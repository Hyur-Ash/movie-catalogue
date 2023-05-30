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

    let imageKey;
    if(props.type === "person"){
        imageKey = "profile_path";
    }
    if(props.type === "company"){
        imageKey = "logo_path"
    }

    
    const search = async (query) => {
        setIsLoading(true);
        const params = {api_key, query};
        try{
            const res = await axios.get(`${tmdb_main_url}/search/${props.type}`, {params});
            const newOptions = [];
            res.data.results.forEach(el => {
                console.log(el)
                if(props.excludeIds?.includes(el.id)){return;}
                const newOption = {label: el.name, value: el.id};
                if(imageKey){
                    newOption.imagePath = el[imageKey];
                }
                newOptions.push(newOption);
            })
            setOptions(newOptions);
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
            formatOptionLabel={imageKey ? ({label, imagePath}) => (
                <div className={"image-option"}>
                    <div className={`image ${props.type}`}>
                        <img src={imagePath ? `https://www.themoviedb.org/t/p/w185${imagePath}` : `/img/${props.type}-not-found.jpg`}/>
                    </div>
                    <span>{label}</span>
                </div>
            ) : null}
        /> 
    )   
}