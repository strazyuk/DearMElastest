import axios from 'axios'
import { supabase } from './supabaseClient'

// Fail-safe API URL detection: Use production URL if not on localhost
const API_URL = import.meta.env.VITE_API_URL || 
                (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                    ? 'http://localhost:8000' 
                    : 'https://wo7z2tu39l.execute-api.ap-south-1.amazonaws.com')

console.log('Using API Base URL:', API_URL)

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
const api = {
    // Create a new encrypted message
    async createMessage(title, recipientEmail, content, scheduledDate) {
        // Convert local datetime to ISO string with timezone
        // scheduledDate comes as "2026-02-07T16:54" from datetime-local input
        const localDate = new Date(scheduledDate)
        const isoDate = localDate.toISOString()

        const response = await apiClient.post('/api/messages', {
            title: title || null,
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

    // Delete a message by ID (only works for messages you own/sent)
    async deleteMessage(messageId) {
        await apiClient.delete(`/api/messages/${messageId}`)
    },
}

export { apiClient, api }
export default api
