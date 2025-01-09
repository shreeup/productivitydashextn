import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAixpZB4zDZIMF9c8zylFoXi2HOOA2jT_s',
  authDomain: 'productivitydashextn-adea4.firebaseapp.com',
  projectId: 'productivitydashextn-adea4',
  storageBucket: 'productivitydashextn-adea4.firebasestorage.app',
  messagingSenderId: '928713725170',
  appId: '1:928713725170:web:bd46184e503a2bb59dac6b',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
