import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { SlArrowDown, SlArrowUp } from "react-icons/sl";
import PropTypes from "prop-types";
import { handleVendorItemChange, handleEdit } from "../functions/SuggestedOrderFunctions.jsx";

const TableCell = styled.div`
  position: relative;
  font-size: 14px;
  justify-content: ${(props) =>
    props.columntype === "number" ? "center" : "left"};
  border-bottom: 1px solid ${(props) => props.theme.lightGrey};
  padding: 10px 0;
  height: 25px;
  // overflow: hidden;
  display: flex;
  flex-direction: row;
  gap: 20px;
`;

const TableRow = styled.div`
  position: relative;
  align-items: center;
  font-size: 14px;
  justify-content: ${(props) =>
    props.columntype === "number" ? "center" : "left"};
  border-bottom: 1px solid ${(props) => props.theme.lightGrey};
  padding: 10px 0;
  // overflow: hidden;
  display: flex;
  flex-direction: row;
  gap: 20px;
`;

const StyledCell = styled.div`
  width: 100%;
  min-width: 145px;

  text-align: ${(props) =>
    props.columntype === "number" || props.columntype === "percent"
      ? "center"
      : "left"};
`;

const StyledCellParent = styled.div`
  width: 100%;
  margin-bottom: 10px;
  padding-bottom: 10px;
  font-weight: 500;
`;

const ToggleIcon = styled.span`
  cursor: pointer;
  padding-right: 20px;
`;

const Select = styled.select`
  width: 100%;
  border: none;
  background: #efefef;
  padding: 4px 8px;
  border-radius: 50px;
`;

const SlArrowUpIcon = styled(SlArrowUp)`
  font-weight: bold;
  margin-right: 10px;
  stroke: #000000;
  stroke-width: 10;
`;

const SlArrowDownIcon = styled(SlArrowDown)`
  font-weight: bold;
  margin-right: 10px;
  stroke: #000000;
  stroke-width: 10;
`;

const InputCell = styled.input`
  border: none;
  min-width: 142px;
  width: 100%;
  text-align: center;
`;
const DollarSign = styled.span`
  font-size: 1em;
`;
const PercentSign = styled.span`
  font-size: 1em;
`;
const EditableCell = ({ value, onChange, DataType }) => {
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    onChange(inputValue);
  };

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <>
      {DataType === "string" || DataType === "percent" ? (
        <InputCell
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
      ) : (
        <InputCell
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
      )}
    </>
  );
};

