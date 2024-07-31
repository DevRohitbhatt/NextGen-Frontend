import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import styled from 'styled-components';

const TooltipWrapper = styled.div`
  gap: 5px;
  align-items: center;
  position: relative;
`;

const TooltipTip = styled.div`
  position: fixed; /* Changed to fixed for global positioning */
  border-radius: 4px;
  padding: 10px;
  color: ${(props) => props.theme.primary};
  background: ${(props) => props.theme.lightGrey};
  font-size: 14px;
  font-family: sans-serif;
  line-height: 1.2;
  z-index: 1000;
  max-width: 300px;
  word-wrap: break-word;
  white-space: normal;
  left: 50%;
  transform: translateX(-50%);
  white-space: normal;
`;

const Tooltip = ({ content, direction, delay, children }) => {
  let timeout;
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);
  const wrapperRef = useRef(null);

  const showTip = () => {
    timeout = setTimeout(() => {
      setActive(true);
    }, delay || 400);
  };

  const hideTip = () => {
    clearInterval(timeout);
    setActive(false);
  };

  useEffect(() => {
    if (tooltipRef.current && active) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
  
      let top, left;
      top = wrapperRect.top - tooltipRect.height - 10;
      
      if (direction === "right") {
        left = wrapperRect.left - tooltipRect.width - 10;
      } else if (direction === "left") {
        left = wrapperRect.left + wrapperRect.width + 10;
      }
      
      // Adjust left position if it goes beyond viewport
      if (left + tooltipRect.width > viewportWidth) {
        left = viewportWidth - tooltipRect.width - 10;
      }
      
      // Adjust left position if it goes off the screen on the left
      if (left < 0) {
        left = 10;
      }
  
      // Adjust top position if it goes beyond viewport
      if (top < 0) {
        top = wrapperRect.bottom + 10; // Position it below the parent element
      }
  
      tooltipRef.current.style.top = `${top}px`;
      tooltipRef.current.style.left = `${left}px`;
    }
  }, [active, direction]);

  const tooltipElement = (
    <TooltipTip ref={tooltipRef} direction={direction}>
      {content}
    </TooltipTip>
  );

  return (
    <TooltipWrapper ref={wrapperRef} onMouseEnter={showTip} onMouseLeave={hideTip}>
      {children}
      {active && ReactDOM.createPortal(tooltipElement, document.body)}
    </TooltipWrapper>
  );
};

export default Tooltip;
