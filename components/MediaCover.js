import {useState, useContext, useEffect} from 'react';
import { Context } from '/lib/Context';
import moment from 'moment';
import Link from 'next/link';
import {FaStar, FaRegStar, FaTrash} from 'react-icons/fa';
import {AiOutlineLoading} from 'react-icons/ai';
import {useRouter} from 'next/router';
import noImage from '/public/img/not-found.jpg';

export const MediaCover = ({data, showTitle, href, withDeleteIcon, mediaType, showStatus}) => {

  const [isMounted, setIsMounted] = useState(false);
  useEffect(()=>{
    setIsMounted(true);
  },[]);

    const tmdb_main_url_img_low = "https://www.themoviedb.org/t/p/w220_and_h330_face";

    const router = useRouter();

    const {
        translate, favorites, setFavorites, setOriginLink, properNames, loadingMedias
    } = useContext(Context);

    const currentNames = properNames[mediaType];

    const voteColor = (vote) => {
        return vote > 3 ? vote > 4.5 ? vote > 6 ? vote > 7.5 ? vote > 9? "lightblue" : "green" : "lightgreen" : "yellow" : "orange" : "red";
    }

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

    const addFavorite = (data) => {
      setFavorites(curr=>{
        return {
          ...curr,
          [mediaType]: [
            ...curr[mediaType],
            data
          ]
        }
      })
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

    const Content = () => {
      const [thumbnailLoaded, setThumbnailloaded] = useState(true);
      const [mainPicLoaded, setMainPicLoaded] = useState(false);
      return (<>
        <div className="cover">
          <div style={{opacity: mainPicLoaded ? 0 : 1}} id={`thumbnail_${data.id}`} className="thumbnail"><AiOutlineLoading className="loader"/></div>
          {thumbnailLoaded && loadingMedias !== true && <>
            <div className={`icon-container ${favoritesIncludes(data.id)? withDeleteIcon? 'hide' : '' : 'hide'}`}>
              {favoritesIncludes(data.id) ?
                withDeleteIcon ? 
                  <FaTrash className="is-favorites trash" onClick={(e)=>{
                    e.stopPropagation();
                    e.preventDefault();
                    removeFavorite(data.id);
                  }}/>
                  :
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
            {data.vote_count > 0 && moment(data[currentNames.release_date],"YYYY-MM-DD") < moment(Date.now()) && <>
              <div className={`vote-average ${voteColor(data.vote_average)}`}>{Math.round(data.vote_average*10)/10}</div>
              <div className={`vote-count ${voteColor(data.vote_average)}`}>{data.vote_count}</div>
            </>}
            {moment(data[currentNames.release_date],"YYYY-MM-DD") > moment(Date.now()) ? 
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
            <div className="flag-container">
              <img className="flag" alt={data.original_language} src={`/img/flags/${data.original_language}.svg`}/>
            </div>
            <img className="main-image" alt={data[currentNames.title]} src={data.poster_path? `${tmdb_main_url_img_low}/${data.poster_path}` : noImage.src} 
            onLoad={()=>{setMainPicLoaded(true)}}/>
          </>}
        </div>
        {showTitle && <div className="cover-title">{ loadingMedias !== true? data[currentNames.title] : ''}</div>}
      </>)
    }

    return isMounted && mediaType && (<>
    {href ? 
      <Link href={href} className="media clickable" onClick={(e)=>{
        if(!href || e.target.classList.contains('is-favorites') || e.target.classList.contains('add-favorites') || e.target.tagName === 'path'){
          e.preventDefault();
        }else{
          setOriginLink(router.route);
        }
      }}>
        <Content/>
      </Link>
    :
      <div className="media">
        <Content/>
      </div>
    }</>)
  }