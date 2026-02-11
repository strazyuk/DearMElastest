import { useState } from 'react'
import { format } from 'date-fns'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Toast from '../components/Toast'
import LoadingSpinner from '../components/LoadingSpinner'
import { api } from '../services/api'
import './Dashboard.css'

const Dashboard = () => {
    const [title, setTitle] = useState('')
    const [messageContent, setMessageContent] = useState('')
    const [recipientEmail, setRecipientEmail] = useState('')
    const [scheduledDate, setScheduledDate] = useState('')
    const [isToSelf, setIsToSelf] = useState(true)
    const [dreamMode, setDreamMode] = useState(false)
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(null)
    const [selectedDate, setSelectedDate] = useState(null)
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const { user } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const email = isToSelf ? user?.email : recipientEmail
            await api.createMessage(email, messageContent, scheduledDate)

            setToast({
                type: 'success',
                message: 'Memory sealed and sent to the light! ✨',
            })

            // Clear form
            setTitle('')
            setMessageContent('')
            if (!isToSelf) setRecipientEmail('')
            setScheduledDate('')
            setSelectedDate(null)
        } catch (error) {
            setToast({
                type: 'error',
                message: error.response?.data?.message || 'Failed to seal your memory. Please try again.',
            })
        } finally {
            setLoading(false)
        }
    }

    const wordCount = messageContent.trim().split(/\s+/).filter(word => word.length > 0).length

    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        return { firstDay, daysInMonth }
    }

    const handleDateSelect = (day) => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const date = new Date(year, month, day)
        setSelectedDate(date)
        setScheduledDate(format(date, "yyyy-MM-dd'T'12:00"))
    }

    const { firstDay, daysInMonth } = getDaysInMonth(currentMonth)
    const today = new Date()
    const isPastDate = (day) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        return date < today.setHours(0, 0, 0, 0)
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]

    return (
        <div className="dashboard-root">
            <main className="dashboard-main">
                {/* Writing Section */}
                <section className="writing-section">
                    {/* Background effects */}
                    <div className="bg-noise"></div>
                    <div className="bg-orb orb-1"></div>
                    <div className="bg-orb orb-2"></div>

                    {/* Dream Mode Overlay */}
                    {dreamMode && (
                        <div className="dream-overlay">
                            <div className="sparkle" style={{ top: '20%', left: '25%' }}></div>
                            <div className="sparkle" style={{ top: '75%', left: '33%', animationDelay: '1s' }}></div>
                            <div className="sparkle" style={{ top: '50%', right: '25%', animationDelay: '2s' }}></div>
                            <div className="sparkle" style={{ bottom: '25%', right: '33%', animationDelay: '0.5s' }}></div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="writing-content">
                        {/* Icon */}
                        <div className="content-icon float-element">
                            <span className="material-symbols-outlined icon-main">hourglass_empty</span>
                            <span className="material-symbols-outlined icon-accent">history_edu</span>
                            <div className="icon-glow"></div>
                        </div>

                        {/* Formatting Toolbar */}
                        <div className="formatting-toolbar">
                            <button className="toolbar-btn" title="Bold">
                                <span className="material-symbols-outlined">format_bold</span>
                            </button>
                            <button className="toolbar-btn" title="Italic">
                                <span className="material-symbols-outlined">format_italic</span>
                            </button>
                            <button className="toolbar-btn" title="List">
                                <span className="material-symbols-outlined">format_list_bulleted</span>
                            </button>
                            <div className="toolbar-divider"></div>
                            <button className="toolbar-btn" title="Image">
                                <span className="material-symbols-outlined">image</span>
                            </button>
                            <button className="toolbar-btn" title="Attach">
                                <span className="material-symbols-outlined">attach_file</span>
                            </button>
                        </div>

                        {/* Title Input */}
                        <div className="title-input-wrapper">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What is this memory about?"
                                className="title-input"
                                disabled={loading}
                            />
                            <div className="title-underline"></div>
                        </div>

                        {/* Message Textarea */}
                        <div className="message-textarea-wrapper">
                            <div className="paper-texture"></div>
                            <textarea
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                                placeholder="Drift into your thoughts..."
                                className="message-textarea"
                                disabled={loading}
                                required
                            ></textarea>
                        </div>

                        {/* Footer Info */}
                        <div className="writing-footer">
                            <span className="word-count">{wordCount} words written</span>
                            <div className="save-status">
                                <span className="material-symbols-outlined">cloud_done</span>
                                <span>Saved to stardust</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sidebar */}
                <aside className="dashboard-sidebar">
                    <div className="sidebar-content">
                        {/* Destination Section */}
                        <div className="sidebar-section float-element" style={{ animationDelay: '0.5s' }}>
                            <h3 className="section-title">
                                <span className="material-symbols-outlined">near_me</span>
                                Destination
                            </h3>
                            <div className="destination-toggle">
                                <button
                                    className={`toggle-btn ${isToSelf ? 'active' : ''}`}
                                    onClick={() => setIsToSelf(true)}
                                >
                                    Myself
                                </button>
                                <button
                                    className={`toggle-btn ${!isToSelf ? 'active' : ''}`}
                                    onClick={() => setIsToSelf(false)}
                                >
                                    Someone Else
                                </button>
                            </div>
                            <div className="email-input-wrapper">
                                <div className="email-icon">
                                    <span className="material-symbols-outlined">alternate_email</span>
                                </div>
                                <input
                                    type="email"
                                    value={isToSelf ? (user?.email || '') : recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                    placeholder="you@future.com"
                                    className="email-input"
                                    disabled={isToSelf || loading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="section-divider"></div>

                        {/* Time Lock Section */}
                        <div className="sidebar-section float-element" style={{ animationDelay: '1s' }}>
                            <h3 className="section-title">
                                <span className="material-symbols-outlined">schedule</span>
                                Time Lock
                            </h3>
                            <div className="calendar-widget">
                                <div className="calendar-header">
                                    <button
                                        className="calendar-nav-btn"
                                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                    >
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    <span className="calendar-month">
                                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                    </span>
                                    <button
                                        className="calendar-nav-btn"
                                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                    >
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </div>
                                <div className="calendar-weekdays">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                        <span key={i}>{day}</span>
                                    ))}
                                </div>
                                <div className="calendar-days">
                                    {Array.from({ length: firstDay }).map((_, i) => (
                                        <div key={`empty-${i}`} className="calendar-day empty"></div>
                                    ))}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1
                                        const isSelected = selectedDate?.getDate() === day &&
                                            selectedDate?.getMonth() === currentMonth.getMonth() &&
                                            selectedDate?.getFullYear() === currentMonth.getFullYear()
                                        const isPast = isPastDate(day)

                                        return (
                                            <div
                                                key={day}
                                                className={`calendar-day ${isSelected ? 'selected' : ''} ${isPast ? 'disabled' : ''}`}
                                                onClick={() => !isPast && handleDateSelect(day)}
                                            >
                                                {day}
                                                {isSelected && <div className="selection-pulse"></div>}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="section-divider"></div>

                        {/* Sanctuary / Dream Mode Section */}


                    </div>

                    {/* Send Button Footer */}
                    <div className="sidebar-footer">
                        <div className="summary-info">
                            <div className="summary-row">
                                <span>Soul Travel Cost</span>
                                <span className="summary-value">Free</span>
                            </div>
                            <div className="summary-row">
                                <span>Manifestation Date</span>
                                <span className="summary-value">
                                    {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Not set'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !messageContent || !scheduledDate}
                            className="send-button"
                        >
                            <div className="send-shimmer"></div>
                            <div className="send-content">
                                {loading ? (
                                    <LoadingSpinner />
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">rocket_launch</span>
                                        <span className="send-text">Seal & Send to Light</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </aside>
            </main>

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
