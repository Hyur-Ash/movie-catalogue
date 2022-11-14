import Head from 'next/head';
import {useState, useEffect, useContext} from 'react';
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

export default function Home() {

  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(()=>{
    setIsMounted(true);
  },[]);

  const {
    movieGenres, tvGenres, yearsContent, sortValues,
    medias, singleMedia, setSingleMedia, loadMedias, loadingMedias, loadSingleMedia, lastSearch,
    totalPages, setCurrentPage, 
    translate, websiteLang, setWebsiteLang, languageCodes,
    currentNames, languagesOptions
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
    year: formOptions.years[0],
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

  useEffect(()=>{
    setFormValues(curr=>({
        ...curr,
        mediaType: formOptions.mediaType.filter(m=>m.value===curr.mediaType.value)[0],
        withGenres: allGenres.map(m=>curr.withGenres.map(w=>w.value).includes(m.value) && m),
        withoutGenres: allGenres.map(m=>curr.withoutGenres.map(w=>w.value).includes(m.value) && m),
        sortBy: formOptions.sortValues.filter(m=>m.value===curr.sortBy.value)[0],
        orderBy: formOptions.orderValues.filter(m=>m.value===curr.orderBy.value)[0],
        year: formOptions.years.filter(m=>m.value===curr.year.value)[0],
    }));
  },[websiteLang]) 

  const changeFormValue = (key, value) => {
    setFormValues(curr=>({...curr, [key]: value}));
  }

  
  return isMounted && (<>
    <div className="language-selector">
      <Select
          instanceId={"language"} 
          options={languagesOptions}
          value={languagesOptions.filter(l=>l.value === websiteLang)[0]}
          onChange={(e)=>{setWebsiteLang(e.value)}}
          isSearchable={false}
        />
    </div>
    <h1>{translate("Hyur's Movie Catalogue")}</h1>
    <div className="my-container">

      <Head>
        <title>{translate("Hyur's Movie Catalogue")}</title>
        <meta name="description" content="Created by Hyur" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
            <label>{translate("Year")}</label>
            <Select
              instanceId={"year"} 
              options={formOptions.years}
              value={formValues.year}
              onChange={(e)=>{changeFormValue('year', e)}}
              placeholder={translate("Select...")}
            />
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
            <button disabled={loadingMedias} onClick={()=>{loadMedias(formValues)}}>{translate("Search")}</button>
          </div>
        </div>
        {medias.length > 0 && <>
          <Navigator
            disabled={loadingMedias}
            pagesToShow={7}
            numPages={totalPages}
            onChange={(pageNum)=>{setCurrentPage(pageNum)}}
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
