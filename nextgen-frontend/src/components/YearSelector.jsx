import React, { useRef } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { AiFillDownSquare } from "react-icons/ai";

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const CustomSelect = styled.div`
  width: 154px;
  height: 29px;
  background: #e6e7e8;
  border: none;
  padding: 0 7px;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-size: 14px;
`;

const SelectOverlay = styled.select`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;

const Icon = styled.div`
  position: absolute;
  top: 0px;
  right: -2px;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 35px;
  color: #364790;
  cursor: pointer;
`;

const YearSelector = ({ selectedYear, onChange }) => {
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

const selectRef = useRef(null);
const handleYearChange = (e) => onChange(parseInt(e.target.value));
const handleIconClick = () => selectRef.current.click();

  return (
    <Wrapper>
      <CustomSelect onClick={handleIconClick}>
        {selectedYear}
        <Icon>
          <AiFillDownSquare />
        </Icon>
      </CustomSelect>
      <SelectOverlay
        ref={selectRef}
        value={selectedYear}
        onChange={handleYearChange}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </SelectOverlay>
    </Wrapper>
  );
};

YearSelector.propTypes = {
  selectedYear: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default YearSelector;
