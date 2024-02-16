import styled from "styled-components";
import PropTypes from "prop-types";

const Table = styled.div`
  width: ${(props) => (props.width ? props.width : "100%")};
  height: ${(props) => (props.height ? props.height : "auto")};
  border-radius: 30px;
  padding: 20px;
  margin: 10px;
  box-shadow: 0px 3px 20px -10px rgba(0, 0, 0, 0.5);

  h3 {
    margin-bottom: 20px;
    font-size: 1.75em;
  }
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: ${(props) =>
    props.columnwidths ? props.columnwidths : "auto"};
  width: 100%;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid ${(props) => props.theme.primary};
`;

const TableHeaderCell = styled.div`
  font-weight: bold;
  font-size: 1.2em;
  margin: 0 5px;
  text-align: ${(props) => props.columntype === "number" ? "center" : "left"};
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: ${(props) =>
    props.columnwidths ? props.columnwidths : "auto"};
  border-bottom: 1px solid ${(props) => props.theme.lightGrey};
  padding: 10px 0;
`;

const TableCell = styled.div`
  font-size: 1em;
  margin: 0 5px;
    //if value of cell is numeric center the text
    text-align: ${(props) => props.columntype === "number" ? "center" : "left"};
`;

export const Input = styled.input`
  width: 75%;
  padding: 5px 0;
  border: none;
  border-radius: 5px;
  font-size: 1em;
  text-align: ${(props) => props.columntype === "number" ? "center" : "left"};

  &:focus {
    outline: none;
    background-color: ${(props) => props.theme.lightGrey};
  }

  &:hover {
    cursor: pointer;
    background-color: ${(props) => props.theme.lightGrey};
  }
`;

const Dropdown = styled.select`
  width: 100%;
  border: none;
  border-radius: 5px;
  font-size: 1em;
  padding: 5px;

  &:focus {
    outline: none;
  }

  &:hover {
    cursor: pointer;
    background-color: ${(props) => props.theme.lightGrey};
  }
`;

const Cell = ({ value, cellType, row, columnName, columntype, handleOnChange, tableName }) => {
  if (cellType === "input")
    return (
      <TableCell columntype={columntype}>
        <Input type="text" defaultValue={value > 0 ? value : ""} columntype={columntype} onChange={(e) => handleOnChange(e, row, columnName, tableName)}/>
      </TableCell>
    );
  else if (cellType === "dropdown") {
    return (
      <TableCell columntype={columntype}>
        <Dropdown>
          {value.map((option, index) => (
            <option key={index} value={option.value}>
              {option.value}
            </option>
          ))}
        </Dropdown>
      </TableCell>
    );
  }
  else return <TableCell columntype={columntype}>{value}</TableCell>;
};

Cell.propTypes = {
  value: PropTypes.any,
  cellType: PropTypes.string,
  row: PropTypes.number,
  tableName: PropTypes.string,
  columnName: PropTypes.string,
  columntype: PropTypes.string,
  handleOnChange: PropTypes.func,
};

export default function TableBuilder({
  columnHeaders,
  dataTypes,
  columnwidths,
  rows,
  tableName,
  width,
  height,
  handleInputCellChange,
}) {
  return (
    <Table width={width} height={height}> 
      <TableHeader columnwidths={columnwidths}>
        {columnHeaders.map((header, index) => (
          <TableHeaderCell key={index} columntype={dataTypes[index]}>{header}</TableHeaderCell>
        ))}
      </TableHeader>
      {rows.map((row, rowIndex) => (
        <TableRow key={rowIndex} columnwidths={columnwidths}>
          {row && row.map((cell, cellIndex) => (
            <Cell key={cellIndex} value={cell.value} columntype={dataTypes[cellIndex]} cellType={cell.cellType} row={rowIndex} tableName={tableName} columnName={cell.columnName} handleOnChange={handleInputCellChange}/>
          ))}
        </TableRow>
      ))}
    </Table>
  );
}

TableBuilder.propTypes = {
  props: PropTypes.object,
  columnHeaders: PropTypes.array,
  dataTypes: PropTypes.array,
  columnwidths: PropTypes.string,
  rows: PropTypes.array,
  tableName: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  handleInputCellChange: PropTypes.func,
};
