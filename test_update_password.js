import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';

console.log("Functions available:", typeof signInWithEmailAndPassword, typeof updatePassword);
