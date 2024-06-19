import React, { useState, useEffect } from "react";
import styled from "styled-components";
import TreeNode from "./TreeNode";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import PropTypes from "prop-types";

const StyledTable = styled.div`
border-radius: 30px;
padding: ${(props) => (props.$scrollable ? "0 15px 0 0" : "15px")};
display: grid;
grid-template-columns: ${(props) =>
  props.columnWidths ? props.columnWidths : "auto"}; // Use the prop here
grid-auto-rows: auto;
align-items: center;

  overflow-y: ${(props) => (props.$scrollable ? "scroll" : "hidden")};

  &::-webkit-scrollbar {
    width: 15px;
  }

  &::-webkit-scrollbar-track-piece {
    background: #f1f1f1;
    border-radius: 30px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.primary};
    border-radius: 30px;
    padding: 18px !important;
    cursor: pointer;
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

const ButtonContainer = styled.div`
  margin-bottom: 10px;
`;
const TableHeader = styled.div`
  width: 100%;
  display: flex;
  gap:20px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid ${(props) => props.theme.primary};
`;

const TableHeaderCell = styled.div`
  font-weight: 500;
  font-size: 14px;
  // height: 44px;
  padding: 10px 0;
  width: 100%;

`;
const CollapseButton = styled.button`
  box-shadow: inset 0 0 0 2px ${(props) => props.theme.primary};
  transition: color 0.25s 0.0833333333s;
  position: relative;
  border-radius: 0px;
  width: 164px;
  margin-top: 18px;
  margin-right: 10px;
  background-color: ${(props) => props.isActive ? props.theme.primary : props.theme.White};
  color: ${(props) => props.isActive ? props.theme.white : props.theme.primary};

  &::after {
    border: 0 solid transparent;
    box-sizing: border-box;
    content: "";
    pointer-events: none;
    position: absolute;
    width: 0;
    height: 0;
    bottom: 0;
    right: 0;
    border-top-width: 2px;
    border-right-width: 2px;
  }
  &::before {
    border: 0 solid transparent;
    box-sizing: border-box;
    content: "";
    pointer-events: none;
    position: absolute;
    width: 0;
    height: 0;
    bottom: 0;
    right: 0;
    border-bottom-width: 2px;
    border-left-width: 2px;
  }
  &:hover::after {
    border-color: ${(props) => props.theme.white};
    transition: border-color 0s, width 0.25s, height 0.25s;
    width: 100%;
    height: 100%;
    transition-delay: 0s, 0.25s, 0s;
  }
  &:hover::before {
    border-color: ${(props) => props.theme.white};
    transition: border-color 0s, width 0.25s, height 0.25s;
    width: 100%;
    height: 100%;
    transition-delay: 0s, 0s, 0.25s;
  }
  &:hover {
    border-color: transparent;
    color: ${(props) => props.theme.white};
    background: ${(props) => props.theme.primary};
  }
`;
const ExpandButton = styled.button`
  box-shadow: inset 0 0 0 2px #364790;
  transition: color 0.25s 0.0833333333s;
  position: relative;
  border-radius: 0px;
  width: 164px;
  margin-top: 18px;
 &::after {
    border: 0 solid transparent;
    box-sizing: border-box;
    content: "";
    pointer-events: none;
    position: absolute;
    width: 0;
    height: 0;
    bottom: 0;
    right: 0;
    border-top-width: 2px;
    border-right-width: 2px;
  }
  &::before {
    border: 0 solid transparent;
    box-sizing: border-box;
    content: "";
    pointer-events: none;
    position: absolute;
    width: 0;
    height: 0;
    bottom: 0;
    right: 0;
    border-bottom-width: 2px;
    border-left-width: 2px;
  }
  &:hover::after {
    border-color: ${(props) => props.theme.White};
    transition: border-color 0s, width 0.25s, height 0.25s;
    width: 100%;
    height: 100%;
    transition-delay: 0s, 0.25s, 0s;
  }
  &:hover::before {
    border-color:${(props) => props.theme.White};
    transition: border-color 0s, width 0.25s, height 0.25s;
    width: 100%;
    height: 100%;
    transition-delay: 0s, 0s, 0.25s;
  }
  &:hover {
    border-color: transparent;
    color: ${(props) => props.theme.White};
    background: ${(props) => props.theme.DarkBlue};
  }
`;

export default function TreeTable ({ data:initialData, columnHeaders, dataTypes }) {
  const [expandedNodes, setExpandedNodes] = useState({});
  const [isCollapseActive, setIsCollapseActive] = useState(false);
  const [isExpandActive, setIsExpandActive] = useState(false);
  const [data, setData] = useState(initialData);

  useEffect(() => {
    setIsCollapseActive(true);
    setIsExpandActive(false);
  }, []);

  const toggleNode = (node) => {
    const updatedExpandedNodes = { ...expandedNodes };
    updatedExpandedNodes[node.name] = !updatedExpandedNodes[node.name];
    setExpandedNodes(updatedExpandedNodes);
  };

  const handleEdit = (updatedNode) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.name === updatedNode.name ? updatedNode : item
      )
    );
  };

  const handleCollapseAll = () => {
    setExpandedNodes({});
    setIsCollapseActive(true);
    setIsExpandActive(false);
  };

  const handleExpandAll = () => {
    const allExpandedNodes = {};
    data.forEach((node) => {
      allExpandedNodes[node.name] = true;
    });
    setExpandedNodes(allExpandedNodes);
    setIsCollapseActive(false);
    setIsExpandActive(true);
  };

  const isEditableArray = [false, false, false, false, true, false, true, true, false];

  console.log(dataTypes);
  return (
    <>
      <ButtonContainer>
        <CollapseButton
          isActive={isCollapseActive}
          onClick={handleCollapseAll}
        >
          Collapse All <MdKeyboardArrowDown />
        </CollapseButton>
        <CollapseButton
          isActive={isExpandActive}
          onClick={handleExpandAll}
        >
          Expand All <MdKeyboardArrowUp />
        </CollapseButton>
      </ButtonContainer>
      <StyledTable>
        <TableHeader className="Header">
          {columnHeaders.map((header, index) => (
            <TableHeaderCell key={index} columntype={dataTypes[index]}>
              {header}
            </TableHeaderCell>
          ))}
        </TableHeader>
        {data.map((node, index) => (
          <TreeNode
            key={index}
            node={node}
            isExpanded={expandedNodes[node.name]}
            onToggleNode={toggleNode}
            headers={columnHeaders}
            onEdit={handleEdit}
            isEditable={isEditableArray}
            dataTypes={dataTypes}
          />
        ))}
      </StyledTable>
    </>
  );
}

TreeTable.propTypes = {
  columnHeaders: PropTypes.array,
  dataTypes: PropTypes.array,
  columnWidths: PropTypes.string,
  data: PropTypes.array
};