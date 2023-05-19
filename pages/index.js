import Head from 'next/head';
import {useState, useEffect, useContext, useRef} from 'react';
import { Context } from '/lib/Context';
import {Form, FormGroup, Label, Input} from 'reactstrap';
import Select from 'react-select'; 
import {Navigator} from '/components/Navigator';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axios from 'axios';
import {useLocalStorage} from '/lib/useLocalStorage';
import {useRouter} from 'next/router';
import moment from 'moment';
import {MediaCover} from '/components/MediaCover';
import Header from '/components/Header';
import {FaStar} from 'react-icons/fa';
import Link from 'next/link';

export default function Discover() {

  const [isMounted, setIsMounted] = useState(false);
  useEffect(()=>{
    setIsMounted(true);
  },[]);

  const {
    movieGenres, tvGenres, yearsContent, sortValues,
    discoveredMedias, singleMedia, setSingleMedia, discoverMedias, loadingMedias, loadSingleMedia, lastDiscover,
    totalSPages, currentSPage, setCurrentSPage, 
    translate, websiteLang, setWebsiteLang, 
    languagesOptions, isYearRange, setIsYearRange, searchedMedias, searchMedias, fromValue, toValue,
    lastSearch,
    users, setUsers, currentUser, setCurrentUser, currentUserIndex, setCurrentUserIndex
  } = useContext(Context);

  const [formValues, setFormValues] = useState({
    userName: "",
    password: ""
  });

  const changeFormValue = (key, value) => {
    setFormValues(curr=>({...curr, [key]: value}));
  }

  const [subscribeMode, setSubscribeMode] = useLocalStorage("subscribeMode", false);

  return isMounted && (<>
    <Head>
      <title>{translate("Hyur's Media Library")}</title>
      <meta name="description" content="Created by Hyur" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    {currentUser && <Header />}
    <div className="my-container">
      
        {currentUserIndex === null && <>
            <h2 className="page-title">{subscribeMode ? translate("Subscribe") : translate("Log In")}</h2>
            <button onClick={()=>{setSubscribeMode(!subscribeMode)}}>
                {subscribeMode ? translate("Already subscribed") : translate("New here")}?
            </button>

            <main>
                <div className="form">
                    <div className="form-group">
                        <label>Username</label>
                        <Input
                            type="text"
                            value={formValues.userName}
                            onChange={(e)=>{changeFormValue('userName', e.target.value);}}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <Input
                            type="password"
                            value={formValues.password}
                            onChange={(e)=>{changeFormValue('password', e.target.value);}}
                        />
                    </div>
                    <div className="form-group submit">
                        <button 
                            disabled={formValues.userName.trim().length === 0 || formValues.password.length === 0}
                            onClick={()=>{
                                if(subscribeMode){
                                    let isAlreadyExisting = false;
                                    // console.log(users);
                                    // return;
                                    users.forEach(user => {
                                        if(user.userName === formValues.userName.trim()){
                                            isAlreadyExisting = true;
                                        }
                                    });
                                    if(isAlreadyExisting){
                                        alert("User is already existing.");
                                        return;
                                    }
                                    setUsers([...users, {
                                        userName: formValues.userName.trim(),
                                        password: formValues.password
                                    }]);
                                    setFormValues({userName: "", password: ""});
                                    alert("User successfully created!");
                                }else{
                                    let userIndex = null;
                                    users.forEach( (user, i) => {
                                        if(user.userName === formValues.userName.trim() && user.password === formValues.password){
                                            userIndex = i;
                                        }
                                    });
                                    if(userIndex === null){
                                        alert("User not found.");
                                        return;
                                    }
                                    setCurrentUserIndex(userIndex);
                                }
                            }}
                        >
                            {subscribeMode ? translate("Subscribe") : translate("Log In")}
                        </button>
                    </div>
                </div>
            </main>
        </>}
        {currentUser && <>
            <h2 className="page-title">{translate("Welcome")} {currentUser.userName} !</h2>
            <button onClick={()=>{setCurrentUserIndex(null)}}>
                {translate("Log out")}
            </button>
        </>}

    </div>
  </>)
}
