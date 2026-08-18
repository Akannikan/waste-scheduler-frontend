import client from './client';

// ── Users ─────────────────────────────────────────────────────
export const getUsers = (params) => client.get('/users', { params });
export const getUser = (id) => client.get(`/users/${id}`);
export const getMyProfile = () => client.get('/users/me');
export const updateMyProfile = (data) => client.put('/users/me', data);
export const updateMyPassword = (data) => client.put('/users/me/password', data);
export const updateUser = (id, data) => client.put(`/users/${id}`, data);
export const deleteUser = (id) => client.delete(`/users/${id}`);

// ── Schedules ─────────────────────────────────────────────────
export const getSchedules = (params) => client.get('/schedules', { params });
export const getUpcomingSchedules = () => client.get('/schedules/upcoming');
export const getSchedule = (id) => client.get(`/schedules/${id}`);
export const createSchedule = (data) => client.post('/schedules', data);
export const updateSchedule = (id, data) => client.put(`/schedules/${id}`, data);
export const deleteSchedule = (id) => client.delete(`/schedules/${id}`);
export const completeSchedule = (id, data) => client.post(`/schedules/${id}/complete`, data);

// ── Categories ────────────────────────────────────────────────
export const getCategories = () => client.get('/categories');
export const getCategory = (id) => client.get(`/categories/${id}`);
export const createCategory = (data) => client.post('/categories', data);
export const updateCategory = (id, data) => client.put(`/categories/${id}`, data);
export const deleteCategory = (id) => client.delete(`/categories/${id}`);

// ── Reports ───────────────────────────────────────────────────
export const getReports = (params) => client.get('/reports', { params });
export const getReport = (id) => client.get(`/reports/${id}`);
export const createReport = (data) => client.post('/reports', data);
export const updateReport = (id, data) => client.put(`/reports/${id}`, data);
export const deleteReport = (id) => client.delete(`/reports/${id}`);

// ── Notifications ─────────────────────────────────────────────
export const getNotifications = () => client.get('/notifications');
export const createNotification = (data) => client.post('/notifications', data);
export const markNotificationRead = (id) => client.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => client.patch('/notifications/read-all');
export const deleteNotification = (id) => client.delete(`/notifications/${id}`);

// ── Announcements ─────────────────────────────────────────────
export const getAnnouncements = (params) => client.get('/announcements', { params });
export const getAnnouncement = (id) => client.get(`/announcements/${id}`);
export const createAnnouncement = (data) => client.post('/announcements', data);
export const updateAnnouncement = (id, data) => client.put(`/announcements/${id}`, data);
export const deleteAnnouncement = (id) => client.delete(`/announcements/${id}`);

// ── Site Reviews ───────────────────────────────────────────────
export const getSiteReviews = () => client.get('/site-reviews');
export const createSiteReview = (data) => client.post('/site-reviews', data);

// ── Analytics ─────────────────────────────────────────────────
export const getDashboardStats = () => client.get('/analytics/dashboard');
export const getSchedulesByMonth = (year) => client.get('/analytics/schedules-by-month', { params: { year } });
export const getWasteByCategory = () => client.get('/analytics/waste-by-category');
export const getReportsByStatus = () => client.get('/analytics/reports-by-status');
export const getUserRegistrations = (year) => client.get('/analytics/user-registrations', { params: { year } });

// ── Waste Guide ───────────────────────────────────────────────
export const searchGuide = (q) => client.get('/guide', { params: { q } });

// ── Recycling Centers ─────────────────────────────────────────
export const getCenters = (params) => client.get('/centers', { params });
export const getCenter = (id) => client.get(`/centers/${id}`);
export const createCenter = (data) => client.post('/centers', data);
export const updateCenter = (id, data) => client.put(`/centers/${id}`, data);
export const deleteCenter = (id) => client.delete(`/centers/${id}`);

// ── Zones ─────────────────────────────────────────────────────
export const getZones = () => client.get('/zones');
export const createZone = (data) => client.post('/zones', data);
export const updateZone = (id, data) => client.put(`/zones/${id}`, data);
export const deleteZone = (id) => client.delete(`/zones/${id}`);

// ── Assignments ───────────────────────────────────────────────
export const getAssignments = (params) => client.get('/assignments', { params });
export const getAssignment = (id) => client.get(`/assignments/${id}`);
export const createAssignment = (data) => client.post('/assignments', data);
export const updateAssignment = (id, data) => client.put(`/assignments/${id}`, data);
export const deleteAssignment = (id) => client.delete(`/assignments/${id}`);
export const createAssignmentMessage = (assignmentId, data) => client.post(`/assignments/${assignmentId}/messages`, data);
