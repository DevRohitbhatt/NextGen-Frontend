import React, { useState, useEffect } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import Cell from "./TableCell.jsx";
import { InventoryItem } from "../components/DraggableInventoryItem.jsx";
import { propTypes } from "react-bootstrap/esm/Image.js";
import { column } from "stylis";
import { FaArrowDownWideShort, FaArrowUpShortWide } from "react-icons/fa6";
import TreeTable from "../components/TreeTableBuilder.jsx";
import Tooltip from "../components/ToolTip.jsx";
import { FcInfo } from "react-icons/fc";

const Container = styled.div`
  width: ${(props) => (props.width ? props.width : "auto")};
  height: ${(props) => (props.height ? props.height : "auto")};
  border-radius: 30px;
  padding: 0 20px;
  // margin-top: 26px;
  box-shadow: 0px 3px 20px -10px rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
`;
const Table = styled.div`
  border-radius: 30px;
  // margin-top: 26px;
  padding: ${(props) => (props.$scrollable ? "0 15px 0 0" : "15px")};
  display: grid;
  grid-template-columns: ${(props) =>
    props.columnwidths ? props.columnwidths : "auto"};
  grid-auto-rows: auto;
  align-items: center;

  overflow-y: ${(props) => (props.$scrollable ? "scroll" : "hidden")};

  &::-webkit-scrollbar {
    /* background: #ffffff; */
    width: 15px;
    /* height: 75%;
    cursor: pointer;
    border: 14px solid #fff;
    outline: 0.25px solid #808285;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px; */
  }

  &::-webkit-scrollbar-track-piece {
    background: #f1f1f1;
    border-radius: 30px;
  }

  &::-webkit-scrollbar-thumb {
    background: #364790;
    border-radius: 30px;
    padding: 18px !important;
    border: 2px solid #fff;
    cursor: pointer;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #508bff;
  }

  &::-webkit-scrollbar-button:start:decrement {
    height: 94px;
    display: block;
    background: transparent;
  }

  &::-webkit-scrollbar-button:end:increment {
    height: 20px;
    display: block;
    background: transparent;
  }

  h3 {
    margin-bottom: 20px;
    font-size: 1.75em;
  }
`;

const TableHeader = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 2.5fr;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid ${(props) => props.theme.primary};
`;

const TableHeaderCell = styled.div`
  font-weight: 500;
  font-size: 14px;
  height: 44px;
  border-bottom: ${(props) =>
    props.$useTableRows ? "none" : "2px solid " + props.theme.primary};
  padding: 10px 0;
  text-align: ${(props) => (props.columntype === "number" ? "center" : "left")};
  display: ${(props) => (props.$isSorting ? "flex" : "block")};
  
`;

const IconContainer = styled.div`
  margin-left: 5px; /* Adjust margin as needed */
  float: right;
`;

export default function TableBuilder({
  columnHeaders,
  classnames,
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
  scrollable = false,
  handleSorting,
  isSorting = false,
  headerTooltips,
  toolTipDirection
}) {
  const [sortColumnIndex, setSortColumnIndex] = useState(-1); // Initialize with -1 to indicate no column is sorted initially
  const [isAscending, setIsAscending] = useState(true);

if (isSorting) {
  useEffect(() => {
    handleSorting(sortColumnIndex, isAscending);
  }, [sortColumnIndex, isAscending]);
}
  
  const handleSort = (index) => {
    if (sortColumnIndex === index) {
      setIsAscending(!isAscending);
    } else {
      setIsAscending(true);
      setSortColumnIndex(index);
    }
  };
   return (
    <Container width={width} height={height}>
      <Table
        width={width}
        height={height}
        className={className}
        $scrollable={scrollable}
        columnwidths={columnwidths}
      >
        {usetablerows ? (
          <TableHeader columnwidths={columnwidths}>
            {columnHeaders.map((header, index) => (
              <TableHeaderCell
                key={index}
                columntype={dataTypes[index]}
                $useTableRows={usetablerows}
                $isSorting={isSorting}
                onClick={isSorting && (() => handleSort(index))}  // Call handleSort function on header click
                style={{ cursor: "pointer" }}
              >
                {header}
                {isSorting ? (
                  <IconContainer>
                    {sortColumnIndex === index ? (
                      isAscending ? (
                        <FaArrowUpShortWide />
                      ) : (
                        <FaArrowDownWideShort />
                      )
                    ) : (
                      <FaArrowDownWideShort /> // Default sorting icon
                    )}
                  </IconContainer>
                ) : null}
              </TableHeaderCell>
            ))}
          </TableHeader>
        ) : (
            columnHeaders.map((header, index) => (
              <TableHeaderCell key={index} columntype={dataTypes[index]} className={classnames && classnames.length > index ? classnames[index] : ''}>
                {
                  headerTooltips ? (headerTooltips[index] === "" ? (
                      <div> {header} </div>
                    ) :
                    (
                      toolTipDirection[index] === "left" ? (
                        <Tooltip content={headerTooltips[index]} direction="left">
                          <FcInfo /> {header}
                        </Tooltip>
                      ) : (
                        <Tooltip content={headerTooltips[index]} direction="left">
                          {header} <FcInfo />
                        </Tooltip>
                      )
                    )
                  ) : <div>{header}</div>
                }
              </TableHeaderCell>
            ))
        )}
        {rows.map((row, rowIndex) => {
          if (isDrag) {
            const key = row.inventoryItemID
              ? row.inventoryItemID
              : `fallback_${rowIndex}`;
            return (
              <InventoryItem
                key={key}
                rowIndex={row.inventoryItemID}
                tableName={tableName}
                description={row.description}
                inventoryItemID={row.inventoryItemID}
              />
            );
          }
          return (
            row &&
            row.map((cell, cellIndex) => (
              <Cell
                key={cellIndex}
                value={cell.value}
                columntype={dataTypes[cellIndex]}
                cellType={cell.cellType}
                isInput={cell.isInput}
                row={rowIndex}
                tableName={tableName}
                columnName={cell.columnName}
                handleInputCellChange={handleInputCellChange}
                handleDropdownChange={handleDropdownChange}
                isTotal={cell.isTotal}
              />
            ))
          );
        })}
      </Table>
    </Container>
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
  className: PropTypes.string,
  handleSorting:PropTypes.func,
  isSorting: PropTypes.bool,
  headerTooltips: PropTypes.array,
  toolTipDirection: PropTypes.array
};
