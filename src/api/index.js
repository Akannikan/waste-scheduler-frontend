import client from './client';

// ════════════════════════════════════════════════════════════════════════════
// WASTE TRACKER MVP - API EXPORTS (Core Features Only)
// ════════════════════════════════════════════════════════════════════════════

// ── Users (MVP) ────────────────────────────────────────────────────────────
export const getUsers = (params) => client.get('/users', { params });
export const getUser = (id) => client.get(`/users/${id}`);
export const getMyProfile = () => client.get('/users/me');
export const updateMyProfile = (data) => client.put('/users/me', data);
export const updateMyPreferences = (data) => client.put('/users/me/preferences', data).catch((error) => {
	if (error.response?.status !== 404) throw error;
	return client.put('/users/me', data);
});
export const updateMyPassword = (data) => client.put('/users/me/password', data);
export const updateUser = (id, data) => client.put(`/users/${id}`, data);
export const deleteUser = (id) => client.delete(`/users/${id}`);

// ── Zones (MVP) ────────────────────────────────────────────────────────────
export const getZones = (params) => client.get('/zones', { params });
export const getNigerianStates = () => client.get('/zones/states');
export const createZone = (data) => client.post('/zones', data);
export const updateZone = (id, data) => client.put(`/zones/${id}`, data);
export const deleteZone = (id) => client.delete(`/zones/${id}`);

// ── Waste Logs (MVP) ───────────────────────────────────────────────────────
export const getMyWasteLogs = () => client.get('/waste-logs/my');

// ── Site Reviews (MVP) ─────────────────────────────────────────────────────
export const getSiteReviews = () => client.get('/site-reviews');
export const createSiteReview = (data) => client.post('/site-reviews', data);

// ── Recycling Centers (MVP) ────────────────────────────────────────────────
export const getRecyclingPartners = () => client.get('/recycling');
export const createRecyclingPartner = (data) => client.post('/recycling', data);

// ── Billing (MVP) ──────────────────────────────────────────────────────────
export const initializePayment = (data) => client.post('/billing', data);
export const verifyPayment = (data) => client.post('/billing/verify', data);
export const getTransactions = (params) => client.get('/billing/transactions', { params });

// ── File Upload (MVP) ──────────────────────────────────────────────────────
export const uploadAvatar = (file) => {
	const form = new FormData();
	form.append('avatar', file);
	return client.post('/users/me/avatar', form);
};

// ════════════════════════════════════════════════════════════════════════════
// Removed for MVP: Schedules, Categories, Reports, Notifications, Announcements,
// Analytics, Waste Guide, Assignments, Subscriptions, Business Accounts,
// Collector Earnings, Admin Revenue Settings
// ════════════════════════════════════════════════════════════════════════════
