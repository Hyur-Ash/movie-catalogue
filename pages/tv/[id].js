import {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import {MediaPopup} from '/components/MediaPopup';

export default function Tv() {

    const router = useRouter();
    const {id} = router.query;

    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);

    return isMounted && id && <MediaPopup mediaType="tv" id={id} />
}
