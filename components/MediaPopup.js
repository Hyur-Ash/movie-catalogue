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
import {SiWikidata} from 'react-icons/si';
import {FaImdb} from 'react-icons/fa';
import {BsInstagram, BsFacebook, BsTwitter} from 'react-icons/bs';

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
        discoveredMedias, discoverMedias, loadingMedias, lastDiscover,
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
        router.push(`${originLink}?scrollTo=${id}` || '/');
    }

    const getYouTubeSearchLink = (media) => {
        const date = media[currentNames.primary_release_date]? media[currentNames.primary_release_date].substring(0, 4) : media[currentNames.release_date]? media[currentNames.release_date].substring(0, 4) : '';
        const query = `${media[currentNames.title]} ${date} trailer ${websiteLang}`;
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

    const [loadingMedia, setLoadingMedia] = useState(false);
    const [singleMedia, setSingleMedia] = useState({});

    const getMedia = async (mediaType, id, lang) => {
        const params = {
            api_key: tmdb_api_key,
        }
        try{
            const langMediaInfo = await axios.get(`${tmdb_main_url}/${mediaType}/${id}`, {params:{...params, language: lang,}});
            const engMediaInfo = lang === "en" ? langMediaInfo : await axios.get(`${tmdb_main_url}/${mediaType}/${id}`, {params:{...params, language: "en",}});
            const socialInfo = await axios.get(`${tmdb_main_url}/${mediaType}/${id}/external_ids`, {params});
            const creditsInfo = await axios.get(`${tmdb_main_url}/${mediaType}/${id}/credits`, {params});
            return {
                [lang] : langMediaInfo.data,
                ["en"] : engMediaInfo.data,
                socials: socialInfo.data,
                credits: creditsInfo.data
            };
        }catch(error){
            console.error(error);
        }
    }

    const loadSingleMedia = async (mediaType, id) => {
        setLoadingMedia(true);
        try{
            const mediaInfo = await getMedia(mediaType, id, websiteLang)
            setSingleMedia(mediaInfo);
            // console.log(mediaInfo)
        }catch(error){
            console.error(error);
        }finally{
            setLoadingMedia(false);
        }
    }

    useEffect(()=>{
        loadSingleMedia(mediaType, id);
        loadMediaVideos(mediaType, id, websiteLang)
    },[websiteLang]);

    const directors = !singleMedia || !singleMedia.credits ? [] : singleMedia.credits.crew.filter(w=>w.job === "Director");
    const producers = !singleMedia || !singleMedia.credits ? [] : singleMedia.credits.crew.filter(w=>w.job === "Producer");
    const storyWriters = !singleMedia || !singleMedia.credits ? [] : singleMedia.credits.crew.filter(w=>w.job === "Story");
    const screenplayWriters = !singleMedia || !singleMedia.credits ? [] : singleMedia.credits.crew.filter(w=>w.job === "Screenplay");
    const cast = !singleMedia || !singleMedia.credits ? [] : singleMedia.credits.cast.filter(m=>m.popularity > 20).sort((a,b)=>a.popularity<b.popularity?1:-1);

    return isMounted && id && currentNames && (<>
        {singleMedia && singleMedia[websiteLang] &&
            <div className="overlay-backdrop">
            <img alt={singleMedia[websiteLang].title} src={singleMedia[websiteLang].backdrop_path? `${tmdb_main_url_img_high}/${singleMedia[websiteLang].backdrop_path}` : `img/not-found.jpg`}/>
            </div>
        }
        {loadingMedias !== true && singleMedia && singleMedia[websiteLang] &&
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
                        <div className="socials">
                            <a href={`https://www.themoviedb.org/movie/${singleMedia.socials.id}`} target="_blank" rel="noreferrer"><img src="/img/tmdb.png"/></a>
                            <a href={`https://www.imdb.com/title/${singleMedia.socials.imdb_id}`} target="_blank" rel="noreferrer"><FaImdb/></a>
                            <a href={`https://www.facebook.com/${singleMedia.socials.facebook_id}`} target="_blank" rel="noreferrer"><BsFacebook/></a>
                            <a href={`https://www.instagram.com/${singleMedia.socials.instagram_id}`} target="_blank" rel="noreferrer"><BsInstagram/></a>
                            <a href={`https://twitter.com/${singleMedia.socials.twitter_id}`} target="_blank" rel="noreferrer"><BsTwitter/></a>
                            <a href={`https://www.wikidata.org/wiki/${singleMedia.socials.wikidata_id}`} target="_blank" rel="noreferrer"><SiWikidata/></a>
                            <a href={`stremio://detail/${mediaType === "movie" ? "movie" : "series"}/${singleMedia.socials.imdb_id}`} target="_blank" rel="noreferrer"><img src="/img/stremio.png"/></a>
                        </div>
                        <div className="voice"><strong>{translate("Original title")}</strong> {singleMedia[websiteLang][currentNames.original_title]}</div>
                        <div className="voice"><strong>{translate("Release date")}</strong> {moment(singleMedia[websiteLang][currentNames.release_date], "YYYY-MM-DD").format("DD/MM/YYYY")}</div>
                        {mediaType === 'tv' && <>
                            <div><strong>{translate("Number of Seasons")}</strong> {singleMedia[websiteLang].number_of_seasons}</div>
                            <div><strong>{translate("Number of Episodes")}</strong> {singleMedia[websiteLang].number_of_episodes}</div>
                        </>}
                        <div className="voice"><strong>{translate("Runtime")}</strong> {getRuntime(singleMedia[websiteLang][currentNames.runtime])}</div>
                        <div className="voice"><strong>{translate(singleMedia[websiteLang].genres.length > 1 ? "Genres" : "Genre")}</strong> {singleMedia[websiteLang].genres.map((g,i)=>i<singleMedia[websiteLang].genres.length-1?g.name+", ":g.name)}</div>
                        <div className="voice"><strong>{translate(singleMedia[websiteLang].spoken_languages.length > 1 ? "Spoken languages" : "Spoken language")}</strong> {singleMedia[websiteLang].spoken_languages.map((g,i)=>i<singleMedia[websiteLang].spoken_languages.length-1?g.name+", ":g.name)}</div>
                    </div>
                </div>
                <div className="credits-container">
                    <div className="credits">
                        <div className="voice"><strong>{translate(singleMedia[websiteLang].production_countries.length > 1 ? "Production countries" : "Production country")}</strong> {singleMedia[websiteLang].production_countries.map((g,i)=>i<singleMedia[websiteLang].production_countries.length-1?g.name+", ":g.name)}</div>
                        <div className="voice"><strong>{translate(directors.length > 1 ? "Directors" : "Director")}</strong> {directors.map(d=>d.original_name).join(", ")}</div>
                        <div className="voice"><strong>{translate(producers.length > 1 ? "Producers" : "Producer")}</strong> {producers.map(d=>d.original_name).join(", ")}</div>
                    </div>
                    <div className="credits">
                        <div className="voice"><strong>{translate("Story")}</strong> {storyWriters.map(d=>d.original_name).join(", ")}</div>
                        <div className="voice"><strong>{translate("Screenplay")}</strong> {screenplayWriters.map(d=>d.original_name).join(", ")}</div>
                        <div className="voice"><strong>{translate("Cast")}</strong> {cast.map(d=>d.original_name).join(", ")}</div>
                    </div>
                </div>
                {singleMedia.en.overview.length > 0 &&
                    <div className="overview">
                        <h4>{translate("Overview")}</h4>
                        {singleMedia[websiteLang].overview.length > 0 ? singleMedia[websiteLang].overview : singleMedia.en.overview}
                    </div>
                }
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
                        >{translate(mc)}    
                        </div>
                    ))}
                </div>
                <div className="media-videos">
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
                <div className="media-videos">
                    <Link href={getYouTubeSearchLink(singleMedia[websiteLang])} target="_blank" className="c-button">
                        {translate("Search Trailer on YouTube")}
                    </Link>
                </div>
            </ModalBody>
            </Modal>
        }
    </>)
}
