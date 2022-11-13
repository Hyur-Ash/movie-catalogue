import { ContextProvider } from '/lib/Context';
import { ToastContainer } from 'react-toastify';
import '../styles/globals.scss';
import 'react-toastify/dist/ReactToastify.css';
//date/time pickers
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'react-calendar/dist/Calendar.css';
// import 'react-clock/dist/Clock.css';
// import 'react-time-picker/dist/TimePicker.css';
// import 'react-date-picker/dist/DatePicker.css';

function MyApp({ Component, pageProps }) {

  

  return(<>
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
