import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const TableCell = styled.td`
  padding: 8px;
`;

const DateTimeCell = ({
  cellIndex,
  value
}) => {
  const [dateTime, setDateTime] = useState(value);
  
  useEffect(() => {
    if(value) {
    let date = new Date(value).toString();
    const day = date.substr(0, 3);
    date = new Date(value).toLocaleString('en-US');    
    const formattedDate = `${day}, ${date}`;
    setDateTime(formattedDate);
    }
    else {
      setDateTime("");
    }
  }, [value]);

  return (
    <TableCell key={cellIndex}>{dateTime}</TableCell>
  );
};
DateTimeCell.propTypes = {
  cellIndex: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
};

const DateCell = ({
  cellIndex,
  value
}) => {
  const [dt, setDt] = useState(value);
  
  useEffect(() => {
    if (value) {
      let date = new Date(value).toString();
      const day = date.substr(0, 3);
      date = new Date(value).toLocaleDateString();    
      const formattedDate = `${day}, ${date}`;
      setDt(formattedDate);
    }
    else {
      setDt("");
    }
  }, [value]);

  return (
    <TableCell key={cellIndex}>{dt}</TableCell>
  );
};
DateCell.propTypes = {
  cellIndex: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
};

const DropdownCell = ({
  cellIndex,
  value,
  row
}) => {

  const options = value.options;
  const selected = options.find((option) => option.isSelected).value;

  // Create a wrapped onChange function that captures the row parameter
  const handleChange = (e) => {
    if (value.onChange) {
      value.onChange(e, row);
    }
  };

  return (
    <TableCell key={cellIndex}>
      <select defaultValue={selected} onChange={handleChange} onClick={(e) => { e.stopPropagation(); }}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.value}
          </option>
        ))}
      </select>
    </TableCell>
  );
};


export default function Cell({
  cellIndex,
  value,
  cellType,
  row
}) {
  if (cellType === "dateTime") {
    return DateTimeCell({
      cellIndex,
      value      
    });
  } else if (cellType === "date") {
    return DateCell({
      cellIndex,
      value
    });
  } else if (cellType === "dropdown") {
    return DropdownCell({
      cellIndex,
      value,
      row
    });
  } else return <TableCell key={cellIndex}>{value}</TableCell>;
}

Cell.propTypes = {
  cellIndex: PropTypes.number,
  value: PropTypes.any,
  cellType: PropTypes.string
};
