import {useRouter} from 'next/router';
import {MediaPopup} from '/components/MediaPopup';
import {useState, useEffect, useContext} from 'react';
import { Context } from '/lib/Context';

export default function Movie() {

    const {
        currentUser
    } = useContext(Context);
    
    const router = useRouter();
    useEffect(()=>{
    if(!currentUser){
        router.push("/");
    }
    },[currentUser]);

    const {id} = router.query;

    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);

    return isMounted && id && currentUser && <MediaPopup mediaType="movie" id={id} />
}
