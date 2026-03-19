import { useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Toast from '../components/Toast'
import LoadingSpinner from '../components/LoadingSpinner'
import QuoteOfTheDay from '../components/QuoteOfTheDay'
import { api } from '../services/api'
import './Dashboard.css'

const Dashboard = () => {
    const [title, setTitle] = useState('')
    const [messageContent, setMessageContent] = useState('')
    const [recipientEmail, setRecipientEmail] = useState('')
    const [scheduledDate, setScheduledDate] = useState('')
    const [selectedHour, setSelectedHour] = useState(12)
    const [selectedMinute, setSelectedMinute] = useState(0)
    const [selectedSecond, setSelectedSecond] = useState(0)
    const [isToSelf, setIsToSelf] = useState(true)
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
            await api.createMessage(title, email, messageContent, scheduledDate)

            setToast({
                type: 'success',
                message: 'Your memory has been sealed for the future.',
            })

            // Clear form
            setTitle('')
            setMessageContent('')
            if (!isToSelf) setRecipientEmail('')
            setScheduledDate('')
            setSelectedDate(null)
            setSelectedHour(12)
            setSelectedMinute(0)
            setSelectedSecond(0)
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

    const buildScheduledDate = (date, hour, minute, second) => {
        if (!date) return ''
        const d = new Date(date)
        d.setHours(hour, minute, second, 0)
        return format(d, "yyyy-MM-dd'T'HH:mm:ss")
    }

    const handleDateSelect = (day) => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const date = new Date(year, month, day)
        setSelectedDate(date)
        setScheduledDate(buildScheduledDate(date, selectedHour, selectedMinute, selectedSecond))
    }

    const handleTimeChange = (type, value) => {
        const num = parseInt(value, 10)
        let h = selectedHour, m = selectedMinute, s = selectedSecond
        if (type === 'hour') { h = num; setSelectedHour(num) }
        if (type === 'minute') { m = num; setSelectedMinute(num) }
        if (type === 'second') { s = num; setSelectedSecond(num) }
        if (selectedDate) {
            setScheduledDate(buildScheduledDate(selectedDate, h, m, s))
        }
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
            <div className="dashboard-container">
                {/* Desktop sidebar for quote */}
                <aside className="dashboard-quote-sidebar">
                    <QuoteOfTheDay />
                </aside>

                <main className="dashboard-main">
                    {/* Writing Section */}
                    <section className="writing-section">
                        {/* Content */}
                        <div className="writing-content slide-up">

                            {/* Title Input */}
                            <div className="title-input-wrapper">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Title this memory..."
                                    className="title-input serif"
                                    disabled={loading}
                                />
                                <div className="title-underline"></div>
                            </div>

                            {/* Message Textarea */}
                            <div className="message-textarea-wrapper">
                                <textarea
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    placeholder="Write your thoughts..."
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
                                    <span>Draft saved</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Sidebar / Configuration */}
                    <aside className="dashboard-sidebar">
                        <div className="sidebar-content fade-in">
                            {/* Destination Section */}
                            <div className="sidebar-section">
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
                            <div className="sidebar-section">
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
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Time Picker */}
                                <div className="time-picker-section">
                                    <div className="time-picker-label">
                                        <span className="material-symbols-outlined">schedule</span>
                                        <span>Set Time</span>
                                    </div>
                                    <div className="time-picker-controls">
                                        <div className="time-unit">
                                            <label>HR</label>
                                            <select
                                                value={selectedHour}
                                                onChange={(e) => handleTimeChange('hour', e.target.value)}
                                                disabled={loading}
                                            >
                                                {Array.from({ length: 24 }, (_, i) => (
                                                    <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <span className="time-separator">:</span>
                                        <div className="time-unit">
                                            <label>MIN</label>
                                            <select
                                                value={selectedMinute}
                                                onChange={(e) => handleTimeChange('minute', e.target.value)}
                                                disabled={loading}
                                            >
                                                {Array.from({ length: 60 }, (_, i) => (
                                                    <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Send Button Footer */}
                        <div className="sidebar-footer">
                            <div className="summary-info">
                                <div className="summary-row">
                                    <span>Delivery Date</span>
                                    <span className="summary-value">
                                        {selectedDate
                                            ? `${format(selectedDate, 'MMM d, yyyy')} at ${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`
                                            : 'Not set'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !messageContent || !scheduledDate}
                                className="btn btn-primary send-button"
                            >
                                <div className="send-content">
                                    {loading ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">lock</span>
                                            <span className="send-text">Seal & Send</span>
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </aside>
                </main>
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
