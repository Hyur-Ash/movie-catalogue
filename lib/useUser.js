import { useState, useEffect } from 'react';
import db from '/lib/firebase';
import {doc, getDoc, setDoc, updateDoc} from 'firebase/firestore';
import moment from 'moment';
import { useLocalStorage } from '/lib/useLocalStorage';

export function useUser() {

  const errorMessage = {
    ok: false,
    message: "There was a problem. Try again later."
  };

  const emptyList = {movie: [], tv: [], person: []};

  const [user, setUser] = useLocalStorage("user", null);

  const cleanData = (data) => {
    const cleanedData = {};
    Object.entries(data).forEach(([key, value]) => {
      if(value !== undefined && value !== null){
        if(Array.isArray(value)){
          cleanedData[key] = [];
          value.forEach((element, index) => {
            cleanedData[key][index] = cleanData(element);
          });
          return;
        }
        if(typeof value === "object"){
          cleanedData[key] = cleanData(value);
          return;
        }
        cleanedData[key] = value;
      }
    });
    return cleanedData;
  }

  const subscribeUser = async (data) => {
    try{
      const docRef = doc(db, "users", data.userName);
      const docSnap = await getDoc(docRef);
      if(docSnap.exists()){
        return {ok: false,}
      }else{
        try{
          await setDoc(docRef, cleanData({...data, favorites: emptyList, trashed: emptyList}));
          console.log(`${data.userName} subscribed.`); 
          return{ok: true}
        }catch(error){
          console.error(`Error subscribing ${data.userName}:`, error);
          return errorMessage;
        }
      }
    }catch(error){
      console.error(`Error subscribing ${data.userName}:`, error);
      return errorMessage;
    }
  }

  const loginUser = async (data) => {
    try{
      const docRef = doc(db, "users", data.userName);
      const docSnap = await getDoc(docRef);
      if(!docSnap.exists()){
        return {ok: false};
      }
      const userData = docSnap.data();
      if(userData.password !== data.password){
        return {ok: false}
      }
      setUser(docSnap.data());
      console.log(`${data.userName} logged in.`);
      return{ok: true}
    }catch(error){
      console.error(`Error logging in ${data.userName}:`, error);
      return errorMessage;
    }
  }
  
  if(!user){
    return {user, subscribeUser, loginUser}
  }

  const logoutUser = () => {
    setUser(null);
  }

  const updateUser = async (update) => {
    const currentUser = JSON.parse(JSON.stringify(user));
    const newUser = JSON.parse(JSON.stringify(user));
    Object.entries(update).forEach(([key, value]) => {
      newUser[key] = value;
    });
    setUser(newUser);
    try{
      const docRef = doc(db, "users", user.userName);
      const docSnap = await getDoc(docRef);
      if(!docSnap.exists()){
        return errorMessage;
      }
      await updateDoc(docRef, cleanData(update));
      console.log(`${user.userName} updated.`);
      return{ok: true}
    }catch(error){
      console.error(`Error updating ${user.userName}:`, error);
      setUser(currentUser);
      return errorMessage;
    }
  }

  return {user, subscribeUser, loginUser, logoutUser, updateUser};
  
}
