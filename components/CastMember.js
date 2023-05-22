import {useContext} from 'react';
import { Context } from '/lib/Context';
import Link from 'next/link';

export default function CastMember({data}){
    const tmdb_main_url_img_low = "https://www.themoviedb.org/t/p/w220_and_h330_face";
    const {
        tmdb_main_url, tmdb_api_key, websiteLang
    } = useContext(Context);
    return(
        <Link className="cast-member" href={`/person/${data.id}`}>
            <img src={data.profile_path ? `${tmdb_main_url_img_low}${data.profile_path}` : "/img/not-found.jpg"}/>
            <div className="name orig">{data.original_name}</div>
            {data.character &&
                <div className="name char">{data.character}</div>
            }
        </Link>
    )
}