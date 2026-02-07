import { useState, useEffect } from 'react'
import { Clock, CheckCircle, Mail } from 'lucide-react'
import { format } from 'date-fns'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import { api } from '../services/api'
import './Vault.css'

const Vault = () => {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchMessages()
    }, [])

    const fetchMessages = async () => {
        try {
            setLoading(true)
            const data = await api.getMessages()
            setMessages(data.messages || [])
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load messages')
        } finally {
            setLoading(false)
        }
    }

    const scheduledMessages = messages.filter(
        (msg) => new Date(msg.scheduled_date) > new Date()
    )
    const sentMessages = messages.filter(
        (msg) => new Date(msg.scheduled_date) <= new Date()
    )

    if (loading) {
        return (
            <div className="vault">
                <Navbar />
                <div className="vault-loading">
                    <LoadingSpinner />
                </div>
            </div>
        )
    }

    return (
        <div className="vault">
            <Navbar />

            <div className="vault-container">
                <div className="vault-header">
                    <h1>Message Vault</h1>
                    <p>View all your encrypted time-locked messages</p>
                </div>

                {error && (
                    <div className="error-banner">
                        {error}
                    </div>
                )}

                <div className="vault-section">
                    <div className="section-header">
                        <Clock size={24} />
                        <h2>Scheduled Messages ({scheduledMessages.length})</h2>
                    </div>

                    {scheduledMessages.length === 0 ? (
                        <div className="empty-state">
                            <Clock size={48} />
                            <p>No scheduled messages</p>
                            <span>Messages you schedule will appear here</span>
                        </div>
                    ) : (
                        <div className="message-grid">
                            {scheduledMessages.map((message) => (
                                <MessageCard key={message.id} message={message} status="scheduled" />
                            ))}
                        </div>
                    )}
                </div>

                <div className="vault-section">
                    <div className="section-header">
                        <CheckCircle size={24} />
                        <h2>Sent Messages ({sentMessages.length})</h2>
                    </div>

                    {sentMessages.length === 0 ? (
                        <div className="empty-state">
                            <CheckCircle size={48} />
                            <p>No sent messages</p>
                            <span>Delivered messages will appear here</span>
                        </div>
                    ) : (
                        <div className="message-grid">
                            {sentMessages.map((message) => (
                                <MessageCard key={message.id} message={message} status="sent" />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const MessageCard = ({ message, status }) => {
    const preview = message.content?.substring(0, 80) + (message.content?.length > 80 ? '...' : '')
    const dateFormatted = format(new Date(message.scheduled_date), 'PPp')

    return (
        <div className={`message-card ${status}`}>
            <div className="message-card-header">
                <span className={`status-badge ${status}`}>
                    {status === 'scheduled' ? (
                        <>
                            <Clock size={14} />
                            Scheduled
                        </>
                    ) : (
                        <>
                            <CheckCircle size={14} />
                            Sent
                        </>
                    )}
                </span>
                <span className="message-date">{dateFormatted}</span>
            </div>

            <div className="message-card-body">
                <div className="message-recipient">
                    <Mail size={16} />
                    <span>{message.recipient_email}</span>
                </div>

                {message.content && (
                    <p className="message-preview">{preview}</p>
                )}
            </div>
        </div>
    )
}

export default Vault
