import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Modal from "./Modal";
import { InventoryItemsAPI } from "../apis/food-cost/InventoryItemsAPI";
import { toast } from "react-toastify";

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid ${(props) => props.theme.primary};
`;

const FormRowContainer = styled.div`
  display: flex;
  justify-content: start;
  width: 100%;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 90%;
  margin: 10px 20px;
`;

const Label = styled.div`
  font-size: 0.9em;
  font-weight: bold;
  white-space: nowrap;
`;

const Input = styled.input`
  all: unset;
  border-radius: 6px;
  padding: 5px 0px;
  font-size: 0.8em;
  text-align: center;
  width: 100%;
  border: 2px solid ${(props) => props.theme.lightGrey};
  transition: all 0.25s ease;

  &:focus {
    border: 2px solid ${(props) => props.theme.primary};
  }

  &:hover {
    border: 2px solid ${(props) => props.theme.primary};
  }

  &:disabled {
    background-color: ${(props) => props.theme.lightGrey};

    &:hover {
      border: 2px solid ${(props) => props.theme.lightGrey};
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: end;
  width: 100%;
  gap: 10px;
  margin: 10px;
`;

const DeleteButton = styled.button`
  all: unset;
  margin-top: 20px;
  padding: 10px 20px;
  border-radius: 20px;
  background-color: ${(props) => props.theme.error};
  color: white;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background-color: ${(props) => props.theme.redColor};
  }
`;

const SubmitButton = styled.button`
  all: unset;
  margin-top: 20px;
  padding: 10px 20px;
  border-radius: 20px;
  background-color: ${(props) => props.theme.primary};
  color: white;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background-color: ${(props) => props.theme.secondary};
  }
`;

export default function SetOrderLimitsModal({
  companyAndUnitData,
  isOpen,
  onClose,
  inventoryItemData,
  vendorItemData,
  itemOrderQuantities,
  orderLimits,
  setOrderLimits,
}) {
  const [inventoryItemOrderLimits, setInventoryItemOrderLimits] =
    useState(itemOrderQuantities);

  useEffect(() => {
    setInventoryItemOrderLimits(itemOrderQuantities);
  }, [itemOrderQuantities]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInventoryItemOrderLimits({ ...inventoryItemOrderLimits, [name]: value });
  };

  const handleSubmit = () => {
    let updatedOrderLimits = orderLimits.filter(
      (orderLimit) =>
        orderLimit.qsrInventoryItemID !== inventoryItemData.qsrInventoryItemID
    );
    updatedOrderLimits.push({
      qsrInventoryItemID: inventoryItemData.qsrInventoryItemID,
      minOrderQuantity: inventoryItemOrderLimits.minOrderQuantity,
      maxOrderQuantity: inventoryItemOrderLimits.maxOrderQuantity,
    });
    setOrderLimits(updatedOrderLimits);
    InventoryItemsAPI.updateInventoryItemOrderLimits(
      companyAndUnitData.companyID,
      companyAndUnitData.unitID,
      inventoryItemData.qsrInventoryItemID,
      inventoryItemOrderLimits.minOrderQuantity,
      inventoryItemOrderLimits.maxOrderQuantity
    ).catch((error) => {
      console.error(error);
      toast.error("Error updating order limits");
    });
    onClose();
  };

  const handleDelete = () => {
    let updatedOrderLimits = orderLimits.filter(
      (orderLimit) =>
        orderLimit.qsrInventoryItemID !== inventoryItemData.qsrInventoryItemID
    );
    setOrderLimits(updatedOrderLimits);
    InventoryItemsAPI.deleteInventoryItemOrderLimits(
      companyAndUnitData.companyID,
      companyAndUnitData.unitID,
      inventoryItemData.qsrInventoryItemID
    ).catch((error) => {
      console.error(error);
      toast.error("Error deleting order limits");
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Order Limits">
      <ModalContent>
        <FormSection>
          <FormRowContainer>
            <InputContainer>
              <Label>Inventory Item ID</Label>
              <Input
                type="text"
                name="inventoryItemId"
                value={inventoryItemData?.qsrInventoryItemID || ""}
                disabled
              />
            </InputContainer>
            <InputContainer>
              <Label>Description</Label>
              <Input
                type="text"
                name="inventoryItemName"
                value={inventoryItemData?.invItemDescription || ""}
                disabled
              />
            </InputContainer>
          </FormRowContainer>
          <FormRowContainer>
            <InputContainer>
              <Label>Minimum Order Limit</Label>
              <Input
                type="number"
                name="minOrderQuantity"
                value={inventoryItemOrderLimits?.minOrderQuantity || 0}
                onChange={handleInputChange}
              />
            </InputContainer>
            <InputContainer>
              <Label>Maximum Order Limit</Label>
              <Input
                type="number"
                name="maxOrderQuantity"
                value={inventoryItemOrderLimits?.maxOrderQuantity || 0}
                onChange={handleInputChange}
              />
            </InputContainer>
          </FormRowContainer>
        </FormSection>
        <FormSection>
          <FormRowContainer>
            <InputContainer>
              <Label>Currently Selected Vendor Item</Label>
              <Input
                type="text"
                name="vendorItemDescription"
                value={vendorItemData?.description || ""}
                disabled
              />
            </InputContainer>
          </FormRowContainer>
          <FormRowContainer>
            <InputContainer>
              <Label>Vendor Item UOM</Label>
              <Input
                type="text"
                name="vendorItemUOM"
                value={vendorItemData?.unitOfMeasure || ""}
                disabled
              />
            </InputContainer>
            <InputContainer>
              <Label>Vendor Item Mapping Multiplier</Label>
              <Input
                type="text"
                name="vendorItemPackSize"
                value={vendorItemData?.mappingQuantityMultiplier || ""}
                disabled
              />
            </InputContainer>
          </FormRowContainer>
          <FormRowContainer>
            <InputContainer>
              <Label>Vendor Item Mininum</Label>
              <Input
                type="text"
                name="Vendor Item Minimum"
                value={
                  inventoryItemOrderLimits?.minOrderQuantity /
                    (vendorItemData?.mappingQuantityMultiplier || 0) || ""
                }
                disabled
              />
            </InputContainer>
            <InputContainer>
              <Label>Vendor Item Maximum</Label>
              <Input
                type="text"
                name="Vendor Item Maximum"
                value={
                  inventoryItemOrderLimits?.maxOrderQuantity /
                    (vendorItemData?.mappingQuantityMultiplier || 0) || ""
                }
                disabled
              />
            </InputContainer>
          </FormRowContainer>
        </FormSection>
        <ButtonContainer>
          <DeleteButton onClick={handleDelete}>Delete</DeleteButton>
          <SubmitButton onClick={handleSubmit}>Save</SubmitButton>
        </ButtonContainer>
      </ModalContent>
    </Modal>
  );
}
