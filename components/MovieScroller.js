import Head from 'next/head';
import {useState, useEffect, useContext, useRef, Fragment} from 'react';
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

export default function MovieScroller({mediaPages, mediaType, hideTrash, isLoading, onScrollEnd, setPopupId}){

    const {
        translate,
    } = useContext(Context);

    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);

    const endScrollRef = useRef();
    
    useEffect(()=>{
        window.addEventListener("scroll", async () => {
            if(!endScrollRef || !endScrollRef.current){return;}
            const endScrolLPos = endScrollRef.current.getBoundingClientRect();
            const isVisible = endScrolLPos.top < window.innerHeight && endScrolLPos.bottom > 0;
            if(isVisible){
                onScrollEnd();
            }
        })
    },[]);

    const [filtersConfig, setFiltersConfig] = useLocalStorage("movieScrollerFiltersConfig", {
        showTrashed: false,
        showFavorites: true
    });
    const changeFiltersConfig = (key, value) => {
        setFiltersConfig(curr => ({...curr, [key]: value}));
    }

    return isMounted && (<>
        <div className="scroller-filters">
            <FormGroup switch>
                <Input
                    type="switch"
                    role="switch"
                    checked={filtersConfig.showFavorites || false}
                    onChange={(e)=>{changeFiltersConfig("showFavorites", e.target.checked)}}
                />
                <Label>{translate("Show Favorites")}</Label>
            </FormGroup>
            <FormGroup switch>
                <Input
                    type="switch"
                    role="switch"
                    checked={filtersConfig.showTrashed || false}
                    onChange={(e)=>{changeFiltersConfig("showTrashed", e.target.checked)}}
                />
                <Label>{translate("Show Trashed")}</Label>
            </FormGroup>
        </div>
        <div className="movie-scroller">
          {mediaPages.length > 0 && mediaPages[0].results.length > 0 &&
            <div className="medias">
                {mediaPages.map( (mediaPage, mp) => (<Fragment key={`media-page${mp}`}>
                    {mediaPage.results.map((media, m) => (
                        <MediaCover
                            page={mediaPage.page}
                            key={`media${m}`} 
                            mediaType={mediaType} 
                            showTitle 
                            data={media} 
                            // href={`/${mediaType}/${media.id}`}
                            onClick={()=>{
                                setPopupId(media.id);
                                window.history.pushState({}, "", `/${mediaType}/${media.id}`);
                            }}
                            hideTrash={!filtersConfig.showTrashed}
                            hideFavorites={!filtersConfig.showFavorites}
                        />
                    ))}
                </Fragment>))}
            </div>
          }
        </div>
        <div className={`end-scroll ${isLoading ? "loading" : ""}`} ref={endScrollRef}>
            <AiOutlineLoading className="loader"/>
        </div>
        {mediaPages.length > 0 && mediaPages[mediaPages.length - 1].results.length === 0 &&
            <h3 style={{color:"white", marginBottom:"2rem"}}>{translate("END OF RESULTS")}</h3>
        }
    </>)
}