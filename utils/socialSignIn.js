import axios from 'axios';
import catchErrors from './catchErrors';
import baseUrl from './baseUrl';
import { handleLogin } from './auth';
import firebase from 'firebase';

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: 'AIzaSyAsBJg_zzaO-7uSCFlSKj01HD-xCRLpJ8k',
    authDomain: 'hackyourshop-d9ad6.firebaseapp.com',
  });
}

export default async function handleSocialLogin(
  event,
  errorHandler,
  loadingHandler,
) {
  if (firebase.auth().currentUser) {
    return catchErrors(new Error('You are already signed in!'), errorHandler);
  }
  try {
    loadingHandler(true);
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    const facebookProvider = new firebase.auth.FacebookAuthProvider();
    const chosenProvider =
      event.target.title === 'google' ? googleProvider : facebookProvider;
    const {
      user: { displayName, email },
      credential: { providerId },
    } = await firebase.auth().signInWithPopup(chosenProvider);
    const idToken = await firebase.auth().currentUser.getIdToken(true);
    const payload = {
      username: displayName,
      email,
      idToken,
      provider: providerId,
    };
    const url = `${baseUrl}/api/social`;
    const response = await axios.post(url, payload);
    handleLogin(response.data);
  } catch (error) {
    catchErrors(error, errorHandler);
  } finally {
    loadingHandler(false);
  }
}
