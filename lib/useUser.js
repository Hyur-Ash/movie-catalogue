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

  useEffect(()=>{
    if(user){
      getCurrentUser(user, true);
    }
  },[]);

  const refreshUser = () => {
    getCurrentUser(user, true);
  }

  const getCurrentUser = async (data, pull) => {
    try{
      const docRef = doc(db, "users", data.userName);
      const docSnap = await getDoc(docRef);
      if(!docSnap.exists()){
        logoutUser();
        return null;
      }
      const userData = docSnap.data();
      if(userData.password !== data.password){
        logoutUser();
        return null;
      }
      if(pull){
        setUser(userData);
        console.log(`${data.userName} refreshed.`);
      }
      return userData;
    }catch(error){
      console.error(`Error refreshing ${data.userName}:`, error);
      logoutUser();
      return null;
    }
  }

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
      setUser(userData);
      console.log(`${data.userName} logged in.`);
      return{ok: true}
    }catch(error){
      console.error(`Error logging in ${data.userName}:`, error);
      return errorMessage;
    }
  }

  const logoutUser = () => {
    setUser(null);
  }

  const updatePasswordUser = async (newPassword) => {
    const currentUser = await getCurrentUser(user);
    try{
      const docRef = doc(db, "users", user.userName);
      const docSnap = await getDoc(docRef);
      if(!docSnap.exists()){
        return errorMessage;
      }
      await updateDoc(docRef, cleanData({password: newPassword}));
      console.log(`${user.userName}'s password updated.`);
      setUser({...currentUser, password: newPassword});
      return{ok: true}
    }catch(error){
      console.error(`Error updating ${user.userName}'s password:`, error);
      setUser(currentUser);
      return errorMessage;
    }
  }

  const addMediaToUserList = async (data, mediaType, listName) => {
    setUser(curr => ({
      ...curr,
      [listName]: {
        ...curr[listName],
        [mediaType]: [
          ...curr[listName][mediaType].filter(media => media.id !== data.id),
          data
        ]
      }
    }));
    const currentUser = await getCurrentUser(user);
    if(!currentUser){return;}
    const newList = JSON.parse(JSON.stringify({
      ...currentUser[listName],
        [mediaType]: [
          ...currentUser[listName][mediaType].filter(media => media.id !== data.id),
          data
        ]
    }));
    try{
      const docRef = doc(db, "users", user.userName);
      await updateDoc(docRef, cleanData({[listName] : newList}));
      console.log(`${user.userName} updated.`);
    }catch(error){
      console.error(`Error updating ${user.userName}:`, error);
      setUser(currentUser);
    }
  }

  const removeMediaFromUserList = async (id, mediaType, listName) => {
    setUser(curr => ({
      ...curr,
      [listName]: {
        ...curr[listName],
        [mediaType]: id === "all" ? [] : curr[listName][mediaType].filter(media => media.id !== id)
      }
    }));
    const currentUser = await getCurrentUser(user);
    if(!currentUser){return;}
    const newList = JSON.parse(JSON.stringify({
      ...currentUser[listName],
      [mediaType]: id === "all" ? [] : currentUser[listName][mediaType].filter(media => media.id !== id)
    }));
    try{
      const docRef = doc(db, "users", user.userName);
      await updateDoc(docRef, cleanData({[listName] : newList}));
      console.log(`${user.userName} updated.`);
    }catch(error){
      console.error(`Error updating ${user.userName}:`, error);
      setUser(currentUser);
    }
  }

  const addTemplateToUser = async (data, listName) => {
    setUser(curr => ({
      ...curr,
      templates: {
        ...curr.templates,
        [listName]: [
          ...curr.templates[listName],
          data
        ]
      }
    }));
    const currentUser = await getCurrentUser(user);
    if(!currentUser){return;}
    const newList = JSON.parse(JSON.stringify([
      ...currentUser.templates[listName],
      data
    ]));
    try{
      const docRef = doc(db, "users", user.userName);
      await updateDoc(docRef, cleanData({templates: {...currentUser.templates, [listName]: newList}}));
      console.log(`${user.userName} updated.`);
    }catch(error){
      console.error(`Error updating ${user.userName}:`, error);
      setUser(currentUser);
    }
  }

  function deepEqual(a, b) {
    if (a === b) return true;
    if (a === null || typeof a !== "object" ||
        b === null || typeof b !== "object")
      return false;
    let keysA = Object.keys(a), keysB = Object.keys(b);
    if (keysA.length != keysB.length) return false;
    for (let key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  const removeTemplateFromUser = async (data, listName) => {
    setUser(curr => ({
      ...curr,
      templates: {
        ...curr.templates,
        [listName]: [...curr.templates[listName].filter(t => !deepEqual(t, data))]
      }
    }));
    const currentUser = await getCurrentUser(user);
    if(!currentUser){return;}
    const newList = JSON.parse(JSON.stringify([
      ...currentUser.templates[listName].filter(t => !deepEqual(t, data))
    ]));
    try{
      const docRef = doc(db, "users", user.userName);
      await updateDoc(docRef, cleanData({templates: {...currentUser.templates, [listName]: newList}}));
      console.log(`${user.userName} updated.`);
    }catch(error){
      console.error(`Error updating ${user.userName}:`, error);
      setUser(currentUser);
    }
  }
  
  if(!user){
    return {user, subscribeUser, loginUser}
  }

  return {user, subscribeUser, refreshUser, loginUser, logoutUser, updatePasswordUser, addMediaToUserList, removeMediaFromUserList, addTemplateToUser, removeTemplateFromUser};
  
}
