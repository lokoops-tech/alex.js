import React, { useState, useEffect } from 'react';
import './QuoteDashboard.css';

const QuoteDashboard = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulated API call - Replace with your actual API endpoint
        const fetchQuotes = async () => {
            try {
                // Replace this with your actual API call
                const response = await fetch('/api/quotes');
                const data = await response.json();
                setQuotes(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching quotes:', error);
                setLoading(false);
            }
        };

        fetchQuotes();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="quote-dashboard">
            <h2>Quote Dashboard</h2>
            <div className="quotes-container">
                {quotes.map((quote) => (
                    <div key={quote.id} className="quote-card">
                        <h3>Quote #{quote.id}</h3>
                        <p><strong>From:</strong> {quote.customerName}</p>
                        <p><strong>Date:</strong> {new Date(quote.date).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {quote.status}</p>
                        <p><strong>Amount:</strong> ${quote.amount}</p>
                        <div className="quote-actions">
                            <button onClick={() => handleApprove(quote.id)}>Approve</button>
                            <button onClick={() => handleDecline(quote.id)}>Decline</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuoteDashboard;