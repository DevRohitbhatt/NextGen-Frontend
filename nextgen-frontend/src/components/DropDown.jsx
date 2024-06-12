import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const MainContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  position: relative;
  border-radius: 20px;
  border: 2px solid #f0f0f0;
  background-color: transparent;
  color: #00000094;
  padding: 10px 30px;
  cursor: pointer;
  outline: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  white-space: nowrap;
  &:hover {
    border-color: ${(props) => props.theme.primary};
  }
`;

const DropdownList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  white-space: nowrap;
  max-height: 350px; /* Adjust this value as needed */
  overflow-y: scroll;
  padding: 0;
  margin: 0;
  list-style-type: none;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const DropdownItem = styled.li`
  padding: 10px 20px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const Label = styled.div`
  white-space: nowrap;
  font-size: 1.2em;
  font-weight: bold;
  margin-top: 5px;
`;

const DropdownArrow = styled.span`
  margin-left: 10px;
  transition: transform 0.3s ease;
  transform: ${(props) => (props.isOpen ? "rotate(180deg)" : "rotate(0deg)")};
  display: inline-block;
`;

const Dropdown = ({ options, selectedOption, onOptionChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (optionValue) => {
    onOptionChange(optionValue);
    setIsOpen(false);
  };
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <MainContainer ref={dropdownRef}>
      <Label>Select Vendor(s)</Label>
      <DropdownButton onClick={toggleDropdown}>
        {selectedOption}
        <DropdownArrow>
          {isOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
        </DropdownArrow>
      </DropdownButton>
      {isOpen && (
        <DropdownList>
          {options.map((option, index) => (
            <DropdownItem
              key={index}
              onClick={() => handleOptionClick(option.name)}
            >
              {option.name}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </MainContainer>
  );
};

Dropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  selectedOption: PropTypes.string.isRequired,
  onOptionChange: PropTypes.func,
};

export default Dropdown;
