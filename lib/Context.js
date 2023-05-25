import STORE from '/lib/store.json';
import { useState, useEffect, createContext } from 'react';
import axios from 'axios';
import {useLocalStorage} from '/lib/useLocalStorage';
import {useRouter} from 'next/router';
import { useData } from '/lib/useData';
import { useUser } from '/lib/useUser';

export const Context = createContext();

export const ContextProvider = ({children}) => {

    const api_key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const [tmdbConfig, setTmdbconfig] = useLocalStorage("tmdbConfig", null);
    // const [tmdbConfig, setTmdbconfig] = useState(null);
    const getTmdbConfig = async () => {
        const params = {api_key};
        try{
            const generalInfo = await axios.get(`${tmdb_main_url}/configuration`, {params});
            const jobsInfo = await axios.get(`${tmdb_main_url}/configuration/jobs`, {params});
            const countriesInfo = await axios.get(`${tmdb_main_url}/configuration/countries`, {params});
            const languagesInfo = await axios.get(`${tmdb_main_url}/configuration/languages`, {params});
            const movieGenresInfo = await axios.get(`${tmdb_main_url}/genre/movie/list`, {params});
            const tvGenresInfo = await axios.get(`${tmdb_main_url}/genre/tv/list`, {params});
            const config = {
                sort_values: [
                    {"id": "popularity", "name":"Popularity"},
                    {"id": "primary_release_date", "name":"Release Date"},
                    {"id": "revenue", "name":"Revenue"},
                    {"id": "original_title", "name":"Original title"},
                    {"id": "vote_average", "name":"Vote Average"},
                    {"id": "vote_count", "name":"Vote Count"}
                ],
                general: generalInfo.data,
                jobs: jobsInfo.data,
                countries: countriesInfo.data,
                languages: languagesInfo.data,
                genres: {
                    movie: movieGenresInfo.data.genres, 
                    tv: tvGenresInfo.data.genres
                },

            };
            return config;
        }catch(error){
            console.error(error);
        }
    }
    useEffect(()=>{
        getTmdbConfig()
        .then(config => {
            if(JSON.stringify(config) !== JSON.stringify(tmdbConfig)){
                setTmdbconfig(config);
                console.log("tmdvConfig updated.")
            }
        }).catch(error => {
            console.error(error);
        })
    },[]);

    
    const tmdb_main_url = "https://api.themoviedb.org/3";
    const {translations} = STORE;

    // console.log(tmdbConfig)

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
    for(let i=thisYear+2; i>=1900; i--){
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

    const fromValue = (value) => {
        return value.length > 0 ? parseInt(value) : 0;
      }
    const toValue = (value) => {
        return value.length > 0 ? parseInt(value) : 3000;
    }

    const User = useUser();

    const getMedia = async (mediaType, id, lang) => {
        const keywordsLabel = mediaType === "movie" ? "keywords" : "results";
        const params = {api_key}
        try{
            const langMediaInfo = await axios.get(`${tmdb_main_url}/${mediaType}/${id}`, {params:{...params, language: lang,}});
            const engMediaInfo = lang === "en" ? langMediaInfo : await axios.get(`${tmdb_main_url}/${mediaType}/${id}`, {params:{...params, language: "en",}});
            const socialInfo = await axios.get(`${tmdb_main_url}/${mediaType}/${id}/external_ids`, {params});
            const creditsInfo = await axios.get(`${tmdb_main_url}/${mediaType}/${id}/credits`, {params});
            const keywordsInfo = await axios.get(`${tmdb_main_url}/${mediaType}/${id}/keywords`, {params});
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

    const getPerson = async (id, lang) => {
        const params = {api_key};
        try{
            const langMediaInfo = await axios.get(`${tmdb_main_url}/person/${id}`, {params:{...params, language: lang,}});
            const engMediaInfo = lang === "en" ? langMediaInfo : await axios.get(`${tmdb_main_url}/person/${id}`, {params:{...params, language: "en",}});
            const moviesInfo = await axios.get(`${tmdb_main_url}/person/${id}/movie_credits`, {params:{...params, language: lang,}});
            const tvInfo = await axios.get(`${tmdb_main_url}/person/${id}/tv_credits`, {params:{...params, language: lang,}});
            const socialInfo = await axios.get(`${tmdb_main_url}/person/${id}/external_ids`, {params:{...params}});
            const media = {
                [lang] : langMediaInfo.data,
                ["en"] : engMediaInfo.data,
                movie: moviesInfo.data,
                tv: tvInfo.data,
                socials: socialInfo.data
            };
            console.log(media);
            return media;
        }catch(error){
            console.error(error);
        }
    }

    return (
        <Context.Provider value={{
            User,
            api_key,
            tmdbConfig,
            tmdb_main_url,
            websiteLang, setWebsiteLang, translate,
            yearsContent,
            properNames,
            languagesOptions,
            fromValue, toValue,
            getMedia, getPerson,
        }}>
            {children}
        </Context.Provider>
    )
}