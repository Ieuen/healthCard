import { auth } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber
} from 'firebase/auth'

// Email/Password Registration
export function registerWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
}

// Email/Password Login
export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

// Google Sign-In
export function loginWithGoogle() {
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider)
}

// Phone Sign-In for test numbers (no recaptcha needed)
export function sendPhoneVerification(phoneNumber) {
  // For test numbers, appVerifier can be omitted or set to undefined
  return signInWithPhoneNumber(auth, phoneNumber, undefined)
}

// Complete Phone Sign-In (after user enters code)
export function confirmPhoneCode(confirmationResult, code) {
  return confirmationResult.confirm(code)
}

// Sign out
export function logout() {
  return signOut(auth)
}
