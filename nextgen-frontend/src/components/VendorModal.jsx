import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { FaTimes } from "react-icons/fa";
import { ModalHeader } from "react-bootstrap";
import SearchVendor from "./SearchVendor";

const ModalOverlay = styled.div`
  position: fixed;
  width: 500px;
  height: auto;
  background-color: #fff;
  display: block;
  z-index: 9;
  border-radius: 8px;
  box-shadow: 0px 0px 10px #00000047;
  overflow: hidden;
  left: 38%;
  top: 6%;
`;

const ModalContent = styled.div`
  // background-color: white;
  // padding: 20px;
  // border-radius: 8px;
  // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  background: #364790;
  color: #fff;
  padding: 10px 14px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 6px;
  right: 12px;
  background-color: transparent;
  cursor: pointer;
  color: #fff;
  border: 0.25px solid #fff;
  padding: 3px;
  border-radius: 0px;
  padding-bottom: 0;
`;
const ModalDialog = styled.div`
  position: fixed;
  background: #00000073;
  width: 100%;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 9;
`;
const FooterButton = styled.button`
  box-shadow: inset 0 0 0 2px #364790;
  transition: color 0.25s 0.0833333333s;
  position: relative;
  border-radius: 0px;
  width: 110px;

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
const ModalFooter = styled.div`
  background: #efefef;
  display: flex;
  justify-content: center;
  gap: 11px;
  padding: 0.75rem;
`;
const ModalBody = styled.div`
  padding: 0px 14px;
`;
export const PopupContainer = styled.div`
  grid-column-gap: 20px;
  display: grid;
  grid-template-columns: 50fr 50fr;
  margin-top: 10px;
`;
const LeftVendorList = styled.div`
  color: #000;
  font-weight: 400;
  font-size: 12px;
`;
const InputGroup = styled.div`
  position: relative;
`;
const RightVendorList = styled.div`
  display: block;
  color: #000;
  font-weight: 400;
  font-size: 12px;
  padding: 10px 0px;
  border-radius: 4px;
  margin-top: 13px;
  padding: 10px;
  min-height: 24px;
`;
const Span = styled.span`
  background: #364790;
  display: block;
  text-align: center;
  color: #fff;
  border-radius: 4px;
  margin-top: -9px;
  padding: 10px;
  min-height: 18px;
`;
const VendorContainer = styled.div`
  border: 0.25px solid #808285;
  border-radius: 8px;
  margin: 10px 0px;
  overflow-y: scroll;
  height: 233px;
`;

const VendorList = styled.ul`
  list-style: none;
  padding: 0px;
  margin: 0px;
`;

const VendorListItem = styled.li`
  padding: 4px 10px 4px 10px;
  cursor: pointer;
  border-bottom: 0.25px solid ${(props) => (props.$isArea ? "#fff" : props.theme.lightGrey)};
  background: ${(props) => (props.$isActive ? "#364790" : (props.$isArea ? props.theme.lightGrey : "#fff"))};
  color: ${(props) => (props.$isActive ? "#fff" :  "#000")};
