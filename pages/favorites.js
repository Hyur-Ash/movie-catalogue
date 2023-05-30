import Head from 'next/head';
import {useState, useEffect, useContext} from 'react';
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
import {FaFilm} from 'react-icons/fa';
import Link from 'next/link';
import Header from '/components/Header';
import { MediaPopup } from '/components/MediaPopup';
import { PersonPopup } from '/components/PersonPopup';

export default function Favorites() {

  const [isMounted, setIsMounted] = useState(false);
  useEffect(()=>{
    setIsMounted(true);
  },[]);

  const {
    User,
    translate
  } = useContext(Context);

  const {user, refreshUser, removeMediaFromUserList} = User;
  const {favorites} = user ?? {};

  const router = useRouter();
  useEffect(()=>{
    if(!user){
        router.push("/");
    }
  },[user]);
  useEffect(()=>{
      if(user){
          refreshUser();
      }
  },[]);


  const MediaSelect = ({value, onChange}) => {
    return (
        <div className="media-select">
            <div className={`media-option ${value === 'movie' ? 'active' : ''}`} onClick={()=>{onChange('movie')}}>{translate("Movies")}</div>
            <div className={`media-option ${value === 'tv' ? 'active' : ''}`} onClick={()=>{onChange('tv')}}>{translate("TV Shows")}</div>
            <div className={`media-option ${value === 'person' ? 'active' : ''}`} onClick={()=>{onChange('person')}}>{translate("People")}</div>
        </div>
    )
  }

  const [selectedMedia, setSelectedMedia] = useLocalStorage('selectedMedia', 'movie');
  const [emptyFavoritesMode, setEmptyFavoritesMode] = useState(false);

  const [popupConfig, setPopupConfig] = useState(null);

  return isMounted && user && (<>
    <Header />
    <div className="my-container">
        <h2 className="page-title">{translate("Favorites")}</h2>
        <div style={{height: "100px"}}>
          {favorites[selectedMedia].length > 0 && <>
              {!emptyFavoritesMode &&
                <button className="c-button" onClick={()=>{setEmptyFavoritesMode(true)}}>{translate(`Empty ${selectedMedia} favorites`)}</button>
              }
              {emptyFavoritesMode && <>
                <h3 style={{color: "white", marginBottom: "1.5rem"}}>{translate("Are you sure?")}</h3>
                <div className="buttons" style={{display: "flex", gap: "2.5rem"}}>
                  <button className="c-button" onClick={()=>{setEmptyFavoritesMode(false)}}>{translate("Cancel")}</button>
                  <button className="c-button" onClick={()=>{
                    removeMediaFromUserList("all", selectedMedia, "favorites");
                    setEmptyFavoritesMode(false);
                  }}>{translate(`Empty ${selectedMedia} favorites`)}</button>
                </div>
              </>}
            </>}
        </div>
        <main>
            <MediaSelect value={selectedMedia} onChange={(mediaType)=>{setSelectedMedia(mediaType)}}/>

            <div className="media-group">
                {favorites[selectedMedia].length === 0 ?
                    <div className="message">
                        <h3>{translate(`You have no favorite ${selectedMedia === 'movie' ? 'Movies' : selectedMedia === 'tv' ? 'TV Shows' : 'People'}.`)}</h3>
                        <Link className="c-button" href="/discover">{translate("Discover")}</Link>
                    </div>
                :
                    <div className="medias">
                        {favorites[selectedMedia].map((media, i) => (
                            <MediaCover 
                              mediaType={selectedMedia} 
                              showTitle 
                              data={media} 
                              key={`media${i}`} 
                              showUpcoming
                              // href={`/${selectedMedia}/${media.id}`}
                              onClick={()=>{
                                setPopupConfig({
                                  mediaType: selectedMedia,
                                  id: media.id
                                });
                                window.history.pushState({}, "", `/${selectedMedia}/${media.id}`);
                              }}
                            />
                        ))}
                    </div>
                }
            </div>
        </main>
    </div>
    {popupConfig !== null && popupConfig.mediaType !== "person" && 
      <MediaPopup mediaType={popupConfig.mediaType} id={popupConfig.id} onClose={()=>{
        setPopupConfig(null);
        window.history.pushState({}, "", `/favorites`);
      }} />
    }
    {popupConfig !== null && popupConfig.mediaType === "person" && 
      <PersonPopup id={popupConfig.id} onClose={()=>{
        setPopupConfig(null);
        window.history.pushState({}, "", `/favorites`);
      }} />
    }
  </>)
}
