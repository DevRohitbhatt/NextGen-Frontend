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
    let date = new Date(value).toString();
    const day = date.substr(0, 3);
    date = new Date(value).toLocaleString('en-US');    
    const formattedDate = `${day}, ${date}`;
    setDateTime(formattedDate);
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
    let date = new Date(value).toString();
    const day = date.substr(0, 3);
    date = new Date(value).toLocaleDateString();    
    const formattedDate = `${day}, ${date}`;
    setDt(formattedDate);
  }, [value]);

  return (
    <TableCell key={cellIndex}>{dt}</TableCell>
  );
};
DateCell.propTypes = {
  cellIndex: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
};

export default function Cell({
  cellIndex,
  value,
  cellType
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
  } else return <TableCell key={cellIndex}>{value}</TableCell>;
}

Cell.propTypes = {
  cellIndex: PropTypes.number,
  value: PropTypes.any,
  cellType: PropTypes.string
};
