import {useContext, useRef} from 'react';
import { Context } from '/lib/Context';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y, Mousewheel, FreeMode } from 'swiper';

export default function CoverScroller({children, breakType}){

    const swiperRef = useRef();

    let breakpoints = {
        0: {slidesPerView: 2},
        500: {slidesPerView: 3},
        1000: {slidesPerView: 5},
        1200: {slidesPerView: 5},
    };
    if(breakType === "medium"){
        breakpoints = {
            0: {slidesPerView: 2},
            300: {slidesPerView: 3},
            400: {slidesPerView: 4},
            1000: {slidesPerView: 6},
            1200: {slidesPerView: 6},
        };
    }
    if(breakType === "big"){
        breakpoints = {
            0: {slidesPerView: 3},
            400: {slidesPerView: 4},
            1000: {slidesPerView: 5},
            1200: {slidesPerView: 6},
        };
    }

    return(
        <div className={`cover-scroller ${children.length > breakpoints["1200"].slidesPerView ? "paddinged" : ""}`}>
            <Swiper
                ref={swiperRef}
                modules={[Navigation, Pagination, Scrollbar, A11y, Mousewheel, FreeMode]}
                breakpoints={breakpoints}
                spaceBetween={10}
                scrollbar={{ draggable: true }}
                autoHeight
            >
                {children.map((slide, s) => slide && (
                    <SwiperSlide key={`slide${s}`}>
                        {slide}
                    </SwiperSlide>
                ))}
            </Swiper>
            {children.length > breakpoints["1200"].slidesPerView && <>
                <div className="swiper-button-prev" onClick={()=>{swiperRef.current.swiper.slidePrev();}}></div>
                <div className="swiper-button-next" onClick={()=>{swiperRef.current.swiper.slideNext();}}></div>
            </>}
        </div>
    )
}