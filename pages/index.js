import Head from 'next/head';
import {useState, useEffect, useContext} from 'react';
import { Context } from '/lib/Context';
import {Form, FormGroup, Label, Input} from 'reactstrap';
import Select from 'react-select'; 
import {Navigator} from '/components/Navigator';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axios from 'axios';
import {useLocalStorage} from '/lib/useLocalStorage';
import moment from 'moment';
import ReactCountryFlag from "react-country-flag";

export default function Home() {

  const [isMounted, setIsMounted] = useState(false);
  useEffect(()=>{
    setIsMounted(true);
  },[]);

  const {
    movieGenres, tvGenres, yearsContent, sortValues,
    medias, singleMedia, setSingleMedia, loadMedias, loadingMedias, loadSingleMedia,
    totalPages, setCurrentPage, 
    translate, websiteLang, setWebsiteLang, languageCodes
  } = useContext(Context);

  const tmdb_main_url_img_low = "https://www.themoviedb.org/t/p/w220_and_h330_face";
  const tmdb_main_url_img_high = "https://www.themoviedb.org/t/p/original";
  const youtube_api_key = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  const [genres, setGenres] = useState(movieGenres);

  const capitalize = (string) =>{
    const words = string.split(' ');
    let newString = '';
    words.forEach((word, i)=>{
      newString += `${word.charAt(0).toUpperCase()}${word.substring(1, word.length)}`;
      if(i < words.length - 1){
        newString += ' ';
      }
    })
    return newString;
  }

  const formOptions = {
    mediaType: [
      {value: 'movie', label: translate('Movie')},
      {value: 'tv', label: translate('TV Show')}
    ],
    genres: genres.map(g=>({value: g.id, label: translate(g.name)})),
    years: [{value: "", label: translate("Any")}, ...yearsContent.map(g=>({value: g.id, label: g.name}))],
    sortValues: sortValues.map(g=>({value: g.id, label: translate(g.name)})),
    orderValues: [
      {value: 'desc', label: translate('Descending')},
      {value: 'asc', label: translate('Ascending')},
    ]
  };

  const properNames = {
    movie: {
      release_date: "release_date",
      title: "title",
      original_title: "original_title",
      runtime: "runtime"
    },
    tv: {
      release_date: "first_air_date",
      title: "name",
      original_title: "original_name",
      runtime: "episode_run_time"
    }
  }
  const [currentNames, setCurrentNames] = useState(properNames.movie);
  const [formValues, setFormValues] = useLocalStorage('formValues', {
    mediaType: formOptions.mediaType[0],
    withGenres: [],
    withoutGenres: [],
    sortBy: formOptions.sortValues[0],
    orderBy: formOptions.orderValues[0],
    year: formOptions.years[0],
  });
  useEffect(()=>{
    const genres = formValues.mediaType.value === 'movie' ? movieGenres : tvGenres;
    setGenres(genres);
    setFormValues(curr=>{
      if(!curr){return curr}
      const newWithGenres = [], newWithoutGenres = [];
      curr.withGenres.forEach((g)=>{
        if(genres.map(g=>g.id).includes(g.value)){
          newWithGenres.push(g);
        }
      });
      curr.withoutGenres.forEach((g)=>{
        if(genres.map(g=>g.id).includes(g.value)){
          newWithGenres.push(g);
        }
      });
      return {...curr, withGenres: newWithGenres, withoutGenres: newWithoutGenres,}
    });
    setCurrentNames(properNames[formValues.mediaType.value]);
  },[formValues.mediaType]);

  useEffect(()=>{
    setFormValues(curr=>({
        ...curr,
        mediaType: formOptions.mediaType.filter(m=>m.value===curr.mediaType.value)[0],
        withGenres: formOptions.genres.map(m=>curr.withGenres.map(w=>w.value).includes(m.value) && m),
        withoutGenres: formOptions.genres.map(m=>curr.withoutGenres.map(w=>w.value).includes(m.value) && m),
        sortBy: formOptions.sortValues.filter(m=>m.value===curr.sortBy.value)[0],
        orderBy: formOptions.orderValues.filter(m=>m.value===curr.orderBy.value)[0],
        year: formOptions.years.filter(m=>m.value===curr.year.value)[0],
    }));
  },[websiteLang]) 

  const changeFormValue = (key, value) => {
    setFormValues(curr=>({...curr, [key]: value}));
  }

  const languagesOptions = [
    {value: "it", label: capitalize(translate("italian"))},
    {value: "en", label: capitalize(translate("english"))},
    {value: "ru", label: capitalize(translate("russian"))},
  ];
  const currentLanguage = languagesOptions.filter(l=>l.value===websiteLang)[0].label.toLowerCase();

  const closeMovieModal = () => {
    setSingleMedia(null);
    setTrailerVideoId(null);
  }

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

  const voteColor = (vote) => {
    return vote > 3 ? vote > 4.5 ? vote > 6 ? vote > 7.5 ? vote > 9? "lightblue" : "green" : "lightgreen" : "yellow" : "orange" : "red";
  }

  const getFlag = (code) => {
    return languageCodes[code] ?? code;
  }

  const Media = ({data, showTitle}) => {
    return(
      <div className="media" onClick={()=>{
        loadTrailerLink(data);
        loadSingleMedia(data.id);
      }}>
        {data.vote_count > 0 && moment(data[currentNames.release_date],"YYYY-MM-DD") < moment(Date.now()) &&
          <div className={`vote-average ${voteColor(data.vote_average)}`}>{data.vote_average}</div>
        }
        {moment(data[currentNames.release_date],"YYYY-MM-DD") > moment(Date.now()) && 
          <div className="upcoming-alert">{translate("upcoming")}</div>
        }
        <div className="flag-container">
          <ReactCountryFlag 
            className={`flag code-${data.original_language}`} 
            countryCode={getFlag(data.original_language)}
            svg
          />
        </div>
        <img alt={data.title} src={data.poster_path? `${tmdb_main_url_img_low}/${data.poster_path}` : `img/not-found.jpg`}/>
        {showTitle && data.title}
      </div>
    )
  }

  const getRuntime = (time) => {
    console.log(time)
    time = Array.isArray(time) ? time[0] : time;
    const hours = Math.floor(parseInt(time)/60);
    const minutes = Math.floor(((time/60) - Math.floor(time/60))*60);
    return `${hours > 0 ? `${hours} ${translate("hours")} ${translate("and")} ` : ''}${minutes} ${translate("minutes")}`;
    
  }

  return isMounted && (<>
    <h1>{translate("Hyur's Movie Catalogue")}</h1>
    <div className="my-container">

      <Head>
        <title>{translate("Hyur's Movie Catalogue")}</title>
        <meta name="description" content="Created by Hyur" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="language-selector fixed">
        <Select
            instanceId={"language"} 
            options={languagesOptions}
            value={languagesOptions.filter(l=>l.value === websiteLang)[0]}
            onChange={(e)=>{setWebsiteLang(e.value)}}
          />
      </div>

      <main>
        <div className="form">
          <div className="form-group">
            <label>{translate("Media type")}</label>
            <Select
              instanceId={"mediaType"} 
              options={formOptions.mediaType}
              value={formValues.mediaType}
              onChange={(e)=>{changeFormValue('mediaType', e)}}
              isSearchable={false}
            />
          </div>
          <div className="form-group">
            <label>{translate("With genres")}</label>
            <Select
              instanceId={"withGenres"} 
              options={formOptions.genres}
              value={formValues.withGenres}
              isMulti
              onChange={(e)=>{changeFormValue('withGenres', e)}}
              placeholder={translate("Select...")}
            />
          </div>
          <div className="form-group">
            <label>{translate("Without genres")}</label>
            <Select
              instanceId={"withoutGenres"} 
              options={formOptions.genres}
              value={formValues.withoutGenres}
              isMulti
              onChange={(e)=>{changeFormValue('withoutGenres', e)}}
              placeholder={translate("Select...")}
            />
          </div>
          <div className="form-group">
            <label>{translate("Year")}</label>
            <Select
              instanceId={"year"} 
              options={formOptions.years}
              value={formValues.year}
              onChange={(e)=>{changeFormValue('year', e)}}
              placeholder={translate("Select...")}
            />
          </div>
          <div className="form-group">
            <label>{translate("Sort By")}</label>
            <Select
              instanceId={"sortBy"} 
              options={formOptions.sortValues}
              value={formValues.sortBy}
              onChange={(e)=>{changeFormValue('sortBy', e)}}
            />
          </div>
          <div className="form-group">
            <label>{translate("Order By")}</label>
            <Select
              instanceId={"orderBy"} 
              options={formOptions.orderValues}
              value={formValues.orderBy}
              onChange={(e)=>{changeFormValue('orderBy', e)}}
              isSearchable={false}
            />
          </div>
          <div className="form-group submit">
            <button disabled={loadingMedias} onClick={()=>{loadMedias(formValues)}}>{translate("Search")}</button>
          </div>
        </div>
        {medias.length > 0 && <>
          <Navigator
            disabled={loadingMedias}
            pagesToShow={7}
            numPages={totalPages}
            onChange={(pageNum)=>{setCurrentPage(pageNum)}}
          />
          <div className="medias">
            {medias.map((media, i) => <Media showTitle data={media} key={`media${i}`}/>)}
          </div>
        </>}
      </main>
      {singleMedia && singleMedia[websiteLang] &&
        <div className="overlay-backdrop">
          <img alt={singleMedia[websiteLang].title} src={singleMedia[websiteLang].backdrop_path? `${tmdb_main_url_img_high}/${singleMedia[websiteLang].backdrop_path}` : `img/not-found.jpg`}/>
        </div>
      }
      {!loadingMedias && singleMedia && singleMedia[websiteLang] &&
        <Modal className="single-media" isOpen={singleMedia !== null} toggle={closeMovieModal} size={"xl"}>
          <ModalHeader toggle={closeMovieModal}>
            <div className="modal-title">
              {singleMedia[websiteLang][currentNames.title]}
              <div className="language-selector">
                <Select
                    instanceId={"language"} 
                    options={languagesOptions}
                    value={languagesOptions.filter(l=>l.value === websiteLang)[0]}
                    onChange={(e)=>{setWebsiteLang(e.value)}}
                  />
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="media-info">
              <Media data={singleMedia[websiteLang]}/>
              <div className="general-info">
                <div><strong>{translate("Original title")}:</strong> {singleMedia[websiteLang][currentNames.original_title]}</div>
                <div><strong>{translate("Release date")}:</strong> {moment(singleMedia[websiteLang][currentNames.release_date], "YYYY-MM-DD").format("DD/MM/YYYY")}</div>
                <div><strong>{translate("Runtime")}:</strong> {getRuntime(singleMedia[websiteLang][currentNames.runtime])}</div>
                <div><strong>{translate(singleMedia[websiteLang].genres.length > 1 ? "Genres" : "Genre")}:</strong> {singleMedia[websiteLang].genres.map((g,i)=>i<singleMedia[websiteLang].genres.length-1?g.name+", ":g.name)}</div>
                <div><strong>{translate(singleMedia[websiteLang].production_countries.length > 1 ? "Production countries" : "Production country")}:</strong> {singleMedia[websiteLang].production_countries.map((g,i)=>i<singleMedia[websiteLang].production_countries.length-1?g.name+", ":g.name)}</div>
                <div><strong>{translate(singleMedia[websiteLang].spoken_languages.length > 1 ? "Spoken languages" : "Spoken language")}:</strong> {singleMedia[websiteLang].spoken_languages.map((g,i)=>i<singleMedia[websiteLang].spoken_languages.length-1?g.name+", ":g.name)}</div>
              </div>
              <div className="overview">
                <h4>{translate("Overview")}</h4>
                {singleMedia[websiteLang].overview.length > 0 ? singleMedia[websiteLang].overview : singleMedia.en.overview}
              </div>
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

    </div>
  </>)
}
