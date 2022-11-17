import Head from 'next/head';
import {useState, useEffect, useContext, useRef} from 'react';
import { Context } from '/lib/Context';
import {Form, FormGroup, Label, Input} from 'reactstrap';
import Select from 'react-select'; 
import {Navigator} from '/components/Navigator';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axios from 'axios';
import {useLocalStorage} from '/lib/useLocalStorage';
import {useRouter} from 'next/router';
import moment from 'moment';
import {MediaCover} from '/components/MediaCover';
import {FaStar} from 'react-icons/fa';
import {TfiLayoutMediaLeft as LogoIcon} from 'react-icons/tfi';
import Link from 'next/link';

export default function({data, showTitle, href, withDeleteIcon}){

    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);

    const {
        movieGenres, tvGenres, yearsContent, sortValues,
        medias, singleMedia, setSingleMedia, loadMedias, loadingMedias, loadSingleMedia, lastSearch,
        totalPages, currentPage, setCurrentPage, 
        translate, websiteLang, setWebsiteLang, languageCodes,
        currentNames, languagesOptions, isYearRange, setIsYearRange
    } = useContext(Context);

    return isMounted && (
        <header>
            <div className="logo">
                <Link href="/"><LogoIcon className="logo-icon"/></Link>
                <h1>{translate("Hyur's Media Library")}</h1>
            </div>
            <nav>
                <Link href="/favorites"><FaStar className="icon favorites"/></Link>
            </nav>
            <div className="language-selector">
                <Select
                    instanceId={"language"} 
                    options={languagesOptions}
                    value={languagesOptions.filter(l=>l.value === websiteLang)[0]}
                    onChange={(e)=>{setWebsiteLang(e.value)}}
                    isSearchable={false}
                />
            </div>
        </header>
    )
}