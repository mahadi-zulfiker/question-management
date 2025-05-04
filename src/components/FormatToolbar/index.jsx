import React from 'react';
import { FaBold, FaItalic, FaUnderline, FaPlus } from 'react-icons/fa';

const FormatToolbar = ({ onFormat, isVisible }) => {
  const toolbarStyle = {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    zIndex: 1000,
    display: isVisible ? 'flex' : 'none',
    gap: '8px',
  };

  const buttonStyle = {
    background: 'none',
    border: 'none',
    padding: '6px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#555',
    outline: 'none',
  };

  const hoverStyle = {
    backgroundColor: '#f0f0f0',
  };

  const handleClick = (format, event) => {
    onFormat(format, event);
  };

  return (
    <div style={toolbarStyle}>
      <button
        type="button"
        onClick={(e) => handleClick('bold', e)}
        style={{ ...buttonStyle, ':hover': hoverStyle }}
        title="Bold"
      >
        <FaBold />
      </button>
      <button
        type="button"
        onClick={(e) => handleClick('italic', e)}
        style={{ ...buttonStyle, ':hover': hoverStyle }}
        title="Italic"
      >
        <FaItalic />
      </button>
      <button
        type="button"
        onClick={(e) => handleClick('underline', e)}
        style={{ ...buttonStyle, ':hover': hoverStyle }}
        title="Underline"
      >
        <FaUnderline />
      </button>
      <button
        type="button"
        onClick={(e) => handleClick('math', e)}
        style={{ ...buttonStyle, ':hover': hoverStyle }}
        title="Math"
      >
        <FaPlus />
      </button>
    </div>
  );
};

export default FormatToolbar;