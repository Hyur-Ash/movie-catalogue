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

export default function Favorites() {

  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(()=>{
    setIsMounted(true);
  },[]);

  const {
    movieGenres, tvGenres, yearsContent, sortValues,
    medias, singleMedia, setSingleMedia, loadMedias, loadingMedias, loadSingleMedia, lastSearch,
    totalPages, setCurrentPage, 
    translate, websiteLang, setWebsiteLang, languageCodes,
    currentNames, languagesOptions, favorites, setFavorites
  } = useContext(Context);

  const MediaSelect = ({value, onChange}) => {
    return (
        <div className="media-select">
            <div className={`media-option ${value === 'movie' ? 'active' : ''}`} onClick={()=>{onChange('movie')}}>{translate("Movies")}</div>
            <div className={`media-option ${value === 'tv' ? 'active' : ''}`} onClick={()=>{onChange('tv')}}>{translate("TV Shows")}</div>
        </div>
    )
  }

  const [selectedMedia, setSelectedMedia1] = useLocalStorage('selectedMedia', 'movie');

  return isMounted && (<>
    <header>
        <div className="menu">
            <Link href="/"><FaFilm className="icon media"/></Link>
        </div>
        <div className="language-selector">
            <Select
                instanceId={"language"} 
                options={languagesOptions}
                value={languagesOptions.filter(l=>l.value === websiteLang)[0]}
                onChange={(e)=>{setWebsiteLang(e.value)}}
                isSearchable={false}
            />
        </div>
    </header>
        <h1>{translate("Favorites")}</h1>
        <div className="my-container">
            <Head>
                <title>{translate("Hyur's Media Library")}</title>
                <meta name="description" content="Created by Hyur" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <MediaSelect value={selectedMedia} onChange={(mediaType)=>{setSelectedMedia1(mediaType)}}/>

                <div className="media-group">
                    {favorites[selectedMedia].length === 0 ?
                        <div className="message">
                            <h3>{translate(`You have no favorite ${selectedMedia === 'movie' ? 'Movies' : 'TV Shows'}.`)}</h3>
                            <Link className="c-button" href="/">{translate("Discover")}</Link>
                        </div>
                    :
                        <div className="medias">
                            {favorites[selectedMedia].map((media, i) => (
                                <MediaCover withDeleteIcon showTitle data={media} key={`media${i}`} href={`/${selectedMedia}/${media.id}`}/>
                            ))}
                        </div>
                    }
                </div>

        </main>
    </div>
  </>)
}
