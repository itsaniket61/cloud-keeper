import { bucket } from "@/helpers/FirebaseHelper";

// Create a new Folder
const createFolder = async (folderPath) => {
    try {
        const ref = bucket.file(folderPath+'/');
        let isExist = await ref.exists();
        isExist = isExist[0];
        if(isExist) {
            return {message: "Folder already exists", status: 400 };
        }
        ref.save('');
        return {message: "Folder created successfully", status: 201 };
    } catch (error) {
        console.log(error.message);
        return {message: "Failed to create folder", status: 500 };
    }
}

// Upload a File to the bucket
const uploadFile = async (filePath,file) => {
    if (!file) {
      return {message: "File not found", status: 404};
    }
    const fileRef = bucket.file(filePath + '/' + file.name);
    const filename = file.name.replaceAll(' ', '_');
    console.log(filename);

    const stream = fileRef.createWriteStream({
      metadata: {
        contentType: file.type,
      },
    });

    try {
      stream.on('error', (error) => {
        console.error('Error uploading file:', error);
        return {message:error.message,status:500};
      });

      stream.on('finish', () => {
        return { message: "Uploaded Succesfully!", status: 200 };
      });

      stream.end(file.data);
      return { message: 'Success', status: 201 };
    } catch (error) {
      console.log('Error occured ', error);
      return { message: 'Failed', status: 500 };
    }
}

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

export const firebaseStorageService = {createFolder, uploadFile,listFiles}
