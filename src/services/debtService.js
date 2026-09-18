import axios from 'axios';
import Config from '../components/axios/Config';

const getBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/';
  // Ensure trailing slash
  const normalized = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
  return `${normalized}v2/debts`;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return Config({ Authorization: `Bearer ${token}` });
};

/**
 * Fetch all debts with optional status filter
 * @param {string} [status] - 'active' | 'paid_off' | 'defaulted' | 'settled'
 */
export const getDebts = async (status = '') => {
  const baseUrl = getBaseUrl();
  const token = localStorage.getItem('token');
  const params = status ? { status } : null;
  const response = await axios.get(baseUrl, Config({ Authorization: `Bearer ${token}` }, params));
  return response.data;
};

/**
 * Get detailed information for a specific debt
 * @param {number|string} id
 * @param {object} [options]
 * @param {boolean} [options.include_payments=true]
 * @param {boolean} [options.include_milestones=true]
 */
export const getDebtDetail = async (id, options = { include_payments: true, include_milestones: true }) => {
  const url = `${getBaseUrl()}/${id}`;
  const token = localStorage.getItem('token');
  const params = {};
  if (options.include_payments) params.include_payments = 'true';
  if (options.include_milestones) params.include_milestones = 'true';

  const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }, params));
  return response.data;
};

/**
 * Create a new debt
 * @param {object} payload
 */
export const createDebt = async (payload) => {
  const response = await axios.post(getBaseUrl(), payload, getAuthHeaders());
  return response.data;
};

/**
 * Update debt details
 * @param {number|string} id
 * @param {object} payload
 */
export const updateDebt = async (id, payload) => {
  const url = `${getBaseUrl()}/${id}`;
  const response = await axios.put(url, payload, getAuthHeaders());
  return response.data;
};

/**
 * Delete a debt
 * @param {number|string} id
 */
export const deleteDebt = async (id) => {
  const url = `${getBaseUrl()}/${id}`;
  const response = await axios.delete(url, getAuthHeaders());
  return response.data;
};

/**
 * Record a payment on a debt
 * @param {number|string} id
 * @param {object} payload
 */
export const recordDebtPayment = async (id, payload) => {
  const url = `${getBaseUrl()}/${id}/payments`;
  const response = await axios.post(url, payload, getAuthHeaders());
  return response.data;
};

/**
 * Update debt balance manually (statement sync)
 * @param {number|string} id
 * @param {object} payload - { new_balance, as_of_date }
 */
export const updateDebtBalance = async (id, payload) => {
  const url = `${getBaseUrl()}/${id}/balance`;
  const response = await axios.put(url, payload, getAuthHeaders());
  return response.data;
};

/**
 * Fetch payoff strategies (minimum, avalanche, snowball)
 * @param {number} [extraPayment=0]
 */
export const getPayoffStrategies = async (extraPayment = 0) => {
  const url = `${getBaseUrl()}/strategies`;
  const token = localStorage.getItem('token');
  const params = extraPayment ? { extra_payment: extraPayment } : null;
  const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }, params));
  return response.data;
};

/**
 * Fetch payoff timeline for a specific debt
 * @param {number|string} id
 * @param {object} [options]
 * @param {string} [options.strategy='minimum']
 * @param {number} [options.extra_payment=0]
 */
export const getDebtTimeline = async (id, options = { strategy: 'minimum', extra_payment: 0 }) => {
  const url = `${getBaseUrl()}/${id}/timeline`;
  const token = localStorage.getItem('token');
  const params = {
    strategy: options.strategy || 'minimum',
    ...(options.extra_payment ? { extra_payment: options.extra_payment } : {}),
  };
  const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }, params));
  return response.data;
};

/**
 * Fetch user wallets/assets to link with debt or payments
 */
export const getWallets = async () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/';
  const normalized = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
  const token = localStorage.getItem('token');
  const response = await axios.get(`${normalized}wallets`, Config({ Authorization: `Bearer ${token}` }));
  return response.data;
};
