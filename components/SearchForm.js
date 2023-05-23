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

export default function SearchForm({onSubmit}){
    
    const router = useRouter();

    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);

    const {
        yearsContent, loadingMedias,
        translate, websiteLang, isYearRange, 
    } = useContext(Context);

    const formOptions = {
      mediaType: [
        {value: 'movie', label: translate('Movie')},
        {value: 'tv', label: translate('TV Show')},
        {value: 'person', label: translate('Person')},
      ],
      query: '',
      years: [{value: "", label: translate("Any")}, ...yearsContent.map(g=>({value: g.id, label: g.name}))],
    };

    const firstFormValues = {
      mediaType: formOptions.mediaType[0],
      query: '',
      year: formOptions.years[0],
    }

    const [formValues, setFormValues] = useLocalStorage('searchValues', firstFormValues);
    useEffect(()=>{
      setFormValues(curr=>{
        const mediaType = formOptions.mediaType.filter(m=>m.value===curr.mediaType.value)[0];
        const newFormValues = {
          ...curr,
          mediaType: formOptions.mediaType.filter(m=>m.value===curr.mediaType.value)[0],
        }
        if(newFormValues.mediaType !== "person"){
          newFormValues.year = formOptions.years.filter(m=>m.value===curr.year.value)[0];
        }
        return newFormValues;
      });
    },[websiteLang]);

    const changeFormValue = (key, value) => {
      setFormValues(curr=>({...curr, [key]: value}));
    }

    return isMounted && (
      <div className="form">
          <div className="form-group">
            <label>{translate("Search type")}</label>
            <Select
              instanceId={"mediaType"} 
              options={formOptions.mediaType}
              value={formValues.mediaType}
              onChange={(e)=>{changeFormValue('mediaType', e)}}
              isSearchable={false}
              />
          </div>
          {formValues.mediaType.value !== "person" &&
            <div className="form-group">
              <label className="year-label">
                {translate("Year")}
              </label>
                <Select
                  className={isYearRange? 'half' : ''}
                  instanceId={"year"} 
                  options={formOptions.years}
                  value={formValues.year}
                  onChange={(e)=>{changeFormValue('year', e)}}
                  placeholder={translate("Select...")}
                />
            </div>
          }
          <div className="form-group">
            <label></label>
            <Input
              type="text"
              value={formValues.query}
              onChange={(e)=>{changeFormValue('query', e.target.value);}}
              onKeyDown={(e)=>{
                if(e.key === 'Enter') {
                  onSubmit(formValues);
                }
              }}
            />
          </div>
          <div className="form-group submit">
            <button disabled={loadingMedias === true} onClick={()=>{
              onSubmit(formValues)
            }}>{translate("Search")}</button>
          </div>
        </div>
    )
}