`;

const VendorModal = ({
  vendorData,
  vendorID,
  vendorName,
  show,
  handleClose,
  handleVendorSelection,
  isSaveVendor = false,
  isMultiVendor = false,
  includeAreas = false,
  handleVendorSaveSelection,
}) => {
  const [vendorsList, setVendorsList] = useState(vendorData.data || []);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectedVendorName, setSelectedVendorName] = useState(vendorName);
  const [selectedVendor, setSelectedVendor] = useState(vendorID);

  useEffect(() => {        
    if(vendorData) {
      setVendorsList(vendorData?.data);
      setSelectedVendorName(vendorName);
      setSelectedVendor(vendorID);
      setSelectedVendors([{id: vendorID, name: vendorName, isArea: false}]);
    }
    else {
      console.log('No data found')
    }
  }, [vendorData, vendorName, vendorID]);

  useEffect(() => {
    PopulateFilteredList(vendorsList);
  }, [vendorsList]);

  const PopulateFilteredList = (vendorsList) => {
    const vendorListWithFlag = vendorsList?.map(vendor => ({id: vendor.vendorID, name: vendor.vendorName, isArea: false}));
      setFilteredList(vendorListWithFlag);
  };

  const SearchVendorItem = (keyword) => {
    if (keyword.length > 0) {
      const filteredVendors = vendorsList.filter(
        (item) =>
          (item.vendorName &&
            item.vendorName.toString().toLowerCase().includes(keyword.toLowerCase())) ||
          (item.vendorId &&
            item.vendorId.toString().toLowerCase().includes(keyword.toLowerCase()))
      );      
      
      PopulateFilteredList(filteredVendors);
    }
    else {
      PopulateFilteredList(vendorsList);
    }
  };

  const handleVendorSelectChange = (event) => {
    const selectedVendorId = event.target.value;
    setSelectedVendor(selectedVendorId);
    const selectedText = event.target.textContent;
    setSelectedVendorName(selectedText);
    const data = vendorsList.filter(
      (item) => item.id === parseInt(selectedVendorId, 10)
    );
  };

  const handleSaveButtonClick = () => {
    handleVendorSaveSelection(selectedVendors);
    handleClose();
  };

  const handleVendorItemClick = (id, name) => {
    if (selectedVendors.some(v => v.id === id)) {
      const newSelectedVendors = selectedVendors.filter((item) => item.id !== id);
      setSelectedVendors(newSelectedVendors);
    }else {
      setSelectedVendors([...selectedVendors, {id: id, name: name, isArea: false}]);
    }
  };

  const handleSingleVendorSelection = (id, name) => {
    setSelectedVendor(id);
    setSelectedVendorName(name);
    setSelectedVendors([{id: id, name: name, isArea: false}]);
  };

  const handleOkButtonClick = () => {
    handleVendorSelection(selectedVendorName, selectedVendor);
    handleClose();
  };

  const handleCancelClick = () => {
    setSelectedVendor(vendorID);
    setSelectedVendorName(vendorName);
    setSelectedVendors([{id: vendorID, name: vendorName, isArea: false}]);
    handleClose();
  };

  return (
    show ? (
      <ModalDialog>
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              {isSaveVendor ? (
                <h4>Select Vendor(s) to save</h4>
              ) : (
                <h4>Select a Vendor </h4>
              )}

              <CloseButton onClick={handleClose}>
                <FaTimes className="close" />
              </CloseButton>
            </ModalHeader>
          </ModalContent>

          <ModalBody>
            <PopupContainer>
              <LeftVendorList>
                <label>Filter</label>
                <InputGroup>
                  <SearchVendor
                    onSearch={(keyword) => SearchVendorItem(keyword)}
                  />
                </InputGroup>
                <VendorContainer className="vendorList">
                  {isMultiVendor ? (
                    <VendorList value={selectedVendor} onClick={handleVendorSelectChange}>
                      {filteredList?.map((item, index) => (
                        <VendorListItem
                          key={index}
                          onClick={() => {
                            handleVendorItemClick(item.id, item.name),
                            setSelectedVendor(item.id),
                            setSelectedVendorName(item.name);
                          }}
                          $isActive={
                            selectedVendors.some((vendor) => (vendor.id === item.id)) ? true : false
                          }
                          value={item.id}                          
                        >
                          {item.name}
                        </VendorListItem>
                      ))}
                    </VendorList>
                  ) : (
                    <VendorList value={selectedVendor} onClick={handleVendorSelectChange}>
                      {filteredList?.map((item, index) => (
                        <VendorListItem
                          key={index}
                          onClick={() => {
                            handleSingleVendorSelection(item.id, item.name)
                          }}
                          value={item.id}
                          className={selectedVendor === item.id ? true : false}
                        >
                          {item.name}
                        </VendorListItem>
                      ))}
                    </VendorList>
                  )}
                </VendorContainer>
              </LeftVendorList>
              <RightVendorList>
                <Span>{selectedVendorName}</Span>
                <VendorContainer className="vendorList">
                  <VendorList value={selectedVendor} onClick={handleVendorSelectChange}>
                    {selectedVendors?.map((item, index) => (
                      !item.isArea ? (
                        <VendorListItem
                          key={index}
                          value={item.id}
                          onClick={() => {
                            setSelectedVendor(item.id),
                            setSelectedVendorName(item.name);
                          }}
                          className={selectedVendor === item.id ? "active" : ""}
                        >
                          {item.name}
                        </VendorListItem>
                      ) : (null)
                    ))}
                  </VendorList>
                </VendorContainer>
              </RightVendorList>
            </PopupContainer>
          </ModalBody>

          <ModalFooter>
            {isSaveVendor ? (
              <>
                <FooterButton onClick={handleSaveButtonClick}>Save</FooterButton>
                <FooterButton onClick={handleCancelClick}>Cancel</FooterButton>
              </>
            ) : (
              <>
                <FooterButton onClick={handleOkButtonClick}>Ok</FooterButton>
                <FooterButton onClick={handleCancelClick}>Cancel</FooterButton>
              </>
            )}
          </ModalFooter>
        </ModalOverlay>
      </ModalDialog>
    ) : null
  );
};

VendorModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleVendorSelection: PropTypes.func,
  isSaveUnit: PropTypes.bool,
};

export default VendorModal;
