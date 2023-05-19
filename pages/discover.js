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
import DiscoverForm from '/components/DiscoverForm';

export default function Discover() {

  const [isMounted, setIsMounted] = useState(false);
  useEffect(()=>{
    setIsMounted(true);
  },[]);

  const {
    translate, currentUser, websiteLang, properNames,
    isVoteAverageRange, isVoteCountRange, isYearRange,
  } = useContext(Context);

  const router = useRouter();
  useEffect(()=>{
    if(!currentUser){
      router.push("/");
    }
  },[currentUser]);

  const [scrollerConfig, setScrollerConfig] = useState(null);
  const changeScrollerConfig = async (formValues) => {
        
    const tmdb_api_key = process.env.NEXT_PUBLIC_TMDB_API_KEY;

    const FV = JSON.parse(JSON.stringify(formValues));
    const currentNames = properNames[FV.mediaType.value];
    const params = {
        api_key: tmdb_api_key,
        sort_by: `${FV.sortBy.value}.${FV.orderBy.value}`,
        with_genres: `${FV.withGenres.map(e=>e.value).toString()}`,
        without_genres: `${FV.withoutGenres.map(e=>e.value).toString()}`,
        language: websiteLang,
        with_original_language: FV.originalLanguage.value === 'any' ? '' : FV.originalLanguage.value,
        ["vote_average.gte"]: FV.voteAverageFrom.value === 'any' ? '' : FV.voteAverageFrom.value.toString(),
        ["vote_count.gte"]: FV.voteCountFrom.toString(),
    }
    if(FV.mediaType.value === 'movie'){
        if(isVoteAverageRange){
            params["vote_average.lte"] = FV.voteAverageTo.value === 'any' ? '' :FV.voteAverageTo.value.toString();
        }
        if(isVoteCountRange){
            params["vote_count.lte"] = FV.voteCountTo.toString();
        }
    }
    if(!isYearRange){
        params[currentNames.primary_release_year] = FV.yearFrom.value;
    }else{
        params[currentNames["primary_release_date.gte"]] = FV.yearFrom.value.length > 0 ? FV.yearFrom.value : '0';
        params[currentNames["primary_release_date.lte"]] = FV.yearTo.value.length > 0 ? FV.yearTo.value : '3000';
    }
    setScrollerConfig({params, mediaType: FV.mediaType.value});
  }

  return isMounted && currentUser && (<>
    <Head>
      <title>{translate("Hyur's Media Library")}</title>
      <meta name="description" content="Created by Hyur" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Header />
    <div className="my-container">
      
      <h2 className="page-title">{translate("Discover")}</h2>

      <main>
        <DiscoverForm 
          onSubmit={formValues => {
            setScrollerConfig(null);
            changeScrollerConfig(formValues);
          }}
        />
        <MovieScroller 
          hideTrash
          config={scrollerConfig}
        />
      </main>

    </div>
  </>)
}
