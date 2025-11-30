import axios from 'axios';

// Cambia el puerto si tu backend usa otro
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export default API;
