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
import {FaStar, FaFilm, FaSearch, FaTrash} from 'react-icons/fa';
import {TfiLayoutMediaLeft as LogoIcon} from 'react-icons/tfi';
import Link from 'next/link';

export default function DiscoverForm({
  onSubmit, 
  isYearRange, setIsYearRange, 
  isVoteAverageRange, setIsVoteAverageRange, 
  isVoteCountRange, setIsVoteCountRange,
}){
    
    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);

    const {
        tmdbConfig,
        yearsContent,
        loadingMedias,
        translate, websiteLang,
        fromValue, toValue,
    } = useContext(Context);

    const [availableGenres, setAvailableGenres] = useState([]);
    const [availableVotes, setAvailableVotes] = useState([]);
    const [selectedMediaType, setSelectedMediaType] = useLocalStorage("selectedMediaType-discover", "movie");
    
    const getFormOptions = () => {
      if(!tmdbConfig){return;}
      const getTimeLabel = (minutes) => {
        let hours = minutes / 60;
        if(hours >= 1){
          minutes = Math.round((hours - Math.floor(hours)) * 60);
          hours = Math.floor(hours);
          return `${hours} ${hours > 1 ? translate("hours") : translate("hour")}${minutes > 0 ? ` ${minutes} ${translate("minutes")}` : ""}`;
        }
        return `${minutes} ${translate("minutes")}`;
      }
      const languages = tmdbConfig?.languages ?? [];
      const allRuntimes = Array.from({ length: 36 }).map((el, i)=>({value: (i+1)*10, label: getTimeLabel((i+1)*10)}));
      const allVotes = Array.from({ length: 11 }).map((el, i)=>({value: i, label: i}));
      const allGenres = tmdbConfig?.genres ? tmdbConfig.genres[selectedMediaType].map(g=>({value: g.id, label: translate(g.name)})) : [];
      return {
        mediaType: [
          {value: 'movie', label: translate('Movie')},
          {value: 'tv', label: translate('TV Show')}
        ],
        genres: allGenres,
        years: [{value: "", label: translate("Any")}, ...yearsContent.map(g=>({value: g.id, label: g.name}))],
        sortValues: tmdbConfig?.sort_values ? tmdbConfig.sort_values.map(g=>({value: g.id, label: translate(g.name)})) : [],
        orderValues: [
          {value: 'desc', label: translate('Descending')},
          {value: 'asc', label: translate('Ascending')},
        ],
        originalLanguages: [{value: "", label: translate("Any")}, ...languages.map(lc=>({value: lc.iso_639_1, label: translate(lc.english_name)}))],
        votes: allVotes,
        runtimes: [{value:"1", label: translate("Any")}, ...allRuntimes],
      }
    };
    const [formOptions, setFormOptions] = useState(null);
    useEffect(()=>{
      setFormOptions(getFormOptions());
    },[tmdbConfig, websiteLang, selectedMediaType]);

    const [formValues, setFormValues] = useLocalStorage('discoverValues', null);
    useEffect(()=>{
      console.log({formValues})
    },[formValues]);
    useEffect(()=>{
      if(formValues?.mediaType && tmdbConfig?.genres){
        setSelectedMediaType(formValues.mediaType.value);
        setFormValues(curr=>{
          if(!curr){return curr}
          const allGenresValues = tmdbConfig.genres[formValues.mediaType.value].map(g=>g.id);
          const withGenres = [], withoutGenres = [];
          curr.withGenres.forEach(g => {
            if(allGenresValues.includes(g.value)){
              withGenres.push(g);
            }
          });
          curr.withoutGenres.forEach(g => {
            if(allGenresValues.includes(g.value)){
              withoutGenres.push(g);
            }
          });
          return {
            ...curr, 
            withGenres, 
            withoutGenres,
          }
        });
      }
    },[formValues?.mediaType]);

    useEffect(()=>{
      if(formValues && formOptions?.genres){
        const newAvailableGenres = [];
        formOptions.genres.forEach(g=>{
          if(
            formValues.withGenres.filter(w=>w.value===g.value).length > 0 || 
            formValues.withoutGenres.filter(w=>w.value===g.value).length > 0
          ){
            return;
          }
          newAvailableGenres.push(g);
        });
        setAvailableGenres(newAvailableGenres);
      }
    },[formOptions?.genres, formValues?.withGenres, formValues?.withoutGenres]);

    useEffect(()=>{
      if(formOptions?.votes && formValues?.voteAverageFrom && formOptions?.votes){
        const newAvailableVotes = [];
        formOptions.votes.forEach(g=>{
          if(g.value < formValues.voteAverageFrom.value + 1){return;}
          newAvailableVotes.push(g);
        });
        setAvailableVotes(newAvailableVotes);
        if(formValues.voteAverageTo.value <= formValues.voteAverageFrom.value){
          changeFormValue('voteAverageTo', newAvailableVotes[0]);
        }
      }
    },[formOptions?.votes, formValues?.voteAverageFrom]);

    useEffect(()=>{
      if(formValues?.yearFrom && formValues?.yearTo){
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
      if(!formOptions){return;}
      if(!formValues){
        setFormValues({
          mediaType: formOptions.mediaType[0],
          withGenres: [],
          withGenresLogic: ",",
          withoutGenres: [],
          originalLanguage: formOptions.originalLanguages[0],
          yearFrom: formOptions.years[0],
          yearTo: formOptions.years[0],
          voteAverageFrom: formOptions.votes[0],
          voteAverageTo: formOptions.votes[0],
          voteCountFrom: "",
          voteCountTo: "",
          runtimeFrom: formOptions.runtimes[0],
          sortBy: formOptions.sortValues[0],
          orderBy: formOptions.orderValues[0],
        })
        return;
      }
      setFormValues(curr=>({
          ...curr,
          mediaType: formOptions.mediaType.filter(m=>m.value===curr.mediaType.value)[0],
          withGenres: formOptions.genres.map(m=>curr.withGenres.map(w=>w.value).includes(m.value) && m),
          withoutGenres: formOptions.genres.map(m=>curr.withoutGenres.map(w=>w.value).includes(m.value) && m),
          originalLanguage: formOptions.originalLanguages.filter(m=>m.value===curr.originalLanguage?.value)[0],
          yearFrom: formOptions.years.filter(m=>m.value===curr.yearFrom.value)[0],
          yearTo: formOptions.years.filter(m=>m.value===curr.yearTo.value)[0],
          runtimeFrom: formOptions.runtimes.filter(m=>m.value===curr.runtimeFrom.value)[0],
          sortBy: formOptions.sortValues.filter(m=>m.value===curr.sortBy.value)[0],
          orderBy: formOptions.orderValues.filter(m=>m.value===curr.orderBy.value)[0],
      }));
    },[formOptions]) 

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

    return isMounted && formOptions && formValues && (
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
        <div className={`form-group genres three`}>
            <label>{translate("With genres")}</label>
            <div className="select-with-button">
              <Select
                instanceId={`withGenres`} 
                options={availableGenres}
                value={formValues.withGenres}
                isMulti
                onChange={(e)=>{changeFormValue('withGenres', e)}}
                placeholder={translate("Select...")}
              />
              <button onClick={()=>{
                changeFormValue('withGenresLogic', formValues.withGenresLogic === "," ? "|" : ",");
              }}>{formValues.withGenresLogic === "," ? translate("AND") : translate("OR")}</button>
            </div>
          </div>
        <div className="form-group">
          <label>{translate("Without genres")}</label>
          <Select
            instanceId={"withoutGenres"} 
            options={availableGenres}
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
          <label className="year-label">
            {translate("Runtime")}
          </label>
          <div className="year-group">
            <span>{translate("From")}</span>
            <Select
              instanceId={"runtimeFrom"} 
              options={formOptions.runtimes}
              value={formValues.runtimeFrom}
              onChange={(e)=>{changeFormValue('runtimeFrom', e)}}
              placeholder={translate("Select...")}
            />
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
          <button 
            disabled={loadingMedias === true} 
            onClick={()=>{
              onSubmit(formValues);
            }}
          >{translate("Discover")}</button>
          <button 
          className="red" 
          onClick={()=>{
            setFormValues(firstFormValues);
          }}>{translate("Reset")}</button>
        </div>
      </div>
    )
}