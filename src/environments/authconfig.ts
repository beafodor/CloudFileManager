import firebase from 'firebase';

export const firebaseConfig = {
  apiKey: "AIzaSyCf2CTexFB3vSeKINeMjbWSmwCuseCQPMc",
  authDomain: "cloudfilemanagerapp.firebaseapp.com",
  projectId: "cloudfilemanagerapp",
  storageBucket: "cloudfilemanagerapp.appspot.com",
  messagingSenderId: "162689521172",
  appId: "1:162689521172:web:683f60203d9922059bb901",
  measurementId: "G-GRXGFG49C8"
}

//firebase.initializeApp(firebaseConfig);

export const firebaseAuth = firebase.auth
