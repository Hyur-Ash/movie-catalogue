import Head from 'next/head';
import {useState, useEffect, useContext} from 'react';
import { Context } from '/lib/Context';
import {Form, FormGroup, Label, Input} from 'reactstrap';
import Select from 'react-select'; 
import {Navigator} from '/components/Navigator';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export default function Home() {

  const {
    movieGenres, tvGenres, yearsContent, sortValues,
    movies, loadMovies, loadingMovies,
    totalPages, setCurrentPage, 
    translate, websiteLang, setWebsiteLang
  } = useContext(Context);

  const tmdb_main_url_img_low = "https://www.themoviedb.org/t/p/w220_and_h330_face";
  const tmdb_main_url_img_high = "https://www.themoviedb.org/t/p/original";

  const [genres, setGenres] = useState(movieGenres);

  const capitalize = (string) =>{
    const words = string.split(' ');
    let newString = '';
    words.forEach((word, i)=>{
      newString += `${word.charAt(0).toUpperCase()}${word.substring(1, word.length)}`;
      if(i < words.length - 1){
        newString += ' ';
      }
    })
    return newString;
  }

  const formOptions = {
    mediaType: [
      {value: 'movie', label: translate('Movie')},
      {value: 'tv', label: translate('TV Show')}
    ],
    genres: genres.map(g=>({value: g.id, label: translate(g.name)})),
    years: yearsContent.map(g=>({value: g.id, label: g.name})),
    sortValues: sortValues.map(g=>({value: g, label: translate(capitalize(g.replaceAll('_', ' ')))})),
    orderValues: [
      {value: 'desc', label: translate('Descending')},
      {value: 'asc', label: translate('Ascending')},
    ]
  }

  const [formValues, setFormValues] = useState({
    mediaType: formOptions.mediaType[0],
    withGenres: [],
    withoutGenres: [],
    sortBy: formOptions.sortValues[0],
    orderBy: formOptions.orderValues[0],
    year: '',
  });
  useEffect(()=>{
    setGenres(formValues.mediaType.value === 'movie' ? movieGenres : tvGenres);
    setFormValues(curr=>({...curr, withGenres: [], withoutGenres: [],}));
  },[formValues.mediaType]);

  const changeFormValue = (key, value) => {
    setFormValues(curr=>({...curr, [key]: value}));
  }

  const languagesOptions = [
    {value: "it", label: capitalize(translate("italian"))},
    {value: "en", label: capitalize(translate("english"))},
    {value: "ru", label: capitalize(translate("russian"))},
  ];

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showMovieModal, setShowMovieModal] = useState(false);
  const closeMovieModal = () => {
    setShowMovieModal(curr=>!curr);
    setSelectedMovie(null);
  }

  return (
    <div className="my-container">

      <Head>
        <title>Hyur&apos;s Movie Catalogue</title>
        <meta name="description" content="Created by Hyur" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="language-selector">
        <Select
            instanceId={"language"} 
            options={languagesOptions}
            value={languagesOptions.filter(l=>l.value === websiteLang)[0]}
            onChange={(e)=>{setWebsiteLang(e.value)}}
          />
      </div>

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
            />
          </div>
          <div className="form-group">
            <label>{translate("Year")}</label>
            <Select
              instanceId={"year"} 
              options={formOptions.years}
              value={formValues.year}
              onChange={(e)=>{changeFormValue('year', e)}}
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
            <button disabled={loadingMovies} onClick={()=>{loadMovies(formValues)}}>{translate("Search")}</button>
          </div>
        </div>
        {movies.length > 0 && <>
          <Navigator
            disabled={loadingMovies}
            pagesToShow={7}
            numPages={totalPages}
            onChange={(pageNum)=>{setCurrentPage(pageNum)}}
          />
          <div className="movies">
            {movies.map((movie,i) => (
              <div className="movie" key={`movie${i}`} onClick={()=>{
                setSelectedMovie(movie);
                setShowMovieModal(true);
              }}>
                <img alt={movie.title} src={movie.poster_path? `${tmdb_main_url_img_low}/${movie.poster_path}` : `img/not-found.jpg`}/>
                {movie.title}
              </div>
            ))}
          </div>
        </>}
      </main>
      {selectedMovie && 
        <div className="overlay-backdrop">
          <img alt={selectedMovie.title} src={selectedMovie.backdrop_path? `${tmdb_main_url_img_high}/${selectedMovie.backdrop_path}` : `img/not-found.jpg`}/>
        </div>
      }
      {selectedMovie && 
        <Modal isOpen={showMovieModal} toggle={closeMovieModal}>
          <ModalHeader toggle={closeMovieModal}>{selectedMovie.title}</ModalHeader>
          <ModalBody>
            {selectedMovie.overview}
          </ModalBody>
        </Modal>
      }

    </div>
  )
}
