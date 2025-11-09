import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';

// Set up axios defaults with normalized base URL
const rawApiBase = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const normalizedApiBase = rawApiBase.replace(/\/+$/, '');
axios.defaults.baseURL = normalizedApiBase;
axios.defaults.headers.common['Content-Type'] = 'application/json';

if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_API_URL) {
  // eslint-disable-next-line no-console
  console.warn('REACT_APP_API_URL is not configured. API requests will point to', normalizedApiBase);
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
