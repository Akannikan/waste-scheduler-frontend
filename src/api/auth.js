import client from './client';

export const register = (data) => client.post('/auth/register', data);
export const login = (data) => client.post('/auth/login', data);
export const logout = () => client.post('/auth/logout');
export const getMe = () => client.get('/auth/me');
export const forgotPassword = (email) => client.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => client.post('/auth/reset-password', { token, password });
