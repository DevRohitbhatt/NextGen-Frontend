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

const Label = styled.div`
  white-space: nowrap;
  font-size: 1.2em;
  font-weight: bold;
`;

const VendorValue = styled.div`
  white-space: nowrap;
  border-radius: 20px;
  border: 2px solid ${(props) => props.theme.lightGrey};
  text-align: center;
  padding: 10px 30px;

  &:hover {
    border: 2px solid ${(props) => props.theme.primary};
  }
`;

export default function VendorSelector({ onClick , vendorName, setVendorName, vendorID}) {
  
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
    <VendorContainer onClick={onClick} className="vendor-selector">
      <Label>Select Vendor(s)</Label>
      <VendorValue >{vendorName}</VendorValue>
    </VendorContainer>
    </>
  );
}
