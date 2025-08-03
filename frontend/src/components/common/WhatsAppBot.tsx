'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { FaWhatsapp, FaPaperPlane, FaTimes, FaComments, FaQuestionCircle, FaQrcode } from 'react-icons/fa';
import { getAllFaqs } from '@/services/faqService';
import { usePathname } from 'next/navigation';
import '@/app/styles/whatsapp-bot.css';

const WhatsAppBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'faq', or 'qr'
    const [faqs, setFaqs] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const chatRef = useRef(null);
    const overlayRef = useRef(null);
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER;
    const pathname = usePathname();
    
    // Check if current route is an admin route
    const isAdminRoute = pathname?.includes('/admin');

    useEffect(() => {
        // Don't fetch data for admin routes
        if (isAdminRoute) return;
        
        // Fetch FAQs from backend when component mounts
        const fetchFaqs = async () => {
            try {
                setLoading(true);
                const response = await getAllFaqs();
                setFaqs(response.data);
            } catch (error) {
                console.error('Error fetching FAQs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFaqs();
        
        // Generate QR code
        generateQRCode();
    }, [isAdminRoute]);

    // Generate QR code using qrcode library
    const generateQRCode = async () => {
        try {
            const dataUrl = await QRCode.toDataURL(`https://wa.me/${phoneNumber}`, {
                width: 128,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
            setQrCodeDataUrl(dataUrl);
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    };

    useEffect(() => {
        // Scroll to bottom of chat when messages update
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    const toggleBot = () => {
        if (isOpen) {
            closeBot();
        } else {
            setIsOpen(true);
            setIsClosing(false);
        }
    };

    const closeBot = () => {
        if (!isOpen) return;
        
        setIsClosing(true);
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 250); // Match this with the animation duration
    };

    const changeTab = (tab) => {
        setActiveTab(tab);
    };

    const handleFaqClick = (faq) => {
        // Add user question to chat
        setMessages([
            ...messages,
            { type: 'user', content: faq.question }
        ]);

        // Add bot answer after a small delay (feels more natural)
        setTimeout(() => {
            setMessages(prevMessages => [
                ...prevMessages,
                { type: 'bot', content: faq.answer }
            ]);
        }, 500);

        // Switch to chat tab to show the conversation
        setActiveTab('chat');
    };

    const handleInputChange = (e) => {
        setInputMessage(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!inputMessage.trim()) return;

        // Add user message to chat
        setMessages([
            ...messages,
            { type: 'user', content: inputMessage }
        ]);

        // Generate WhatsApp URL
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(inputMessage)}`;

        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');

        // Clear input field
        setInputMessage('');
    };

    // Don't render anything for admin routes
    if (isAdminRoute) {
        return null;
    }

    return (
        <div className="whatsapp-bot-container">
            {/* Floating Button */}
            <button
                className="whatsapp-bot-button"
                onClick={toggleBot}
                aria-label="WhatsApp Support"
            >
                <FaWhatsapp size={24} />
            </button>

            {/* Chat Overlay */}
            {isOpen && (
                <div 
                    ref={overlayRef}
                    className={`whatsapp-bot-overlay ${isClosing ? 'closing' : ''}`}
                >
                    <div className="whatsapp-bot-header">
                        <h3>WhatsApp Support</h3>
                        <button
                            className="close-button"
                            onClick={closeBot}
                            aria-label="Close"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="whatsapp-bot-tabs">
                        <button 
                            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
                            onClick={() => changeTab('chat')}
                        >
                            <FaComments /> <span>Chat</span>
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'faq' ? 'active' : ''}`}
                            onClick={() => changeTab('faq')}
                        >
                            <FaQuestionCircle /> <span>FAQs</span>
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'qr' ? 'active' : ''}`}
                            onClick={() => changeTab('qr')}
                        >
                            <FaQrcode /> <span>WhatsApp</span>
                        </button>
                    </div>

                    <div className="whatsapp-bot-body">
                        {/* Chat Messages */}
                        {activeTab === 'chat' && (
                            <div className="content-section">
                                <div className="chat-container" ref={chatRef}>
                                    {/* Welcome Message */}
                                    <div className="message bot-message">
                                        <p>👋 Hi there! How can I help you today?</p>
                                    </div>

                                    {/* Chat Messages */}
                                    {messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
                                        >
                                            <p>{message.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* FAQ Options */}
                        {activeTab === 'faq' && (
                            <div className="content-section">
                                <div className="faq-options">
                                    <h4>Frequently Asked Questions</h4>
                                    {loading ? (
                                        <p>Loading FAQs...</p>
                                    ) : (
                                        <ul>
                                            {faqs.map((faq) => (
                                                <li key={faq._id} onClick={() => handleFaqClick(faq)}>
                                                    {faq.question}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* QR Code */}
                        {activeTab === 'qr' && (
                            <div className="content-section">
                                <div className="qr-code-container">
                                    <h4>Scan to chat on WhatsApp</h4>
                                    {qrCodeDataUrl ? (
                                        <img 
                                            src={qrCodeDataUrl} 
                                            alt="WhatsApp QR Code" 
                                            width="120" 
                                            height="120" 
                                        />
                                    ) : (
                                        <p>Loading QR code...</p>
                                    )}
                                    <p className="qr-description">
                                        Scan this code with your phone camera to chat with us directly on WhatsApp.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Chat Input - always visible */}
                        <form className="chat-input-container" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={handleInputChange}
                                placeholder="Type your message..."
                                className="chat-input"
                            />
                            <button
                                type="submit"
                                className="send-button"
                                disabled={!inputMessage.trim()}
                            >
                                <FaPaperPlane size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WhatsAppBot; 