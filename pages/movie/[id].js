import {useRouter} from 'next/router';
import {MediaPopup} from '/components/MediaPopup';
import {useState, useEffect, useContext} from 'react';
import { Context } from '/lib/Context';

export default function Movie() {

    const {
        User
    } = useContext(Context);

    const {user, refreshUser} = User;
    
    const router = useRouter();
    useEffect(()=>{
        if(!user){
            router.push("/");
        }
      },[user]);
      useEffect(()=>{
          if(user){
              refreshUser();
          }
      },[]);

    const {id} = router.query;

    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);

    return isMounted && id && user && <MediaPopup mediaType="movie" id={id} />
}
