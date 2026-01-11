import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading,
  disabled,
  ...props 
}) => {
  const baseStyle = "px-4 py-2 font-medium text-sm transition-all duration-200 border-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-black text-white border-black hover:bg-white hover:text-black",
    secondary: "bg-white text-black border-black hover:bg-gray-100",
    outline: "bg-transparent text-black border-black border-dashed hover:bg-black hover:text-white hover:border-solid",
    ghost: "bg-transparent text-black border-transparent hover:bg-gray-100"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input 
    className={`w-full px-3 py-2 border-2 border-black bg-transparent focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-500 ${className}`}
    {...props}
  />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => (
  <textarea 
    className={`w-full px-3 py-2 border-2 border-black bg-transparent focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-500 resize-none ${className}`}
    {...props}
  />
);

export const Badge: React.FC<{ children: React.ReactNode; invert?: boolean }> = ({ children, invert }) => (
  <span className={`text-xs font-bold px-2 py-0.5 border border-black ${invert ? 'bg-black text-white' : 'bg-white text-black'}`}>
    {children}
  </span>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 cursor-pointer ${className}`}
  >
    {children}
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title?: string }> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white border-2 border-black w-full max-w-4xl max-h-[100dvh] md:max-h-[90vh] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center p-3 md:p-4 border-b-2 border-black bg-gray-50 select-none flex-shrink-0">
          <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-red-500 rounded-full border border-black cursor-pointer hover:bg-red-600" onClick={onClose}></div>
             <div className="w-3 h-3 bg-yellow-400 rounded-full border border-black hidden md:block"></div>
             <div className="w-3 h-3 bg-green-500 rounded-full border border-black hidden md:block"></div>
             <span className="ml-2 md:ml-3 font-mono text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest truncate max-w-[150px] md:max-w-none">{title || 'DETAILS'}</span>
          </div>
          <button onClick={onClose} className="hover:bg-black hover:text-white p-1 transition-colors border border-transparent hover:border-black rounded-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-0 overflow-hidden flex flex-col flex-1 relative">
          {children}
        </div>
      </div>
    </div>
  );
};