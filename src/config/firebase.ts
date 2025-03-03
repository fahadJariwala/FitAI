const firebaseConfig = {
    // ... your config ...
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Enable anonymous sign-in
setPersistence(auth, browserLocalPersistence);

export { auth }; 