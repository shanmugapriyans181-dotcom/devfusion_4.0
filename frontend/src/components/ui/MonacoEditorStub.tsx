import React from 'react';

const Editor: React.FC<any> = ({ value, onChange }) => {
  return (
    <textarea
      className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-green-400 rounded border border-gray-700 outline-none resize-none"
      value={value || ''}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder="// Write your code solution here..."
    />
  );
};

export default Editor;
