import {useState, useEffect, useContext, useRef, Fragment} from 'react';
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
import {AiFillHome} from 'react-icons/ai';
import {BsInstagram, BsFacebook, BsTwitter} from 'react-icons/bs';
import SimpleCover from '/components/SimpleCover';
import Company from '/components/Company';
import { PersonPopup } from '/components/PersonPopup';
import CoverScroller from '/components/CoverScroller';

export const MediaPopup = ({mediaType, id, onClose}) => {

    const tmdb_main_url_img_low = "https://www.themoviedb.org/t/p/w220_and_h330_face";
    const tmdb_main_url_img_high = "https://www.themoviedb.org/t/p/original";
    
    const router = useRouter();

    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);

    const {
        api_key,
        tmdbConfig,
        tmdb_main_url,
        yearsContent,
        discoveredMedias, discoverMedias, loadingMedias, lastDiscover,
        totalDPages, setCurrentDPage,
        translate, websiteLang, setWebsiteLang, languagesOptions, properNames, getMedia,
    } = useContext(Context);

    const currentNames = properNames[mediaType];

    const getRuntime = (time) => {
        time = Array.isArray(time) ? time[0] : time;
        const hours = Math.floor(parseInt(time)/60);
        const minutes = Math.floor(((time/60) - Math.floor(time/60))*60);
        return `${hours > 0 ? `${hours} ${translate("hours")}` : ''}${minutes > 0 ? ` ${hours > 0 ? translate("and") : ""} ${minutes} ${translate("minutes")}` : ''}`;
    }

    const closeMediaModal = () => {
        if(onClose){
            onClose();
            return;
        }
        setSingleMedia(null);
        router.push("/");
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
            api_key,
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
    let allCast = !singleMedia || !singleMedia.credits ? [] : singleMedia.credits.cast;
    const mainCast = allCast.slice(0,6);
    const otherCast = allCast.slice(6,allCast.length);
    const restOfCast = [];
    otherCast.forEach(c => {
        if(c.popularity > 15){
            mainCast.push(c);
        }else{
            restOfCast.push(c);
        }
    });

    const orderByDate = (array, dateKey) => {
        return array.sort((a,b)=>moment(a[dateKey], "YYYY-MM-DD").valueOf() < moment(b[dateKey], "YYYY-MM-DD").valueOf() ? -1 : 1);
    }

    const collection = !singleMedia || !singleMedia[websiteLang] ? null : singleMedia[websiteLang]?.collection || singleMedia.en?.collection;
    console.log(collection)

    const sagaIndex = collection?.parts && orderByDate(collection.parts, "release_date").findIndex(p=>p.id === singleMedia[websiteLang].id) + 1;
    
    const getCardinal = (n) => {
        return n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
    }

    const [mediaConfig, setMediaConfig] = useState(null);
    const [personId, setPersonId] = useState(null);

    const [selectedSeason, setSelectedSeason] = useState(null);

    return isMounted && id && currentNames && (<>
        <div className="media-popup">
            {singleMedia && singleMedia[websiteLang] &&
                <div className="overlay-backdrop">
                    <img alt={singleMedia[websiteLang].title} src={singleMedia[websiteLang].backdrop_path? `${tmdb_main_url_img_high}/${singleMedia[websiteLang].backdrop_path}` : `img/not-found.jpg`}/>
                </div>
            }
            {mediaConfig === null && personId === null && loadingMedias !== true && singleMedia && singleMedia[websiteLang] &&
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
                        <MediaCover 
                            sagaIndex={sagaIndex && <span>{sagaIndex}<sup>{translate(getCardinal(sagaIndex))}</sup></span>}
                            showStatus 
                            mediaType={mediaType} 
                            data={singleMedia[websiteLang]}
                        />
                        <div className="general-info">
                            <div className="socials">
                                {(singleMedia[websiteLang].homepage || singleMedia.en.homepage) &&
                                    <a href={singleMedia[websiteLang].homepage || singleMedia.en.homepage} target="_blank" rel="noreferrer"><AiFillHome/></a>
                                }
                                {singleMedia.socials.id &&
                                    <a href={`https://www.themoviedb.org/movie/${singleMedia.socials.id}`} target="_blank" rel="noreferrer"><img src="/img/tmdb.png"/></a>
                                }
                                {singleMedia.socials.imdb_id &&
                                    <a href={`https://www.imdb.com/title/${singleMedia.socials.imdb_id}`} target="_blank" rel="noreferrer"><FaImdb/></a>
                                }
                                {singleMedia.socials.facebook_id &&
                                    <a href={`https://www.facebook.com/${singleMedia.socials.facebook_id}`} target="_blank" rel="noreferrer"><BsFacebook/></a>
                                }
                                {singleMedia.socials.instagram_id &&
                                    <a href={`https://www.instagram.com/${singleMedia.socials.instagram_id}`} target="_blank" rel="noreferrer"><BsInstagram/></a>
                                }
                                {singleMedia.socials.twitter_id &&
                                    <a href={`https://twitter.com/${singleMedia.socials.twitter_id}`} target="_blank" rel="noreferrer"><BsTwitter/></a>
                                }
                                {singleMedia.socials.wikidata_id &&
                                    <a href={`https://www.wikidata.org/wiki/${singleMedia.socials.wikidata_id}`} target="_blank" rel="noreferrer"><SiWikidata/></a>
                                }
                                {singleMedia.socials.imdb_id &&
                                    <a href={`stremio://detail/${mediaType === "movie" ? "movie" : "series"}/${singleMedia.socials.imdb_id}`} target="_blank" rel="noreferrer"><img src="/img/stremio.png"/></a>
                                }
                            </div>
                            {collection &&
                                <div className="voice"><strong>{translate("Saga")}</strong> {singleMedia[websiteLang].collection.name.replaceAll("Collection", "")}</div>
                            }
                            <div className="voice"><strong>{translate("Original title")}</strong> {singleMedia[websiteLang][currentNames.original_title]}</div>
                            {singleMedia[websiteLang].release_date &&
                                <div className="voice"><strong>{translate("Release date")}</strong> {moment(singleMedia[websiteLang].release_date, "YYYY-MM-DD").format("DD/MM/YYYY")}</div>
                            }
                            {singleMedia[websiteLang].first_air_date &&
                                <div className="voice">
                                    <strong>{translate("Airing")}</strong> 
                                    <span>
                                        <span>{moment(singleMedia[websiteLang].first_air_date, "YYYY-MM-DD").format("DD/MM/YYYY")}</span>
                                        <span> - </span>
                                        {singleMedia[websiteLang].in_production &&
                                            <span>{translate("ongoing")}</span>
                                        }
                                        {!singleMedia[websiteLang].in_production &&
                                            <span>{moment(singleMedia[websiteLang].last_air_date, "YYYY-MM-DD").format("DD/MM/YYYY")}</span>
                                        }
                                    </span>
                                </div>
                            }
                            {mediaType === 'tv' && <>
                                <div className="voice"><strong>{translate("Length")}</strong> {singleMedia[websiteLang].number_of_seasons} Seasons ({singleMedia[websiteLang].number_of_episodes} {translate("episodes")})</div>
                            </>}
                            {mediaType === 'movie' && singleMedia[websiteLang].runtime > 0 &&
                                <div className="voice"><strong>{translate("Runtime")}</strong> {getRuntime(singleMedia[websiteLang].runtime)}</div>
                            }
                            {mediaType === 'tv' && singleMedia[websiteLang].episode_run_time?.length > 0 &&
                                <div className="voice">
                                    <strong>{translate("Episodes Runtime")}</strong>
                                    {singleMedia[websiteLang].episode_run_time.map(r => getRuntime(r)).join(", ")}
                                </div>
                            }
                            {singleMedia[websiteLang].genres.length > 0 &&
                                <div className="voice"><strong>{translate(singleMedia[websiteLang].genres.length > 1 ? "Genres" : "Genre")}</strong> {singleMedia[websiteLang].genres.map(g=>g.name).join(", ")}</div>
                            }
                            {singleMedia[websiteLang].spoken_languages > 0 &&
                                <div className="voice"><strong>{translate(singleMedia[websiteLang].spoken_languages.length > 1 ? "Spoken languages" : "Spoken language")}</strong> {singleMedia[websiteLang].spoken_languages.map(g=>g.name).join(", ")}</div>
                            }
                        </div>
                    </div>
                    {(singleMedia[websiteLang].tagline.length > 0 || singleMedia.en.tagline > 0) &&
                        <h3>{"“"}{singleMedia[websiteLang].tagline.length > 0 ? singleMedia[websiteLang].tagline : singleMedia.en.tagline}{"”"}</h3>
                    }
                    {singleMedia.duringcreditsstinger && !singleMedia.aftercreditsstinger &&
                        <div className="announcement green">{translate("WITH DURING CREDITS STINGER!")}</div>
                    }
                    {singleMedia.aftercreditsstinger && !singleMedia.duringcreditsstinger &&
                        <div className="announcement green">{translate("WITH AFTER CREDITS STINGER!")}</div>
                    }
                    {singleMedia.aftercreditsstinger && singleMedia.duringcreditsstinger &&
                        <div className="announcement green">{translate("WITH DURING & AFTER CREDITS STINGERS!")}</div>
                    }
                    {collection && <>
                        <div className="overview">
                            <h4>{translate("Saga Overview")}</h4>
                            {collection.overview}
                        </div>
                        <div className="saga-parts">
                            <CoverScroller>
                                {orderByDate(collection.parts, "release_date").map( (part, p) => (
                                    <MediaCover 
                                        sagaIndex={<span>{p+1}<sup>{translate(getCardinal(p+1))}</sup></span>}
                                        highlight={part.id === singleMedia[websiteLang].id}
                                        key={`part${p}`} 
                                        headline={part.release_date?.length > 0 ? moment(part.release_date, "YYYY-MM-DD").format("YYYY") : translate("UPCOMING")} 
                                        showTitle 
                                        showStatus 
                                        mediaType={part.media_type} 
                                        data={part}
                                        onClick={part.id !== singleMedia[websiteLang].id ? ()=>{
                                            setMediaConfig({mediaType: part.media_type, id: part.id});
                                            window.history.pushState({}, "", `/${part.media_type}/${part.id}`);
                                        } : null}
                                    />
                                ))}
                            </CoverScroller>
                        </div>
                    </>}
                    {singleMedia.en.overview.length > 0 &&
                        <div className="overview">
                            <h4>{translate(collection || mediaType === "tv" ? `${mediaType}-overview` : "Overview")}</h4>
                            {singleMedia[websiteLang].overview.length > 0 ? singleMedia[websiteLang].overview : singleMedia.en.overview}
                        </div>
                    }
                    {singleMedia[websiteLang].seasons && 
                        <div className="seasons">
                            <CoverScroller simple>
                                {singleMedia[websiteLang].seasons.map((season, s) => (
                                    <SimpleCover 
                                        key={`season${s}`}
                                        name={`${translate("Season")} ${season.season_number}`}
                                        imagePath={season.poster_path}
                                        headline={moment(season.air_date, "YYYY-MM-DD").format("YYYY")}
                                        onClick={()=>{setSelectedSeason(season)}}
                                        transparent={!selectedSeason || selectedSeason.id !== season.id}
                                    />
                                ))}
                            </CoverScroller>
                        </div>
                    }
                    {selectedSeason?.overview &&
                        <div className="overview">
                            <h4>{translate("Season")} {translate("Overview")}</h4>
                            {selectedSeason.overview}
                        </div>
                    }
                    <div className="credits-container">
                        <div className="credits">
                            {singleMedia[websiteLang].budget > 0 && singleMedia[websiteLang].revenue > 0 && <>
                                {singleMedia[websiteLang].revenue / singleMedia[websiteLang].budget < 1 ? <div className="announcement red">FLOP</div> : 
                                singleMedia[websiteLang].revenue / singleMedia[websiteLang].budget < 2 ? <div className="announcement grey">BREAK EVEN</div> : 
                                singleMedia[websiteLang].revenue / singleMedia[websiteLang].budget < 3 ? <div className="announcement green">HIT</div> : 
                                <div className="announcement blue">BLOCKBUSTER</div>}
                                <div className="box-office" style={{display: "flex"}}>
                                    <div className="voice" style={{width:"50%"}}>
                                        <h4>{translate("Budget")}</h4>
                                        <span className="profit">
                                            {singleMedia[websiteLang].budget.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0})}
                                        </span>
                                    </div>
                                    <div className="voice" style={{width:"50%"}}>
                                        <h4>{translate("Revenue")}</h4> 
                                        <span className={`profit ${
                                            singleMedia[websiteLang].budget && singleMedia[websiteLang].revenue ? 
                                            singleMedia[websiteLang].revenue / singleMedia[websiteLang].budget < 1 ? "red" : 
                                            singleMedia[websiteLang].revenue / singleMedia[websiteLang].budget < 2 ? "grey" : 
                                            singleMedia[websiteLang].revenue / singleMedia[websiteLang].budget < 3 ? "green" : 
                                            "blue" : ""}`}>
                                            {singleMedia[websiteLang].revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0})}
                                        </span>
                                    </div>
                                </div>
                            </>}
                            {directors.length > 0 &&
                                <div className="voice">
                                    <h4>{translate(directors.length > 1 ? "Directors" : "Director")}</h4> 
                                    <div className="cast-members">
                                        {directors.map((data, c) => (
                                            <SimpleCover 
                                                key={`cast${c}`} 
                                                name={data.original_name || data.name}
                                                imagePath={data.profile_path}
                                                onClick={()=>{
                                                    setPersonId(data.id);
                                                    window.history.pushState({}, "", `/person/${data.id}`);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            }
                            {singleMedia[websiteLang]?.created_by?.length > 0 &&
                                <div className="voice">
                                    <h4>{translate(singleMedia[websiteLang].created_by.length > 1 ? "Creators" : "Creator")}</h4> 
                                    <div className="cast-members">
                                        {singleMedia[websiteLang].created_by.map((data, c) => (
                                            <SimpleCover 
                                                key={`cast${c}`} 
                                                name={data.original_name || data.name}
                                                imagePath={data.profile_path}
                                                onClick={()=>{
                                                    setPersonId(data.id);
                                                    window.history.pushState({}, "", `/person/${data.id}`);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            }
                        </div>
                        <div className="credits">
                            {singleMedia[websiteLang].production_companies.length > 0 &&
                                <div className="voice">
                                    <h4>{translate(singleMedia[websiteLang].production_companies.length > 1 ? "Production companies" : "Production company")}</h4> 
                                    <div className="production-companies">
                                        {singleMedia[websiteLang].production_companies.map((pc, index)=>(
                                            <Company data={pc} key={`pc${index}`}/>
                                        ))}
                                    </div>
                                </div>
                            }
                            {singleMedia[websiteLang].production_countries.length > 0 &&
                                <div className="voice"><h4>{translate(singleMedia[websiteLang].production_countries.length > 1 ? "Production countries" : "Production country")}</h4> {singleMedia[websiteLang].production_countries.map(g=>g.name).join(", ")}</div>
                            }
                            {producers.length > 0 &&
                                <div className="voice"><h4>{translate(producers.length > 1 ? "Producers" : "Producer")}</h4> {producers.map(d=>d.original_name).join(", ")}</div>
                            }
                            {storyWriters.length > 0 &&
                                <div className="voice"><h4>{translate("Story")}</h4> {storyWriters.map(d=>d.original_name).join(", ")}</div>
                            }
                            {screenplayWriters.length > 0 &&
                                <div className="voice"><h4>{translate("Screenplay")}</h4> {screenplayWriters.map(d=>d.original_name).join(", ")}</div>
                            }
                        </div>
                    </div>
                    {mainCast.length > 0 &&
                        <div className="cast">
                            <h4>{translate("Main Cast")}</h4> 
                            <div className="cast-members">
                                {mainCast.map((data, c) => (
                                    <SimpleCover 
                                        key={`cast${c}`} 
                                        name={data.original_name || data.name}
                                        imagePath={data.profile_path}
                                        headline={data.character}
                                        onClick={()=>{
                                            setPersonId(data.id);
                                            window.history.pushState({}, "", `/person/${data.id}`);
                                        }}
                                    />
                                ))}
                            </div>
                            {restOfCast.length > 0 &&
                                <div className="other-cast">
                                    <h4>Rest of Cast</h4> {restOfCast.map((data, c)=>{
                                        return(
                                            <span key={`other${c}`}>
                                                {c > 0 && ", "}
                                                <strong style={{cursor:"pointer"}} onClick={()=>{
                                                    setPersonId(data.id);
                                                    window.history.pushState({}, "", `/person/${data.id}`);
                                                }}>{data.original_name}</strong>
                                                {data.character && " as "}
                                                {data.character && <span style={{fontStyle:"italic"}}>{data.character}</span>}
                                            </span>
                                        )
                                    })}
                                </div>
                            }
                        </div>
                    }
                    {singleMedia.keywords.length > 0 &&
                        <div className="extra">
                            <h4>{translate("Keywords")}</h4>
                            {singleMedia.keywords.map(k=>k.name).join(", ")}
                        </div>
                    }
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
                        {mediaVideos && mediaVideos.map((mv, i) => mv.site === 'YouTube' && mv.type === mediaCategories[selectedCategory] && (
                            <Link key={`mv${i}`} href={`https://www.youtube.com/watch?v=${mv.key}`} target="_blank" className={`media-video`}>
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
        </div>
        {mediaConfig !== null && 
          <MediaPopup mediaType={mediaConfig.mediaType} id={mediaConfig.id} onClose={()=>{
            setMediaConfig(null);
            window.history.pushState({}, "", `/${mediaType}/${id}`);
          }} />
        }
        {personId !== null && 
          <PersonPopup id={personId} onClose={()=>{
            setPersonId(null);
            window.history.pushState({}, "", `/${mediaType}/${id}`);
          }} />
        }
    </>)
}