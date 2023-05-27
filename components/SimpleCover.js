import {useContext} from 'react';
import { Context } from '/lib/Context';
import Link from 'next/link';

export default function SimpleCover({imagePath, name, headline, onClick, type, transparent}){
    const tmdb_main_url_img_low = "https://www.themoviedb.org/t/p/w220_and_h330_face";

    return(
        <div className={`simple-cover ${transparent ? "transparent" : ""}`} onClick={()=>{onClick && onClick()}}>
            <img src={imagePath ? `${tmdb_main_url_img_low}${imagePath}` : `/img/${type || ""}-not-found.jpg`}/>
            {name &&
                <div className="name orig">{name}</div>
            }
            {headline &&
                <div className="name char">{headline}</div>
            }
        </div>
    )
}