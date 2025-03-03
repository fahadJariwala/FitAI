import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {createUserWithEmailAndPassword, signInAnonymously} from 'firebase/auth';
import {auth} from '../config/firebase';

const AuthScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      // First, sign up with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Then navigate to user details screen
      navigation.navigate('UserDetails', {
        userId: userCredential.user.uid,
      });
    } catch (error) {
      console.error('Error signing up:', error);
      // Handle error appropriately
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      const result = await signInAnonymously(auth);
      // Navigate to user details screen after anonymous sign-in
      navigation.navigate('UserDetails', {
        userId: result.user.uid,
      });
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      // Handle error appropriately
    }
  };

  return (
    <View style={styles.container}>
      {/* ... existing UI components ... */}

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.anonymousButton]}
        onPress={handleAnonymousSignIn}>
        <Text style={styles.buttonText}>Continue as Guest</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  anonymousButton: {
    backgroundColor: '#6c757d',
  },
});

export default AuthScreen;
