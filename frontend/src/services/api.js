import axios from 'axios'
import { supabase } from './supabaseClient'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance with base configuration
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add request interceptor to attach JWT token
apiClient.interceptors.request.use(
    async (config) => {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Add response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'An error occurred'
        console.error('API Error:', message)
        return Promise.reject(error)
    }
)

// API methods
export const api = {
    // Create a new encrypted message
    async createMessage(recipientEmail, content, scheduledDate) {
        // Convert local datetime to ISO string with timezone
        // scheduledDate comes as "2026-02-07T16:54" from datetime-local input
        const localDate = new Date(scheduledDate)
        const isoDate = localDate.toISOString()

        const response = await apiClient.post('/api/messages', {
            recipient_email: recipientEmail,
            content,
            scheduled_date: isoDate,
        })
        return response.data
    },

    // Get all messages for the current user
    async getMessages() {
        const response = await apiClient.get('/api/messages')
        return response.data
    },

    // Get a specific message by ID
    async getMessage(messageId) {
        const response = await apiClient.get(`/api/messages/${messageId}`)
        return response.data
    },
}

export default api
