import {useRouter} from 'next/router';
import {PersonPopup} from '/components/PersonPopup';
import {useState, useEffect, useContext} from 'react';
import { Context } from '/lib/Context';

export default function Movie() {

    const {
        User
    } = useContext(Context);

    const {user} = User;
    
    const router = useRouter();
    useEffect(()=>{
    if(!user){
        router.push("/");
    }
    },[user]);

    const {id} = router.query;

    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);

    return isMounted && id && user && <PersonPopup id={id} />
}
