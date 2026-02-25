import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import './Contact.css';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export default function Contact() {
  const formRef = useRef(null);
  const navigate = useNavigate();

  const [status, setStatus]  = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [errMsg, setErrMsg]  = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      setErrMsg('EmailJS is not configured. Add the VITE_EMAILJS_* variables to your .env file.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrMsg('');
    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY);
      setStatus('success');
      formRef.current.reset();
    } catch (err) {
      setErrMsg(err?.text ?? 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-card">
        <button className="contact-back-btn" onClick={() => navigate(-1)} title="Go back">
          ← Back
        </button>

        <div className="contact-header">
          <div className="contact-icon">✉️</div>
          <h1>Contact Us</h1>
          <p>Have a question or feedback? We'd love to hear from you.</p>
        </div>

        {status === 'success' ? (
          <div className="contact-success">
            <span className="contact-success-icon">✅</span>
            <p>Message sent! We'll get back to you soon.</p>
            <button className="contact-btn" onClick={() => setStatus('idle')}>
              Send another
            </button>
          </div>
        ) : (
          <form ref={formRef} className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="contact-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Jane Smith"
                required
              />
            </div>

            <div className="contact-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="contact-field">
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="What is it about?"
                required
              />
            </div>

            <div className="contact-field">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Your message…"
                required
              />
            </div>

            {status === 'error' && (
              <p className="contact-error">{errMsg}</p>
            )}

            <button
              className="contact-btn"
              type="submit"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
