import * as admin from 'firebase-admin';
import fs from 'fs';

const loadServiceAccount = ()=> {
  if (process.env.FIREBASE_CONFIG_PATH) {
    const path = process.env.FIREBASE_CONFIG_PATH;
    try {
      const data = fs.readFileSync(path, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading Firebase config file:', err);
      throw new Error('Error reading Firebase config file:', err);
    }
  } else {
    return {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: 'googleapis.com',
    };
  }
}

const MAX_RETRIES = 3;
let retries = 0;
let serviceAccount = null;

while (!serviceAccount && retries < MAX_RETRIES) {
  try {
    serviceAccount = loadServiceAccount();
  } catch (err) {
    retries++;
    if (retries === MAX_RETRIES) {
      console.error('Maximum retries reached. Exiting...');
      throw new Error('Maximum retries reached. Exiting...');
    } else {
      console.log(`Retrying... Attempt ${retries}/${MAX_RETRIES}`);
    }
  }
}

if (serviceAccount && serviceAccount.project_id) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: serviceAccount.project_id + '.appspot.com',
  });
}else{
  console.error('Error loading service account. Exiting...');
}

// Now you can use admin SDK functions, for example:
const db = serviceAccount.project_id ? admin.firestore(): null;
const storage = serviceAccount.project_id ? admin.storage(): null;
const bucket = serviceAccount.project_id ? admin.storage().bucket(): null;

export { db, storage, bucket };