import * as admin from 'firebase-admin';
import serviceAccount from '../configs/firebaseConfig.json'; // path to your service account key

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'buildifyx-16d18.appspot.com',
  });
}

// Now you can use admin SDK functions, for example:
const db = admin.firestore();
const storage = admin.storage();
const bucket = admin.storage().bucket();

export { db, storage, bucket };