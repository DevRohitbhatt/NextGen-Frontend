import React, { useState } from 'react';
import styled from 'styled-components';
import { MdKeyboardArrowRight, MdKeyboardArrowDown } from 'react-icons/md'; // Import the icons you want to use

const Title = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.5em;
  text-align: left;
  margin-top: 25px;
  margin-bottom: 25px;
`;

const ArrowButton = styled.div`
  margin-right: 10px;
  padding-top: 5px;
`;

const Content = styled.div`
  display: ${({ minimized }) => (minimized ? 'none' : 'block')};
`;

const MinimizableContainer = ({ title, children }) => {
  const [minimized, setMinimized] = useState(false);

  const toggleMinimized = () => {
    setMinimized(!minimized);
  };

  return (
    <div>
      <Title onClick={toggleMinimized}>
        {title}
        <ArrowButton>
          {minimized ? <MdKeyboardArrowRight /> : <MdKeyboardArrowDown />}
        </ArrowButton>
      </Title>
      <Content minimized={minimized}>{children}</Content>
    </div>
  );
};

export default MinimizableContainer;
