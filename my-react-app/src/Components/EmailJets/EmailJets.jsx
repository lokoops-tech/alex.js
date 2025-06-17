import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const EmailJSTest = () => {
  const [testStatus, setTestStatus] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize EmailJS
    try {
      emailjs.init('6OvX4-mZfc9VVzXt5');
      setIsInitialized(true);
      console.log('EmailJS Test: Initialized successfully');
    } catch (error) {
      console.error('EmailJS Test: Initialization failed', error);
      setTestStatus('init_failed');
    }
  }, []);

  const testEmailSend = async () => {
    if (!isInitialized) {
      setTestStatus('not_initialized');
      return;
    }

    setTestStatus('sending');
    console.log('EmailJS Test: Starting test email send...');

    const testParams = {
      from_name: 'Test User',
      from_email: 'test@example.com',
      from_phone: '1234567890',
      project_type: 'residential',
      project_location: 'Test Location',
      project_budget: '100k-500k',
      project_timeline: '3-6months',
      project_description: 'This is a test email from the debugging component',
      to_name: 'Construction Team',
      reply_to: 'test@example.com',
    };

    console.log('EmailJS Test: Sending with params:', testParams);

    try {
      const response = await emailjs.send(
        'service_wqng82z',
        'template_x5mzkja',
        testParams
      );

      console.log('EmailJS Test: Success!', response);
      setTestStatus('success');
    } catch (error) {
      console.error('EmailJS Test: Failed!', error);
      console.log('Error details:', {
        status: error.status,
        text: error.text,
        message: error.message
      });
      setTestStatus('failed');
    }
  };

  const getStatusMessage = () => {
    switch (testStatus) {
      case 'sending':
        return { text: 'Sending test email...', color: 'blue' };
      case 'success':
        return { text: 'Test email sent successfully! ✅', color: 'green' };
      case 'failed':
        return { text: 'Test email failed! Check console for details. ❌', color: 'red' };
      case 'init_failed':
        return { text: 'EmailJS initialization failed! ❌', color: 'red' };
      case 'not_initialized':
        return { text: 'EmailJS not initialized yet! ⚠️', color: 'orange' };
      default:
        return { text: 'Ready to test', color: 'black' };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #ccc', 
      borderRadius: '8px', 
      margin: '20px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>EmailJS Debug Test</h3>
      <div style={{ marginBottom: '15px' }}>
        <strong>Initialization Status:</strong> {isInitialized ? '✅ Ready' : '❌ Not Ready'}
      </div>
      <div style={{ marginBottom: '15px', color: statusMessage.color }}>
        <strong>Test Status:</strong> {statusMessage.text}
      </div>
      <button 
        onClick={testEmailSend}
        disabled={!isInitialized || testStatus === 'sending'}
        style={{
          padding: '10px 20px',
          backgroundColor: isInitialized ? '#007bff' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isInitialized ? 'pointer' : 'not-allowed'
        }}
      >
        {testStatus === 'sending' ? 'Sending...' : 'Send Test Email'}
      </button>
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <strong>Instructions:</strong>
        <ul>
          <li>Open browser DevTools Console (F12)</li>
          <li>Click "Send Test Email" button</li>
          <li>Check console for detailed logs</li>
          <li>Check your email inbox for the test message</li>
        </ul>
      </div>
    </div>
  );
};

export default EmailJSTest;