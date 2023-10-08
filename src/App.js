import React, { useRef, useState } from 'react';
import './App.css';


import firebase from 'firebase/compat/app';

import { initializeApp } from 'firebase/app';

import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/analytics';


import { getAuth, getAdditionalUserInfo, signInWithPopup } from 'firebase/auth';

import {collection, doc, getDocs, updateDoc, query,
     where, getFirestore, getDoc, addDoc, setDoc } from 'firebase/firestore';



import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';


const config = ({
  apiKey: "AIzaSyCBri9L4EQVzD8XbgGfTpbJy6Flyp73O9o",
  authDomain: "random-chat-app-7f3ca.firebaseapp.com",
  projectId: "random-chat-app-7f3ca",
  storageBucket: "random-chat-app-7f3ca.appspot.com",
  messagingSenderId: "147505168002",
  appId: "1:147505168002:web:4ccbc9c78a83c37672be9b",
  measurementId: "G-HPYL8FRZMJ"
})

initializeApp(config);

const auth = getAuth();
const firestore = getFirestore();

let matched = false;

let globalOtherUser;


function App() {


  const [user] = useAuthState(auth);

    let content;

    if (user && !matched) {
        content = <Menu />;
    } else if (!user) {
        content = <SignIn />;
    } else if (user && matched) {
        content = <DisplayLatestRoom />
    }


  return (


      <div className="App">
        
        <header>
          <h1>ChatTwist</h1>
          <SignOut />
        </header>

        <section>
            {content}
        </section>


      </div>
  );
}



function SignIn() {
  const usersRef = collection(firestore, "users");
  const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then( async (result) => {
            const user = getAdditionalUserInfo(result);
            if (user.isNewUser) {
                const data = ({
                    userid: auth.currentUser.uid
                })
                await addDoc(usersRef, data);
            }
        })
  }

  return (
      <>
        <div className="center">
          Please sign in with Google to continue
        </div>

        <div className="dud">
          &nbsp;
        </div>

        <button className="sign-in" onClick={signInWithGoogle}>&nbsp;&nbsp;Sign in&nbsp;&nbsp;</button>
      </>
  )
}

function SignOut() {
  return auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>&nbsp;&nbsp;Sign Out&nbsp;&nbsp;</button>
  )
}



function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  if (messageClass === 'received') {
    return (<>
      <div className={`message ${messageClass}`}>
        <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
        <p>{text}</p>
      </div>
    </>)
  } else
    return (
        <>

          <div className={`message ${messageClass}`}>
            <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
            <p>{text}</p>
          </div>


        </>
    )
}

async function counterIncrementer() {
    const counterRef =
        doc(firestore, 'counter/Room Counter');

    const result = await getDoc(counterRef);

    let { room_count } = result.data();

    let counter = room_count;


    counter += 1;

    const updatedData = {
        room_count: counter
    }

    await updateDoc(counterRef, updatedData);
}



async function MatchUsers(user) {

    const query2 = query(collection(firestore, 'users'),
        where("userid", "!=", auth.currentUser.uid));

    const queryResult = await getDocs(query2);

    const docArray = queryResult.docs;

    const snapshotCount = queryResult.size;
    const randomNumber = Math.floor(Math.random() * snapshotCount);

    let counter = 0;
    let otherUser, temp;


    docArray.forEach(doc => {
        if (counter === randomNumber) {
            temp = doc.data();
            console.log(temp);
        } else
            counter++;
    })

    const { userid } = temp;

    otherUser = userid;

    await counterIncrementer();

    globalOtherUser = otherUser;

    await CreateNewChatRoom();

    matched = true;

}

async function CreateNewChatRoom() {
    let counterRef =
        doc(firestore, "counter", "Room Counter");

    const docResult = await getDoc(counterRef);

    const { room_count } = docResult.data();

    const counter = room_count;

    const userData = {
        user1: auth.currentUser.uid,
        user2: globalOtherUser,
        createdOn: firebase.firestore.FieldValue.serverTimestamp()
    }

    await setDoc(doc(firestore, "rooms", "room"+counter),
        userData);

    //const messagesRef
    //    = firestore.doc('rooms/room'+counter).collection('messages');

    const messagesRef
        = collection(firestore, "rooms", "room"+counter, "messages");


    //await setDoc(testing, testing3, {merge: true})

    const {uid, photoURL} = auth.currentUser;

    /*await messagesRef.add( {
        text: '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
    })*/

    const messageData = {
        text: '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
    }

    await addDoc(messagesRef, messageData);

}

function Menu() {

    const [user] = useAuthState(auth);

    return ( <>

            <div className="dud">
                &nbsp;
            </div>

            <button className="sign-in" onClick={() => MatchUsers(user)}>
            Match with someone!</button>

            <div className="dud">
                &nbsp;
            </div>

        </>
    )
}

async function DisplayLatestRoom() {

    const roomsCol = collection(firestore, 'rooms');

    const firstQuery =
        query(roomsCol, where("user1", "==", auth.currentUser.uid));

    const secondQuery
        = query(roomsCol, where("user2", "==", auth.currentUser.uid));
    //No other way to do this that I can find. :(

    const activeSnapshot = await getDocs(firstQuery);
    const secondarySnapshot = await getDocs(secondQuery);
    const merged = [];

    activeSnapshot.forEach((doc) => {
        merged.push(doc.data());
    });
    secondarySnapshot.forEach((doc) => {
       merged.push(doc.data());
    });

    const [targetRoomArray] = merged.docs();
    let targetRoom = {
        id: ''
    };

    let localCounter = 0;

    targetRoomArray.forEach(doc => {
        if (localCounter === 0) {
            targetRoom.id = doc.id;
            localCounter++;
        }
    })

    const scrollToBottomDiv = useRef();
    const messagesRef
        = firestore.doc(targetRoom.id).collection('messages');

    const messagesQuery = messagesRef.orderBy('createdAt').limit(50);

    const [messages] = useCollectionData(messagesQuery, { idField: 'id' });

    const [formValue, setFormValue] = useState('');


    const sendMessage = async (e) => {
        e.preventDefault();

        const { uid, photoURL } = auth.currentUser;

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL
        })

        setFormValue('');
        scrollToBottomDiv.current.scrollIntoView({ behavior: 'smooth' });
    }

    return (<>
        <main>

            {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

            <span ref={scrollToBottomDiv}></span>

        </main>

        <form onSubmit={sendMessage}>

            <input value={formValue} onChange={(e) =>
                setFormValue(e.target.value)} placeholder="Message..." />

            <button type="submit" disabled={!formValue}>Send</button>

        </form>
    </>)

}

export default App;