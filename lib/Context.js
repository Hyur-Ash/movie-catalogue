import STORE from '/lib/store.json';
import { useState, useEffect, createContext } from 'react';
import axios from 'axios';
import {useLocalStorage} from '/lib/useLocalStorage';
import {useRouter} from 'next/router';
import { useData } from '/lib/useData';

export const Context = createContext();

export const ContextProvider = ({children}) => {

    const router = useRouter();

    const tmdb_api_key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const tmdb_main_url = "https://api.themoviedb.org/3";
    const {languageCodes, movieGenres, tvGenres, sortValues, translations} = STORE;

    const [websiteLang, setWebsiteLang] = useLocalStorage('websiteLang', 'it');
    const translate = (word) => {
        if(translations[word]){
            return translations[word][websiteLang] ?? word;
        }else{
            return word;
        }
    }
    //Making years content
    const yearsContent = [];
    const today = new Date();
    const thisYear = today.getFullYear();
    for(let i=thisYear+2; i>=1990; i--){
        yearsContent.push({
            name: i.toString(),
            id: i.toString(),
        }) 
    }

    const properNames = {
        movie: {
            release_date: "release_date",
            title: "title",
            original_title: "original_title",
            runtime: "runtime",
            primary_release_year: "primary_release_year",
            "primary_release_date.gte": "primary_release_date.gte",
            "primary_release_date.lte": "primary_release_date.lte",
            year: "year",
        },
        tv: {
            release_date: "first_air_date",
            title: "name",
            original_title: "original_name",
            runtime: "episode_run_time",
            primary_release_year: "first_air_date_year",
            "primary_release_date.gte": "first_air_date.gte",
            "primary_release_date.lte": "first_air_date.lte",
        }
    }

    const languagesOptions = [
        {value: "it", label: <img className="lang-flag" alt="IT" src="/img/flags/it.svg"/>},
        {value: "en", label: <img className="lang-flag" alt="EN" src="/img/flags/en.svg"/>},
        {value: "ru", label: <img className="lang-flag" alt="RU" src="/img/flags/ru.svg"/>},
      ];

    const [originLink, setOriginLink] = useLocalStorage('originLink', '');

    const fromValue = (value) => {
        return value.length > 0 ? parseInt(value) : 0;
      }
    const toValue = (value) => {
        return value.length > 0 ? parseInt(value) : 3000;
    }
    
    const [isYearRange, setIsYearRange] = useLocalStorage('isYearRange', false);
    const [isVoteAverageRange, setIsVoteAverageRange] = useLocalStorage('isVoteAverageRange', false);
    const [isVoteCountRange, setIsVoteCountRange] = useLocalStorage('isVoteCountRange', false);

    const [users, setUsers] = useData("users", []);
    const [currentUser, setCurrentUser] = useLocalStorage("currentUser", null);
    const [currentUserIndex, setCurrentUserIndex] = useLocalStorage("currentUserIndex", null);
    useEffect(()=>{
        if(currentUserIndex === null){
            setCurrentUser(null);
            return;
        }
        if(users && users[currentUserIndex]){
            setCurrentUser(users[currentUserIndex]);
        }
    },[users, currentUserIndex]);

    const setFavorites = (favs) => {
        const currUsers = JSON.parse(JSON.stringify(users));
        currUsers[currentUserIndex].favorites = favs;
        setUsers(currUsers);
    }

    const setTrash = (favs) => {
        const currUsers = JSON.parse(JSON.stringify(users));
        currUsers[currentUserIndex].trashed = favs;
        setUsers(currUsers);
    }

    const [favorites, changeFavorites] = useState({movie: [], tv: []});
    const [trashed, setTrashed] = useState({movie: [], tv: []});
    useEffect(()=>{
        changeFavorites(currentUser?.favorites ?? {movie: [], tv: []})
        setTrashed(currentUser?.trashed ?? {movie: [], tv: []})
    },[currentUser]);

    const getMedia = async (mediaType, id, lang) => {
        const keywordsLabel = mediaType === "movie" ? "keywords" : "results";
        const params = {
            api_key: tmdb_api_key,
        }
        try{
            const langMediaInfo = await axios.get(`${tmdb_main_url}/${mediaType}/${id}`, {params:{...params, language: lang,}});
            const engMediaInfo = lang === "en" ? langMediaInfo : await axios.get(`${tmdb_main_url}/${mediaType}/${id}`, {params:{...params, language: "en",}});
            const socialInfo = await axios.get(`${tmdb_main_url}/${mediaType}/${id}/external_ids`, {params});
            const creditsInfo = await axios.get(`${tmdb_main_url}/${mediaType}/${id}/credits`, {params});
            const keywordsInfo = await axios.get(`${tmdb_main_url}/${mediaType}/${id}/keywords`, {params});
            const test = await axios.get(`${tmdb_main_url}/${mediaType}/${id}/recommendations`, {params});
            console.log(test.data)
            const media = {
                [lang] : langMediaInfo.data,
                ["en"] : engMediaInfo.data,
                socials: socialInfo.data,
                credits: creditsInfo.data,
                aftercreditsstinger: keywordsInfo.data[keywordsLabel].map(k=>k.name).includes("aftercreditsstinger"),
                duringcreditsstinger: keywordsInfo.data[keywordsLabel].map(k=>k.name).includes("duringcreditsstinger"),
                keywords: keywordsInfo.data[keywordsLabel].filter(k=>k.name!=="aftercreditsstinger" && k.name!=="duringcreditsstinger"),
            };
            console.log(media)
            return media;
        }catch(error){
            console.error(error);
        }
    }

    const [scrollId, setScrollId] = useLocalStorage("scrollId", false);

    return (
        <Context.Provider value={{
            tmdb_api_key,
            tmdb_main_url,
            languageCodes, movieGenres, tvGenres, sortValues,
            websiteLang, setWebsiteLang, translate,
            yearsContent,
            properNames,
            languagesOptions,
            originLink, setOriginLink,
            fromValue, toValue,
            isYearRange, setIsYearRange,
            isVoteAverageRange, setIsVoteAverageRange,
            isVoteCountRange, setIsVoteCountRange,
            users, setUsers,
            currentUser, setCurrentUser,
            currentUserIndex, setCurrentUserIndex,
            favorites, setFavorites,
            trashed, setTrash,
            getMedia,
            scrollId, setScrollId
        }}>
            {children}
        </Context.Provider>
    )
}