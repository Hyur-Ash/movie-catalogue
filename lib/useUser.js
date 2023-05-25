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

  const cleanData = (mediaType, data) => {
    if(mediaType === "movie"){
      const {id, original_language, original_title, poster_path, release_date, vote_average, vote_count} = data;
      return {id, original_language, original_title, poster_path, release_date, vote_average, vote_count};
    }else if(mediaType === "tv"){
      const {id, original_language, original_name, poster_path, first_air_date, vote_average, vote_count} = data;
      return {id, original_language, original_name, poster_path, first_air_date, vote_average, vote_count};
    }else if(mediaType === "person"){
      const {id, gender, name, profile_path, popularity, known_for_department} = data;
      return {id, gender, name, profile_path, popularity, known_for_department};
    }
  }

  const makeMigration = async () => {
    const docRef = doc(db, "data", "users");
    const docSnap = await getDoc(docRef);
    const string = docSnap.data();
    const users = JSON.parse(string.value);
    console.log(users)
    const newUsers = [];
    users.forEach(user => {
      const newFavorites = JSON.parse(JSON.stringify(emptyList));
      if(user.favorites){
        Object.entries(user.favorites).forEach(([mediaType, favorites]) => {
          newFavorites[mediaType] = favorites.map(favorite => {
            return cleanData(mediaType, favorite);
          });
        });
      }
      const newTrashed = JSON.parse(JSON.stringify(emptyList));
      if(user.trashed){
        Object.entries(user.trashed).forEach(([mediaType, trashed]) => {
          newTrashed[mediaType] = trashed.map(trash => {
            return cleanData(mediaType, trash);
          });
        });
      }
      newUsers.push({
        ...user,
        favorites: newFavorites,
        trashed: newTrashed,
      })
    });
    
    newUsers.forEach(async(user)=>{
      if(user.userName === "Hyur"){
        console.log(user)
       const docRef = doc(db, "users", user.userName);
       await setDoc(docRef, user);
      }
    });
  };

  // makeMigration();

  const [user, setUser] = useLocalStorage("user", null);

  const subscribeUser = async (data) => {
    try{
      const docRef = doc(db, "users", data.userName);
      const docSnap = await getDoc(docRef);
      if(docSnap.exists()){
        return {ok: false,}
      }else{
        try{
          await setDoc(docRef, {...data, favorites: emptyList, trashed: emptyList});
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
      await updateDoc(docRef, update);
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
