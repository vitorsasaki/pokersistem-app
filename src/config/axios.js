import axios from 'axios'

const instance = axios.create({
  baseURL: '/pokersistem',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Adiciona o token em todas as requisições
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // Adiciona o token como Cookie também
      document.cookie = `token=${token}; path=/`
    }
    console.log('Token:', localStorage.getItem('token'))
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Intercepta erros de autenticação
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Remove o token em caso de erro de autenticação
      localStorage.removeItem('token')
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default instance 