import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
} from "react-icons/fa"; // Importing icons from react-icons

const PopupContainer = styled.div`
  position: fixed;
  top: 20%;
  right: 30px; /* Adjust the distance from the right side */
  transform: translateY(-50%);
  background-color: #d7e5ff;
  border: 1px solid #cccccc;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  opacity: ${(props) => props.opacity};
  transition: opacity 1s ease-in-out;
  min-width: 200px; /* Set minimum width to 200px */
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const Icon = styled.div`
  margin-right: 10px;
`;

const Title = styled.h2`
  color: ${(props) => {
    switch (props.type) {
      case "Success":
        return props.theme.greenColor; 
      case "Error":
        return props.theme.redColor; 
      case "Warning":
        return props.theme.orangeColor; 
      default:
        return "#000000";
    }
  }};
  font-size: 24px;
  font-weight: bold;
  margin: 0; 
  margin-top: -5px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  cursor: pointer;
`;

const Content = styled.div`
  margin-top: 0px;
`;

const ProgressBar = styled.div`
  width: ${(props) => props.progress}%;
  height: 5px;
  background-color: ${(props) => {
    switch (props.type) {
      case "Success":
        return "#2ecc71"; // Green color for success
      case "Error":
        return "#e74c3c"; // Red color for error
      case "Warning":
        return "#f39c12"; // Orange color for warning
      default:
        return "#007bff"; // Blue color for default
    }
  }};
  border-radius: 2px;
  transition: width 1s linear;
`;

const MessagePopup = ({ type, message, onClose }) => {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!hovering) {
        setProgress((prevProgress) => prevProgress - 1);
      }
    }, 100); // Update progress every 300 milliseconds

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setVisible(false); // Auto-hide after 30 seconds
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [hovering]);

  useEffect(() => {
    if (progress <= 10) {
      setOpacity(0.1);
    } else {
      setOpacity(1);
    }
    if (progress === 0) {
      setVisible(false);
    }
  }, [progress]);

  const handleMouseEnter = () => {
    setHovering(true);
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setHovering(false);
  };

  const getIcon = () => {
    switch (type) {
      case "Success":
        return <FaCheckCircle size={24} color="#008000" />;
      case "Error":
        return <FaTimesCircle size={24} color="#FF0000" />;
      case "Warning":
        return <FaExclamationCircle size={24} color="#FFA500" />;
      default:
        return null;
    }
  };

  return (
    <PopupContainer
      type={type}
      opacity={visible ? opacity : "0"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Header>
        <Icon>{getIcon()}</Icon>
        <Title type={type}>{type}</Title>
      </Header>
      <CloseButton onClick={onClose}>X</CloseButton>
      <Content>
        <p>{message}</p>
      </Content>
      <ProgressBar type={type} progress={progress} />
    </PopupContainer>
  );
};

export default MessagePopup;
