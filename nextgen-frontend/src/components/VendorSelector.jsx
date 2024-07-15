import styled from "styled-components";
import { useEffect, useState } from "react";
import { VendorAPI } from "../apis/VendorAPI";


const VendorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 30px;
  margin: 5px;
  cursor: pointer;
`;

const FormElementContainer = styled.div`
  width: 100%;
  border-radius: 6px;
  cursor: pointer;
`;

const FormVendorValue = styled.div`
  white-space: nowrap;
  border-radius: 6px;
  border: 2px solid ${(props) => props.theme.lightGrey};
  text-align: center;
  padding: 10px 30px;

  &:hover {
    border: 2px solid ${(props) => props.theme.primary};
  }
`;

const Label = styled.div`
  white-space: nowrap;
  font-size: 1.2em;
  font-weight: bold;
`;

const VendorValue = styled.div`
  white-space: nowrap;
  border-radius: 20px;
  border: 2px solid ${(props) => props.isEditable ? props.theme.lightGrey : `#D3D3D3`};
  background-color: ${(props) => props.isEditable ? `none` : props.theme.lightGrey};
  text-align: center;
  padding: 10px 30px;

  &:hover {
    border: 2px solid ${(props) => props.isEditable ? props.theme.primary : `#D3D3D3`};
  }
`;

export default function VendorSelector({ onClick , vendorName, setVendorName, vendorID, formVersion, isEditable = true,isInvalid=false }) {
  
  const GetVendorList = () => {
    VendorAPI.getVendorsByCompany(1, 1)
    .then((data) => {
      if (data.Vendors.length > 0) {
        setVendorName(data.Vendors.find(x => x.VendorID === vendorID).Name);
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
  };
  if (vendorName === "No Vendor Selected" && vendorID) {
    GetVendorList();
  }
  
  return (
    <>
      {formVersion ? (
        <FormElementContainer onClick={onClick}>
          <FormVendorValue  style={isInvalid ? { borderColor: 'red' } : {}}>{vendorName}</FormVendorValue>
        </FormElementContainer>
      ) : (
        <VendorContainer onClick={isEditable ? onClick : () => {}} className="vendor-selector">
          {isEditable ? (
            <Label>Select Vendor(s)</Label>
          ) : (
            <Label>Vendor</Label>
          )}
          <VendorValue isEditable={isEditable}>{vendorName}</VendorValue>
        </VendorContainer>
      )}
    </>
  );
}
