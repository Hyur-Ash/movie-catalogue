import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import {FaAngleLeft, FaAngleRight} from 'react-icons/fa';

export const Navigator = ({pagesToShow, numPages, onChange, disabled, goToExtremes, currentPage, forcePageChange, setForcePageChange}) => {

    const [sIndex, setSIndex] = useState(currentPage-1);
    const [pointI, setPointI] = useState(currentPage-1);
    const changeSIndex = (value) => {
        setSIndex(value);
        onChange(value+1)
    }

    useEffect(()=>{
        if(forcePageChange){
            setSIndex(forcePageChange-1);
            setPointI(forcePageChange-1);
            setForcePageChange(null);
        }
    },[forcePageChange])

    const navigate = (amount) => {
        if(!disabled){
            if(amount < 0){
                amount = Math.abs(amount);
                changeSIndex(curr=>curr-amount>0?curr-amount:0);
                setPointI(curr=>curr-amount>0?curr-amount:0);
            }else{
                changeSIndex(curr=>curr+amount<numPages?curr+amount:numPages-1);
                setPointI(curr=>curr+amount<numPages-amount?curr+amount:numPages-amount);
            }
        }
    }

    return(
        <div className={`navigator ${disabled? 'disabled' : ''}`}>
            <div className="numbers">
                {pagesToShow && <>
                    {goToExtremes && <div className="number" onClick={()=>{setPointI(0); changeSIndex(0)}}><FaAngleLeft/><FaAngleLeft/><FaAngleLeft/></div>}
                    <div className="number" onClick={()=>{navigate(-pagesToShow+1)}}><FaAngleLeft/><FaAngleLeft/></div>
                    <div className="number" onClick={()=>{navigate(-1)}}><FaAngleLeft/></div>
                </>}
                {Array.from(Array(pagesToShow-1).keys()).map( (n) => n < numPages && (
                    <div key={`num${n}`} className={`number ${pointI + n === sIndex? 'active' : ''}`} onClick={()=>{changeSIndex(pointI + n)}}>{pointI + n + 1}</div>
                ))}
                {pagesToShow && <>
                    <div className="number" onClick={()=>{navigate(1)}}><FaAngleRight/></div>
                    <div className="number" onClick={()=>{navigate(pagesToShow-1)}}><FaAngleRight/><FaAngleRight/></div>
                    {goToExtremes && <div className="number" onClick={()=>{setPointI(numPages-pagesToShow-1); changeSIndex(numPages-1)}}><FaAngleRight/><FaAngleRight/><FaAngleRight/></div>}
                </>}
            </div>
        </div>
    )
}

Navigator.propTypes = {
    pagesToShow: PropTypes.number,
    numPages: PropTypes.number,
    goToExtremes: PropTypes.bool
  };

Navigator.defaultProps = {
    pagesToShow: 10,
    numPages: 100,
}