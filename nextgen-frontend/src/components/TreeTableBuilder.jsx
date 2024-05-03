import React, { useState } from "react";
import styled from "styled-components";
import { SlArrowDown, SlArrowUp } from "react-icons/sl";

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
`;

const ToggleIcon = styled.span`
  cursor: pointer;
`;

const ButtonContainer = styled.div`
  margin-bottom: 10px;
`;

const CollapseButton = styled.button`
  margin-right: 10px;
`;

const ExpandButton = styled.button``;

const TreeNode = ({ node, isExpanded, onToggleNode, headers }) => {
  const hasChildren = node.children && node.children.length > 0;

  const toggleNode = () => {
    onToggleNode(node);
  };
  return (
    <>
      <StyledRow>
        <StyledCell>
          {hasChildren && (
            <ToggleIcon onClick={toggleNode}>
              {isExpanded ? <SlArrowDown /> : <SlArrowUp />}{" "}
            </ToggleIcon>
          )}
          {node.name}
        </StyledCell>
        <StyledCell>{node.InventoryDescription}</StyledCell>
        <StyledCell>{node.ItemDescription}</StyledCell>
        <StyledCell>{node.ItemRef}</StyledCell>
        <StyledCell>{node.ItemOrder}</StyledCell>
      </StyledRow>
      {isExpanded && hasChildren && (
        <>
          {node.children.map((childNode, index) => (
            <TreeNode
              key={index}
              node={childNode}
              isExpanded={childNode.isExpanded}
              onToggleNode={onToggleNode}
              headers={headers}
            />
          ))}
        </>
      )}
    </>
  );
};

const TreeTable = ({ data, headers }) => {
  const [expandedNodes, setExpandedNodes] = useState({});
  const toggleNode = (node) => {
    const updatedExpandedNodes = { ...expandedNodes };
    updatedExpandedNodes[node.name] = !updatedExpandedNodes[node.name];
    setExpandedNodes(updatedExpandedNodes);
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

  return (
    <>
      <ButtonContainer>
        <CollapseButton onClick={handleCollapseAll}>
          Collapse All
        </CollapseButton>
        <ExpandButton onClick={handleExpandAll}>Expand All</ExpandButton>
      </ButtonContainer>
      <StyledTable>
        <thead>
          <StyledRow>
            {headers.map((header, index) => (
              <StyledHeaderCell key={index}>{header}</StyledHeaderCell>
            ))}
          </StyledRow>
        </thead>
        <tbody>
          {data.map((node, index) => (
            <TreeNode
              key={index}
              node={node}
              isExpanded={expandedNodes[node.name]}
              onToggleNode={toggleNode}
              headers={headers}
            />
          ))}
        </tbody>
      </StyledTable>
    </>
  );
};

export default TreeTable;
