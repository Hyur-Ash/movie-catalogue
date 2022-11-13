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

    const [loadingMovies, setLoadingMovies] = useState(false);
    const [lastSearch, setLastSearch] = useState();
    const [movies, setMovies] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState();
    const [totalResults, setTotalResults] = useState();
    const loadMovies = (formValues) => {
        setLastSearch(JSON.parse(JSON.stringify(formValues)));
    }
    useEffect(()=>{
        if(lastSearch){
            setLoadingMovies(true);
            const params = {
                api_key: tmdb_api_key,
                sort_by: `${lastSearch.sortBy.value}.${lastSearch.orderBy.value}`,
                with_genres: `${lastSearch.withGenres.map(e=>e.value).toString()}`,
                without_genres: `${lastSearch.withoutGenres.map(e=>e.value).toString()}`,
                year:lastSearch.year.value,
                page: currentPage,
                language: websiteLang
            }
            axios.get(`${tmdb_main_url}/discover/${lastSearch.mediaType.value}`, {params})
            .then(res=>{
                console.log(res.data)
                setMovies(res.data.results);
                setCurrentPage(res.data.page)
                setTotalPages(res.data.total_pages);
                setTotalResults(res.data.total_results);
                setLoadingMovies(false);
            })
            .catch(err=>{
                console.error(err);
                setLoadingMovies(false);
            });
        }
    },[lastSearch, currentPage, websiteLang])
  
    return (
        <Context.Provider value={{
            movieGenres, tvGenres, yearsContent, sortValues,
            movies, loadMovies, loadingMovies, 
            totalPages, setCurrentPage, translate,
            websiteLang, setWebsiteLang
        }}>
            {children}
        </Context.Provider>
    )
}