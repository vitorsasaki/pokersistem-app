import axios from 'axios'

export const API_BASE_URL = 'http://localhost:8080/pokersistem'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para tratamento global de erros
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('Erro na requisição:', error)
    if (error.response) {
      // O servidor respondeu com um status de erro
      console.error('Erro do servidor:', error.response.data)
    }
    return Promise.reject(error)
  }
)

// Interceptor para logs de requisição (debug)
axiosInstance.interceptors.request.use(
  config => {
    console.log('Requisição para:', config.url)
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

export default axiosInstance 