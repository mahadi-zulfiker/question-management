import React from 'react';

const FormatToolbar = ({ position, onFormat }) => {
  if (!position) return null;

  const toolbarStyle = {
    position: 'absolute',
    left: position.x,
    top: position.y - 40, // Position above the selection
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '5px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    zIndex: 1000,
  };

  return (
    <div style={toolbarStyle}>
      <button
        type="button"
        onClick={(e) => onFormat('bold', e)}
        className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded mr-1"
      >
        Bold
      </button>
      <button
        type="button"
        onClick={(e) => onFormat('italic', e)}
        className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded mr-1"
      >
        Italic
      </button>
      <button
        type="button"
        onClick={(e) => onFormat('underline', e)}
        className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded mr-1"
      >
        Underline
      </button>
      <button
        type="button"
        onClick={(e) => onFormat('math', e)}
        className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
      >
        Math
      </button>
    </div>
  );
};

export default FormatToolbar;