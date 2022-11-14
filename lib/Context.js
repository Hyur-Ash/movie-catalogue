import STORE from '/lib/store.json';
import { useState, useEffect, createContext } from 'react';
import axios from 'axios';

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

    const [loadingMedias, setLoadingMedias] = useState(false);
    const [lastSearch, setLastSearch] = useState(null);
    const [lastSingleSearch, setLastSingleSearch] = useState(null);
    const [medias, setMedias] = useState([]);
    const [singleMedia, setSingleMedia] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
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
                primary_release_year:lastSearch.year.value,
                page: currentPage,
                language: websiteLang,
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

    const loadSingleMedia = (id) => {
        setLastSingleSearch(id);
    }
    useEffect(()=>{
        if(lastSingleSearch !== null){
            setLastSingleSearch(null);
            setLoadingMedias(true);
            const params = {
                api_key: tmdb_api_key,
                language: websiteLang,
            }
            const mediaType = lastSearch.mediaType.value;
            axios.get(`${tmdb_main_url}/${mediaType}/${lastSingleSearch}`, {params})
            .then(res=>{
                const langVersion = res.data;
                console.log(res.data)
                params.language = 'en';
                axios.get(`${tmdb_main_url}/${mediaType}/${lastSingleSearch}`, {params})
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
    },[lastSingleSearch, websiteLang])
    
  
    return (
        <Context.Provider value={{
            movieGenres, tvGenres, yearsContent, sortValues,
            medias, singleMedia, setSingleMedia, loadMedias, loadingMedias, loadSingleMedia,
            totalPages, setCurrentPage, translate,
            websiteLang, setWebsiteLang, languageCodes
        }}>
            {children}
        </Context.Provider>
    )
}