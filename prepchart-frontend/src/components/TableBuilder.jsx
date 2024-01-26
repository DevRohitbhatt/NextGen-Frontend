import styled from "styled-components";
import PropTypes from "prop-types";

const Table = styled.div`
  width: ${(props) => (props.width ? props.width : "100%")};
  border-radius: 30px;
  padding: 20px;
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
`;

export const Input = styled.input`
  width: 75%;
  padding: 5px 0;
  border: none;
  border-radius: 5px;
  font-size: 1em;

  &:focus {
    outline: none;
    background-color: ${(props) => props.theme.lightGrey};
  }

  &:hover {
    cursor: pointer;
    background-color: ${(props) => props.theme.lightGrey};
  }
`;

const Cell = ({ value, cellType }) => {
  console.log(value);
  if (cellType === "input")
    return (
      <TableCell>
        <Input type="text" defaultValue={value > 0 ? value : ""} />
      </TableCell>
    );
  else return <TableCell>{value}</TableCell>;
};

Cell.propTypes = {
  value: PropTypes.any,
  cellType: PropTypes.string,
};

export default function TableBuilder({
  columnHeaders,
  columnwidths,
  rows,
  width,
}) {
  console.log(columnwidths);

  return (
    <Table width={width}>
      <TableHeader columnwidths={columnwidths}>
        {columnHeaders.map((header, index) => (
          <TableHeaderCell key={index}>{header}</TableHeaderCell>
        ))}
      </TableHeader>
      {rows.map((row, index) => (
        <TableRow key={index} columnwidths={columnwidths}>
          {row.map((cell, index) => (
            <Cell key={index} value={cell.value} cellType={cell.cellType} />
          ))}
        </TableRow>
      ))}
    </Table>
  );
}

TableBuilder.propTypes = {
  props: PropTypes.object,
  columnHeaders: PropTypes.array,
  columnwidths: PropTypes.string,
  rows: PropTypes.array,
  width: PropTypes.string,
};
