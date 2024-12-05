import React, { useState, useEffect } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { FaArrowDownWideShort, FaArrowUpShortWide } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";
import { TableCell as Cell, Tooltip } from "../index.js";

const InfoIcon = styled(FaInfoCircle)`
  color: ${(props) => props.theme.secondary};
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
  usetablerows = false,
  handleInputCellChange,
  handleDropdownChange,
  className,
  scrollable = false,
  handleSorting,
  isSorting = false,
  headerTooltips,
  toolTipDirection,
  onRowClick,
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

  const handleRowClick = (row) => {
    if (onRowClick) {
      onRowClick(row); // Pass the clicked row to the parent via the callback
    }
  };

  return (
    <div
      className={`${className} rounded-2xl p-5 ${
        scrollable ? "overflow-y-scroll" : "overflow-hidden"
      } shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]`}
      style={{ width, height }}
    >
      <div
        className={`rounded-2xl ${scrollable ? "p-3" : "p-4"} grid`}
        style={{ gridTemplateColumns: columnwidths }}
      >
        {usetablerows ? (
          <div className="w-full grid mb-2.5 pb-2.5 border-b-2 border-[var(--tw-primary)]">
            {columnHeaders.map((header, index) => (
              <div
                key={index}
                className={`font-medium text-sm h-11 ${
                  dataTypes[index] === "number" ? "text-center" : "text-left"
                } ${isSorting ? "flex items-center cursor-pointer" : "block"}`}
                onClick={isSorting ? () => handleSort(index) : undefined}
              >
                {header}
                {isSorting && (
                  <div className="ml-1 float-right">
                    {sortColumnIndex === index ? (
                      isAscending ? (
                        <FaArrowUpShortWide />
                      ) : (
                        <FaArrowDownWideShort />
                      )
                    ) : (
                      <FaArrowDownWideShort />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          columnHeaders.map((header, index) => (
            <div
              key={index}
              className={`font-medium text-md h-11 border-b-2 border-[var(--tw-primary)] ${
                classnames && classnames.length > index ? classnames[index] : ""
              } ${
                dataTypes[index] === "number"
                  ? "text-center justify-center"
                  : "text-left"
              }`}
            >
              {headerTooltips ? (
                headerTooltips[index] === "" ? (
                  <div>{header}</div>
                ) : toolTipDirection[index] === "left" ? (
                  <Tooltip
                    content={headerTooltips[index]}
                    direction="left"
                    styles={`${
                      dataTypes[index] === "number"
                        ? "text-center justify-center"
                        : "text-left"
                    }`}
                  >
                    <FaInfoCircle className="text-[var(--tw-secondary)] w-4 h-4 flex-shrink-0" />{" "}
                    {header}
                  </Tooltip>
                ) : (
                  <Tooltip content={headerTooltips[index]} direction="left">
                    {header} <InfoIcon className="text-[var(--tw-secondary)]" />
                  </Tooltip>
                )
              ) : (
                <div>{header}</div>
              )}
            </div>
          ))
        )}
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="contents cursor-pointer"
            onClick={() => handleRowClick(row)} // Add onClick event for the row
          >
            {row &&
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
              ))}
          </div>
        ))}
      </div>
    </div>
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
  usetablerows: PropTypes.bool,
  className: PropTypes.string,
  handleSorting: PropTypes.func,
  isSorting: PropTypes.bool,
  headerTooltips: PropTypes.array,
  toolTipDirection: PropTypes.array,
};
