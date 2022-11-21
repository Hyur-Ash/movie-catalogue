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
import {FaStar, FaFilm, FaSearch} from 'react-icons/fa';
import {TfiLayoutMediaLeft as LogoIcon} from 'react-icons/tfi';
import Link from 'next/link';

export default function Header({data, showTitle, href, withDeleteIcon}){
    
    const router = useRouter();

    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);

    const {
        movieGenres, tvGenres, yearsContent, sortValues,
        discoveredMedias, singleMedia, setSingleMedia, discoverMedias, loadingMedias, loadSingleMedia, lastDiscover,
        totalDPages, currentDPage, setCurrentDPage, 
        translate, websiteLang, setWebsiteLang, 
        languagesOptions, isYearRange, setIsYearRange,
    } = useContext(Context);

    const menuVoices = [
        {name: translate("Search"), href: '/', icon: <FaSearch className="icon"/>},
        {name: translate("Discover"), href: '/discover', icon: <FaFilm className="icon"/>},
        {name: translate("Favorites"), href: '/favorites', icon: <FaStar className="icon"/>},
    ]

    return isMounted && (
        <header>
            <div className="logo-container">
                <Link className="logo" href="/"><h1><LogoIcon className="logo-icon"/><span>{translate("Hyur's Media Library")}</span></h1></Link>
            </div>
            <nav>
                {menuVoices.map((voice, i) => router.pathname !== voice.href && (
                    <Link key={`menu-voice-${i}`} className="menu-voice" href={voice.href}><div className="content">{voice.icon}<span>{voice.name}</span></div></Link>
                ))}
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