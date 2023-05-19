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

export default function MovieScroller({config, hideTrash}){

    const router = useRouter();

    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);

    const {
        trashed
    } = useContext(Context);

    const trashIncludes = (id) => {
        let isIncluded = false;
        if(trashed && trashed[configRef.current.mediaType]){
          trashed[configRef.current.mediaType].forEach(media=>{
            if(media.id === id){
              isIncluded = true;
            }
          });
        }
        return isIncluded;
      }

    const [mediaPages, setMediaPages] = useState([]);
    const mediaPagesRef = useRef();
    mediaPagesRef.current = mediaPages;
    const isLoading = useRef(false);
    const getPage = async (pageNum) => {
        const tmdb_main_url = "https://api.themoviedb.org/3";
        const params = {page: pageNum, ...configRef.current.params};
        try{
            const res = await axios.get(`${tmdb_main_url}/discover/${configRef.current.mediaType}`, {params});
            const results = [];
            res.data.results.forEach(result => {
                if(hideTrash && trashIncludes(result.id)){
                    return;
                }
                results.push({...result, page: pageNum});
            });
            return {...res.data, results};
        }catch(error){
            console.error(error);
        }
    }
    const loadPages = async (start, step, startPages) => {
        const pages = JSON.parse(JSON.stringify(startPages));
        for(let i=start; i<start+step; i++){
            pages.push(await getPage(i));
        }
        setMediaPages(pages);
    }

    useEffect(()=>{
        setMediaPages(curr => {
            const pages = JSON.parse(JSON.stringify(curr));
            pages.forEach(page => {
                page.results = page.results.filter(media => !trashIncludes(media.id));
            });
            return pages;
        })
    },[trashed])

    const configRef = useRef(config);
    useEffect(()=>{
        configRef.current = config;
        if(!isLoading.current && configRef.current){
            loadPages(1, 5, []);
        }
    },[config])

    useEffect(()=>{
        console.log(mediaPages)
    },[mediaPages]);

    const endScrollRef = useRef();
    
    useEffect(()=>{
        window.addEventListener("scroll", async () => {
            if(isLoading.current || !endScrollRef || !endScrollRef.current){return;}
            const endScrolLPos = endScrollRef.current.getBoundingClientRect();
            const isVisible = endScrolLPos.top < window.innerHeight && endScrolLPos.bottom > 0;
            const pages = JSON.parse(JSON.stringify(mediaPagesRef.current));
            if(!isVisible || !configRef.current){return;}
            isLoading.current = true;
            const lastPage = pages[pages.length - 1];
            if(!lastPage || !lastPage.results || lastPage.results.length === 0){
                return;
            }
            window.scrollBy({top: -50, behavior: 'instant'});
            await loadPages(lastPage.page, 5, pages);
            window.scrollBy({top: 50, behavior: 'instant'});
            setTimeout(()=>{isLoading.current = false;}, 1000);
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
          {mediaPages.length > 0 &&
            <div className="medias">
                {mediaPages.map((mediaPage, pageIndex) => mediaPage && (
                    <MediaPage 
                        key={`page${pageIndex}`} 
                        mediaPage={mediaPage} 
                        mediaType={config.mediaType}
                    />
                ))}
            </div>
          }
        </div>
        <div className="end-scroll" ref={endScrollRef}></div>
    </>)
}

const MediaPage = ({mediaType, mediaPage}) => {
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
                onDelete={()=>{

                }}
            />
        ))}
    </>)
}