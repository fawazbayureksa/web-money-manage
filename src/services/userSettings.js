import { api } from '../components/axios/Config';

export const getSettings = async () => {
  const response = await api.get('user/settings');
  return response.data;
};

export const createSettings = async (data) => {
  const response = await api.post('user/settings', data);
  return response.data;
};

export const updateSettings = async (data) => {
  const response = await api.put('user/settings', data);
  return response.data;
};

export const resetSettings = async () => {
  const response = await api.delete('user/settings');
  return response.data;
};

export const getAnalyticsWithPayCycle = async (endpoint, params = {}) => {
  const response = await api.get(endpoint, { params });
  return response.data;
};
