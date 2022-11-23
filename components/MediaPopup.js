import {useState, useEffect, useContext} from 'react';
import { Context } from '/lib/Context';
import Select from 'react-select';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axios from 'axios';
import {useLocalStorage} from '/lib/useLocalStorage';
import {useRouter} from 'next/router';
import moment from 'moment';
import {MediaCover} from '/components/MediaCover';
import {FaPlayCircle} from 'react-icons/fa';
import Link from 'next/link';

export const MediaPopup = ({mediaType, id}) => {

    const tmdb_main_url_img_low = "https://www.themoviedb.org/t/p/w220_and_h330_face";
    const tmdb_main_url_img_high = "https://www.themoviedb.org/t/p/original";
    
    const router = useRouter();

    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);

    const {
        tmdb_main_url, tmdb_api_key,
        movieGenres, tvGenres, yearsContent, sortValues,
        discoveredMedias, singleMedia, setSingleMedia, discoverMedias, loadingMedias, loadSingleMedia, lastDiscover,
        totalDPages, setCurrentDPage,
        translate, websiteLang, setWebsiteLang, languagesOptions, originLink, properNames
    } = useContext(Context);

    const currentNames = properNames[mediaType];

    const getRuntime = (time) => {
        time = Array.isArray(time) ? time[0] : time;
        const hours = Math.floor(parseInt(time)/60);
        const minutes = Math.floor(((time/60) - Math.floor(time/60))*60);
        return `${hours > 0 ? `${hours} ${translate("hours")} ${translate("and")} ` : ''}${minutes > 0 ? `${minutes} ${translate("minutes")}` : ''}`;
    }

    const closeMediaModal = () => {
        setSingleMedia(null);
        router.push(originLink || '/');
    }

    const getYouTubeSearchLink = (media) => {
        const query = `${media[currentNames.title]} ${media[currentNames.release_date].substring(0,4)} trailer ${websiteLang}`;
        return `https://www.youtube.com/results?search_query=${query}`;
    }

    const [mediaVideos, setMediaVideos] = useState([]);
    const [mediaCategories, setMediaCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(0);
    const loadMediaVideos = (mediaType, id) => {
        const params = {
            api_key: tmdb_api_key,
            language: websiteLang,
        }
        axios.get(`${tmdb_main_url}/${mediaType}/${id}/videos`, {params})
        .then(res=>{
            console.log(res.data.results)
            if(res.data.results && res.data.results.length > 0){
                setMediaVideos(res.data.results.reverse());
            }else{
                setMediaVideos(null);
            }
        })
        .catch(err=>{
            console.error(err);
        })
    }

    useEffect(()=>{
        if(mediaVideos){
            const categories = [];
            mediaVideos.forEach((mv)=>{
                if(!categories.includes(mv.type)){
                    categories.push(mv.type);
                }
            });
            setMediaCategories(categories);
        }
    },[mediaVideos])

    useEffect(()=>{
        loadSingleMedia(mediaType, id);
        loadMediaVideos(mediaType, id, websiteLang)
    },[websiteLang]);

    const [videoData, setVideoData] = useState(null);
    const VideoModal = ({videoData}) => {
        console.log({videoData})
        return videoData && (
            <Modal className="single-media" isOpen={videoData !== null} toggle={()=>{setVideoData(null)}} fullscreen size={"xl"}>
                <ModalHeader toggle={()=>{setVideoData(null)}}>
                    <div className="c-modal-title">
                        <img className="flag" alt={videoData.iso_639_1} src={`/img/flags/${videoData.iso_639_1}.svg`}/>
                        {videoData.name}
                    </div>
                </ModalHeader>
                <ModalBody>
                <iframe 
                    style={{width: "100%", aspectRatio: "16/9"}} 
                    // width="1600" 
                    // height="900" 
                    src={`https://www.youtube.com/embed/${videoData.key}`}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen 
                />
                </ModalBody>
            </Modal>
        )
    }

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
                <MediaCover showStatus mediaType={mediaType} data={singleMedia[websiteLang]}/>
                <div className="general-info">
                    <div><strong>{translate("Original title")}:</strong> {singleMedia[websiteLang][currentNames.original_title]}</div>
                    <div><strong>{translate("Release date")}:</strong> {moment(singleMedia[websiteLang][currentNames.release_date], "YYYY-MM-DD").format("DD/MM/YYYY")}</div>
                    {mediaType === 'tv' && <>
                        <div><strong>{translate("Number of Seasons")}:</strong> {singleMedia[websiteLang].number_of_seasons}</div>
                        <div><strong>{translate("Number of Episodes")}:</strong> {singleMedia[websiteLang].number_of_episodes}</div>
                    </>}
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
                <div className="media-categories">
                    {mediaCategories.map( (mc, i) => (
                        <div 
                            key={`mc${i}`} 
                            style={{width:`calc(100% / ${mediaCategories.length})`}} 
                            className={`media-category ${i === selectedCategory? 'active' : ''}`} 
                            onClick={()=>{
                                setSelectedCategory(i);
                            }}
                        >{mc}    
                        </div>
                    ))}
                </div>
                <div className="media-videos">
                    {!mediaVideos && 
                        <Link href={getYouTubeSearchLink(singleMedia[websiteLang])} target="_blank" className="c-button">
                            {translate("Search trailer on YouTube")}
                        </Link>
                    }
                    {mediaVideos && mediaVideos.map(mv => mv.site === 'YouTube' && mv.type === mediaCategories[selectedCategory] && (
                        <Link href={`https://www.youtube.com/watch?v=${mv.key}`} target="_blank" className={`media-video`}>
                            <img src={`https://img.youtube.com/vi/${mv.key}/0.jpg`} />
                            <div className="overlay">
                                <FaPlayCircle className="play-circle"/>
                            </div>
                            {mv.official && <div className="official">{translate("Official")}</div>}
                            {mv.name && <div className="title">{mv.name}</div>}
                        </Link>
                    ))}
                </div>
            </ModalBody>
            </Modal>
        }
        <VideoModal videoData={videoData} />
    </>)
}
