import axios from 'axios'

const api = axios.create({ baseURL: '/api' })
api.interceptors.request.use(c => {
  const t = localStorage.getItem('token')
  if (t) c.headers.Authorization = `Bearer ${t}`
  return c
})
api.interceptors.response.use(r => r, e => {
  if (e.response?.status === 401 && !e.config.url?.includes('/auth/login')) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }
  return Promise.reject(e)
})

export const login = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)
export const getMe = () => api.get('/auth/me')
export const getStudents = (p) => api.get('/students', { params: p })
export const createStudent = (d) => api.post('/students', d)
export const updateStudent = (id, d) => api.put(`/students/${id}`, d)
export const deleteStudent = (id) => api.delete(`/students/${id}`)
export const exportStudents = () => api.get('/students/export', { responseType: 'blob' })
export const importStudents = (file) => { const fd = new FormData(); fd.append('file', file); return api.post('/students/import', fd) }
export const getStats = () => api.get('/stats')
export const getClasses = () => api.get('/classes')
export const getClassrooms = () => api.get('/classrooms')
export const createClassroom = (d) => api.post('/classrooms', d)
export const updateClassroom = (id, d) => api.put(`/classrooms/${id}`, d)
export const deleteClassroom = (id) => api.delete(`/classrooms/${id}`)
export const getActivities = () => api.get('/activities')
