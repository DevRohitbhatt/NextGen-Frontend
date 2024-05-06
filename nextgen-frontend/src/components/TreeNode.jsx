import React from "react";
import styled from "styled-components";
import { SlArrowDown, SlArrowUp } from "react-icons/sl";
import EditableCell from "./EditableCell";

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

const DropdownCell = ({ value, options, onChange }) => {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

const TreeNode = ({ node, isExpanded, onToggleNode, headers, onEdit, CellType }) => {
  const hasChildren = node.children && node.children.length > 0;

  const toggleNode = () => {
    onToggleNode(node);
  };

  const handleEdit = (field, value) => {
    const updatedNode = { ...node, [field]: value };
    onEdit(updatedNode);
  };

  return (
    <>
      <StyledRow>
        <StyledCell colSpan={headers.length}>
          <ToggleIcon onClick={toggleNode}>
            {hasChildren && (isExpanded ? <SlArrowDown /> : <SlArrowUp />)}
          </ToggleIcon>
          {node.name}
        </StyledCell>
      </StyledRow>
      {isExpanded && hasChildren && (
        <>
          {node.children.map((childNode, index) => (
            <StyledRow key={index}>
              {Object.keys(childNode).map((property, propertyIndex) => (
                <StyledCell key={propertyIndex}>
                  {CellType === "text" ? (
                    <EditableCell
                      value={childNode[property]}
                      onSave={(value) => handleEdit(property, value)}
                    />
                  ) : CellType === "dropdown" ? (
                    <DropdownCell
                      value={childNode[property]}
                      options={["Option 1", "Option 2", "Option 3"]} // Example options array
                      onChange={(value) => handleEdit(property, value)}
                    />
                  ) : null}
                </StyledCell>
              ))}
            </StyledRow>
          ))}
        </>
      )}
    </>
  );
};

export default TreeNode;
