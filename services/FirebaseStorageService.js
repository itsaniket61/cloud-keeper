import { bucket } from "@/helpers/FirebaseHelper";

// Create a new Folder
const createFolder = async (folderPath) => {
    try {
        const ref = bucket.file(folderPath+'/');
        let [exists] = await ref.exists();
        if (exists) {
          return { message: 'Folder already exists', status: 400 };
        }
        ref.save('');
        return {message: "Folder created successfully", status: 201 };
    } catch (error) {
        console.log(error.message);
        return {message: "Failed to create folder", status: 500 };
    }
}

// Upload a File to the bucket
const uploadFile = async (filePath, file, customMetadata = {}) => {
  if (!file) {
    return { message: 'File not found', status: 404 };
  }

  const fileRef = bucket.file(filePath + '/' + file.name);

  const stream = fileRef.createWriteStream({
    metadata: {
      contentType: file.type,
      // Add other Firebase Storage metadata properties here if needed
    },
  });

  // Convert file to stream
  const fileStream = file.stream();

  // Convert stream to buffer
  const chunks = [];
  for await (const chunk of fileStream) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  return new Promise((resolve, reject) => {
    stream.on('error', (error) => {
      console.error('Error uploading file:', error);
      reject({ message: error.message, status: 500 });
    });

    stream.on('finish', async () => {
      try {
        // Set custom metadata after file upload
        await fileRef.setMetadata({
          metadata: {
            ...customMetadata,
          },
        });

        resolve({ message: 'Uploaded Successfully!', status: 200 });
      } catch (error) {
        console.error('Error setting custom metadata:', error);
        reject({ message: 'Failed to set custom metadata', status: 500 });
      }
    });

    stream.end(buffer);
  });
};


const listFiles = async (folderName) => {
  try {
    if (!folderName) {
      return { response: 'Folder not found', status: 404 };
    }

    const [files] = await bucket.getFiles({ prefix: folderName + '/' });

    const fileSystem = {
      name: folderName,
      type: 'directory',
      children: [],
    };

    files.forEach(async (file) => {
      const filePath = file.name.replace(`${folderName}/`, '');
      const pathSegments = filePath.split('/');
      let currentDirectory = fileSystem;

      for (let i = 0; i < pathSegments.length - 1; i++) {
        const directoryName = pathSegments[i];
        let childDirectory = currentDirectory.children.find(
          (child) => child.name === directoryName
        );
        if (!childDirectory) {
          childDirectory = {
            name: directoryName,
            type: 'directory',
            children: [],
          };
          currentDirectory.children.push(childDirectory);
        }
        currentDirectory = childDirectory;
      }

      // Add file to the directory
      currentDirectory.children.push({
        name: pathSegments[pathSegments.length - 1],
        type: 'file',
        size: file.size,
        metadata: file.metadata.metadata || {},
        created_at: file.metadata.timeCreated,
        modified_at: file.metadata.updated,
      });
    });

    return { response: fileSystem, status: 200 };
  } catch (error) {
    console.error('Error listing files:', error);
    return { response: error, status: 500 };
  }
};


const deleteFile = async (pathToBeDeleted) => {
  try {
    if (!pathToBeDeleted) {
      return { response: "Folder not found", status: 404 };
    }

    const fileRef = bucket.file(pathToBeDeleted);

    await fileRef.delete();

    return {response: "File from "+pathToBeDeleted+" is deleted", status: 200};
  } catch (error) {
    console.error('Error deleting file:', error);
    return {response: "Failed to delete the file", status: 500};
  }
}

const deleteFolder = async (folderName) => {
  try {
    if (!folderName) {
      return { response: "Folder not found", status: 404 };
    }

    const folderRef = bucket.file(folderName + '/');

    // List all files in the folder
    const [files] = await bucket.getFiles({ prefix: folderName + '/' });

    // Delete each file in the folder
    await Promise.all(files.map((file) => file.delete()));

    return {response: "Folder deleted successfully", status: 200};
  } catch (error) {
    console.error('Error deleting folder:', error);
    return {response: "Error deleting folder : " + folderName, status: 500};
  }
};

const getDownloadUrl = async (filePath) => {
  try {
    if (!filePath) {
      return { response: 'File path not provided', status: 400 };
    }

    const fileRef = bucket.file(filePath);

    // Check if the file exists
    const [exists] = await fileRef.exists();
    if (!exists) {
      return { response: 'File not found', status: 404 };
    }

    // Get a signed URL for the file
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 2 * 60 * 1000,
    });

    return { response:{downloadUrl: url}, status: 200 };
  } catch (error) {
    console.error('Error getting download URL:', error);
    return { response: 'Failed to get download URL', status: 500 };
  }
};


export const firebaseStorageService = {
  createFolder,
  uploadFile,
  listFiles,
  deleteFile,
  deleteFolder,
  getDownloadUrl,
};
