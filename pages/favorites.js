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

export default function Favorites() {

  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(()=>{
    setIsMounted(true);
  },[]);

  const {
    translate, favorites
  } = useContext(Context);

  const MediaSelect = ({value, onChange}) => {
    return (
        <div className="media-select">
            <div className={`media-option ${value === 'movie' ? 'active' : ''}`} onClick={()=>{onChange('movie')}}>{translate("Movies")}</div>
            <div className={`media-option ${value === 'tv' ? 'active' : ''}`} onClick={()=>{onChange('tv')}}>{translate("TV Shows")}</div>
        </div>
    )
  }

  const [selectedMedia, setSelectedMedia] = useLocalStorage('selectedMedia', 'movie');

  return isMounted && (<>
    <Header />
    <div className="my-container">
        <h2 className="page-title">{translate("Favorites")}</h2>
        <main>
            <MediaSelect value={selectedMedia} onChange={(mediaType)=>{setSelectedMedia(mediaType)}}/>

            <div className="media-group">
                {favorites[selectedMedia].length === 0 ?
                    <div className="message">
                        <h3>{translate(`You have no favorite ${selectedMedia === 'movie' ? 'Movies' : 'TV Shows'}.`)}</h3>
                        <Link className="c-button" href="/discover">{translate("Discover")}</Link>
                    </div>
                :
                    <div className="medias">
                        {favorites[selectedMedia].map((media, i) => (
                            <MediaCover mediaType={selectedMedia} withDeleteIcon showTitle data={media} key={`media${i}`} href={`/${selectedMedia}/${media.id}`}/>
                        ))}
                    </div>
                }
            </div>
        </main>
    </div>
  </>)
}
