import * as admin from 'firebase-admin';
import serviceAccount from '../hackyourshoplets-firebase-adminsdk.json';

const app = {};

function initializeAdmin() {
  if (app.isInitialized) {
    // Use existing admin 
    console.log('Using existing admin');
    return app.admin;
  }
  // Use new admin
  app.admin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://hackyourshoplets.firebaseio.com',
  });
  console.log('Admin Initialized');
  app.isInitialized = true;
  return app.admin;
}

export default initializeAdmin;