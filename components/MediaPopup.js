import {useState, useEffect, useContext} from 'react';
import { Context } from '/lib/Context';
import Select from 'react-select';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axios from 'axios';
import {useLocalStorage} from '/lib/useLocalStorage';
import {useRouter} from 'next/router';
import moment from 'moment';
import {MediaCover} from '/components/MediaCover';

export const MediaPopup = ({mediaType, id}) => {

    const tmdb_main_url_img_high = "https://www.themoviedb.org/t/p/original";
    
    const router = useRouter();

    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);

    const {
        movieGenres, tvGenres, yearsContent, sortValues,
        discoveredMedias, singleMedia, setSingleMedia, discoverMedias, loadingMedias, loadSingleMedia, lastDiscover,
        totalDPages, setCurrentDPage,
        translate, websiteLang, setWebsiteLang, languageCodes, languagesOptions, originLink, properNames
    } = useContext(Context);

    const currentLanguage = languagesOptions.filter(l=>l.value===websiteLang)[0].label;

    const currentNames = properNames[mediaType];

    const getRuntime = (time) => {
        time = Array.isArray(time) ? time[0] : time;
        const hours = Math.floor(parseInt(time)/60);
        const minutes = Math.floor(((time/60) - Math.floor(time/60))*60);
        return `${hours > 0 ? `${hours} ${translate("hours")} ${translate("and")} ` : ''}${minutes > 0 ? `${minutes} ${translate("minutes")}` : ''}`;
    }

    const closeMediaModal = () => {
        setSingleMedia(null);
        setTrailerVideoId(null);
        router.push(originLink);
    }

    const youtube_api_key = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const [trailerVideoId, setTrailerVideoId] = useState(null);
    const [trailerIds, setTrailerIds] = useLocalStorage('trailerIds', {});
    const loadTrailerLink = (media) => {
        const q = `${media[currentNames.title]} ${media[currentNames.release_date].substring(0,4)} trailer ${currentLanguage}`;
        if(trailerIds[q]){
            setTrailerVideoId(trailerIds[q]);
        }else{
            const params = {
                key: youtube_api_key,
                q
            }
            axios.get('https://www.googleapis.com/youtube/v3/search', {params})
            .then(res=>{
                if(res.data.items.length > 0){
                const id = res.data.items[0]?.id?.videoId ?? null;
                setTrailerIds(curr=>({...curr, [q]: id}));
                setTrailerVideoId(id);
                }
            })
            .catch(err=>{
                console.error(err);
            })
        }
    }

    useEffect(()=>{
        loadSingleMedia(mediaType, id);
    },[]);
    
    useEffect(()=>{
        if(singleMedia){
            loadTrailerLink(singleMedia[websiteLang]);
        }
    },[singleMedia])

    return isMounted && id && currentNames && (<>
        {singleMedia && singleMedia[websiteLang] &&
            <div className="overlay-backdrop">
            <img alt={singleMedia[websiteLang].title} src={singleMedia[websiteLang].backdrop_path? `${tmdb_main_url_img_high}/${singleMedia[websiteLang].backdrop_path}` : `img/not-found.jpg`}/>
            </div>
        }
        {!loadingMedias && singleMedia && singleMedia[websiteLang] &&
            <Modal className="single-media" isOpen={singleMedia !== null} toggle={closeMediaModal} size={"xl"}>
            <ModalHeader toggle={closeMediaModal}>
                <div className="c-modal-title">
                {singleMedia[websiteLang][currentNames.title]}
                <div className="language-selector variant">
                    <Select
                        instanceId={"language"} 
                        options={languagesOptions}
                        value={languagesOptions.filter(l=>l.value === websiteLang)[0]}
                        onChange={(e)=>{setWebsiteLang(e.value)}}
                        isSearchable={false}
                    />
                </div>
                </div>
            </ModalHeader>
            <ModalBody>
                <div className="media-info">
                <MediaCover mediaType={mediaType} data={singleMedia[websiteLang]}/>
                <div className="general-info">
                    <div><strong>{translate("Original title")}:</strong> {singleMedia[websiteLang][currentNames.original_title]}</div>
                    <div><strong>{translate("Release date")}:</strong> {moment(singleMedia[websiteLang][currentNames.release_date], "YYYY-MM-DD").format("DD/MM/YYYY")}</div>
                    <div><strong>{translate("Runtime")}:</strong> {getRuntime(singleMedia[websiteLang][currentNames.runtime])}</div>
                    <div><strong>{translate(singleMedia[websiteLang].genres.length > 1 ? "Genres" : "Genre")}:</strong> {singleMedia[websiteLang].genres.map((g,i)=>i<singleMedia[websiteLang].genres.length-1?g.name+", ":g.name)}</div>
                    <div><strong>{translate(singleMedia[websiteLang].production_countries.length > 1 ? "Production countries" : "Production country")}:</strong> {singleMedia[websiteLang].production_countries.map((g,i)=>i<singleMedia[websiteLang].production_countries.length-1?g.name+", ":g.name)}</div>
                    <div><strong>{translate(singleMedia[websiteLang].spoken_languages.length > 1 ? "Spoken languages" : "Spoken language")}:</strong> {singleMedia[websiteLang].spoken_languages.map((g,i)=>i<singleMedia[websiteLang].spoken_languages.length-1?g.name+", ":g.name)}</div>
                </div>
                {singleMedia.en.overview.length > 0 &&
                    <div className="overview">
                        <h4>{translate("Overview")}</h4>
                        {singleMedia[websiteLang].overview.length > 0 ? singleMedia[websiteLang].overview : singleMedia.en.overview}
                    </div>
                }
                </div>
                <h3>{singleMedia[websiteLang].tagline.length > 0 ? singleMedia[websiteLang].tagline : singleMedia.en.tagline}</h3>
                {trailerVideoId && 
                <div className="trailer">
                    <iframe style={{width: "calc(1600px / 3)", height:"calc(900px / 3", maxWidth: "100%"}} 
                    width="1600" 
                    height="900" 
                    src={`https://www.youtube.com/embed/${trailerVideoId}`}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen></iframe>
                </div>
                }
            </ModalBody>
            </Modal>
        }
    </>)
}
