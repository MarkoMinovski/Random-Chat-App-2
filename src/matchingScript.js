import React, { useRef, useState } from 'react';
import './App.css';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/analytics';


firebase.initializeApp({
    apiKey: "AIzaSyCBri9L4EQVzD8XbgGfTpbJy6Flyp73O9o",
    authDomain: "random-chat-app-7f3ca.firebaseapp.com",
    projectId: "random-chat-app-7f3ca",
    storageBucket: "random-chat-app-7f3ca.appspot.com",
    messagingSenderId: "147505168002",
    appId: "1:147505168002:web:4ccbc9c78a83c37672be9b",
    measurementId: "G-HPYL8FRZMJ"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

