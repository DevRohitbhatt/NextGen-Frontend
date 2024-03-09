import React, { useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const SelectWrapper = styled.div`
  position: relative;
`;

const SelectBox = styled.select`
  width: 156px;
  height: 27px;
  background: #e6e7e8;
  border: none;
  padding-left: 7px;
  color: #000;
  font-weight: 500;
`;

// const DropdownIcon = styled.div`
//   position: absolute;
//   top: 7px;
//   right: 7px;
// `;

const YearSelector = ({ selectedYear, onChange }) => {
  const years = Array.from({ length: 10 }, (_, index) => selectedYear - 4 + index).reverse();

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    if (onChange) {
      onChange(year);
    }
  };

  return (  
    <SelectWrapper>
      <SelectBox value={selectedYear} onChange={handleYearChange}>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </SelectBox>
      {/* <DropdownIcon>&#9660;</DropdownIcon> */}
    </SelectWrapper>
  );
};

YearSelector.propTypes = {
  selectedYear: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default YearSelector;
