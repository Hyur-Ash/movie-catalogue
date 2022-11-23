import STORE from '/lib/store.json';
import { useState, useEffect, createContext } from 'react';
import axios from 'axios';
import {useLocalStorage} from '/lib/useLocalStorage';
import {useRouter} from 'next/router';

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
    const [lastDiscover, setLastDiscover] = useLocalStorage('lastDiscover', null);
    const [lastSingleDiscover, setLastSingleDiscover] = useState(null);
    const [discoveredMedias, setDiscoveredMedias] = useState([]);
    const [singleMedia, setSingleMedia] = useState(null);
    const [currentDPage, setCurrentDPage] = useLocalStorage('currentDPage', 1);
    const [totalDPages, setTotalDPages] = useState();
    const discoverMedias = (formValues) => {
        setLastDiscover(null);
        setLastDiscover(JSON.parse(JSON.stringify(formValues)));
    }
    useEffect(()=>{
        if(router.pathname !== '/discover' || !lastDiscover){
            return;
        }
        const currentNames = properNames[lastDiscover.mediaType.value];
        setLoadingMedias(true);
        const params = {
            api_key: tmdb_api_key,
            sort_by: `${lastDiscover.sortBy.value}.${lastDiscover.orderBy.value}`,
            with_genres: `${lastDiscover.withGenres.map(e=>e.value).toString()}`,
            without_genres: `${lastDiscover.withoutGenres.map(e=>e.value).toString()}`,
            page: currentDPage,
            language: websiteLang,
            with_original_language: lastDiscover.originalLanguage.value === 'any' ? '' : lastDiscover.originalLanguage.value,
            ["vote_average.gte"]: lastDiscover.voteAverageFrom.value === 'any' ? '' : lastDiscover.voteAverageFrom.value.toString(),
            ["vote_count.gte"]: lastDiscover.voteCountFrom.toString(),
        }
        if(lastDiscover.mediaType.value === 'movie'){
            if(isVoteAverageRange){
                params["vote_average.lte"] = lastDiscover.voteAverageTo.value === 'any' ? '' :lastDiscover.voteAverageTo.value.toString();
            }
            if(isVoteCountRange){
                params["vote_count.lte"] = lastDiscover.voteCountTo.toString();
            }
        }
        if(!isYearRange){
            params[currentNames.primary_release_year] = lastDiscover.yearFrom.value;
        }else{
            params[currentNames["primary_release_date.gte"]] = lastDiscover.yearFrom.value.length > 0 ? lastDiscover.yearFrom.value : '0';
            params[currentNames["primary_release_date.lte"]] = lastDiscover.yearTo.value.length > 0 ? lastDiscover.yearTo.value : '3000';
        }
        axios.get(`${tmdb_main_url}/discover/${lastDiscover.mediaType.value}`, {params})
        .then(res=>{
            console.log(res.data)
            setDiscoveredMedias(res.data.results);
            setCurrentDPage(res.data.page)
            setTotalDPages(res.data.total_pages);
            setLoadingMedias(Date.now());
        })
        .catch(err=>{
            console.error(err);
            setLoadingMedias(Date.now());
        });
    },[lastDiscover, currentDPage, websiteLang, router]);

    const [lastSearch, setLastSearch] = useLocalStorage('lastSearch', null);
    const [currentSPage, setCurrentSPage] = useLocalStorage('currentSPage', 1);
    const [totalSPages, setTotalSPages] = useState();
    const [searchedMedias, setSearchedMedias] = useState([]);
    const searchMedias = (formValues) => {
        setLastSearch(null);
        setLastSearch(JSON.parse(JSON.stringify(formValues)));
    }
    useEffect(()=>{
        if(router.pathname !== '/' || !lastSearch){
            return;
        }
        const currentNames = properNames[lastSearch.mediaType.value];
        setLoadingMedias(Date.now());
        const params = {
            api_key: tmdb_api_key,
            query: lastSearch.query.trim().length > 0 ? lastSearch.query : tmdb_api_key,
            page: currentSPage,
            language: websiteLang,
            [currentNames.primary_release_year]: lastSearch.year.value
        }

        console.log(params)
       
        axios.get(`${tmdb_main_url}/search/${lastSearch.mediaType.value}`, {params})
        .then(res=>{
            console.log(res.data)
            setSearchedMedias(res.data.results);
            setCurrentSPage(res.data.page)
            setTotalSPages(res.data.total_pages);
            setLoadingMedias(Date.now());
        })
        .catch(err=>{
            console.error(err);
            setLoadingMedias(Date.now());
        });
    },[lastSearch, currentSPage, websiteLang, router]);

    const loadSingleMedia = (media, id) => {
        setLastSingleDiscover({media, id});
    }
    useEffect(()=>{
        if((router.pathname !== '/movie/[id]' && router.pathname !== '/tv/[id]') || lastSingleDiscover === null){
            return;
        }else{
            setLoadingMedias(true);
            const params = {
                api_key: tmdb_api_key,
                language: websiteLang,
            }
            const {media, id} = lastSingleDiscover;
            setLastSingleDiscover(null);
            axios.get(`${tmdb_main_url}/${media}/${id}`, {params})
            .then(res=>{
                const langVersion = res.data;
                console.log(res.data)
                params.language = 'en';
                axios.get(`${tmdb_main_url}/${media}/${id}`, {params})
                .then(res=>{
                    setSingleMedia({
                        [websiteLang]: langVersion,
                        en: res.data
                    });
                    setLoadingMedias(Date.now());
                })
                .catch(err=>{
                    console.error(err);
                    setLoadingMedias(Date.now());
                });
            })
            .catch(err=>{
                console.error(err);
                setLoadingMedias(Date.now());
            });
        }
    },[lastSingleDiscover, websiteLang]);

    const [favorites, setFavorites] = useLocalStorage('favorites', {movie: [], tv: []});
    
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
  
    return (
        <Context.Provider value={{
            tmdb_main_url, tmdb_api_key,
            movieGenres, tvGenres, yearsContent, sortValues,
            discoveredMedias, singleMedia, setSingleMedia, discoverMedias, loadingMedias, loadSingleMedia, lastDiscover,
            totalDPages, currentDPage, setCurrentDPage, translate,
            websiteLang, setWebsiteLang, languageCodes,
            languagesOptions, favorites, setFavorites,
            originLink, setOriginLink, searchMedias, searchedMedias,
            fromValue, toValue, totalSPages, setTotalSPages, currentSPage, setCurrentSPage, lastSearch, properNames,
            isYearRange, setIsYearRange,
            isVoteAverageRange, setIsVoteAverageRange,
            isVoteCountRange, setIsVoteCountRange, setDiscoveredMedias
        }}>
            {children}
        </Context.Provider>
    )
}