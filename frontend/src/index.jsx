import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import './styles/index.css';

const rawApiUrl = process.env.REACT_APP_API_URL || '';
const apiBaseUrl = rawApiUrl.trim().replace(/\/+$/, '');

if (apiBaseUrl) {
  axios.defaults.baseURL = apiBaseUrl;
}

axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
