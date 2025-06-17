import React from 'react';
import './Button.css'; // Import the component's CSS


const Button = ({ children, onClick, variant = 'primary', href, className = '' }) => {
  const Tag = href ? 'a' : 'button';
  const buttonProps = {
    className: `btn ${variant} ${className}`,
    onClick: onClick,
    [href ? 'href' : 'type']: href || 'button', // Use href for <a>, type for <button>
  };

  return (
    <Tag {...buttonProps}>
      {children}
    </Tag>
  );
};

export default Button;