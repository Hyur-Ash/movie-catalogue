import {useState, useContext, useEffect} from 'react';
import { Context } from '/lib/Context';
import moment from 'moment';
import Link from 'next/link';
import {FaStar, FaRegStar, FaTrash} from 'react-icons/fa';
import {useRouter} from 'next/router';

export const MediaCover = ({data, showTitle, href, withDeleteIcon, mediaType}) => {

  const [isMounted, setIsMounted] = useState(false);
  useEffect(()=>{
    setIsMounted(true);
  },[]);

    const tmdb_main_url_img_low = "https://www.themoviedb.org/t/p/w220_and_h330_face";

    const router = useRouter();

    const {
        translate, favorites, setFavorites, setOriginLink, properNames
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

    return isMounted && mediaType && (
      <Link href={href ?? ''} className={`media ${href ? 'clickable' : ''}`} onClick={(e)=>{
        if(e.target.classList.contains('is-favorites') || e.target.classList.contains('add-favorites') || e.target.tagName === 'path'){
          e.preventDefault();
        }else{
          setOriginLink(router.route);
        }
      }}>
        <div className="cover">
          <div className={`icon-container ${favoritesIncludes(data.id)? withDeleteIcon? 'hide' : '' : 'hide'}`}>
            {favoritesIncludes(data.id) ?
              withDeleteIcon ? 
                <FaTrash className="is-favorites trash" onClick={()=>{removeFavorite(data.id)}}/>
                :
                <FaStar className="is-favorites" onClick={()=>{removeFavorite(data.id)}}/>
              :
              <FaRegStar className="add-favorites" onClick={()=>{addFavorite(data)}}/>
            }
          </div>
          {data.vote_count > 0 && moment(data[currentNames.release_date],"YYYY-MM-DD") < moment(Date.now()) && <>
            <div className={`vote-average ${voteColor(data.vote_average)}`}>{Math.round(data.vote_average*10)/10}</div>
            <div className={`vote-count ${voteColor(data.vote_average)}`}>{data.vote_count}</div>
          </>}
          {moment(data[currentNames.release_date],"YYYY-MM-DD") > moment(Date.now()) && 
            <div className="upcoming-alert">{translate("upcoming")}</div>
          }
          <div className="flag-container">
            <img className="flag" alt={data.original_language} src={`/img/flags/${data.original_language}.svg`}/>
          </div>
          <img alt={data[currentNames.title]} src={data.poster_path? `${tmdb_main_url_img_low}/${data.poster_path}` : `img/not-found.jpg`}/>
        </div>
        {showTitle && data[currentNames.title]}
      </Link>
    )
  }