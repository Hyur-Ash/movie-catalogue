import {useContext} from 'react';
import { Context } from '/lib/Context';
import moment from 'moment';

export const MediaCover = ({data, showTitle, onClick}) => {

    const tmdb_main_url_img_low = "https://www.themoviedb.org/t/p/w220_and_h330_face";

    const {
        translate, currentNames
    } = useContext(Context);

    const voteColor = (vote) => {
        return vote > 3 ? vote > 4.5 ? vote > 6 ? vote > 7.5 ? vote > 9? "lightblue" : "green" : "lightgreen" : "yellow" : "orange" : "red";
    }

    return(
      <div className={`media ${onClick ? 'clickable' : ''}`} onClick={()=>{onClick && onClick();}}>
        {data.vote_count > 0 && moment(data[currentNames.release_date],"YYYY-MM-DD") < moment(Date.now()) &&
          <div className={`vote-average ${voteColor(data.vote_average)}`}>{Math.round(data.vote_average*10)/10}</div>
        }
        {moment(data[currentNames.release_date],"YYYY-MM-DD") > moment(Date.now()) && 
          <div className="upcoming-alert">{translate("upcoming")}</div>
        }
        <div className="flag-container">
          <img className="flag" alt={data.original_language} src={`/img/flags/${data.original_language}.svg`}/>
        </div>
        <img alt={data[currentNames.title]} src={data.poster_path? `${tmdb_main_url_img_low}/${data.poster_path}` : `img/not-found.jpg`}/>
        {showTitle && data[currentNames.title]}
      </div>
    )
  }