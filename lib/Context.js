import STORE from '/lib/store.json';
import { useState, useEffect, createContext } from 'react';
import axios from 'axios';
import {useLocalStorage} from '/lib/useLocalStorage';

export const Context = createContext();

export const ContextProvider = ({children}) => {

    const tmdb_api_key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const tmdb_main_url = "https://api.themoviedb.org/3";
    const {translations} = STORE;

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

    const capitalize = (string) =>{
        const words = string.split(' ');
        let newString = '';
        words.forEach((word, i)=>{
            newString += `${word.charAt(0).toUpperCase()}${word.substring(1, word.length)}`;
            if(i < words.length - 1){
            newString += ' ';
            }
        })
        return newString;
    }
    const languagesOptions = [
        {value: "it", label: <img className="lang-flag" alt="IT" src="/img/flags/it.svg"/>},
        {value: "en", label: <img className="lang-flag" alt="EN" src="/img/flags/en.svg"/>},
        {value: "ru", label: <img className="lang-flag" alt="RU" src="/img/flags/ru.svg"/>},
      ];

    const [loadingMedias, setLoadingMedias] = useState(Date.now());

    const [favorites, setFavorites] = useLocalStorage('favorites', {movie: [], tv: []});
    
    const [originLink, setOriginLink] = useLocalStorage('originLink', '');

    const [isYearRange, setIsYearRange] = useLocalStorage('isYearRange', false);

    return (
        <Context.Provider value={{
            tmdb_main_url, tmdb_api_key,
            yearsContent, setLoadingMedias,
            loadingMedias, translate,
            websiteLang, setWebsiteLang,
            languagesOptions, favorites, setFavorites,
            properNames, originLink, setOriginLink,
            isYearRange, setIsYearRange,
        }}>
            {children}
        </Context.Provider>
    )
}