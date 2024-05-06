import React, { useState } from "react";
import styled from "styled-components";
import TreeNode from "./TreeNode";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import Cell from "./TableCell.jsx";

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StyledRow = styled.tr`
  &:nth-child(odd) {
    background-color: #f2f2f2;
  }
`;

const StyledCell = styled.td`
  padding: 8px;
`;

const StyledHeaderCell = styled.th`
  padding: 8px;
  width: 0px;
`;

const ToggleIcon = styled.span`
  cursor: pointer;
`;

const ButtonContainer = styled.div`
  margin-bottom: 10px;
`;

const Header=styled.thead`
font-weight: 500;
  font-size: 14px;
  height: 44px;
  border-bottom: ${(props) =>
    props.$useTableRows ? "none" : "2px solid " + props.theme.primary};
  padding: 10px 0;
  text-align: ${(props) => (props.columntype === "number" ? "center" : "left")};
`;

const MainBody=styled.tbody`
`;

const CollapseButton = styled.button`
  box-shadow: inset 0 0 0 2px #364790;
  transition: color 0.25s 0.0833333333s;
  position: relative;
  border-radius: 0px;
  width: 164px;
  margin-top: 18px;
  margin-right: 10px;

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
    border-color: #fff;
    transition: border-color 0s, width 0.25s, height 0.25s;
    width: 100%;
    height: 100%;
    transition-delay: 0s, 0.25s, 0s;
  }
  &:hover::before {
    border-color: #fff;
    transition: border-color 0s, width 0.25s, height 0.25s;
    width: 100%;
    height: 100%;
    transition-delay: 0s, 0s, 0.25s;
  }
  &:hover {
    border-color: transparent;
    color: #fff;
    background: #364790;
  }
`;
const ExpandButton = styled.button`
box-shadow: inset 0 0 0 2px #364790;
transition: color 0.25s 0.0833333333s;
position: relative;
border-radius: 0px;
width: 164px;
margin-top: 18px;
mar

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
  border-color: #fff;
  transition: border-color 0s, width 0.25s, height 0.25s;
  width: 100%;
  height: 100%;
  transition-delay: 0s, 0.25s, 0s;
}
&:hover::before {
  border-color: #fff;
  transition: border-color 0s, width 0.25s, height 0.25s;
  width: 100%;
  height: 100%;
  transition-delay: 0s, 0s, 0.25s;
}
&:hover {
  border-color: transparent;
  color: #fff;
  background: #364790;
}
`;
const TreeTable = ({ data, headers }) => {
  const [expandedNodes, setExpandedNodes] = useState({});

  const toggleNode = (node) => {
    const updatedExpandedNodes = { ...expandedNodes };
    updatedExpandedNodes[node.name] = !updatedExpandedNodes[node.name];
    setExpandedNodes(updatedExpandedNodes);
  };

  const handleEdit = (updatedNode) => {
    const updatedData = data.map((item) =>
      item.name === updatedNode.name ? updatedNode : item
    );
    // setData(updatedData);
  };

  const handleCollapseAll = () => {
    setExpandedNodes({});
  };

  const handleExpandAll = () => {
    const allExpandedNodes = {};
    data.forEach((node) => {
      allExpandedNodes[node.name] = true;
    });
    setExpandedNodes(allExpandedNodes);
  };

  console.log(data)
  return (
    <>
      <ButtonContainer>
        <CollapseButton onClick={handleCollapseAll}>Collapse All <MdKeyboardArrowUp/></CollapseButton>
        <ExpandButton onClick={handleExpandAll}>Expand All <MdKeyboardArrowDown/> </ExpandButton>
      </ButtonContainer>
      <StyledTable>
        <Header>
          <StyledRow>
            {headers.map((header, index) => (
              <StyledHeaderCell key={index}>{header}</StyledHeaderCell>
            ))}
          </StyledRow>
        </Header>
        <MainBody>
          {data.map((node, index) => (
            <TreeNode
              key={index}
              node={node}
              isExpanded={expandedNodes[node.name]}
              onToggleNode={toggleNode}
              headers={headers}
              onEdit={handleEdit}
              CellType="text"
            />
          ))}
        </MainBody>
      </StyledTable>
    </>
  );
};

export default TreeTable;
