import { useEffect } from 'react';
import { useLocalStorage } from '/lib/useLocalStorage';
import { ContextProvider } from '/lib/Context';
import { ToastContainer } from 'react-toastify';
import '../styles/globals.scss';
import 'react-toastify/dist/ReactToastify.css';
import '/components/Navigator.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import 'swiper/swiper-bundle.css';
//date/time pickers
// import 'react-calendar/dist/Calendar.css';
// import 'react-clock/dist/Clock.css';
// import 'react-time-picker/dist/TimePicker.css';
// import 'react-date-picker/dist/DatePicker.css';

function MyApp({ Component, pageProps }) {

  const [isMounted, setIsMounted] = useState(false);
  useEffect(()=>{
    setIsMounted(true);
  },[]);

  const appVersion = '1.3';
  const [version, setVersion] = useLocalStorage('version', '0');

  useEffect(()=>{
      if(version && version !== appVersion){
          localStorage.removeItem("searchValues");
          localStorage.removeItem("discoverValues");
          localStorage.removeItem("lastDiscover");
          localStorage.removeItem("lastSearch");
          setVersion(appVersion);
      }
  },[version]);

  return isMounted && version === appVersion && (<>
      <ContextProvider>
        <Component {...pageProps} />
      </ContextProvider>
        <ToastContainer
          position="top-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          theme="light"
        />
    </>
  ) 
}

export default MyApp
