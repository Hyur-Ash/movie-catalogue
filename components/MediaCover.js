import {useState, useContext, useEffect, useRef, Fragment} from 'react';
import { Context } from '/lib/Context';
import moment from 'moment';
import Link from 'next/link';
import {FaStar, FaRegStar, FaTrash} from 'react-icons/fa';
import {SlOptions} from 'react-icons/sl';
import {BiCopy} from 'react-icons/bi';
import {AiOutlineLoading} from 'react-icons/ai';
import {MdCancel, MdRecommend} from 'react-icons/md';
import {useRouter} from 'next/router';
import noImage from '/public/img/not-found.jpg';

export const MediaCover = ({data, character, showTitle, href, mediaType, showStatus, page, hideTrash}) => {

    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
      setIsMounted(true);
    },[]);

    const router = useRouter();

    const {
        translate, setOriginLink, favorites, trashed
    } = useContext(Context);


    const favoritesIncludes = (id) => {
      let isIncluded = false;
      if(favorites && favorites[mediaType]){
        favorites[mediaType].forEach(media=>{
          if(media.id === id){
            isIncluded = true;
          }
        });
      }
      return isIncluded;
    }

    const trashIncludes = (id) => {
      let isIncluded = false;
      if(trashed && trashed[mediaType]){
        trashed[mediaType].forEach(media=>{
          if(media.id === id){
            isIncluded = true;
          }
        });
      }
      return isIncluded;
    }

    const contentRef = useRef();

    const isTrash = trashIncludes(data.id);

    return isMounted && mediaType && (
      <div className={`media-container media-id-${data.id} ${isTrash && hideTrash ? "no-display" : ""} ${page ? `page${page}` : ""}`} ref={contentRef}>
        {href ? 
          <Link href={href} className="media clickable" onClick={(e)=>{
            if(!href || e.target.classList.contains('is-favorites') || e.target.classList.contains('add-favorites') || e.target.tagName === 'path'){
              e.preventDefault();
            }else{
              setOriginLink(router);
            }
          }}>
            <Content
              data={data} 
              mediaType={mediaType}
              showStatus={showStatus}
              character={character}
              showTitle={showTitle}
              isFavorite={favoritesIncludes(data.id)} 
              isTrash={isTrash}
              />
          </Link>
        :
        <div className="media">
            {data && data.id &&
              <Content 
                data={data} 
                mediaType={mediaType}
                showStatus={showStatus}
                character={character}
                showTitle={showTitle}
                isFavorite={favoritesIncludes(data.id)} 
                isTrash={isTrash}
              />
            }
          </div>
        }
      </div>
    )
  }

  const Content = ({data, mediaType, character, showStatus, showTitle, isFavorite, isTrash}) => {

    const router = useRouter();

    const {
        translate, properNames, setFavorites, setTrash, favorites, trashed
    } = useContext(Context);

    const currentNames = properNames[mediaType];

    const [mainPicLoaded, setMainPicLoaded] = useState(false);

    const tmdb_main_url_img_low = "https://www.themoviedb.org/t/p/w220_and_h330_face";

    const voteColor = (vote) => {
        return vote > 3 ? vote > 4.5 ? vote > 6 ? vote > 7.5 ? vote > 9? "lightblue" : "green" : "lightgreen" : "yellow" : "orange" : "red";
    }

    const popColor = (vote) => {
        return vote > 10 ? vote > 19 ? vote > 29 ? vote > 49 ? vote > 89? "lightblue" : "green" : "lightgreen" : "yellow" : "orange" : "red";
    }

    const addFavorite = (data) => {
      const newFavs = {...favorites};
      newFavs[mediaType] = favorites[mediaType] ? [...favorites[mediaType], data] : [data];
      setFavorites(newFavs);
    }
    
    const removeFavorite = (id) => {
      const curr = {...favorites};
      curr[mediaType].forEach((media, i)=>{
        if(media.id===id){
          curr[mediaType].splice(i, 1);
          return;
        }
      });
      setFavorites(curr);
    }

    const addTrash = (data) => {
      const newTrash = {...trashed};
      newTrash[mediaType] = trashed[mediaType] ? [...trashed[mediaType], data] : [data];
      setTrash(newTrash);
    }
    
    const removeTrash = (id) => {
      const curr = {...trashed};
      curr[mediaType].forEach((media, i)=>{
        if(media.id===id){
          curr[mediaType].splice(i, 1);
          return;
        }
      });
      setTrash(curr);
    }

    const [optionsMode, setOptionsMode] = useState(false);

    return (<>
      <div className="cover">
        <div 
          style={{opacity: mainPicLoaded ? 0 : 1}} 
          id={`thumbnail_${data.id}`} 
          className="thumbnail"
        >
          <AiOutlineLoading className="loader"/>
        </div>
        {!isTrash && <>
          <div className={`icon-container ${isFavorite ? '' : 'hide'}`}>
            {isFavorite ?
                <FaStar className="is-favorites" onClick={(e)=>{
                  e.stopPropagation();
                  e.preventDefault();
                  removeFavorite(data.id)
                }}/>
            :
                <FaRegStar className="add-favorites" onClick={(e)=>{
                  e.stopPropagation();
                  e.preventDefault();
                  addFavorite(data);
                }}/>
            }
          </div>
        </>}
        {!isFavorite && <>
          <div className={`icon-container trash ${isTrash ? '' : 'hide'}`}>
            {isTrash ?
                <FaTrash className="is-favorites trash" onClick={(e)=>{
                  e.stopPropagation();
                  e.preventDefault();
                  removeTrash(data.id)
                }}/>
            :
                <FaTrash className="add-favorites" onClick={(e)=>{
                  e.stopPropagation();
                  e.preventDefault();
                  addTrash(data);
                }}/>
            }
          </div>
        </>}
        {mediaType !== "person" && !optionsMode &&
          <div className={`icon-container options hide`}>
            <SlOptions className="is-favorites trash" onClick={(e)=>{
                e.stopPropagation();
                e.preventDefault();
                setOptionsMode(!optionsMode);
              }}/>
          </div>
        }
        {mediaType !== "person" && optionsMode && <>
          <div className={`icon-container options2`}>
            <MdCancel className="is-favorites trash" onClick={(e)=>{
                e.stopPropagation();
                e.preventDefault();
                setOptionsMode(!optionsMode);
              }}/>
          </div>
          <div className={`icon-container option1`}>
            <MdRecommend className="is-favorites trash" onClick={(e)=>{
                e.stopPropagation();
                e.preventDefault();
                router.push(`/recommendations/${mediaType}/${data.id}`)
                setOptionsMode(!optionsMode);
              }}/>
          </div>
          <div className={`icon-container option2`}>
            <BiCopy className="is-favorites trash" onClick={(e)=>{
                e.stopPropagation();
                e.preventDefault();
                router.push(`/similar/${mediaType}/${data.id}`)
                setOptionsMode(!optionsMode);
              }}/>
          </div>
        </>}
        {mediaType !== "person" && data.vote_count > 0 && moment(data[currentNames.release_date],"YYYY-MM-DD") < moment(Date.now()) && <>
          <div className={`vote-average ${voteColor(data.vote_average)}`}>{Math.round(data.vote_average*10)/10}</div>
          <div className={`vote-count ${voteColor(data.vote_average)}`}>{data.vote_count}</div>
        </>}
        {mediaType === "person" && <>
          <div className={`vote-average ${popColor(data.popularity)}`}>{Math.round(data.popularity)}</div>
          {data.known_for_department &&
            <div className={`${data.known_for_department.replaceAll(" ","").split("&")[0].toLowerCase()} person-alert`}>{translate(data.known_for_department.split("&")[0])}</div>
          }
          <div className={`vote-count ${popColor(data.popularity)}`}>{data.gender === 1 ? "F" : data.gender === 2 ? "M" : "NB"}</div>
        </>}
        {showStatus && mediaType !== "person" && moment(data[currentNames.release_date],"YYYY-MM-DD") > moment(Date.now()) ? 
          <div className="upcoming-alert">{translate("upcoming")}</div>
        : <>
          {showStatus && mediaType === 'tv' && <>
            {data.status === 'Canceled' ? 
              <div className="canceled-alert">{translate("canceled")}</div>
            : data.in_production ? 
              <div className="ongoing-alert">{translate("ongoing")}</div>
            :
              <div className="ended-alert">{translate("ended")}</div>
            }
          </>}
        </>}
        {mediaType !== "person" && 
          <div className="flag-container">
            <img className="flag" alt={data.original_language} src={`/img/flags/${data.original_language}.svg`}/>
          </div>
        }
        {mediaType !== "person" && 
          <img className="main-image" alt={data[currentNames.title]} src={data.poster_path? `${tmdb_main_url_img_low}/${data.poster_path}` : noImage.src} 
          onLoad={()=>{setMainPicLoaded(true)}}/>
        }
        {mediaType === "person" && 
          <img className="main-image" alt={data.original_name} src={data.profile_path? `${tmdb_main_url_img_low}/${data.profile_path}` : noImage.src} 
          onLoad={()=>{setMainPicLoaded(true)}}/>
        }
        {character &&
          <div className={`cover-title ontop`}>
            {character}
          </div>
        }
      </div>
      {showTitle &&
        <div className={`cover-title`}>
          {mediaType === "person" ? data.original_name : data[currentNames.title]}
        </div>
      }
    </>)
  }