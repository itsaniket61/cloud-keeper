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
  const filename = file.name.replaceAll(' ', '_');
  console.log(filename);

  const stream = fileRef.createWriteStream({
    metadata: {
      contentType: file.type,
      customMetadata,
    },
  });

  try {
    stream.on('error', (error) => {
      console.error('Error uploading file:', error);
      return { message: error.message, status: 500 };
    });

    stream.on('finish', () => {
      return { message: 'Uploaded Succesfully!', status: 200 };
    });

    stream.end(file.data);
    return { message: 'Success', status: 201 };
  } catch (error) {
    console.log('Error occured ', error);
    return { message: 'Failed', status: 500 };
  }
};

const listFiles = async (folderName) => {
  try {
    if (!folderName) {
      return {response: "Folder not found", status: 404};
    }

    const [files] = await bucket.getFiles({ prefix: folderName + '/' });

    const fileList = files.map((file) =>
      file.name.replace(`${folderName}/`, '')
    );

    return { response: fileList, status: 200 };
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
