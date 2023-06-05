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

export const MediaCover = ({sagaIndex, highlight, data, headline, showTitle, href, onClick, mediaType, showStatus, showUpcoming, page, hideTrash, hideFavorites, hide}) => {

    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
      setIsMounted(true);
    },[]);

    const router = useRouter();

    const {
        User
    } = useContext(Context);

    
    const {user} = User;
    const {favorites, trashed} = user ?? {};

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
    const isFavorite = favoritesIncludes(data.id);

    return isMounted && mediaType && (
      <div className={`media-container media-id-${data.id} ${(hide || (isTrash && hideTrash) || (isFavorite && hideFavorites)) ? "no-display" : ""} ${page ? `page${page}` : ""}`} ref={contentRef}>
        {href ? 
          <Link href={href} className={`media clickable ${highlight ? "highlight" : ""}`} onClick={(e)=>{
            if(!href || e.target.classList.contains('is-favorites') || e.target.classList.contains('add-favorites') || e.target.tagName === 'path'){
              e.preventDefault();
            }
          }}>
            <Content
              data={data} 
              mediaType={mediaType}
              showStatus={showStatus}
              showUpcoming={showUpcoming}
              headline={headline}
              showTitle={showTitle}
              isFavorite={isFavorite} 
              isTrash={isTrash}
              sagaIndex={sagaIndex}
              />
          </Link>
        :
        <div className={`media ${highlight ? "highlight" : ""} ${onClick ? "clickable" : ""}`} onClick={()=>{onClick && onClick()}}>
            {data && data.id &&
              <Content
                data={data} 
                mediaType={mediaType}
                showStatus={showStatus}
                showUpcoming={showUpcoming}
                headline={headline}
                showTitle={showTitle}
                isFavorite={isFavorite} 
                isTrash={isTrash}
                sagaIndex={sagaIndex}
              />
            }
          </div>
        }
      </div>
    )
  }

  const Content = ({data, mediaType, headline, showStatus, showUpcoming, showTitle, isFavorite, isTrash, sagaIndex}) => {

    const router = useRouter();
    
    const {
        User,
        translate, properNames,
        voteColor
    } = useContext(Context);

    const {user, addMediaToUserList, removeMediaFromUserList} = User;
    const {favorites, trashed} = user ?? {};

    const currentNames = properNames[mediaType];

    const [mainPicLoaded, setMainPicLoaded] = useState(false);

    const tmdb_main_url_img_low = "https://www.themoviedb.org/t/p/w220_and_h330_face";

    const popColor = (vote) => {
        return vote < 10 ? "black" :
        vote < 20 ? "grey" :
        vote < 30 ? "lightgreen" :
        vote < 40 ? "green" :
        vote < 50 ? "darkgreen" :
        vote < 60 ? "yellow" :
        vote < 70 ? "gold" :
        vote < 80 ? "orange" :
        vote < 90 ? "red" :
        vote < 100 ? "lightblue" : "blue";
    }

    const cleanMedia = (mediaType, data) => {
      if(mediaType === "movie"){
        const {id, original_language, original_title, poster_path, release_date, vote_average, vote_count} = data;
        return {id, original_language, original_title, poster_path, release_date, vote_average, vote_count};
      }else if(mediaType === "tv"){
        const {id, original_language, original_name, poster_path, first_air_date, vote_average, vote_count} = data;
        return {id, original_language, original_name, poster_path, first_air_date, vote_average, vote_count};
      }else if(mediaType === "person"){
        const {id, gender, original_name, name, profile_path, popularity, known_for_department} = data;
        return {id, gender, original_name, name, profile_path, popularity, known_for_department};
      }
    }

    const addFavorite = (fullData) => {
      const data = cleanMedia(mediaType, fullData);
      addMediaToUserList(data, mediaType, "favorites");
    }
    
    const removeFavorite = (id) => {
      removeMediaFromUserList(id, mediaType, "favorites");
    }

    const addTrash = (fullData) => {
      const data = cleanMedia(mediaType, fullData);
      addMediaToUserList(data, mediaType, "trashed");
    }
    
    const removeTrash = (id) => {
      removeMediaFromUserList(id, mediaType, "trashed");
    }

    const [optionsMode, setOptionsMode] = useState(false);

    return (<>
      <div className={`cover`}>
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
        {sagaIndex &&
          <div className={`saga-index`}>{sagaIndex}</div>
        }
        {mediaType !== "person" && data[currentNames.release_date]?.length > 0 && moment(data[currentNames.release_date],"YYYY-MM-DD") < moment(Date.now()) && <>
          <div className={`vote ${voteColor(data.vote_average)}`}>
            <div className="average">{Math.round(data.vote_average*10)/10}</div>
            <div className="count">{data.vote_count}</div>
          </div>
        </>}
        {mediaType === "person" && <>
          <div className={`vote ${popColor(data.popularity)}`}>
            <div className="average">{Math.floor(data.popularity)}</div>
            <div className="count">{data.gender === 1 ? "F" : data.gender === 2 ? "M" : "NB"}</div>
          </div>
          {data.known_for_department &&
            <div className={`${data.known_for_department.replaceAll(" ","").split("&")[0].toLowerCase()} person alert`}>{translate(data.known_for_department)}</div>
          }
        </>}
        {showStatus && mediaType === 'movie' && data.status &&
          <div 
            className={`upcoming alert ${data.status ? data.status.toLowerCase().replaceAll(" ", "-") : ""}`}
          >{translate(data.status)}</div>
        }
        {showUpcoming && mediaType !== "person" && !data.status && data[currentNames.release_date]?.length > 0 && moment(data[currentNames.release_date],"YYYY-MM-DD").valueOf() > moment().valueOf() && 
          <div 
            className={`upcoming alert`}
          >{translate("upcoming")}</div>
        }
        {showStatus && mediaType === 'tv' && data.status && <>
          {data.status === 'Canceled' ? 
            <div className="canceled alert">{translate("canceled")}</div>
          : data.in_production ? 
            <div className="ongoing alert">{translate("ongoing")}</div>
          :
            <div className="ended alert">{translate("ended")}</div>
          }
        </>}
        {mediaType !== "person" && 
          <div className="flag-container">
            <img className="flag" alt={data.original_language} src={`/img/flags/${data.original_language}.svg`}/>
          </div>
        }
        {mediaType !== "person" && 
          <img className="main-image" alt={data[currentNames.title]} src={data.poster_path? `${tmdb_main_url_img_low}${data.poster_path}` : `/img/not-found.jpg`} 
          onLoad={()=>{setMainPicLoaded(true)}}/>
        }
        {mediaType === "person" && 
          <img className="main-image" alt={data.original_name} src={data.profile_path? `${tmdb_main_url_img_low}${data.profile_path}` : '/img/person-not-found.jpg'} 
          onLoad={()=>{setMainPicLoaded(true)}}/>
        }
        {headline &&
          <div className={`cover-title ontop`}>
            {headline}
          </div>
        }
      </div>
      {showTitle &&
        <div className={`cover-title`}>
          {mediaType === "person" ? data.original_name || data.name : data[currentNames.title]}
        </div>
      }
    </>)
  }