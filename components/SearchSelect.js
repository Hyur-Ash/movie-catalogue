import {useContext, useState, useEffect, useCallback } from 'react';
import { Context } from '/lib/Context';
import Link from 'next/link';
import Select from 'react-select'; 
import { debounce } from 'lodash';
import axios from 'axios';

export default function SearchSelect(props){

    const {
        tmdb_main_url,
        api_key,
        translate
    } = useContext(Context);

    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const onInputChange = useCallback(
        debounce(value => {
            search(value);
        }, 500),
    []);

    const search = async (query) => {
        setIsLoading(true);
        const params = {api_key, query};
        try{
            const res = await axios.get(`${tmdb_main_url}/search/${props.type}`, {params});
            setOptions(res.data.results.map(el => ({label: el.name, value: el.id})));
        }catch(error){
            console.error(error);
        }finally{
            setIsLoading(false);
        }
    }

    return(
        <Select
            instanceId={props.instanceId} 
            options={options}
            value={props.value}
            isMulti={props.isMulti || false}
            onChange={(e)=>{
                props.onChange(e);
            }}
            onInputChange={onInputChange}
            placeholder={props.placeholder}
            noOptionsMessage={()=>isLoading ? translate("Loading...") : translate("Type to Search")}
        /> 
    )   
}