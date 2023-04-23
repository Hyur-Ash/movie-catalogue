import STORE from '/lib/store.json';
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
import Header from '/components/Header';
import {FaStar} from 'react-icons/fa';
import Link from 'next/link';

export default function Discover() {

  const router = useRouter();
  
  const {languageCodes, movieGenres, tvGenres, sortValues} = STORE;

  const [isMounted, setIsMounted] = useState(false);
  useEffect(()=>{
    setIsMounted(true);
  },[]);

  const {
    tmdb_api_key, tmdb_main_url,
    yearsContent,
    loadingMedias, setLoadingMedias, properNames,
    translate, websiteLang,
    isYearRange, setIsYearRange,
  } = useContext(Context);

  const [genres, setGenres] = useState(movieGenres);

  const allGenres = genres.map(g=>({value: g.id, label: translate(g.name)}));
  const [availableGenres, setAvailableGenres] = useState(JSON.parse(JSON.stringify(allGenres)));

  const allVotes = Array.from({ length: 11 }).map((el, i)=>({value: i, label: i}));
  const [availableVotes, setAvailableVotes] = useState(JSON.parse(JSON.stringify(allVotes)));

  const formOptions = {
    mediaType: [
      {value: 'movie', label: translate('Movie')},
      {value: 'tv', label: translate('TV Show')}
    ],
    genres: availableGenres,
    years: [{value: "", label: translate("Any")}, ...yearsContent.map(g=>({value: g.id, label: g.name}))],
    sortValues: sortValues.map(g=>({value: g.id, label: translate(g.name)})),
    orderValues: [
      {value: 'desc', label: translate('Descending')},
      {value: 'asc', label: translate('Ascending')},
    ],
    originalLanguages: [{value: "", label: translate("Any")}, ...languageCodes.map(lc=>({value: lc.code, label: translate(lc.name)}))],
    votes: allVotes,
  };

  const firstFormValues = {
    mediaType: formOptions.mediaType[0],
    withGenres: [],
    withoutGenres: [],
    sortBy: formOptions.sortValues[0],
    orderBy: formOptions.orderValues[0],
    yearFrom: formOptions.years[0],
    yearTo: formOptions.years[0],
    originalLanguage: formOptions.originalLanguages[0],
    voteAverageFrom: formOptions.votes[0],
    voteAverageTo: formOptions.votes[formOptions.votes.length-1],
    voteCountFrom: '',
    voteCountTo: '',
  }
  const [formValues, setFormValues] = useLocalStorage('discoverValues', firstFormValues);
  useEffect(()=>{
    if(formValues){
      const genres = formValues.mediaType.value === 'movie' ? movieGenres : tvGenres;
      setGenres(genres);
      setFormValues(curr=>{
        if(!curr){return curr}
        const newWithGenres = [], newWithoutGenres = [];
        curr.withGenres.forEach((g)=>{
          if(genres.map(g=>g.id).includes(g.value)){
            newWithGenres.push(g);
          }
        });
        curr.withoutGenres.forEach((g)=>{
          if(genres.map(g=>g.id).includes(g.value)){
            newWithoutGenres.push(g);
          }
        });
        return {...curr, withGenres: newWithGenres, withoutGenres: newWithoutGenres,}
      });
    }
  },[formValues?.mediaType]);

  useEffect(()=>{
    if(formValues){
      const newAvailableGenres = [];
      allGenres.forEach(g=>{
        if( formValues.withGenres.filter(w=>w.value===g.value).length > 0 || 
            formValues.withoutGenres.filter(w=>w.value===g.value).length > 0
        ){return;}
        newAvailableGenres.push(g);
      });
      setAvailableGenres(newAvailableGenres);
    }
  },[formValues?.withGenres, formValues?.withoutGenres])

  useEffect(()=>{
    if(formValues){
      const newAvailableVotes = [];
      allVotes.forEach(g=>{
        if(g.value < formValues.voteAverageFrom.value){return;}
        newAvailableVotes.push(g);
      });
      setAvailableVotes(newAvailableVotes);
      if(formValues.voteAverageTo.value < formValues.voteAverageFrom.value){
        changeFormValue('voteAverageTo', formValues.voteAverageFrom);
      }
    }
  },[formValues?.voteAverageFrom])

  useEffect(()=>{
    if(formValues){
      const from = fromValue(formValues.yearFrom.value);
      const to = toValue(formValues.yearTo.value);
      if(to < from){
        const option = formOptions.years.filter(y=>y.value === (from + 1).toString())[0];
        changeFormValue('yearTo', option ?? formOptions.years[0]);
      }
    }
  },[formValues?.yearFrom, formValues?.yearTo])

  const getAverageTo = (curr) => {
    const voteSearch = availableVotes.filter(m=>m.value===curr.voteAverageTo.value);
    if(voteSearch && voteSearch[0]){
      return voteSearch[0];
    }else{
      return availableVotes.votes[0];
    }
    
  }
  useEffect(()=>{
    setFormValues(curr=>({
        ...curr,
        mediaType: formOptions.mediaType.filter(m=>m.value===curr.mediaType.value)[0],
        withGenres: allGenres.map(m=>curr.withGenres.map(w=>w.value).includes(m.value) && m),
        withoutGenres: allGenres.map(m=>curr.withoutGenres.map(w=>w.value).includes(m.value) && m),
        sortBy: formOptions.sortValues.filter(m=>m.value===curr.sortBy.value)[0],
        orderBy: formOptions.orderValues.filter(m=>m.value===curr.orderBy.value)[0],
        yearFrom: formOptions.years.filter(m=>m.value===curr.yearFrom.value)[0],
        yearTo: formOptions.years.filter(m=>m.value===curr.yearTo.value)[0],
        originalLanguage: formOptions.originalLanguages.filter(m=>m.value===curr.originalLanguage?.value)[0],
        voteAverageFrom: formOptions.votes.filter(m=>m.value===curr.voteAverageFrom.value)[0],
        voteAverageTo: getAverageTo(curr),
    }));
  },[websiteLang]) 

  const changeFormValue = (key, value) => {
    setFormValues(curr=>({...curr, [key]: value}));
  }

  const handleVoteCount = (dir, value) => {
    value = parseInt(value);
    let from, to;
    if(!value && value !== 0){
      if(dir === 'from'){
        from = '';
        to = formValues.voteCountTo;
      }else{
        to = '';
        from = formValues.voteCountFrom;
      }
    }
    else if(dir === 'from'){
      from = value < 0? 0 : value;
      to = formValues.voteCountTo >= from ? formValues.voteCountTo : from;
    }else{
      to = value < 0? 0 : value 
      from = formValues.voteCountFrom <= to ? formValues.voteCountFrom : to;
    }
    setFormValues(curr=>({...curr, 
      voteCountFrom: from, 
      voteCountTo: to
    }));
  }

  const [lastDiscover, setLastDiscover] = useLocalStorage('lastDiscover', null);
  const [medias, setMedias] = useState([]);
  const [currentPage, setCurrentPage] = useLocalStorage('currentPage', 1);
  const [totalPages, setTotalPages] = useState();
  const discoverMedias = (formValues) => {
      setLastDiscover(JSON.parse(JSON.stringify(formValues)));
      setLoadingMedias(true);
      loadPage(1, formValues, true);
  }
  const loadPage = (pageNum, lastDiscover, resetMedias, scrollTop) => {
    const currentNames = properNames[lastDiscover.mediaType.value];
    const params = {
        api_key: tmdb_api_key,
        sort_by: `${lastDiscover.sortBy.value}.${lastDiscover.orderBy.value}`,
        with_genres: `${lastDiscover.withGenres.map(e=>e.value).toString()}`,
        without_genres: `${lastDiscover.withoutGenres.map(e=>e.value).toString()}`,
        page: pageNum,
        language: websiteLang,
        with_original_language: lastDiscover.originalLanguage.value === 'any' ? '' : lastDiscover.originalLanguage.value,
        ["vote_average.gte"]: lastDiscover.voteAverageFrom.value === 'any' ? '' : lastDiscover.voteAverageFrom.value.toString(),
        ["vote_count.gte"]: lastDiscover.voteCountFrom.toString(),
    }
    if(lastDiscover.mediaType.value === 'movie'){
        if(isVoteAverageRange){
            params["vote_average.lte"] = lastDiscover.voteAverageTo.value === 'any' ? '' :lastDiscover.voteAverageTo.value.toString();
        }
        if(isVoteCountRange){
            params["vote_count.lte"] = lastDiscover.voteCountTo.toString();
        }
    }
    if(!isYearRange){
        params[currentNames.primary_release_year] = lastDiscover.yearFrom.value;
    }else{
        params[currentNames["primary_release_date.gte"]] = lastDiscover.yearFrom.value.length > 0 ? lastDiscover.yearFrom.value : '0';
        params[currentNames["primary_release_date.lte"]] = lastDiscover.yearTo.value.length > 0 ? lastDiscover.yearTo.value : '3000';
    }
    axios.get(`${tmdb_main_url}/discover/${lastDiscover.mediaType.value}`, {params})
    .then(res=>{
        console.log(res.data)
        setMedias(curr => resetMedias ? res.data.results : [...curr, ...res.data.results] );
        setCurrentPage(res.data.page);
        setTotalPages(res.data.total_pages);
        setLoadingMedias(Date.now());
        if(scrollTop){
          scrollElementRef.current.scrollIntoView();
        }
    })
    .catch(err=>{
        console.error(err);
        setLoadingMedias(Date.now());
    });
  }
  useEffect(()=>{
      if(lastDiscover){
        loadPage(currentPage, lastDiscover);
      }
  },[lastDiscover, websiteLang]);

  const [isVoteAverageRange, setIsVoteAverageRange] = useLocalStorage('isVoteAverageRange', false);
  const [isVoteCountRange, setIsVoteCountRange] = useLocalStorage('isVoteCountRange', false);

  const scrollElementRef = useRef();

  // const [scrollPerc, setScrollPerc] = useState(0);
  const [scrollPerc, setScrollPerc] = useState(0)
  // useEffect(()=>{
    // console.log(scrollPerc.current)
// console.log(Date.now() - scrollAllowed.current, Date.now() - scrollAllowed.current > 5000)
//     console.log(scrolled > 90, !isLoading.current, scrollAllowed.current < 4)
//     if(scrolled > 90 && !isLoading.current && scrollAllowed.current < 4){
//       setLoadingMedias(true);
//       // loadPage(currentPage+1, lastDiscover);
//       console.log('loading next page')
//       scrollAllowed.current ++;;
//     }
  // },[scrollPerc.current])

  const handleScroll = () => {
    const {scrollTop, scrollHeight, clientHeight} = document.documentElement;
    const winScroll = document.body.scrollTop || scrollTop;
    const height = scrollHeight - clientHeight;
    const scrolled = Math.round(winScroll / height * 100);
    console.log('event')
    if(scrolled > scrollPerc + 4){
      setScrollPerc(scrolled)
    }
  }

  useEffect(()=>{
    document.addEventListener("scroll", handleScroll)
  },[])

  const [forcePageChange, setForcePageChange] = useState(null);

  const fromValue = (value) => {
    return value.length > 0 ? parseInt(value) : 0;
  }
  const toValue = (value) => {
      return value.length > 0 ? parseInt(value) : 3000;
  }

  return isMounted && (<>
    <Head>
      <title>{translate("Hyur's Media Library")}</title>
      <meta name="description" content="Created by Hyur" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Header />
    <div className="my-container" onClick={handleScroll}>
      
      <h2 className="page-title">{translate("Discover")}</h2>

      <main>
        <div className="form">
          <div className="form-group">
            <label>{translate("Media type")}</label>
            <Select
              instanceId={"mediaType"} 
              options={formOptions.mediaType}
              value={formValues.mediaType}
              onChange={(e)=>{changeFormValue('mediaType', e)}}
              isSearchable={false}
            />
          </div>
          <div className="form-group">
            <label>{translate("With genres")}</label>
            <Select
              instanceId={"withGenres"} 
              options={formOptions.genres}
              value={formValues.withGenres}
              isMulti
              onChange={(e)=>{changeFormValue('withGenres', e)}}
              placeholder={translate("Select...")}
            />
          </div>
          <div className="form-group">
            <label>{translate("Without genres")}</label>
            <Select
              instanceId={"withoutGenres"} 
              options={formOptions.genres}
              value={formValues.withoutGenres}
              isMulti
              onChange={(e)=>{changeFormValue('withoutGenres', e)}}
              placeholder={translate("Select...")}
            />
          </div>
          <div className="form-group">
            <label>{translate("Original language")}</label>
            <Select
              instanceId={"originalLanguage"} 
              options={formOptions.originalLanguages}
              value={formValues.originalLanguage}
              onChange={(e)=>{changeFormValue('originalLanguage', e)}}
              placeholder={translate("Select...")}
            />
          </div>
          <div className="form-group">
            <label className="year-label">
              {translate("Year")}
              <FormGroup switch>
                  <Input
                    type="switch"
                    role="switch"
                    checked={isYearRange}
                    onChange={() => {setIsYearRange(!isYearRange);}}
                  />
                  <Label>{translate("Range")}</Label>
              </FormGroup>
            </label>
            <div className="year-group">
              {isYearRange && <span>{translate("From")}</span>}
              <Select
                className={isYearRange? 'half' : ''}
                instanceId={"yearFrom"} 
                options={formOptions.years}
                value={formValues.yearFrom}
                onChange={(e)=>{changeFormValue('yearFrom', e)}}
                placeholder={translate("Select...")}
              />
              {isYearRange && <span>{translate("to")}</span>}
              {isYearRange &&
                <Select
                  className={isYearRange? 'half' : ''}
                  instanceId={"yearTo"} 
                  options={formOptions.years.filter(f=>(toValue(f.value) > fromValue(formValues.yearFrom.value)))}
                  value={formValues.yearTo}
                  onChange={(e)=>{changeFormValue('yearTo', e)}}
                  placeholder={translate("Select...")}
                />
              }
            </div>
          </div>
          <div className="form-group">
            <label className="year-label">
              {translate("Vote average")}
              {formValues.mediaType.value === 'movie' &&
                <FormGroup switch>
                    <Input
                      type="switch"
                      role="switch"
                      checked={isVoteAverageRange}
                      onChange={() => {setIsVoteAverageRange(!isVoteAverageRange);}}
                    />
                    <Label>{translate("Range")}</Label>
                </FormGroup>
              }
            </label>
            <div className="year-group">
              <span>{translate("From")}</span>
              <Select
                className={formValues.mediaType.value === 'movie' && isVoteAverageRange && 'half'}
                instanceId={"voteAverageFrom"} 
                options={formOptions.votes}
                value={formValues.voteAverageFrom}
                onChange={(e)=>{changeFormValue('voteAverageFrom', e)}}
                placeholder={translate("Select...")}
              />
              {formValues.mediaType.value === 'movie' && <>
                {isVoteAverageRange && <span>{translate("to")}</span>}
                {isVoteAverageRange &&
                  <Select
                    className={'half'}
                    instanceId={"voteAverageTo"} 
                    options={availableVotes}
                    value={formValues.voteAverageTo}
                    onChange={(e)=>{changeFormValue('voteAverageTo', e)}}
                    placeholder={translate("Select...")}
                  />
                }
              </>}
            </div>
          </div>
          <div className="form-group">
            <label className="year-label">
              {translate("Vote count")}
              {formValues.mediaType.value === 'movie' &&
                <FormGroup switch>
                    <Input
                      type="switch"
                      role="switch"
                      checked={isVoteCountRange}
                      onChange={() => {setIsVoteCountRange(!isVoteCountRange);}}
                    />
                    <Label>{translate("Range")}</Label>
                </FormGroup>
              }
            </label>
            <div className="year-group">
              <span>{translate("From")}</span>
              <Input
                className={formValues.mediaType.value === 'movie' && isVoteCountRange ? 'half' : ''}
                type="number"
                value={formValues.voteCountFrom}
                onChange={(e)=>{handleVoteCount('from', e.target.value)}}
                // onBlur={(e)=>{handleVoteCount('from', e.target.value, true)}}
                min={0}
              />
              {formValues.mediaType.value === 'movie' && <>
                {isVoteCountRange && <span>{translate("to")}</span>}
                {isVoteCountRange &&
                  <Input
                    className={'half'}
                    type="number"
                    value={formValues.voteCountTo}
                    onChange={(e)=>{handleVoteCount('to', e.target.value)}}
                    // onBlur={(e)=>{handleVoteCount('to', e.target.value, true)}}
                    min={0}
                  />
                }
              </>}
            </div>
          </div>
          <div className="form-group">
            <label>{translate("Sort By")}</label>
            <Select
              instanceId={"sortBy"} 
              options={formOptions.sortValues}
              value={formValues.sortBy}
              onChange={(e)=>{changeFormValue('sortBy', e)}}
            />
          </div>
          <div className="form-group">
            <label>{translate("Order By")}</label>
            <Select
              instanceId={"orderBy"} 
              options={formOptions.orderValues}
              value={formValues.orderBy}
              onChange={(e)=>{changeFormValue('orderBy', e)}}
              isSearchable={false}
            />
          </div>
          <div className="form-group submit">
            <button disabled={loadingMedias === true} onClick={()=>{discoverMedias(formValues)}}>{translate("Discover")}</button>
            <button className="red" onClick={()=>{setFormValues(firstFormValues); setMedias([])}}>{translate("Reset")}</button>
          </div>
        </div>
        <div style={{height: "70px"}} ref={scrollElementRef}></div>
        {medias.length > 0 && <>
          <Navigator
            forcePageChange={forcePageChange}
            setForcePageChange={setForcePageChange}
            currentPage={currentPage}
            disabled={loadingMedias === true}
            pagesToShow={7}
            numPages={totalPages}
            onChange={(pageNum)=>{
              console.log(pageNum)
              loadPage(pageNum, lastDiscover, true, true); 
            }}
          />
          <div className="medias">
            {medias.map((media, i) => (
              <MediaCover mediaType={lastDiscover.mediaType.value} showTitle data={media} key={`media${i}`} href={`/${lastDiscover.mediaType.value}/${media.id}`}/>
            ))}
          </div>
        </>}
      </main>

    </div>
  </>)
}