const DropdownCell = ({ value, options, onChange }) => {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((item, index) => (
        <option key={index} value={item.qsrItemID}>
          {item.description}
        </option>
      ))}
    </Select>
  );
};
const TreeNode = ({
  node: initialNode,
  isExpanded,
  onToggleNode,
  onEdit,
  columnWidths,
  isEditable,
  dataTypes,
  setQid
}) => {
  const [selectedVendorItems, setSelectedVendorItems] = useState([]);
  const [node, setNode] = useState(initialNode);
  
  useEffect(() => {
    setNode(initialNode);
  }, [initialNode]);
  const toggleNode = () => {
    onToggleNode(node);
  };

  const handleEditfield = async (field, value, index) => {
    try {
      const updatedNode = await handleEdit(
        field,
        value,
        index,
        node,
        selectedVendorItems,
        setSelectedVendorItems,
        onEdit,
        setQid
      );
      if (!updatedNode) {
        throw new Error('Failed to update node');
      }
      const updatedSuggestedOrderItem = node.suggestedOrderItem.map(item => {
        const updatedVendorItems = updatedNode.suggestedOrderItem.find(
          updatedItem => updatedItem.qsrInventoryItemID === item.qsrInventoryItemID
        ).vendorItems;
        return {
          ...item,
          vendorItems: item.vendorItems.map(vendorItem => {
            const updatedVendorItem = updatedVendorItems.find(
              updatedItem => updatedItem?.vendorItemReference === vendorItem.vendorItemReference
            );
            return updatedVendorItem ? updatedVendorItem : vendorItem;
          })
        };
      }); 

      const newNode = {
        ...node,
        suggestedOrderItem: updatedSuggestedOrderItem
      };
  
      setNode(newNode);
      onEdit(newNode);
  
    } catch (error) {
      console.error('Error updating node:', error);
    }
  };
  
  const handleVendorChange = (selectedQsrItemID, index) => {
    handleVendorItemChange(
      node,
      selectedQsrItemID,
      index,
      setSelectedVendorItems,
      onEdit
    );
  };

  const formatPercentage = (value) => {
    if (value && value !== "%" && value !== null && value !== "") {
      // Try to avoid string Checking issues
      try {
        if (value.endsWith("%")) {
          return value;
        }
      } catch (error) {
        // console.warn(error);
      }
      // setEditValue(value + "%");

      return value + "%";

      // if (value.endsWith("%")) {
      //   return value;
      // } else {
      //   return value + "%";
      // }
    } else {
      return "0%";
    }
  };

  useEffect(() => {
    const initialSelectedVendorItems = [];
    node.suggestedOrderItem.forEach((childNode, index) => {
      const defaultVendorItem = childNode.vendorItems.find(
        (vendorItem) => vendorItem.isSelected
      );
      initialSelectedVendorItems[index] = defaultVendorItem;
    });
    setSelectedVendorItems(initialSelectedVendorItems);
  }, [node]);
  return (
    <>
      <TableCell>
        <StyledCellParent>
          <ToggleIcon onClick={toggleNode}>
            {isExpanded ? <SlArrowUpIcon /> : <SlArrowDownIcon />}
            {node.name}
          </ToggleIcon>
        </StyledCellParent>
      </TableCell>
      { isExpanded &&
        node.suggestedOrderItem &&
        node.suggestedOrderItem.map((childNode, index) => (
          !childNode.isHidden ? (
            <TableRow key={index} columnWidths={columnWidths}>
              <StyledCell>{childNode.invItemDescription}</StyledCell>
              <StyledCell>
                {childNode.vendorItems && (
                  <DropdownCell
                    value={selectedVendorItems[index]?.qsrItemID || ""}
                    options={childNode.vendorItems}
                    onChange={(value) => handleVendorChange(value, index)}
                  />
                )}
              </StyledCell>
              {selectedVendorItems[index] && (
                <>
                  {isEditable[0] ? (
                    <EditableCell
                      value={selectedVendorItems[index].vendorItemReference}
                      onChange={(value) =>
                        handleEditfield("vendorItemReference", value, index)
                      }
                      DataType={dataTypes[2]}
                    />
                  ) : (
                    <StyledCell>
                      {selectedVendorItems[index].vendorItemReference}
                    </StyledCell>
                  )}
                  {isEditable[1] ? (
                    <EditableCell
                      value={selectedVendorItems[index].unitOfMeasure}
                      onChange={(value) =>
                        handleEditfield("unitOfMeasure", value, index)
                      }
                      DataType={dataTypes[3]}
                    />
                  ) : (
                    <StyledCell>
                      {selectedVendorItems[index].unitOfMeasure}
                    </StyledCell>
                  )}
                  {isEditable[2] ? (
                    <EditableCell
                      value={selectedVendorItems[index].packSize}
                      onChange={(value) =>
                        handleEditfield("packSize", value, index)
                      }
                      DataType={dataTypes[4]}
                    />
                  ) : (
                    <StyledCell>{selectedVendorItems[index].packSize}</StyledCell>
                  )}
                  {isEditable[3] ? (
                    <>
                      <DollarSign>$</DollarSign>
                      <EditableCell
                        value={selectedVendorItems[index].latestInvoicePrice}
                        onChange={(value) =>
                          handleEditfield("latestInvoicePrice", value, index)
                        }
                        DataType={dataTypes[5]}
                        style={{ textAlign: "center" }}
                      />
                    </>
                  ) : (
                    <StyledCell style={{ textAlign: "center" }}>
                      <DollarSign>$</DollarSign>
                      {selectedVendorItems[index].latestInvoicePrice}
                    </StyledCell>
                  )}
                  {isEditable[4] ? (
                    <>
                      <EditableCell
                        value={formatPercentage(
                          selectedVendorItems[index].safetyFactor
                        )}
                        onChange={(value) =>
                          handleEditfield("safetyFactor", value, index)
                        }
                        DataType={dataTypes[6]}
                      />
                    </>
                  ) : (
                    <StyledCell>
                      {selectedVendorItems[index].safetyFactor}
                      <PercentSign>%</PercentSign>
                    </StyledCell>
                  )}

                  {isEditable[5] ? (
                    <EditableCell
                      value={
                        selectedVendorItems[index].suggestedQty
                      }
                      onChange={(value) =>
                        handleEditfield("suggestedQty", value, index)
                      }
                      DataType={dataTypes[7]}
                    />
                  ) : (
                    <StyledCell columntype={dataTypes[7]}>
                      {selectedVendorItems[index].suggestedQty}
                    </StyledCell>
                  )}
                  {isEditable[6] ? (
                    <EditableCell
                      value={selectedVendorItems[index].onHandQty}
                      onChange={(value) =>
                        handleEditfield("onHandQty", value, index)
                      }
                      DataType={dataTypes[8]}
                    />
                  ) : (
                    <StyledCell>{selectedVendorItems[index].onHandQty}</StyledCell>
                  )}
                  {isEditable[7] ? (
                    <EditableCell
                    value={selectedVendorItems[index].orderQty}
                      // value={(
                      //   selectedVendorItems[index].suggestedQty -
                      //   selectedVendorItems[index].onHandQty
                      // ).toFixed(2)}
                      onChange={(value) =>
                        handleEditfield("orderQty", value, index)
                      }
                      DataType={dataTypes[9]}
                    />
                  ) : (
                    <StyledCell>
                      {selectedVendorItems[index].orderQty}
                    </StyledCell>
                  )}
                  {isEditable[8] ? (
                    <EditableCell
                    value={selectedVendorItems[index].extendedPrice}
                      // value={(selectedVendorItems[index].latestInvoicePrice * selectedVendorItems[index].orderQty).toFixed(2)}
                      onChange={(value) =>
                        handleEditfield("extendedPrice", value, index)
                      }
                      DataType={dataTypes[10]}
                    />
                  ) : (
                    <StyledCell columntype={dataTypes[10]}>
                      {selectedVendorItems[index].extendedPrice}
                    </StyledCell>
                  )}
                </>
              )}
            </TableRow>
          ) : null
        ))}
    </>
  );
};

TreeNode.propTypes = {
  node: PropTypes.object.isRequired,
  isExpanded: PropTypes.bool,
  onToggleNode: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  columnWidths: PropTypes.string,
  isEditable: PropTypes.arrayOf(PropTypes.bool).isRequired,
  dataTypes: PropTypes.array,
  setQid:PropTypes.func
};

export default TreeNode;
