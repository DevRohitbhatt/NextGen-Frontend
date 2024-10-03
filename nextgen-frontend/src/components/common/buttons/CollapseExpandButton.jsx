import React from 'react';

const CollapseExpandButton = ({ isActive, onClick, children }) => {
  const baseStyles = "relative mx-auto w-[164px] rounded-none border-2 transition-colors duration-200 focus:outline-none";
  const activeStyles = isActive ? "bg-[var(--tw-primary)] text-white border-transparent" : "bg-white text-[var(--tw-primary)] border-transparent";
  
  const hoverStyles = "hover:after:border-white hover:before:border-white hover:after:w-full hover:after:h-full hover:before:w-full hover:before:h-full hover:after:transition-all hover:before:transition-all hover:after:duration-200 hover:before:duration-200";
  
  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${activeStyles} ${hoverStyles} 
        shadow-inner after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0 after:border-t-2 after:border-r-2 after:border-transparent
        before:content-[''] before:absolute before:bottom-0 before:right-0 before:w-0 before:h-0 before:border-b-2 before:border-l-2 before:border-transparent`}
    >
      {children}
    </button>
  );
};

export default CollapseExpandButton;