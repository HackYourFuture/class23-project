import * as admin from 'firebase-admin';
import serviceAccount from '../hackyourshoplets-firebase-adminsdk.json';

function initializeAdmin() {
  if (admin.apps.length > 0) {
    // Use existing admin 
    console.log('Using existing admin');
    return admin;
  }
  // Initialize admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://hackyourshop-d9ad6.firebaseio.com',
  });
  console.log('Admin Initialized');
  return admin;
}

export default initializeAdmin;