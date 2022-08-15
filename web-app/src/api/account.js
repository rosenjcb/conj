import axios from 'axios';

export const me = () => axios.get('/api/me');

export const login = (accountDetails) => {
  return axios.post('/api/authenticate', accountDetails);
};

export const logout = () => {
  return axios.get('/api/logout');
};

export const signup = (accountDetails) => {
  return axios.post('/api/accounts', accountDetails);
};

export const updateMe = (me) => {
  var formData = new FormData();
  for (let [key, val] of Object.entries(me)) {
    if(val !== null) formData.append(key, val);
  }
  return axios.put('/api/me', formData);
}