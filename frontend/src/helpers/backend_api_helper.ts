import axios from 'axios';

const api = axios.create({
    baseURL: process.env.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    response => {
        return response.data;
    },
    error => {
        const status = error.response ? error.response.status : null;
        if (status === 400) {
            console.error('Bad Request:', error.response.data);
        } else if (status === 401) {
            console.error('Unauthorized:', error.response.data);
        } else if (status === 403) {
            console.error('Forbidden:', error.response.data);
        } else if (status === 404) {
            console.error('Not Found:', error.response.data);
        } else if (status === 500) {
            console.error('Server Error:', error.response.data);
        } else {
            console.error('Unknown Error:', error.message);
        }

        return Promise.reject(error);
    }
);


const backend_api_helper = {
  post: (url: string, data: any) => {
      console.log(api, url)
    return api.post(url, data);
  },

  update: (url: string, data: any) => {
    return api.patch(url, data);
  },

  put: (url: string, data: any) => {
    return api.put(url, data);
  },

  delete: (url: string, data: any) => {
    return api.delete(url, {data: data});
  },

  get: (url: string, data: any) => {
    return api.get(url, {params: data});
  },
};

export default backend_api_helper;
