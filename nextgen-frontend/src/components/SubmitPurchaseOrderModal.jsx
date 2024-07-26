import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import styled from "styled-components";
import Modal from "./Modal";
import SimpleTable from "./SimpleTable";
import * as SuggestedOrderFunctions from "../functions/SuggestedOrderFunctions";
import { toast, ToastContainer } from "react-toastify";
import { SuggestedOrderAPI } from "../apis/food-cost/SuggestedOrderAPI";
import { notify } from "../functions/utils/GlobalToastProvider";

const SubmitModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 27px;
`;

const SubmitModalBody = styled.div`
  padding: 0px 14px;
`;

const FormRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 20px;
  align-items: center;
`;

const SubmitModalText = styled.div``;

const SubmitModalButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const LeftButton = styled.div`
  all: unset;
  margin-left: 10px;
  padding: 5px 10px;
  border-radius: 20px 0 0 20px;
  border: 2px solid ${(props) => props.theme.primary};
  color: ${(props) => props.theme.primary};
  position: relative;
  cursor: pointer;
  transition: all 0.25s ease;

  ${(props) =>
    props.$isSelected &&
    `
    background-color: ${props.theme.primary};
    color: white;
  `}
`;

const RightButton = styled.div`
  all: unset;
  padding: 5px 10px;
  border-radius: 0 20px 20px 0;
  border: 2px solid ${(props) => props.theme.primary};
  color: ${(props) => props.theme.primary};
  position: relative;
  cursor: pointer;
  transition: all 0.25s ease;

  ${(props) =>
    props.$isDisabled &&
    `
    background-color: ${props.theme.grayColor};
    color: ${props.theme.grey};
    cursor: not-allowed;
  `}

  ${(props) =>
    props.$isSelected &&
    `
    background-color: ${props.theme.primary};
    color: white;
  `}
`;

const SubmitButton = styled.button`
  all: unset;
  padding: 10px 20px;
  border-radius: 15px;
  border: 2px solid ${(props) => props.theme.primary};
  color: ${(props) => props.theme.primary};
  position: relative;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background-color: ${(props) => props.theme.primary};
    border: 2px solid ${(props) => props.theme.primary};
    color: white;
  }
`;

export default function SubmitPurchaseOrderModal({
  isOpen,
  onClose,
  orderData,
}) {
  const [isPDFSelected, setIsPDFSelected] = useState(true);
  const [isCSVSelected, setIsCSVSelected] = useState(false);
  const [isVendorItemRefSelected, setIsVendorItemRefSelected] = useState(true);
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const navigate = useNavigate();
  const toastRef = useRef(null);

  useEffect(() => {
    if (orderData.suggestedOrderDetails.length === 0) return;
    const data = formatPreviewData(orderData.suggestedOrderDetails);
    setOrderDetails(data);
  }, [orderData, isOpen]);

  useEffect(() => {
    if (orderDetails.length > 0) {
      setIsPreviewLoaded(true);
    } else {
      setIsPreviewLoaded(false);
    }
  }, [orderDetails]);

  const tableHeaders = [
    {
      key: "vendorItemDescription",
      label: "Item Description",
      cellType: "string",
    },
    { key: "vendorItemReference", label: "Item Ref", cellType: "string" },
    { key: "vendorItemUOM", label: "Order Unit", cellType: "string" },
    { key: "vendorItemPackSize", label: "Pack Size", cellType: "string" },
    { key: "quantity", label: "Order Amount", cellType: "string" },
  ];

  const formatPreviewData = (data) => {
    var returnArray = [];
    data.map((detail) => {
      detail.suggestedOrderItem.map((inventoryItem) => {
        const selectedVendorItem = inventoryItem.vendorItems.find(
          (vendorItem) => vendorItem.isSelected
        );
        if (selectedVendorItem.orderQty > 0) {
          returnArray.push({
            vendorItemDescription: selectedVendorItem.description,
            vendorItemReference: selectedVendorItem.vendorItemReference,
            vendorItemUOM: selectedVendorItem.unitOfMeasure,
            vendorItemPackSize: selectedVendorItem.packSize,
            quantity: selectedVendorItem.orderQty,
          });
        }
      });
    });
    returnArray.sort((a, b) => {
      //sort by vendorItemReference
      return a.vendorItemReference.localeCompare(b.vendorItemReference);
    });
    return returnArray;
  };

  const updateExportType = () => {
    setIsPDFSelected(!isPDFSelected);
    setIsCSVSelected(!isCSVSelected);
  };

  const handleSubmit = () => {
    toastRef.current = toast.info("Submitting Suggested Order...", {
      autoClose: false,
    });
    SuggestedOrderAPI.submit(orderData)
      .then(() => {
        notify("Suggested Order submitted successfully", {
          type: "success",
          autoClose: 3000,
        });
        toast.dismiss(toastRef.current);
        onClose();
        if (isPDFSelected) {
          SuggestedOrderFunctions.submitSuggestedOrderPDF(orderDetails);
        } else {
          SuggestedOrderFunctions.submitSuggestedOrderCSV(orderDetails);
        }
        navigate("/SuggestedOrderList");
      })
      .catch((error) => {
        toast.error("Error submitting Suggested Order");
        console.error("Error submitting Suggested Order", error);
        toast.dismiss(toastRef.current);
        onClose();
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={onClose}
      onClose={onClose}
      title="Submit Suggested Order"
    >
      <ToastContainer />
      <SubmitModalContainer>
        <SubmitModalBody>
          <FormRow onClick={updateExportType}>
            <SubmitModalText>
              How would you like to submit the Suggested Order?
            </SubmitModalText>
            <SubmitModalButtonContainer>
              <LeftButton $isSelected={isPDFSelected}>PDF</LeftButton>
              <RightButton $isSelected={isCSVSelected}>CSV</RightButton>
            </SubmitModalButtonContainer>
          </FormRow>
          <FormRow>
            <SubmitModalText>
              How would you like to sort the order?
            </SubmitModalText>
            <SubmitModalButtonContainer>
              <LeftButton $isSelected={isVendorItemRefSelected}>
                Vendor Item Ref #
              </LeftButton>
              <RightButton $isDisabled={true}>Countsheet</RightButton>
            </SubmitModalButtonContainer>
          </FormRow>
          {!isPreviewLoaded ? (
            <SubmitModalText>No items to display</SubmitModalText>
          ) : (
            <SimpleTable headers={tableHeaders} data={orderDetails} />
          )}
          <FormRow>
            <div></div>
            <SubmitButton onClick={handleSubmit}>Submit</SubmitButton>
          </FormRow>
        </SubmitModalBody>
      </SubmitModalContainer>
    </Modal>
  );
}
