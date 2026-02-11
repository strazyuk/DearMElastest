import { useState, useEffect } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { api } from '../services/api'
import './Vault.css'

const Vault = () => {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filter, setFilter] = useState('in-transit') // in-transit, discovered

    const { user } = useAuth()
    const navigate = useNavigate()

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

    const now = new Date()
    // In Transit: Scheduled messages (not yet sent)
    const inTransitMessages = messages
        .filter(msg => msg.status === 'scheduled')
        .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))

    // Sent: Messages that have been delivered
    const sentMessages = messages
        .filter(msg => msg.status === 'sent')
        .sort((a, b) => new Date(b.sent_at || b.scheduled_date) - new Date(a.sent_at || a.scheduled_date))

    const filteredMessages = filter === 'in-transit' ? inTransitMessages : sentMessages

    const getTimeUntil = (date) => {
        const target = new Date(date)
        const diff = target - now

        if (diff <= 0) return 'Ready to open'

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        if (days > 365) {
            const years = Math.floor(days / 365)
            const months = Math.floor((days % 365) / 30)
            const remainDays = days % 30
            return `${years}y ${months}m ${remainDays}d`
        }
        if (days > 0) return `${days}d ${hours}h ${minutes}m`
        if (hours > 0) return `${hours}h ${minutes}m`
        return `${minutes}m`
    }

    if (loading) {
        return (
            <div className="vault-root">
                <div className="vault-loading">
                    <LoadingSpinner />
                </div>
            </div>
        )
    }

    return (
        <div className="vault-root">
            {/* Main Layout */}
            <div className="vault-layout">
                {/* Left Sidebar */}
                <aside className="vault-sidebar-left">
                    <div className="sidebar-header">
                        <h1 className="sidebar-title">Your Path</h1>
                        <p className="sidebar-subtitle">Welcome home, Time Traveler.</p>
                    </div>

                    <div className="sidebar-actions">
                        <Link to="/dashboard" className="btn-new-memory">
                            <span className="material-symbols-outlined">edit_note</span>
                            New Memory
                        </Link>
                    </div>

                    <div className="sidebar-filters">
                        <p className="filter-label">Constellations</p>
                        <button
                            className={`filter-item ${filter === 'in-transit' ? 'active' : ''}`}
                            onClick={() => setFilter('in-transit')}
                        >
                            <div className="filter-icon-text">
                                <span className="material-symbols-outlined">rocket_launch</span>
                                <span>In Transit</span>
                            </div>
                            <span className="filter-count">{inTransitMessages.length}</span>
                        </button>
                        <button
                            className={`filter-item ${filter === 'sent' ? 'active' : ''}`}
                            onClick={() => setFilter('sent')}
                        >
                            <div className="filter-icon-text">
                                <span className="material-symbols-outlined">mark_email_read</span>
                                <span>Sent</span>
                            </div>
                            <span className="filter-count">{sentMessages.length}</span>
                        </button>
                    </div>

                    <div className="sidebar-next-reveal">
                        <div className="next-reveal-card">
                            <div className="next-reveal-header">
                                <span className="material-symbols-outlined">auto_awesome</span>
                                <span>Next Reveal</span>
                            </div>
                            {inTransitMessages.length > 0 ? (
                                <>
                                    <div className="next-reveal-info">
                                        <p className="next-reveal-title">
                                            {inTransitMessages[0].title || 'Untitled Memory'}
                                        </p>
                                        <p className="next-reveal-time">
                                            {getTimeUntil(inTransitMessages[0].scheduled_date)}
                                        </p>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${Math.min(100, Math.max(5,
                                                    ((new Date() - new Date(inTransitMessages[0].created_at)) /
                                                        (new Date(inTransitMessages[0].scheduled_date) - new Date(inTransitMessages[0].created_at))) * 100
                                                ))}%`
                                            }}
                                        ></div>
                                    </div>
                                </>
                            ) : (
                                <p className="next-reveal-empty">No messages in flight</p>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="vault-main">
                    <div className="vault-bg-constellation"></div>
                    <div className="vault-bg-grid"></div>

                    <div className="vault-content">
                        {/* Timeline Line */}
                        <div className="timeline-line"></div>

                        {/* Header */}
                        <div className="vault-content-header">
                            <h2 className="vault-content-title">
                                {filter === 'in-transit' ? 'Wishes in Flight' : 'Delivered Memories'}
                            </h2>
                            <p className="vault-content-subtitle">
                                {filter === 'in-transit'
                                    ? `${filteredMessages.length} memories currently drifting toward tomorrow`
                                    : `${filteredMessages.length} memories successfully delivered`}
                            </p>
                        </div>

                        {/* Messages Timeline */}
                        {filteredMessages.length === 0 ? (
                            <div className="empty-vault">
                                <span className="material-symbols-outlined">hourglass_empty</span>
                                <p>No messages in this constellation</p>
                            </div>
                        ) : (
                            <div className="messages-timeline">
                                {filteredMessages.map((message, index) => {
                                    // Calculate time difference from previous message
                                    let spacing = 0
                                    if (index > 0) {
                                        const prev = new Date(filteredMessages[index - 1].scheduled_date)
                                        const curr = new Date(message.scheduled_date)
                                        const diffHours = Math.abs(curr - prev) / (1000 * 60 * 60)

                                        // Dynamic spacing scale
                                        if (diffHours < 24) spacing = 0 // Same day/close: standard gap
                                        else if (diffHours < 24 * 7) spacing = 4 // Within week: medium gap
                                        else if (diffHours < 24 * 30) spacing = 8 // Within month: large gap
                                        else spacing = 12 // Long time: huge gap
                                    }

                                    return (
                                        <MessageCard
                                            key={message.id}
                                            message={message}
                                            index={index}
                                            getTimeUntil={getTimeUntil}
                                            filter={filter}
                                            spacing={spacing}
                                        />
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </main>

                {/* Right Sidebar - Memory Lane */}
                <aside className="vault-sidebar-right">
                    <div className="memory-lane-header">
                        <h3>Memory Lane</h3>
                        <div className="memory-lane-actions">
                            <button className="memory-action-btn">
                                <span className="material-symbols-outlined">search</span>
                            </button>
                            <button className="memory-action-btn">
                                <span className="material-symbols-outlined">filter_list</span>
                            </button>
                        </div>
                    </div>

                    <div className="memory-lane-content">
                        {/* Sent Section */}
                        {sentMessages.length > 0 && (
                            <>
                                <div className="memory-section-divider">
                                    <span>Recently Sent</span>
                                </div>
                                {sentMessages.slice(0, 2).map(msg => (
                                    <div key={msg.id} className="memory-lane-item sent">
                                        <div className="memory-indicator"></div>
                                        <div className="memory-lane-meta">
                                            <span className="memory-from">To: {msg.recipient_email}</span>
                                            <span className="memory-time">Sent {formatDistanceToNow(new Date(msg.sent_at || msg.scheduled_date), { addSuffix: true })}</span>
                                        </div>
                                        <h4 className="memory-lane-title">{msg.title || 'Untitled Memory'}</h4>
                                        <p className="memory-lane-preview">{msg.decrypted_content?.substring(0, 60) || 'Delivered'}...</p>
                                    </div>
                                ))}
                            </>
                        )}

                    </div>

                    <div className="memory-lane-footer">
                        <button className="view-full-journey-btn">View Full Journey</button>
                    </div>
                </aside>
            </div>
        </div>
    )
}



const MessageCard = ({ message, index, getTimeUntil, filter, spacing = 0 }) => {
    const isLeft = index % 2 === 0
    const animationDelay = `${(index % 3) * 0.5}s`

    const cardType = message.status === 'sent' ? 'sent' : 'in-transit'
    const timeText = cardType === 'in-transit'
        ? getTimeUntil(message.scheduled_date)
        : `Sent ${format(new Date(message.sent_at || message.scheduled_date), 'MMM d, yyyy')}`

    return (
        <div
            className={`message-card-wrapper ${isLeft ? 'left' : 'right'}`}
            style={{
                animationDelay,
                ...(spacing > 0 ? { marginTop: `${spacing}rem` } : {})
            }}
        >
            {/* Timeline Dot */}
            <div className={`timeline-dot ${cardType}`}>
                <div className="dot-inner"></div>
            </div>

            {/* Connection Line */}
            <div className="timeline-connector"></div>

            {/* Date Label */}
            <div className="timeline-date">
                {format(new Date(message.scheduled_date), 'MMM d, yyyy')}
            </div>

            {/* Card */}
            <div className="message-card">
                <div className="card-glow"></div>
                <div className="card-content">
                    <div className="card-header">
                        <span className={`status-badge ${cardType}`}>
                            {cardType === 'in-transit' ? 'Scheduled' : 'Delivered'}
                        </span>
                        <span className="material-symbols-outlined card-icon">
                            {cardType === 'in-transit' ? 'schedule_send' : 'mark_email_read'}
                        </span>
                    </div>

                    <h3 className="card-title">{message.title || 'Untitled Memory'}</h3>
                    <p className="card-preview">
                        {cardType === 'sent' && message.decrypted_content
                            ? message.decrypted_content.substring(0, 80) + '...'
                            : 'Content sealed until delivery'}
                    </p>

                    <div className="card-footer">
                        <div className="card-time-info">
                            <p className="time-label">
                                {cardType === 'in-transit' ? 'Arrives In' : 'Delivered'}
                            </p>
                            <p className={`time-value ${cardType}`}>{timeText}</p>
                        </div>
                        <button className="card-view-btn">
                            <span className="material-symbols-outlined">visibility</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Vault
