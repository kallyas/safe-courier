import React from 'react';
import ReactDOM from 'react-dom';

// core styles
import "./scss/volt.scss";
import "@fortawesome/fontawesome-free/css/all.css";
import "react-datetime/css/react-datetime.css";


import App from './App';
import { ScrollToTop } from "./components/index"

ReactDOM.render(
  <React.StrictMode>
    <>
      <ScrollToTop />
      <App />
    </>
  </React.StrictMode>,
  document.getElementById('root')
);
