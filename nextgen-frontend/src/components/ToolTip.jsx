import { useState, useRef, useEffect } from "react";
import styled from 'styled-components';

const TooltipWrapper = styled.div`
display: inline-block;
position: relative;
`;

const TooltipTip = styled.div`
  position: absolute;
  border-radius: 4px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px;
  border-radius: 15px;
  color:  ${(props) => props.theme.primary};
  background: ${(props) => props.theme.lightGrey};
  font-size: 14px;
  font-family: sans-serif;
  line-height: 1;
  z-index: 100;
  width: 300px;
  &:before {
    top: 100%;
    border-top-color: ${(props) => props.theme.lightGrey};
  }
`;

const Tooltip = ({content, direction, delay, children}) => {
  let timeout;
  const [active, setActive] = useState(false);
  const tooltipRef = useRef(null);

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
    if (tooltipRef.current) {
      const tooltipHeight = tooltipRef.current.offsetHeight;
      if (direction === "top") {
        tooltipRef.current.style.top = `calc(-30% - ${tooltipHeight}px)`;
      }
      if (direction === "left") {
        tooltipRef.current.style.top = `50px`;
        tooltipRef.current.style.left= `calc(-100% - 10px)`;
        tooltipRef.current.style.transform= `translateX(0) translateY(-50%)`;
      }
    }
  }, [active, direction]);

  return (
    <TooltipWrapper  onMouseEnter={showTip} onMouseLeave={hideTip} >
      {children}
      {active && (
        <TooltipTip  ref={tooltipRef} direction={direction}>
          {content}
        </TooltipTip>
      )}
    </TooltipWrapper>
  );
};

export default Tooltip;
