import {useState, useContext, useEffect, useRef, Fragment} from 'react';
import { Context } from '/lib/Context';
import moment from 'moment';
import Link from 'next/link';
import {FaStar, FaRegStar, FaTrash} from 'react-icons/fa';
import {AiOutlineLoading} from 'react-icons/ai';
import {useRouter} from 'next/router';
import noImage from '/public/img/not-found.jpg';

export const MediaCover = ({data, showTitle, href, mediaType, showStatus, page, hideTrash}) => {

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
      <div className={`media-container ${isTrash && hideTrash ? "no-display" : ""} ${page ? `page${page}` : ""}`} ref={contentRef}>
        {href ? 
          <Link href={href} className="media clickable" onClick={(e)=>{
            if(!href || e.target.classList.contains('is-favorites') || e.target.classList.contains('add-favorites') || e.target.tagName === 'path'){
              e.preventDefault();
            }else{
              setOriginLink(router.route);
            }
          }}>
            <Content
              data={data} 
              mediaType={mediaType}
              showStatus={showStatus}
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

  const Content = ({data, mediaType, showStatus, showTitle, isFavorite, isTrash}) => {

    const {
        translate, properNames, setFavorites, setTrash, favorites, trashed
    } = useContext(Context);

    const currentNames = properNames[mediaType];

    const [mainPicLoaded, setMainPicLoaded] = useState(false);

    const tmdb_main_url_img_low = "https://www.themoviedb.org/t/p/w220_and_h330_face";

    const voteColor = (vote) => {
        return vote > 3 ? vote > 4.5 ? vote > 6 ? vote > 7.5 ? vote > 9? "lightblue" : "green" : "lightgreen" : "yellow" : "orange" : "red";
    }

    const addFavorite = (data) => {
      setFavorites({
        ...favorites,
        [mediaType]: [
          ...favorites[mediaType],
          data
        ]
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

    const addTrash = (data) => {
      setTrash({
        ...trashed,
        [mediaType]: [
          ...trashed[mediaType],
          data
        ]
      });
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
      </div>
      {showTitle && <div className="cover-title">{data[currentNames.title]}</div>}
    </>)
  }