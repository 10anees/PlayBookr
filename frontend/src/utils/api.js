import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
          return api(original);
        } catch (e) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const loginUser = (email, password) => api.post('/auth/login', { email, password }).then(r => r.data);
export const registerUser = (data) => api.post('/auth/register', data).then(r => r.data);
export const logoutUser = (token) => api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
export const refreshToken = (refreshToken) => api.post('/auth/refresh', { refreshToken }).then(r => r.data);
export const getUser = () => api.get('/users/me').then(r => r.data);
export const updateUser = (data) => api.put('/users/me', data).then(r => r.data);
export const changePassword = (data) => api.post('/auth/change-password', data).then(r => r.data);

// Arenas
export const getArenas = (params) => api.get('/arenas', { params }).then(r => r.data);
export const getArena = (id) => api.get(`/arenas/${id}`).then(r => r.data);
export const createArena = (data) => api.post('/arenas', data).then(r => r.data);
export const updateArena = (id, data) => api.put(`/arenas/${id}`, data).then(r => r.data);
export const deleteArena = (id) => api.delete(`/arenas/${id}`).then(r => r.data);
export const getMyArenas = () => api.get('/arenas/my-arenas').then(r => r.data);
export const approveArena = (id) => api.post(`/arenas/${id}/approve`).then(r => r.data);

// Teams
export const getTeams = (params) => api.get('/teams', { params }).then(r => r.data);
export const getTeam = (id) => api.get(`/teams/${id}`).then(r => r.data);
export const createTeam = (data) => api.post('/teams', data).then(r => r.data);
export const updateTeam = (id, data) => api.put(`/teams/${id}`, data).then(r => r.data);
export const deleteTeam = (id) => api.delete(`/teams/${id}`).then(r => r.data);
export const getMyTeams = () => api.get('/teams/my-teams').then(r => r.data);
export const addTeamMember = (id, userId) => api.post(`/teams/${id}/members`, { userId }).then(r => r.data);
export const removeTeamMember = (id, userId) => api.delete(`/teams/${id}/members/${userId}`).then(r => r.data);
export const getTeamLeaderboard = () => api.get('/teams/leaderboard').then(r => r.data);

// Bookings
export const getBookings = (params) => api.get('/bookings', { params }).then(r => r.data);
export const getMyBookings = () => api.get('/bookings/my-bookings').then(r => r.data);
export const getArenaBookings = (arenaId) => api.get(`/bookings/arena/${arenaId}`).then(r => r.data);
export const getBooking = (id) => api.get(`/bookings/${id}`).then(r => r.data);
export const createBooking = (data) => api.post('/bookings', data).then(r => r.data);
export const updateBooking = (id, data) => api.put(`/bookings/${id}`, data).then(r => r.data);
export const cancelBooking = (id) => api.delete(`/bookings/${id}`).then(r => r.data);
export const confirmBooking = (id) => api.post(`/bookings/${id}/confirm`).then(r => r.data);
export const completeBooking = (id) => api.post(`/bookings/${id}/complete`).then(r => r.data);

// Matches
export const getMatches = (params) => api.get('/matches', { params }).then(r => r.data);
export const getMatch = (id) => api.get(`/matches/${id}`).then(r => r.data);
export const getMyMatches = () => api.get('/matches/my-matches').then(r => r.data);
export const createMatch = (data) => api.post('/matches', data).then(r => r.data);
export const updateMatch = (id, data) => api.put(`/matches/${id}`, data).then(r => r.data);
export const acceptMatch = (id) => api.post(`/matches/${id}/accept`).then(r => r.data);
export const rejectMatch = (id) => api.post(`/matches/${id}/reject`).then(r => r.data);
export const startMatch = (id) => api.post(`/matches/${id}/start`).then(r => r.data);
export const completeMatch = (id, data) => api.post(`/matches/${id}/complete`, data).then(r => r.data);
export const addMatchFeedback = (id, data) => api.post(`/matches/${id}/feedback`, data).then(r => r.data);

