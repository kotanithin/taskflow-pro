import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
})

export const api = {
  login: async ({ email, password }: { email: string; password: string }) => {
    const response = await client.post('/login', { email, password })
    return response.data
  },
  getDashboard: async () => {
    const response = await client.get('/dashboard')
    return response.data
  },
  getTasks: async () => {
    const response = await client.get('/tasks')
    return response.data
  },
  getReports: async () => {
    const response = await client.get('/reports')
    return response.data
  },
  getCalendar: async () => {
    const response = await client.get('/calendar')
    return response.data
  },
  getNotifications: async () => {
    const response = await client.get('/notifications')
    return response.data
  },
}
