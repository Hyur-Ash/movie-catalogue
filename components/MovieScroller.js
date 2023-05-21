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
import {FaStar, FaFilm, FaSearch, FaTrash} from 'react-icons/fa';
import {TfiLayoutMediaLeft as LogoIcon} from 'react-icons/tfi';
import Link from 'next/link';
import {AiOutlineLoading} from 'react-icons/ai';

export default function MovieScroller({config, hideTrash}){

    const router = useRouter();

    const {
        websiteLang
    } = useContext(Context);

    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);

    const [configCopy, setConfigCopy] = useState(config);
    const configRef = useRef(config);
    useEffect(()=>{
        setConfigCopy(config);
    },[config]);
    useEffect(()=>{
        configRef.current = configCopy;
        if(!isLoading && configRef.current){
            setMediaPages([]);
            loadPages(1, 5, []);
        }
    },[configCopy]);

    useEffect(()=>{
        if(configCopy && websiteLang !== configCopy.language){
            setConfigCopy({
                ...configCopy,
                params: {
                    ...configCopy.params,
                    language: websiteLang 
                }
            });
        }
    },[websiteLang])

    const [mediaPages, setMediaPages] = useState([]);
    const mediaPagesRef = useRef();
    mediaPagesRef.current = mediaPages;
    const [isLoading, setIsLoading] = useState(false);
    const isLoadingRef = useRef(false);
    isLoadingRef.current = isLoading;
    const getPage = async (pageNum) => {
        const tmdb_main_url = "https://api.themoviedb.org/3";
        const params = {page: pageNum, ...configRef.current.params};
        try{
            const res = await axios.get(`${tmdb_main_url}/discover/${configRef.current.mediaType}`, {params});
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
        setIsLoading(true)
        const pages = JSON.parse(JSON.stringify(startPages));
        for(let i=start; i<start+step; i++){
            pages.push(await getPage(i));
        }
        setMediaPages(pages);
        setTimeout(()=>{setIsLoading(false)}, 1000);
    }

    const endScrollRef = useRef();
    
    useEffect(()=>{
        window.addEventListener("scroll", async () => {
            const loading = isLoadingRef.current;
            if(loading || !endScrollRef || !endScrollRef.current){return;}
            const endScrolLPos = endScrollRef.current.getBoundingClientRect();
            const isVisible = endScrolLPos.top < window.innerHeight && endScrolLPos.bottom > 0;
            const pages = JSON.parse(JSON.stringify(mediaPagesRef.current));
            if(!isVisible || !configRef.current){return;}
            const lastPage = pages[pages.length - 1];
            if(!lastPage || !lastPage.results || lastPage.results.length === 0){
                return;
            }
            window.scrollBy({top: -50, behavior: 'instant'});
            await loadPages(lastPage.page, 5, pages);
            window.scrollBy({top: 50, behavior: 'instant'});
        })
    },[])

    return isMounted && (<>
        <div className="movie-scroller">
          {/* <div style={{height: "70px"}} ref={scrollElementRef}></div> */}
          {/* {discoveredMedias.length > 0 && <>
            <Navigator
              forcePageChange={forcePageChange}
              setForcePageChange={setForcePageChange}
              currentPage={currentDPage}
              disabled={loadingMedias === true}
              pagesToShow={7}
              numPages={totalDPages}
              onChange={(pageNum)=>{setCurrentDPage(pageNum); scrollElementRef.current.scrollIntoView();}}
            />
            <div className="medias">
              {discoveredMedias.map((media, i) => (
                <MediaCover hideTrash mediaType={lastDiscover.mediaType.value} showTitle data={media} key={`media${i}`} href={`/${lastDiscover.mediaType.value}/${media.id}`}/>
              ))}
            </div>
          </>} */}
          {configRef.current && mediaPages.length > 0 &&
            <div className="medias">
                {mediaPages.map((mediaPage, pageIndex) => mediaPage && (
                    <MediaPage 
                        key={`page${pageIndex}`} 
                        mediaPage={mediaPage} 
                        mediaType={configRef.current.mediaType}
                        hideTrash={hideTrash}
                    />
                ))}
            </div>
          }
        </div>
        <div className={`end-scroll ${isLoading ? "loading" : ""}`} ref={endScrollRef}>
            <AiOutlineLoading className="loader"/>
        </div>
    </>)
}

const MediaPage = ({mediaType, mediaPage, hideTrash}) => {
    return (<>
        {mediaPage.results.map((media, i) => (
            <MediaCover
                page={mediaPage.page}
                index={i}
                key={`media${i}`} 
                mediaType={mediaType} 
                showTitle 
                data={media} 
                href={`/${mediaType}/${media.id}`}
                hideTrash={hideTrash}
            />
        ))}
    </>)
}