// Reviews
export const getReviews = (params) => api.get('/reviews', { params }).then(r => r.data);
export const getReview = (id) => api.get(`/reviews/${id}`).then(r => r.data);
export const getArenaReviews = (arenaId) => api.get(`/reviews/arena/${arenaId}`).then(r => r.data);
export const getMyReviews = () => api.get('/reviews/my-reviews').then(r => r.data);
export const createReview = (data) => api.post('/reviews', data).then(r => r.data);
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data).then(r => r.data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`).then(r => r.data);
export const markReviewHelpful = (id) => api.post(`/reviews/${id}/helpful`).then(r => r.data);
export const reportReview = (id) => api.post(`/reviews/${id}/report`).then(r => r.data);

// Tournaments
export const getTournaments = (params) => api.get('/tournaments', { params }).then(r => r.data);
export const getTournament = (id) => api.get(`/tournaments/${id}`).then(r => r.data);
export const getMyTournaments = () => api.get('/tournaments/my-tournaments').then(r => r.data);
export const getParticipatingTournaments = () => api.get('/tournaments/participating').then(r => r.data);
export const createTournament = (data) => api.post('/tournaments', data).then(r => r.data);
export const updateTournament = (id, data) => api.put(`/tournaments/${id}`, data).then(r => r.data);
export const deleteTournament = (id) => api.delete(`/tournaments/${id}`).then(r => r.data);
export const registerTournament = (id, data) => api.post(`/tournaments/${id}/register`, data).then(r => r.data);
export const acceptTournament = (id) => api.post(`/tournaments/${id}/accept`).then(r => r.data);
export const rejectTournament = (id) => api.post(`/tournaments/${id}/reject`).then(r => r.data);
export const startTournament = (id) => api.post(`/tournaments/${id}/start`).then(r => r.data);

// Chat
export const getChats = () => api.get('/chats').then(r => r.data);
export const getDirectChat = (userId) => api.get(`/chats/direct/${userId}`).then(r => r.data);
export const getChat = (id) => api.get(`/chats/${id}`).then(r => r.data);
export const createChat = (data) => api.post('/chats', data).then(r => r.data);
export const sendMessage = (id, data) => api.post(`/chats/${id}/messages`, data).then(r => r.data);
export const editMessage = (id, messageId, data) => api.put(`/chats/${id}/messages/${messageId}`, data).then(r => r.data);
export const deleteMessage = (id, messageId) => api.delete(`/chats/${id}/messages/${messageId}`).then(r => r.data);
export const joinGroupChat = (id) => api.post(`/chats/${id}/join`).then(r => r.data);
export const leaveGroupChat = (id) => api.post(`/chats/${id}/leave`).then(r => r.data);
export const addGroupMember = (id, data) => api.post(`/chats/${id}/add-member`, data).then(r => r.data);
export const removeGroupMember = (id, data) => api.post(`/chats/${id}/remove-member`, data).then(r => r.data);

// Notifications
export const getNotifications = () => api.get('/notifications').then(r => r.data);
export const getUnreadCount = () => api.get('/notifications/unread-count').then(r => r.data);
export const getNotificationSettings = () => api.get('/notifications/settings').then(r => r.data);
export const getNotification = (id) => api.get(`/notifications/${id}`).then(r => r.data);
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`).then(r => r.data);
export const markNotificationUnread = (id) => api.put(`/notifications/${id}/unread`).then(r => r.data);
export const markAllRead = () => api.put('/notifications/read-all').then(r => r.data);
export const deleteNotification = (id) => api.delete(`/notifications/${id}`).then(r => r.data);
export const deleteAllNotifications = () => api.delete('/notifications/delete-all').then(r => r.data);
export const updateNotificationSettings = (data) => api.post('/notifications/settings', data).then(r => r.data);

// Admin
export const getAdminDashboard = () => api.get('/admin/dashboard').then(r => r.data);
export const getAdminUsers = () => api.get('/admin/users').then(r => r.data);
export const updateAdminUser = (id, data) => api.put(`/admin/users/${id}`, data).then(r => r.data);
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`).then(r => r.data);
export const getAdminArenas = () => api.get('/admin/arenas').then(r => r.data);
export const approveAdminArena = (id) => api.post(`/admin/arenas/${id}/approve`).then(r => r.data);
export const rejectAdminArena = (id) => api.post(`/admin/arenas/${id}/reject`).then(r => r.data);
export const getAdminReviews = () => api.get('/admin/reviews').then(r => r.data);
export const deleteAdminReview = (id) => api.delete(`/admin/reviews/${id}`).then(r => r.data);
export const getAdminLeaderboard = () => api.get('/admin/leaderboard').then(r => r.data);
export const getAdminReports = () => api.get('/admin/reports').then(r => r.data); 