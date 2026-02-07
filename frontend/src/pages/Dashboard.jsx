import { useState } from 'react'
import { Send, Clock, Lock } from 'lucide-react'
import { format } from 'date-fns'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'
import LoadingSpinner from '../components/LoadingSpinner'
import { api } from '../services/api'
import './Dashboard.css'

const Dashboard = () => {
    const [recipientEmail, setRecipientEmail] = useState('')
    const [messageContent, setMessageContent] = useState('')
    const [scheduledDate, setScheduledDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            await api.createMessage(recipientEmail, messageContent, scheduledDate)

            setToast({
                type: 'success',
                message: 'Message encrypted and scheduled successfully!',
            })

            // Clear form
            setRecipientEmail('')
            setMessageContent('')
            setScheduledDate('')
        } catch (error) {
            setToast({
                type: 'error',
                message: error.response?.data?.message || 'Failed to schedule message. Please try again.',
            })
        } finally {
            setLoading(false)
        }
    }

    const minDateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm")

    return (
        <div className="dashboard">
            <Navbar />

            <div className="dashboard-container">
                <div className="dashboard-header">
                    <Lock size={32} className="header-icon" />
                    <h1>Create Time-Locked Message</h1>
                    <p>
                        Your message will be encrypted and delivered on the scheduled date
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="message-form">
                    <div className="form-group">
                        <label htmlFor="recipient" className="form-label">
                            <Send size={18} />
                            Recipient Email
                        </label>
                        <input
                            type="email"
                            id="recipient"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            required
                            className="form-input"
                            placeholder="recipient@example.com"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="message" className="form-label">
                            <Lock size={18} />
                            Your Message
                        </label>
                        <textarea
                            id="message"
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            required
                            className="form-textarea"
                            placeholder="Write your message here... It will be encrypted and locked until the scheduled date."
                            rows={8}
                            disabled={loading}
                        />
                        <span className="character-count">
                            {messageContent.length} characters
                        </span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="scheduled" className="form-label">
                            <Clock size={18} />
                            Delivery Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            id="scheduled"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            required
                            className="form-input"
                            min={minDateTime}
                            disabled={loading}
                        />
                        <span className="helper-text">
                            Select when you want this message to be delivered
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary btn-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <Lock size={20} />
                                Schedule & Encrypt Message
                            </>
                        )}
                    </button>
                </form>

                <div className="info-box">
                    <h3>🔒 How it works</h3>
                    <ul>
                        <li>Your message is encrypted using industry-standard AES-256 encryption</li>
                        <li>The encrypted message is stored securely in our vault</li>
                        <li>On the scheduled date, the message will be delivered to the recipient</li>
                        <li>Only the recipient can decrypt and read the message</li>
                    </ul>
                </div>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    )
}

export default Dashboard
