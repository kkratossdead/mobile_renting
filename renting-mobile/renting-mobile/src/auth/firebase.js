import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBZdjiwub_OD1UHWAOypuVSnHraKX6LW5U",
  authDomain: "renting-mobile.firebaseapp.com",
  projectId: "renting-mobile",
  storageBucket: "renting-mobile.firebasestorage.app",
  messagingSenderId: "823600007920",
  appId: "1:823600007920:web:ac08853d472c91edb15035",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
