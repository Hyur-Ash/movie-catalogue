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
import MovieScroller from '/components/MovieScroller';
import SearchForm from '/components/SearchForm';
import { MediaPopup } from '/components/MediaPopup';
import { PersonPopup } from '/components/PersonPopup';

export default function Discover() {

  const [isMounted, setIsMounted] = useState(false);
  useEffect(()=>{
    setIsMounted(true);
  },[]);

  const {
    tmdbConfig,
    translate, currentUser, websiteLang, properNames,
    isVoteAverageRange, isVoteCountRange, isYearRange,
  } = useContext(Context);

  const router = useRouter();
  useEffect(()=>{
    if(!currentUser){
      router.push("/");
    }
  },[currentUser]);

  const [config, setConfig] = useLocalStorage("config-search", {});
  const configRef = useRef(config);
  configRef.current = config;

  const [forceReload, setForceReload] = useState(false);
  useEffect(()=>{
    console.log(JSON.stringify(config) !== JSON.stringify(configRef.current))
      if(!isLoading && (forceReload || !forceReload && JSON.stringify(config) !== JSON.stringify(configRef.current)) ){
          setForceReload(false);
          setMediaPages([]);
          loadPages(1, 5, []);
      }
  },[config, forceReload]);

  useEffect(()=>{
    if(config && config.params && config.params.language !== websiteLang){
      setForceReload(true);
      setConfig({
            ...config,
            params: {
                ...config.params,
                language: websiteLang 
            }
        });
    }
},[websiteLang])

  const changeConfig = async (formValues) => {

    const FV = JSON.parse(JSON.stringify(formValues));
    const currentNames = properNames[FV.mediaType.value];
    const mediaType = FV.mediaType.value;
    const params = {
        api_key: tmdbConfig?.api_key,
        query: FV.query.trim().length > 0 ? FV.query.trim() : "",
        language: websiteLang,
    }
    if(mediaType !== "person"){
      params[currentNames.primary_release_year] = FV.year.value;
    }
    setConfig({params, mediaType});

  }

  const [mediaPages, setMediaPages] = useLocalStorage("mediaPages-search", []);
  const [isLoading, setIsLoading] = useState(false);

  const loadingRef = useRef();
  loadingRef.current = isLoading;

  const mediaPagesRef = useRef();
  mediaPagesRef.current = mediaPages;

  const getPage = async (pageNum) => {
      console.log("get", pageNum)
      const tmdb_main_url = "https://api.themoviedb.org/3";
      const params = {...configRef.current.params, page: pageNum};
      try{
          const res = await axios.get(`${tmdb_main_url}/search/${configRef.current.mediaType}`, {params});
          const results = [];
          res.data.results.forEach(result => {
              results.push({...result, page: pageNum});
          });
          return {...res.data, results};
      }catch(error){
          console.error(error);
      }
  }

  const loadPages = async (start, step, startPages) => {
      console.log(start, step, startPages)
      setIsLoading(true);
      const pages = JSON.parse(JSON.stringify(startPages));
      for(let i=start; i<start+step; i++){
          pages.push(await getPage(i));
      }
      setMediaPages(pages);
      setTimeout(()=>{setIsLoading(false)}, 1000);
  }

  useEffect(()=>{
    console.log(mediaPages)
  },[mediaPages]);

  const [popupId, setPopupId] = useState(null);

  return isMounted && currentUser && (<>
    <Head>
      <title>{translate("Hyur's Media Library")}</title>
      <meta name="description" content="Created by Hyur" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Header />
    <div className="my-container">
      
      <h2 className="page-title">{translate("Search")}</h2>

      <main>
        <SearchForm 
          onSubmit={formValues => {
            setForceReload(true);
            changeConfig(formValues);
          }}
        />
        <MovieScroller 
          hideTrash
          mediaPages={mediaPages}
          isLoading={isLoading}
          mediaType={config?.mediaType}
          setPopupId={setPopupId}
          onScrollEnd={()=>{
            const loading = loadingRef.current;
            if(loading){
              return;
            }
            const lastPage = mediaPagesRef.current[mediaPagesRef.current.length - 1];
            if(!lastPage || !lastPage.results || lastPage.results.length === 0){
                return;
            }
            window.scrollBy({top: -50, behavior: 'instant'});
            loadPages(lastPage.page + 1, 5, mediaPagesRef.current);
          }}
        />
        {config?.mediaType && config.mediaType !== "person" && popupId !== null && 
          <MediaPopup mediaType={config.mediaType} id={popupId} onClose={()=>{
            setPopupId(null);
            window.history.pushState({}, "", `/search`);
          }} />
        }
        {config?.mediaType && config.mediaType === "person" && popupId !== null && 
          <PersonPopup id={popupId} onClose={()=>{
            setPopupId(null);
            window.history.pushState({}, "", `/search`);
          }} />
        }
      </main>

    </div>
  </>)
}
