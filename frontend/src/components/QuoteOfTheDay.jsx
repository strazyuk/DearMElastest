import { useState, useEffect } from 'react'
import './QuoteOfTheDay.css'

const QuoteOfTheDay = () => {
    const [quoteData, setQuoteData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchQuote = async () => {
            const today = new Date().toISOString().split('T')[0]
            const cached = localStorage.getItem('daily_quote')

            if (cached) {
                const parsed = JSON.parse(cached)
                if (parsed.date === today && parsed.quote) {
                    setQuoteData(parsed)
                    setLoading(false)
                    return
                }
            }

            try {
                console.log('Fetching quote from API...')
                const response = await fetch('http://localhost:8000/api/quote/')
                console.log('API Response status:', response.status)

                if (!response.ok) throw new Error('Failed to fetch quote')

                const data = await response.json()
                const dataWithDate = { ...data, date: today }

                localStorage.setItem('daily_quote', JSON.stringify(dataWithDate))
                setQuoteData(dataWithDate)
            } catch (error) {
                console.error('Error fetching quote:', error)

                // Robust Fallback Collection
                const fallbackQuotes = [
                    { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
                    { quote: "Time you enjoy wasting is not wasted time.", author: "Marthe Troly-Curtin" },
                    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
                    { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
                    { quote: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
                    { quote: "The best way to predict the future is to create it.", author: "Peter Drucker" },
                    { quote: "Everything you can imagine is real.", author: "Pablo Picasso" }
                ];

                // Deterministic selection based on day of year
                const start = new Date(new Date().getFullYear(), 0, 0);
                const diff = (new Date() - start) + ((start.getTimezoneOffset() - new Date().getTimezoneOffset()) * 60 * 1000);
                const oneDay = 1000 * 60 * 60 * 24;
                const dayOfYear = Math.floor(diff / oneDay);

                const fallbackQuote = fallbackQuotes[dayOfYear % fallbackQuotes.length];
                const fallbackWithDate = { ...fallbackQuote, date: today }

                // Cache the fallback so it stays consistent for the day
                localStorage.setItem('daily_quote', JSON.stringify(fallbackWithDate))
                setQuoteData(fallbackWithDate)
            } finally {
                setLoading(false)
            }
        }

        fetchQuote()
    }, [])

    if (loading) {
        return (
            <div className="quote-widget">
                <div className="quote-shimmer">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    <span>Consulting the oracles...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="quote-widget">
            <div className="quote-icon">
                <span className="material-symbols-outlined">format_quote</span>
            </div>
            <blockquote className="quote-content">
                <p className="quote-text">"{quoteData?.quote}"</p>
                <footer className="quote-author">— {quoteData?.author}</footer>
            </blockquote>
            <div className="quote-glow"></div>
        </div>
    )
}

export default QuoteOfTheDay
