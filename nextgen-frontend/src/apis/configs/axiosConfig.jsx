import axios from "axios";

axios.defaults.baseURL = "http://192.168.192.244:8030/";

const api = axios.create({
  withCredentials: true,
  headers: {
    'Allow-Control-Allow-Origin': '*',
  },
  'Content-Type': 'application/json',
  baseURL: "https://localhost:7278/",
});

const errorHandler = (error) => {
  const statusCode = error.response?.status;
  if (statusCode && statusCode !== 401) console.log(error);

  return Promise.reject(error);
};

api.interceptors.response.use(undefined, (error) => {
  return errorHandler(error);
});

api.interceptors.request.use((config) => {
  //TODO: get accessToken from authentication server
  // then use localStorage.getItem("accessToken");
  const accessToken = "tempToken";

  config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
});

export default api; 
