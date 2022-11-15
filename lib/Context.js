import STORE from '/lib/store.json';
import { useState, useEffect, createContext } from 'react';
import axios from 'axios';
import {useLocalStorage} from '/lib/useLocalStorage';

export const Context = createContext();

export const ContextProvider = ({children}) => {

    const tmdb_api_key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const tmdb_main_url = "https://api.themoviedb.org/3";
    const {movieGenres, tvGenres, sortValues, languageCodes, translations} = STORE;

    const [websiteLang, setWebsiteLang] = useState('it');
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

    const properNames = {
        movie: {
          release_date: "release_date",
          title: "title",
          original_title: "original_title",
          runtime: "runtime"
        },
        tv: {
          release_date: "first_air_date",
          title: "name",
          original_title: "original_name",
          runtime: "episode_run_time"
        }
      }
    const [currentNames, setCurrentNames] = useState(properNames.movie);

    const [loadingMedias, setLoadingMedias] = useState(false);
    const [lastSearch, setLastSearch] = useLocalStorage('lastSearch', null);
    useEffect(()=>{
        if(lastSearch){
          setCurrentNames(properNames[lastSearch.mediaType.value]);
        }
      },[lastSearch?.mediaType])
    const [lastSingleSearch, setLastSingleSearch] = useState(null);
    const [medias, setMedias] = useState([]);
    const [singleMedia, setSingleMedia] = useState(null);
    const [currentPage, setCurrentPage] = useLocalStorage('currentPage', 1);
    const [totalPages, setTotalPages] = useState();
    const [totalResults, setTotalResults] = useState();
    const loadMedias = (formValues) => {
        setLastSearch(null);
        setLastSearch(JSON.parse(JSON.stringify(formValues)));
    }
    useEffect(()=>{
        if(lastSearch){
            setLoadingMedias(true);
            const params = {
                api_key: tmdb_api_key,
                sort_by: `${lastSearch.sortBy.value}.${lastSearch.orderBy.value}`,
                with_genres: `${lastSearch.withGenres.map(e=>e.value).toString()}`,
                without_genres: `${lastSearch.withoutGenres.map(e=>e.value).toString()}`,
                page: currentPage,
                language: websiteLang,
            }
            if(!isYearRange){
                params.primary_release_year = lastSearch.yearFrom.value;
            }else{
                params["primary_release_date.gte"] = lastSearch.yearFrom.value.length > 0 ? lastSearch.yearFrom.value : '0';
                params["primary_release_date.lte"] = lastSearch.yearTo.value.length > 0 ? lastSearch.yearTo.value : '3000';
            }
            axios.get(`${tmdb_main_url}/discover/${lastSearch.mediaType.value}`, {params})
            .then(res=>{
                console.log(res.data)
                setMedias(res.data.results);
                setCurrentPage(res.data.page)
                setTotalPages(res.data.total_pages);
                setTotalResults(res.data.total_results);
                setLoadingMedias(false);
            })
            .catch(err=>{
                console.error(err);
                setLoadingMedias(false);
            });
        }
    },[lastSearch, currentPage, websiteLang]);

    const loadSingleMedia = (media, id) => {
        setLastSingleSearch({media, id});
    }
    useEffect(()=>{
        if(lastSingleSearch !== null){
            setLoadingMedias(true);
            const params = {
                api_key: tmdb_api_key,
                language: websiteLang,
            }
            const {media, id} = lastSingleSearch;
            setLastSingleSearch(null);
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
                    setLoadingMedias(false);
                })
                .catch(err=>{
                    console.error(err);
                    setLoadingMedias(false);
                });
            })
            .catch(err=>{
                console.error(err);
                setLoadingMedias(false);
            });
        }
    },[lastSingleSearch, websiteLang]);

    const [favorites, setFavorites] = useLocalStorage('favorites', {movie: [], tv: []});
    
    const [originLink, setOriginLink] = useLocalStorage('originLink', '');

    const [isYearRange, setIsYearRange] = useState(false);
    
  
    return (
        <Context.Provider value={{
            movieGenres, tvGenres, yearsContent, sortValues,
            medias, singleMedia, setSingleMedia, loadMedias, loadingMedias, loadSingleMedia, lastSearch,
            totalPages, currentPage, setCurrentPage, translate,
            websiteLang, setWebsiteLang, languageCodes,
            currentNames, languagesOptions, favorites, setFavorites,
            originLink, setOriginLink, isYearRange, setIsYearRange
        }}>
            {children}
        </Context.Provider>
    )
}