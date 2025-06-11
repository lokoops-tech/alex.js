// src/config/emailjsConfig.js
// EmailJS Configuration - Replace with your actual credentials

export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_h2rr33c',      // e.g., 'service_abc123'
  TEMPLATE_ID: 'template_9ougvmb',    // e.g., 'template_xyz789'
  PUBLIC_KEY: '6OvX4-mZfc9VVzXt5',      // e.g., 'user_ABCdef123456'
};

// Optional: Initialize EmailJS with your public key
import emailjs from '@emailjs/browser';

export const initEmailJS = () => {
  emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
};