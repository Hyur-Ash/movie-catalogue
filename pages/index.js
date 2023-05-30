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
    User,
    translate, 
  } = useContext(Context);

  const {user, subscribeUser, loginUser, logoutUser, updatePasswordUser} = User;

  const [formValues, setFormValues] = useState({
    userName: "",
    password: ""
  });

  const changeFormValue = (key, value) => {
    setFormValues(curr=>({...curr, [key]: value}));
  }

  const [subscribeMode, setSubscribeMode] = useLocalStorage("subscribeMode", false);

  const messages = {
    already: translate("User is already existing."),
    created: translate("User successfully created!"),
    notFound: translate("Username or password is incorrect."),
    changed: translate("Password changed successfully."),
  }

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  return isMounted && (<>
    <Head>
      <title>{translate("Hyur's Media Library")}</title>
      <meta name="description" content="Created by Hyur" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Header langOnly={!user}/>
    <div className="my-container">
      
        {!user && <>
            <h2 className="page-title">{subscribeMode ? translate("Subscribe") : translate("Log In")}</h2>
            <button className="c-button" onClick={()=>{setSubscribeMode(!subscribeMode)}}>
                {subscribeMode ? translate("Already subscribed") : translate("New here")}?
            </button>

            <main>
                <div className="form">
                    <div className="form-group">
                        <label>{translate("Username")}</label>
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
                            className="c-button"
                            disabled={isLoading || formValues.userName.trim().length === 0 || formValues.password.length === 0}
                            onClick={async ()=>{
                                if(isLoading){return;}
                                setIsLoading(true);
                                if(subscribeMode){
                                    const response = await subscribeUser({
                                        userName: formValues.userName.trim(),
                                        password: formValues.password
                                    });
                                    if(!response.ok){
                                        setIsLoading(false);
                                        alert(response.message || messages.already);
                                        return;
                                    }
                                    setFormValues({userName: "", password: ""});
                                    setSubscribeMode(false);
                                    setIsLoading(false);
                                    alert(messages.created);
                                }else{
                                    const response = await loginUser({
                                        userName: formValues.userName.trim(),
                                        password: formValues.password
                                    });
                                    if(!response.ok){
                                        setIsLoading(false);
                                        alert(response.message || messages.notFound);
                                        return;
                                    }
                                    setIsLoading(false);
                                }
                            }}
                        >
                            {subscribeMode ? translate("Subscribe") : translate("Log In")}
                        </button>
                    </div>
                </div>
            </main>
        </>}
        {user && <>
            <h2 className="page-title">{translate("Welcome")} {user.userName} !</h2>
            <button className="c-button" onClick={logoutUser}>
                {translate("Log out")}
            </button>
            <div style={{color:"white"}}>
                <h3>{translate("Change password")}</h3>
                <div style={{margin:"1rem 0"}}>
                    <p>{translate("Old password")}</p>
                    <input style={{padding:".25em .75em"}} type="password" value={oldPassword} onChange={(e)=>{setOldPassword(e.target.value)}}/>
                </div>
                <div style={{margin:"1rem 0"}}>
                    <p>{translate("New password")}</p>
                    <input style={{padding:".25em .75em"}} type="password" value={newPassword} onChange={(e)=>{setNewPassword(e.target.value)}}/>
                </div>
                <button className="c-button" disabled={isLoading || oldPassword !== user.password || newPassword.length === 0} onClick={async ()=>{
                    if(oldPassword !== user.password && newPassword.length === 0){return;}
                    setIsLoading(true);
                    const response = await updatePasswordUser( newPassword);
                    if(!response.ok){
                        setIsLoading(false);
                        alert(response.message);
                        return;
                    }
                    setOldPassword("");
                    setNewPassword("");
                    setIsLoading(false);
                    alert(messages.changed);
                }}>
                    {translate("Change")}
                </button>
            </div>
        </>}

    </div>
  </>)
}
