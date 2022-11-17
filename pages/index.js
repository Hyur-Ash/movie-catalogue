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
import {FaStar} from 'react-icons/fa';
import Link from 'next/link';
import Header from '/components/Header';

export default function Home() {

  const [isMounted, setIsMounted] = useState(false);
  useEffect(()=>{
    setIsMounted(true);
  },[]);

  const {
    movieGenres, tvGenres, yearsContent, sortValues,
    medias, singleMedia, setSingleMedia, loadMedias, loadingMedias, loadSingleMedia, lastSearch,
    totalPages, currentPage, setCurrentPage, 
    translate, websiteLang, setWebsiteLang, languageCodes,
    currentNames, languagesOptions, isYearRange, setIsYearRange
  } = useContext(Context);

  return isMounted && (<>

    <Header/>
    <div className="my-container">

      <Head>
        <title>{translate("Hyur's Media Library")}</title>
        <meta name="description" content="Created by Hyur" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{color:"white"}}>
        <h2>
          Welcome bro!<br></br><br></br>
          I swear I will throw a fucking amazing Home page soon, bro.
        </h2>
      </main>
        <Link className="c-button" href="/discover">Discover</Link>

    </div>
  </>)
}
