import { apiClient } from './client';

export async function login({ email, password }) {
  try {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.token) apiClient.setToken(res.token);
    return { user: res.user, token: res.token, isMock: false };
  } catch (err) {
    console.warn('[LockNBook Auth] Backend auth endpoint offline. Using local session.');
    const user = {
      id: 'usr_demo',
      name: email.split('@')[0].replace('.', ' ').replace(/^./, str => str.toUpperCase()),
      email
    };
    apiClient.setToken('mock_jwt_token_' + Date.now());
    localStorage.setItem('lnb_user_session', JSON.stringify(user));
    return { user, token: 'mock_jwt_token', isMock: true };
  }
}

export async function register({ name, email, password }) {
  try {
    const res = await apiClient.post('/auth/register', { name, email, password });
    if (res.token) apiClient.setToken(res.token);
    return { user: res.user, token: res.token, isMock: false };
  } catch (err) {
    console.warn('[LockNBook Auth] Backend registration offline. Using local session.');
    const user = {
      id: 'usr_' + Math.random().toString(36).substring(2, 7),
      name: name || 'Demo Fan',
      email
    };
    apiClient.setToken('mock_jwt_token_' + Date.now());
    localStorage.setItem('lnb_user_session', JSON.stringify(user));
    return { user, token: 'mock_jwt_token', isMock: true };
  }
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('lnb_user_session')) || null;
  } catch (e) {
    return null;
  }
}

export function logout() {
  apiClient.setToken(null);
  localStorage.removeItem('lnb_user_session');
}
