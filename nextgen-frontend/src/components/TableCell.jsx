import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const TableCell = styled.div`
  position: relative;
  font-size: 14px;
  justify-content: ${(props) =>
    props.columntype === "number" ? "center" : "left"};
  border-bottom: 1px solid ${(props) => props.theme.lightGrey};
  padding: 10px 0;
  height: 25px;
  overflow: hidden;
  display: flex;
  flex-direction: row;
`;

export const Input = styled.input`
  border: none;
  border-radius: 5px;
  font-size: 1em;
  text-align: ${(props) => (props.columntype === "number" ? "center" : "left")};
  overflow: hidden;
  white-space: nowrap;

  &:focus {
    outline: none;
    background-color: ${(props) => props.theme.lightGrey};
  }

  &:hover {
    background-color: ${(props) => props.theme.lightGrey};
  }
`;

const PercentSign = styled.span`
  font-size: 1em;
`;

const DollarSign = styled.span`
  font-size: 1em;
`;

const Dropdown = styled.select`
  width: 100%;
  border: none;
  border-radius: 5px;
  font-size: 1em;

  &:focus {
    outline: none;
  }

  &:hover {
    cursor: pointer;
    background-color: ${(props) => props.theme.lightGrey};
  }
`;

const PercentageCell = ({
  value,
  row,
  columnName,
  tableName,
  handleInputCellChange,
  columntype,
  isInput,
}) => {
  const [percentage, setPercentage] = useState(value);
  const inputRef = useRef(null);

  if (!isInput) {
    return (
      <TableCell columntype={columntype}>
        {value}
        <PercentSign>%</PercentSign>
      </TableCell>
    );
  }

  const handleInputChange = (e) => {
    // Allow only numbers 
    const numericValue = e.target.value.replace(/[^0-9.]/g, ""); 
    setPercentage(numericValue);
  };

  const updateInputWidth = () => {
    inputRef.current.style.width = `${inputRef.current.value.length}ch`;
  };

  useEffect(() => {
    setPercentage(value);
  }, [value]);

  useEffect(() => {
    updateInputWidth();
  }, [percentage]);
  return (
    <TableCell columntype={columntype}>
      <Input
        ref={inputRef}
        value={percentage}
        columntype={columntype}
        onChange={handleInputChange}
        onBlur={(e) => handleInputCellChange(e, row, columnName, tableName)}
      ></Input>
      <PercentSign>%</PercentSign>
    </TableCell>
  );
};
PercentageCell.propTypes = {
  value: PropTypes.number.isRequired,
  row: PropTypes.object.isRequired,
  columnName: PropTypes.string.isRequired,
  tableName: PropTypes.string.isRequired,
  handleInputCellChange: PropTypes.func.isRequired,
  columntype: PropTypes.string.isRequired,
  isInput: PropTypes.bool.isRequired,
};

const DollarCell = ({
  value,
  row,
  columnName,
  tableName,
  handleInputCellChange,
  columntype,
  isInput,
  isTotal
}) => {
  const [dollar, setDollar] = useState(value);
  const inputRef = useRef(null);

  if (!isInput) {
    return (
      <TableCell  className={isTotal ? "Total-row" : ""} columntype={columntype}>
        <DollarSign>$</DollarSign>
        {value}
      </TableCell>
    );
  }

  const handleInputChange = (e) => {
    setDollar(e.target.value);
  };

  const updateInputWidth = () => {
    inputRef.current.style.width = `${inputRef.current.value.length}ch`;
  };

  useEffect(() => {
    setDollar(value);
  }, [value]);

  useEffect(() => {
    updateInputWidth();
  }, [dollar]);
  return (
    <TableCell columntype={columntype}>
      <DollarSign>$</DollarSign>
      <Input
        ref={inputRef}
        value={dollar}
        columntype={columntype}
        onChange={handleInputChange}
        onBlur={(e) => handleInputCellChange(e, row, columnName, tableName)}
      ></Input>
    </TableCell>
  );
};
DollarCell.propTypes = {
  value: PropTypes.number.isRequired,
  row: PropTypes.object.isRequired,
  columnName: PropTypes.string.isRequired,
  tableName: PropTypes.string.isRequired,
  handleInputCellChange: PropTypes.func.isRequired,
  columntype: PropTypes.string.isRequired,
  isInput: PropTypes.bool.isRequired,
};

export default function Cell({
  value,
  cellType,
  row,
  columnName,
  columntype,
  isInput,
  handleInputCellChange,
  handleDropdownChange,
  tableName,
  isTotal
}) {
  if (cellType === "input") {
    return (
      <TableCell columntype={columntype} celltype={cellType} value={value}>
        <Input
          type="text"
          defaultValue={value.toString() !== "0" ? value : ""}
          columntype={columntype}
          onBlur={(e) => handleInputCellChange(e, row, columnName, tableName)}
        />
      </TableCell>
    );
  } else if (cellType === "percent") {
    return PercentageCell({
      value,
      row,
      columnName,
      tableName,
      handleInputCellChange,
      columntype,
      isInput,
    });
  } else if (cellType === "dollar") {
    return DollarCell({
      value,
      row,
      columnName,
      tableName,
      handleInputCellChange,
      columntype,
      isInput,
      isTotal
    });
  } else if (cellType === "dropdown") {
    //find the selected option based on the IsSelected property of the value array
    let selectedOption = value.find((option) => option.isSelected);
    if (!selectedOption) {
      selectedOption = value[0];
      value[0].isSelected = true;
    }
    return (
      <TableCell columntype={columntype}>
        <Dropdown
          onChange={(e) => handleDropdownChange(e, row, columnName, tableName)}
          defaultValue={selectedOption.option}
        >
          {value.map((option, index) => (
            <option key={index} value={option.prepType}>
              {option.option}
            </option>
          ))}
        </Dropdown>
      </TableCell>
    );
  } else return <TableCell   className={isTotal ? "Total-row" : ""} columntype={columntype}>{value}</TableCell>;
}

Cell.propTypes = {
  value: PropTypes.any,
  cellType: PropTypes.string,
  row: PropTypes.number,
  tableName: PropTypes.string,
  columnName: PropTypes.string,
  columntype: PropTypes.string,
  isInput: PropTypes.bool,
  handleInputCellChange: PropTypes.func,
  handleDropdownChange: PropTypes.func,
  isTotal:PropTypes.bool
};
