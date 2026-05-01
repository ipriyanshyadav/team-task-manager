import api from './client'

export const usersApi = {
  list: (params) => api.get('/users/', { params }),
  members: () => api.get('/users/members/'),
  get: (id) => api.get(`/users/${id}/`),
  update: (id, data) => api.patch(`/users/${id}/`, data),
  delete: (id) => api.delete(`/users/${id}/`),
}

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats/'),
  userSummaries: () => api.get('/dashboard/user-summaries/'),
  projectSummaries: () => api.get('/dashboard/project-summaries/'),
}

export const activityApi = {
  list: (params) => api.get('/activity/', { params }),
}
