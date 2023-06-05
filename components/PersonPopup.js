import {useState, useEffect, useContext, Fragment} from 'react';
import { Context } from '/lib/Context';
import Select from 'react-select';
import { Button, Modal, ModalHeader, ModalBody, FormGroup, Label, Input } from 'reactstrap';
import axios from 'axios';
import {useLocalStorage} from '/lib/useLocalStorage';
import {useRouter} from 'next/router';
import moment from 'moment';
import {MediaCover} from '/components/MediaCover';
import {FaPlayCircle} from 'react-icons/fa';
import Link from 'next/link';
import {SiWikidata} from 'react-icons/si';
import {FaImdb, FaTiktok} from 'react-icons/fa';
import {BsInstagram, BsFacebook, BsTwitter} from 'react-icons/bs';
import { MediaPopup } from '/components/MediaPopup';

export const PersonPopup = ({id, onClose}) => {

    const tmdb_main_url_img_low = "https://www.themoviedb.org/t/p/w220_and_h330_face";
    const tmdb_main_url_img_high = "https://www.themoviedb.org/t/p/original";
    
    const router = useRouter();

    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);

    const {
        tmdbConfig,
        yearsContent,
        discoveredMedias, discoverMedias, loadingMedias, lastDiscover,
        totalDPages, setCurrentDPage,
        translate, websiteLang, setWebsiteLang, languagesOptions, properNames, getMedia,
        getPerson
    } = useContext(Context);

    const closeModal = () => {
        if(onClose){
            onClose();
            return;
        }
        setPerson(null);
        router.push("/");
    }

    const [loadingPerson, setLoadingPerson] = useState(false);
    const [person, setPerson] = useState({});

    const loadPerson = async (id) => {
        setPerson(true);
        try{
            const personInfo = await getPerson(id, websiteLang)
            setPerson(personInfo);
        }catch(error){
            console.error(error);
        }finally{
            setLoadingPerson(false);
        }
    }

    useEffect(()=>{
        loadPerson(id);
    },[websiteLang]);

    const gender = person && person[websiteLang] && person[websiteLang].gender;
    const genderName = gender === 1 ? translate("Female") : gender === 2 ? translate("Male") : gender === 3 ? translate("Non binary") : null;
    const age = person && person[websiteLang] && person[websiteLang].birthday && Math.floor((moment().valueOf() - moment(person[websiteLang].birthday, "YYYY-MM-DD").valueOf()) / 1000 / 60 / 60 / 24 / 365)
    const deathAge = person && person[websiteLang] && person[websiteLang].deathday && Math.floor((moment(person[websiteLang].deathday, "YYYY-MM-DD").valueOf() - moment(person[websiteLang].birthday, "YYYY-MM-DD").valueOf()) / 1000 / 60 / 60 / 24 / 365);

    const [availableRoles, setAvailableRoles] = useState([]);
    const [selectedMedias, setSelectedMedias] = useState(["movie"]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    useEffect(()=>{
        if(!person){return;}
        const roles = [];
        if(person && person.movie){
            if(person.movie.cast.length > 0){
                roles.push("Cast");
            }
            person.movie.crew.forEach(m => {
                if(m.department !== "Actors" && !roles.includes(m.department)){
                    roles.push(m.department);
                }
            });
        }
        if(person && person.tv){
            if(person.tv.cast.length > 0 && !roles.includes("Cast")){
                roles.push("Cast");
            }
            person.tv.crew.forEach(m => {
                if(m.department !== "Actors" && !roles.includes(m.department)){
                    roles.push(m.department);
                }
            });
        }
        setAvailableRoles(roles);
        if(person?.en?.known_for_department){
            setSelectedRoles([person.en.known_for_department === "Acting" ? "Cast" : person.en.known_for_department]);
        }
    },[person]);


    const possibleSorting = ["release_date", "popularity", "title", "vote_average", "vote_count"];
    const [sortBy, setSortBy] = useState("release_date");
    const [orderBy, setOrderBy] = useState(1);
    const [currentCredits, setCurrentCredits] = useState(null);

    useEffect(()=>{
        if(!person){return;}
        let credits = [];
        selectedMedias.forEach(media => {
            if(!person[media]){return;}
            selectedRoles.forEach(role => {
                if(role === "Cast" && person[media].cast){
                    credits = [...credits, ...person[media].cast.map(m=>({...m, mediaType: media}))];
                }else if(person[media].crew){
                    credits = [...credits, ...person[media].crew.filter(m=>m.department === role).map(m=>({...m, mediaType: media}))];
                }
            })
        });
        credits = credits.sort((a,b)=>{
            switch(sortBy){
                case 'release_date':
                    const aT = moment(a[sortBy], "YYYY-MM-DD").valueOf();
                    const bT = moment(b[sortBy], "YYYY-MM-DD").valueOf();
                    return aT < bT ? 1*orderBy : -1*orderBy;
                case 'popularity': case 'vote_average': case 'vote_count':
                    return a[sortBy] < b[sortBy] ? 1*orderBy : -1*orderBy;
                default:
                    return a[sortBy] < b[sortBy] ? -1*orderBy : 1*orderBy;
            }
        })
        setCurrentCredits(credits);
    },[person, selectedMedias, selectedRoles, sortBy, orderBy]);

    const getPopularName = (popularity) => {
        if(popularity < 10){
            return translate("Obscure");
        }else if(popularity < 20){
            return translate("Recognizable");
        }else if(popularity < 30){
            return translate("Minor Celebrity");
        }else if(popularity < 40){
            return translate("Celebrity");
        }else if(popularity < 50){
            return translate("Major Celebrity");
        }else if(popularity < 60){
            return translate("Star");
        }else if(popularity < 70){
            return translate("Superstar");
        }else if(popularity < 80){
            return translate("Megastar");
        }else if(popularity < 90){
            return translate("Icon");
        }else if(popularity < 100){
            return translate("Legend");
        }else{
            return translate("Immortal")
        }
    }

    const [mediaConfig, setMediaConfig] = useState(null);

    const [filtersConfig, setFiltersConfig] = useLocalStorage("personPopupFiltersConfig", {
        includeDocumentaries: false,
        includeShortFilms: false
    });
    const changeFiltersConfig = (key, value) => {
        setFiltersConfig(curr => ({...curr, [key]: value}));
    }

    return isMounted && id && (<>
        <div className="media-popup">
            {person && person[websiteLang] &&
                <div className="overlay-backdrop">
                    <div style={{background:"black", height: "100%"}}></div>
                </div>
            }
            {mediaConfig === null && loadingPerson !== true && person && person[websiteLang] &&
                <Modal className="single-media" isOpen={person !== null} toggle={closeModal} size={"xl"}>
                <ModalHeader toggle={closeModal}>
                    <div className="c-modal-title">
                    {person[websiteLang].name}
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
                        <MediaCover showStatus mediaType={"person"} data={person[websiteLang]}/>
                        <div className="general-info">
                            <div className="socials">
                                {person.socials.id &&
                                    <a href={`https://www.themoviedb.org/person/${person.socials.id}`} target="_blank" rel="noreferrer"><img src="/img/tmdb.png"/></a>
                                }
                                {person.socials.imdb_id &&
                                    <a href={`https://www.imdb.com/name/${person.socials.imdb_id}`} target="_blank" rel="noreferrer"><FaImdb/></a>
                                }
                                {person.socials.facebook_id &&
                                    <a href={`https://www.facebook.com/${person.socials.facebook_id}`} target="_blank" rel="noreferrer"><BsFacebook/></a>
                                }
                                {person.socials.instagram_id &&
                                    <a href={`https://www.instagram.com/${person.socials.instagram_id}`} target="_blank" rel="noreferrer"><BsInstagram/></a>
                                }
                                {person.socials.tiktok_id &&
                                    <a href={`https://www.tiktok.com/@${person.socials.tiktok_id}`} target="_blank" rel="noreferrer"><FaTiktok/></a>
                                }
                                {person.socials.twitter_id &&
                                    <a href={`https://twitter.com/${person.socials.twitter_id}`} target="_blank" rel="noreferrer"><BsTwitter/></a>
                                }
                                {person.socials.wikidata_id &&
                                    <a href={`https://www.wikidata.org/wiki/${person.socials.wikidata_id}`} target="_blank" rel="noreferrer"><SiWikidata/></a>
                                }
                            </div>
                            <div className="voice"><strong>{translate("Name")}</strong> {person[websiteLang].name} ({genderName})</div>
                            <div className="voice"><strong>{translate("Date of birth")}</strong> {moment(person[websiteLang].birthday, "YYYY-MM-DD").format("DD/MM/YYYY")} {!deathAge && `(${age} ${translate("years old")})`}</div>
                            {person[websiteLang].deathday &&
                                <div className="voice"><strong>{translate("Death day")}</strong> {moment(person[websiteLang].deathday, "YYYY-MM-DD").format("DD/MM/YYYY")} {`(${deathAge} ${translate("years old")})`}</div>
                            }
                            <div className="voice"><strong>{translate("Place of birth")}</strong> {person[websiteLang].place_of_birth}</div>
                            <div className="voice"><strong>{translate("Mostly known for")}</strong> {translate(person[websiteLang].known_for_department)}</div>
                            <div className="voice"><strong>{translate("Popularity")}</strong> {getPopularName(person[websiteLang].popularity)}</div>
                        </div>
                    </div>
                    <div className="credits-container">
                        {/* <div className="credits">
                            {person[websiteLang].production_countries.length > 0 &&
                                <div className="voice"><strong>{translate(person[websiteLang].production_countries.length > 1 ? "Production countries" : "Production country")}</strong> {person[websiteLang].production_countries.map(g=>g.name).join(", ")}</div>
                            }
                            {directors.length > 0 &&
                                <div className="voice">
                                    <strong>{translate(directors.length > 1 ? "Directors" : "Director")}</strong> 
                                    <div className="cast-members">
                                        {directors.map(c => (
                                            <CastMember data={c}/>
                                        ))}
                                    </div>
                                </div>
                            }
                        </div> */}
                        {/* <div className="credits">
                            {producers.length > 0 &&
                                <div className="voice"><strong>{translate(producers.length > 1 ? "Producers" : "Producer")}</strong> {producers.map(d=>d.original_name).join(", ")}</div>
                            }
                            {storyWriters.length > 0 &&
                                <div className="voice"><strong>{translate("Story")}</strong> {storyWriters.map(d=>d.original_name).join(", ")}</div>
                            }
                            {screenplayWriters.length > 0 &&
                                <div className="voice"><strong>{translate("Screenplay")}</strong> {screenplayWriters.map(d=>d.original_name).join(", ")}</div>
                            }
                        </div> */}
                    </div>
                    {(person[websiteLang].biography.length > 0 || person.en.biography.length > 0) &&
                        <div className="overview">
                            <h4>{translate("Biography")}</h4>
                            {person[websiteLang].biography.length > 0 ? person[websiteLang].biography : person.en.biography}
                        </div>
                    }
                    <h4>{translate("Media")}</h4>
                    <div className="media-select left margined wrapped">
                        <div 
                            className={`media-option small ${selectedMedias.includes('movie') ? 'active' : ''}`} 
                            onClick={()=>{setSelectedMedias(curr => {
                                const newCurr = JSON.parse(JSON.stringify(curr));
                                if(newCurr.includes("movie")){
                                    newCurr.splice(newCurr.indexOf("movie"), 1);
                                }else{
                                    newCurr.push("movie");
                                }
                                return newCurr;
                            })}}
                        >{translate("Movies")}</div>
                        <div 
                            className={`media-option small ${selectedMedias.includes('tv') ? 'active' : ''}`} 
                            onClick={()=>{setSelectedMedias(curr => {
                                const newCurr = JSON.parse(JSON.stringify(curr));
                                if(newCurr.includes("tv")){
                                    newCurr.splice(newCurr.indexOf("tv"), 1);
                                }else{
                                    newCurr.push("tv");
                                }
                                return newCurr;
                            })}}
                        >{translate("TV Shows")}</div>
                    </div>
                    <h4>{translate("Department")}</h4>
                    <div className="media-select left margined wrapped">
                        {availableRoles.map((role, r) => (
                            <div 
                                key={`role${r}`}
                                className={`media-option small ${selectedRoles.includes(role) ? 'active' : ''}`} 
                                onClick={()=>{setSelectedRoles(curr => {
                                    const newCurr = JSON.parse(JSON.stringify(curr));
                                    if(newCurr.includes(role)){
                                        newCurr.splice(newCurr.indexOf(role), 1);
                                    }else{
                                        newCurr.push(role);
                                    }
                                    return newCurr;
                                })}}
                            >{translate(role)}</div>
                        ))}
                    </div>
                    <h4>{translate("Sort by")}</h4>
                    <div className="media-select left margined wrapped">
                        {possibleSorting.map((sorter, s) => (
                            <div 
                                key={`sorter${s}`}
                                className={`media-option small ${sortBy === sorter ? 'active' : ''}`} 
                                onClick={()=>{setSortBy(sorter)}}
                            >{translate(sorter)}</div>
                        ))}
                    </div>
                    <h4>{translate("Order by")}</h4>
                    <div className="media-select left margined wrapped">
                        <div 
                            className={`media-option small ${orderBy === 1 ? 'active' : ''}`} 
                            onClick={()=>{setOrderBy(1)}}
                        >{translate("Descending")}</div>
                        <div 
                            className={`media-option small ${orderBy === -1 ? 'active' : ''}`} 
                            onClick={()=>{setOrderBy(-1)}}
                        >{translate("Ascending")}</div>
                    </div>
                    <FormGroup switch>
                        <Input
                            type="switch"
                            role="switch"
                            checked={filtersConfig.includeDocumentaries || false}
                            onChange={(e)=>{changeFiltersConfig("includeDocumentaries", e.target.checked)}}
                        />
                        <Label>{translate("Include Documentaries")}</Label>
                    </FormGroup>
                    {currentCredits &&
                        <div className="person-credits">
                            {currentCredits.length > 0 &&
                                <div className="person-media">
                                    {currentCredits.map((data, d) => (<>
                                        <MediaCover 
                                            key={`data${d}`}
                                            // href={`/${data.mediaType}/${data.id}`} 
                                            onClick={()=>{
                                                setMediaConfig({
                                                    mediaType: data.mediaType,
                                                    id: data.id
                                                });
                                                window.history.pushState({}, "", `/${data.mediaType}/${data.id}`);
                                            }}
                                            headline={!data.department ? `${translate("Cast").toUpperCase()}${data.character ? ` - ${data.character}` : ""}` : translate(data.department).toUpperCase()} 
                                            data={data} 
                                            showTitle 
                                            mediaType={data.mediaType}
                                            hide={!filtersConfig.includeDocumentaries && data.genre_ids.includes(99)}
                                        />
                                    </>))}
                                </div>
                            }
                            {currentCredits.length === 0 &&
                                <div>{translate("No results with the selected filters.")}</div>
                            }
                        </div>
                    }
                    {/* <div className="extra" style={{marginTop: "1rem"}}>
                        {person.keywords.length > 0 &&
                            <div className="voice"><h4>{translate("Keywords")}</h4>{person.keywords.map(k=>k.name).join(", ")}</div>
                        }
                    </div> */}
                    
                    {/* <h3>{person[websiteLang].tagline.length > 0 ? person[websiteLang].tagline : person.en.tagline}</h3>
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
                    </div> */}
                    {/* <div className="media-videos">
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
                    </div> */}
                    {/* <div className="media-videos">
                        <Link href={getYouTubeSearchLink(person[websiteLang])} target="_blank" className="c-button">
                            {translate("Search Trailer on YouTube")}
                        </Link>
                    </div> */}
                </ModalBody>
                </Modal>
            }
        </div>
        {mediaConfig !== null && 
          <MediaPopup mediaType={mediaConfig.mediaType} id={mediaConfig.id} onClose={()=>{
            setMediaConfig(null);
            window.history.pushState({}, "", `/person/${id}`);
          }} />
        }
    </>)
}