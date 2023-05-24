import {useContext} from 'react';
import { Context } from '/lib/Context';
import Link from 'next/link';

export default function CastMember({data, onClick}){
    const tmdb_main_url_img_low = "https://www.themoviedb.org/t/p/w220_and_h330_face";
    const {
        tmdb_main_url, websiteLang
    } = useContext(Context);
    return(
        <div className="cast-member" onClick={()=>{onClick && onClick()}}>
            <img src={data.profile_path ? `${tmdb_main_url_img_low}${data.profile_path}` : "/img/person-not-found.jpg"}/>
            <div className="name orig">{data.original_name}</div>
            {data.character &&
                <div className="name char">{data.character}</div>
            }
        </div>
    )
}