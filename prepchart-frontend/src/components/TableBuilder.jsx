import styled from "styled-components";
import PropTypes from "prop-types";
import Cell from "./TableCell.jsx";
import { InventoryItem } from '../components/DraggableInventoryItem.jsx';
import { propTypes } from "react-bootstrap/esm/Image.js";

const Table = styled.div`
  width: ${(props) => (props.width ? props.width : "auto")};
  height: ${(props) => (props.height ? props.height : "auto")};
  border-radius: 30px;
  padding: 20px;
  // margin-top: 26px;
  box-shadow: 0px 3px 20px -10px rgba(0, 0, 0, 0.5);
  display: grid;
  grid-template-columns: ${(props) =>
    props.columnwidths ? props.columnwidths : "auto"};;
  grid-auto-rows: auto;
  align-items: center;
  h3 {
    margin-bottom: 20px;
    font-size: 1.75em;
  }
`;

const TableHeader = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 2.5fr;;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid ${(props) => props.theme.primary};
`;

const TableHeaderCell = styled.div`
  font-weight: bold;
  font-size: 1.2em;
  height: 50px;
  border-bottom: ${(props) => props.$useTableRows ? "none" : "2px solid " + props.theme.primary};
  padding: 10px 0;
  text-align: ${(props) => props.columntype === "number" ? "center" : "left"};
`;

const TableRow = styled.div`
  width: 100%;
  border-bottom: 1px solid ${(props) => props.theme.lightGrey};
  padding: 10px 0;
`;



export default function TableBuilder({
  columnHeaders,
  dataTypes,
  columnwidths,
  rows,
  tableName,
  width,
  height,
  isDrag = false,
  usetablerows = false,
  handleInputCellChange,
  handleDropdownChange,
  className,
}) {
  return (
    <Table width={width} height={height} className={className} columnwidths={columnwidths}> 
      {usetablerows ? (
        <TableHeader columnwidths={columnwidths}>
          {columnHeaders.map((header, index) => (
            <TableHeaderCell key={index} columntype={dataTypes[index]} $useTableRows={usetablerows}>{header}</TableHeaderCell>
          ))}
        </TableHeader>
      ) : (
        columnHeaders.map((header, index) => (
          <TableHeaderCell key={index} columntype={dataTypes[index]}>{header}</TableHeaderCell>
        ))
      )}
      {rows.map((row, rowIndex) => {

        if(isDrag){
          return <InventoryItem key={rowIndex} rowIndex={rowIndex} Description={row.Description} InventoryItemID={row.InventoryItemID}  ThawTime={row.ThawTime} />
        }
        console.log("testing")
       return   row && row.map((cell, cellIndex) => (
            <Cell key={cellIndex} value={cell.value} columntype={dataTypes[cellIndex]} cellType={cell.cellType} isInput={cell.isInput} row={rowIndex} tableName={tableName} columnName={cell.columnName} handleInputCellChange={handleInputCellChange} handleDropdownChange={handleDropdownChange}/>
          ))


          })}
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
  handleDropdownChange: PropTypes.func,
  isDrag: PropTypes.bool,
  usetablerows: PropTypes.bool,
  className:PropTypes.string

};
