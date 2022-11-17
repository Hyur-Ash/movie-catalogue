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

  const [genres, setGenres] = useState(movieGenres);

  const allGenres = genres.map(g=>({value: g.id, label: translate(g.name)}));
  const [availableGenres, setAvailableGenres] = useState(JSON.parse(JSON.stringify(allGenres)));

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
    ]
  };

  const [formValues, setFormValues] = useLocalStorage('formValues', {
    mediaType: formOptions.mediaType[0],
    withGenres: [],
    withoutGenres: [],
    sortBy: formOptions.sortValues[0],
    orderBy: formOptions.orderValues[0],
    yearFrom: formOptions.years[0],
    yearTo: formOptions.years[0],
  });
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

  const formValue = (value) => {
    return value.length > 0 ? parseInt(value) : 0;
  }
  const toValue = (value) => {
    return value.length > 0 ? parseInt(value) : 3000;
  }
  useEffect(()=>{
    if(formValues){
      const from = formValue(formValues.yearFrom.value);
      const to = toValue(formValues.yearTo.value);
      if(to < from){
        const option = formOptions.years.filter(y=>y.value === (from + 1).toString())[0];
        changeFormValue('yearTo', option ?? formOptions.years[0]);
      }
    }
  },[formValues?.yearFrom, formValues?.yearTo])

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
    }));
  },[websiteLang]) 

  const changeFormValue = (key, value) => {
    setFormValues(curr=>({...curr, [key]: value}));
  }

  const scrollElementRef = useRef();

  const [forcePageChange, setForcePageChange] = useState(null);

  return isMounted && (<>
    <Head>
      <title>{translate("Hyur's Media Library")}</title>
      <meta name="description" content="Created by Hyur" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Header/>
    <div className="my-container">
      
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
                  options={formOptions.years.filter(f=>(toValue(f.value) > formValue(formValues.yearFrom.value)))}
                  value={formValues.yearTo}
                  onChange={(e)=>{changeFormValue('yearTo', e)}}
                  placeholder={translate("Select...")}
                />
              }
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
            <button disabled={loadingMedias} onClick={()=>{loadMedias(formValues); setForcePageChange(1)}}>{translate("Search")}</button>
          </div>
        </div>
        <div ref={scrollElementRef}></div>
        {medias.length > 0 && <>
          <Navigator
            forcePageChange={forcePageChange}
            setForcePageChange={setForcePageChange}
            currentPage={currentPage}
            disabled={loadingMedias}
            pagesToShow={7}
            numPages={totalPages}
            onChange={(pageNum)=>{setCurrentPage(pageNum); scrollElementRef.current.scrollIntoView();}}
          />
          <div className="medias">
            {medias.map((media, i) => (
              <MediaCover showTitle data={media} key={`media${i}`} href={`/${lastSearch.mediaType.value}/${media.id}`}/>
            ))}
          </div>
        </>}
      </main>

    </div>
  </>)
}
