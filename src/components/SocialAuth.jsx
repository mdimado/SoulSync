import React, { useState } from 'react';
import { signInWithPopup, FacebookAuthProvider, TwitterAuthProvider } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase-config';

// Initialize providers outside the component to prevent recreation on each render
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// Configure provider settings
facebookProvider.setCustomParameters({
  'display': 'popup',
  'auth_type': 'rerequest',
  'prompt': 'select_account'
});

twitterProvider.setCustomParameters({
  'prompt': 'select_account'
});

const SocialAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSocialLogin = async (providerType) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const provider = providerType === 'facebook' ? facebookProvider : twitterProvider;
      
      // Add error handling for auth initialization
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }

      // Sign in with popup and await the result
      const result = await signInWithPopup(auth, provider);
      
      if (!result.user) {
        throw new Error('Authentication failed: No user data received');
      }

      // Get minimal required user data
      const userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        provider: providerType,
        lastSignIn: new Date().toISOString()
      };

      // Store user data
      await storeUserData(userData);
      
      setSuccess(true);
      console.log('Authentication successful:', result.user.uid);
    } catch (err) {
      console.error('Social login error:', err);
      
      // More specific error handling
      let errorMessage = 'Authentication failed. Please try again later';
      
      switch (err.code) {
        case 'auth/popup-blocked':
          errorMessage = 'Please enable popups in your browser and try again';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Login was cancelled. Please try again';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with the same email address but different sign-in credentials';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Only one popup request allowed at a time';
          break;
        case 'auth/internal-error':
          errorMessage = 'Authentication service is temporarily unavailable. Please try again later';
          break;
        default:
          errorMessage = err.message || 'Authentication failed. Please try again later';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const storeUserData = async (userData) => {
    try {
      const userRef = query(
        collection(db, 'users'), 
        where('uid', '==', userData.uid)
      );
      
      const snapshot = await getDocs(userRef);

      if (snapshot.empty) {
        await addDoc(collection(db, 'users'), {
          ...userData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, {
          ...userData,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error storing user data:', err);
      throw new Error('Failed to store user data');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      

      <div className="space-y-4">
        <button
          onClick={() => handleSocialLogin('facebook')}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          aria-label="Connect with Facebook"
        >
          {loading ? 'Connecting...' : 'Connect with Facebook'}
        </button>

        <button
          onClick={() => handleSocialLogin('twitter')}
          disabled={loading}
          className="w-full py-2 px-4 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 transition-colors"
          aria-label="Connect with Twitter"
        >
          {loading ? 'Connecting...' : 'Connect with Twitter'}
        </button>
      </div>
    </div>
  );
};

export default SocialAuth;