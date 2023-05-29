import {useContext} from 'react';
import { Context } from '/lib/Context';
import Link from 'next/link';

export default function SimpleCover({imageMain, imagePath, title, subtitle, headline, onClick, type, highlight, vote}){

    const tmdb_main_url_img_low = "https://www.themoviedb.org/t/p/w220_and_h330_face";

    const {
        voteColor
    } = useContext(Context);

    return(
        <div className={`simple-cover ${highlight ? "highlight" : ""}`} onClick={()=>{onClick && onClick()}}>
            <div className="image">
                <img src={imagePath ? `${imageMain || tmdb_main_url_img_low}${imagePath}` : `/img/${type ? `${type}-` : ""}not-found.jpg`}/>
                {headline &&
                    <div className={`headline`}>{headline}</div>
                }
                <div className="thumbnail"></div>
                {vote &&
                    <div className={`vote ${voteColor(vote.average)}`}>
                        <div className="average">{Math.round(vote.average*10)/10}</div>
                        <div className="count">{vote.count}</div>
                    </div>
                }
            </div>
            {title &&
                <div className="name orig">{title}</div>
            }
            {subtitle &&
                <div className="name char">{subtitle}</div>
            }
        </div>
    )
}