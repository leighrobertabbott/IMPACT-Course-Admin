const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable } = require('firebase/functions');

const firebaseConfig = {
  apiKey: "AIzaSyBxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX",
  authDomain: "mwl-impact.firebaseapp.com",
  projectId: "mwl-impact",
  storageBucket: "mwl-impact.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'us-central1');

async function testEmail() {
  try {
    const testEmailFunction = httpsCallable(functions, 'testEmail');
    const result = await testEmailFunction({});
    console.log('Test email result:', result.data);
  } catch (error) {
    console.error('Error testing email:', error);
  }
}

testEmail();
