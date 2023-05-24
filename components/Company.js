import {useContext} from 'react';
import { Context } from '/lib/Context';
import Link from 'next/link';

export default function Company({data, onClick}){
    const tmdb_main_url_img_low = "https://www.themoviedb.org/t/p/w300";
    return(
        <div className="production-company" onClick={()=>{onClick && onClick()}}>
            <div className="image">
                <img src={data.logo_path ? `${tmdb_main_url_img_low}${data.logo_path}` : "/img/company-not-found.jpg"}/>
            </div>
            <span className="title">{data.name}</span>
        </div>
    )
}