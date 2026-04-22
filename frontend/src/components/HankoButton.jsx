import React from 'react';
import './HankoButton.css';

const HankoButton = ({ onClick, children, className = '', disabledRef = false }) => {
  return (
    <button 
      className={`hanko-button ${className}`} 
      onClick={onClick}
      disabled={disabledRef}
    >
      <span className="ui-text">{children}</span>
    </button>
  );
};

export default HankoButton;
