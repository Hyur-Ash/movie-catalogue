// useData.js
import { useState, useEffect } from 'react';
import db from '/lib/firebase';
import {doc, getDoc, setDoc} from 'firebase/firestore';

export function useData(documentName, initialState) {

  let startValue;
  if (typeof window !== "undefined") {
      const item = window.localStorage.getItem(documentName);
      let writeValue;
      try{
          writeValue = JSON.parse(item);
      }catch(error){
          writeValue = item;
      }
      startValue = item ? writeValue : initialState;
  }else{
      startValue = initialState;
  }

  const [data, setData] = useState(startValue);

  const loadDocument = async () => {
    const docRef = doc(db, "data", documentName);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
      const value = JSON.parse(docSnap.data().value);
      setData(value);
    }else{
      updateData(initialState);
    }
  }

  useEffect(()=>{
    loadDocument(documentName);
  },[documentName]);

  const updateData = async (newData) => {
    const docRef = doc(db, "data", documentName);
    await setDoc(docRef, {
      value: JSON.stringify(newData)
    });
    if (typeof window !== "undefined") {
        window.localStorage.setItem(documentName, JSON.stringify(newData));
    }
    console.log(`${documentName} updated.`)
  }

  useEffect(()=>{
    if(JSON.stringify(data) !== JSON.stringify(startValue)){
      updateData(data);
    }
  },[data]);

  return [data, setData];
}
