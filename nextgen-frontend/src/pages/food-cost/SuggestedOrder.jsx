import React, { useState, useEffect } from "react";
import * as Styled from "./styles/SuggestedOrderStyles.jsx";
import UnitSelector from "../../components/UnitSelector";
import VendorSelector from "../../components/VendorSelector";
import DateSelector from "../../components/DateSelector";
import Table from '../../components/SimpleTable.jsx';
import UnitModal from "../../components/UnitModal";
import VendorModal from "../../components/VendorModal";
import CalendarModal from "../../components/ModalDate.jsx";
import { UnitsAndAreasAPI } from "../../apis/UnitsAndAreasAPI";
import { VendorAPI } from "../../apis/VendorAPI.jsx";
import { SuggestedOrderAPI } from "../../apis/SuggestedOrderAPI.jsx";

const SuggestedOrder = () => {
  const [userID, setUserID] = useState();
  const [companyID, setCompanyID] = useState();
  const [alignmentID, setAlignmentID] = useState();  
  const [IsActive, setIsActive] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("There was an error trying to load the Suggested Order, please try again later.");

  const [unitsList, setUnitsList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState();
  const [selectedUnitName, setselectedUnitName] = useState("No Unit Selected");
  const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

  const [vendorsList, setVendorsList] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState();
  const [selectedVendorName, setselectedVendorName] = useState("No Vendor Selected");    
  const [showVendorModal, setVendorShowModal] = useState(false); // State to manage modal visibility
  
  const [selectedToDate, setSelectedToDate] = useState(new Date());
  const [selectedFromDate, setSelectedFromDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showDateModal, setShowDateModal] = useState(false); // State to manage modal visibility
  
  const [suggestedOrders, setSuggestedOrders] = useState([]);  
  //const [showCreateOrderModal, setCreateOrderShowModal] = useState(false);
 
  const headers = [
    { key: 'unitName', label: 'Unit Name', cellType: 'string' },
    { key: 'vendorName', label: 'Vendor Name', cellType: 'string' },
    { key: 'deliveryDate', label: 'Delivery Date', cellType: 'date' },
    { key: 'createdBy', label: 'Created By', cellType: 'string' },
    { key: 'submittedOn', label: 'Submitted On',cellType: 'dateTime' },
    { key: 'status', label: 'Order Status', cellType: 'string' }
  ];

  useEffect(() => {    
    // Fetch initial data
    if (!selectedUnit) {
      let parameters = decodeURIComponent(window.location.search.replace("?data=", ""));
      if (parameters)
        parameters = JSON.parse(parameters);
      parameters ? setCompanyID(parameters.CompanyID) : setCompanyID();
      parameters ? setAlignmentID(parameters.AlignmentId) : setAlignmentID();
      parameters ? setSelectedUnit(parameters.User_DefaultUnitID) : setSelectedUnit();
      parameters ? setUserID(parameters.User_GroupOrUnitAccess) : setUserID();
      parameters ? setIsActive(parameters.UnitID) : setIsActive();
      if (parameters.User_DefaultUnitID) {
        fetchData(parameters.CompanyID, parameters.AlignmentId, parameters.User_GroupOrUnitAccess, selectedFromDate, selectedToDate);
      } else {
        setErrorMessage("No Unit Selected, Please select a unit.");
        setIsError(true);
        setIsLoading(false);
      }
    }
    else {      
      fetchData(1021, 1110, 5199);
    }

  }, []);

  const fetchData = (companyID, alignmentID, userID) => {
    setIsLoading(true);    
    fetchUnits(companyID, alignmentID, userID);
    fetchVendors(companyID);
    fetchSuggestedOrders(companyID, alignmentID, userID, selectedUnit, selectedVendor, selectedFromDate, selectedToDate);
    setIsLoading(false); 
  };

  const fetchUnits =  (companyID, alignmentID, userID) => {
    UnitsAndAreasAPI.getbyid(companyID, alignmentID, userID)
    .then((data) => {      
      setUnitsList(data);
    }).catch((error) => {
      console.error("Error getting units: ", error);
    });
  };

  const fetchVendors =  (companyID) => {
    VendorAPI.getVendorsByCompany(companyID)
    .then((data) => {
      setVendorsList(data);
    }).catch((error) => {
      console.error("Error getting vendors: ", error);
    });
  };

  const fetchSuggestedOrders = (companyID, alignmentID, userID, unitID, vendorID, fromDate, toDate) => {
    SuggestedOrderAPI.getOrderList(companyID, alignmentID, unitID, userID,vendorID, fromDate, toDate)
    .then((data) => {
      setSuggestedOrders(data);
    }).catch((error) => {
      console.error("Error getting orders: ", error);
    });    
  };

  const handleDateSelectorClick = () => {
    setShowDateModal(true); 
  };

  const handleCloseModal = () => {
    setShowDateModal(false);
  };

  const handleUnitSelection = (unitName, unitID) => {
    setselectedUnitName(unitName);
    setSelectedUnit(unitID);
    setUnitShowModal(false);
    fetchSuggestedOrders(companyID, alignmentID, userID, unitID, selectedVendor, selectedFromDate, selectedToDate);
  };

  const handleVendorSelection = (vendorName, vendorID) => {
    setselectedVendorName(vendorName);
    setSelectedVendor(vendorID);
    setVendorShowModal(false);
    fetchSuggestedOrders(companyID, alignmentID, userID, selectedUnit, vendorID, selectedFromDate, selectedToDate);
  };

 const handleDateSelection = (fromDate, toDate) => {
    setSelectedFromDate(fromDate);
    setSelectedToDate(toDate);
    setShowDateModal(false);
    fetchSuggestedOrders(companyID, alignmentID, userID, selectedUnit, selectedVendor, fromDate, toDate);
  };

  const handleCreateOrderClick = () => {    
  };

  return (
    <Styled.PageContainer>
      <Styled.PageTitle>Suggested Order</Styled.PageTitle>
      <Styled.OptionsRow>
        <Styled.DateAndUnitContainer>
          <UnitSelector
            unitID={selectedUnit}
            unitName={selectedUnitName}
            setUnitName={setselectedUnitName}
            onClick={() => setUnitShowModal(true)}
          />
          <VendorSelector
            vendorID = {selectedVendor}
            vendorName = {selectedVendorName}
            setVendorName={setselectedVendorName}
            onClick={() => setVendorShowModal(true)}
          />
          <DateSelector
            ToDate={selectedToDate}
            FromDate={selectedFromDate}
            onClick={handleDateSelectorClick}
            isDateRange={true}
          />
        </Styled.DateAndUnitContainer>
      </Styled.OptionsRow>
      {isLoading ? (
        <Styled.UnloadedMessage>Loading...</Styled.UnloadedMessage>
      ) : isError ? (
        <Styled.UnloadedMessage>Error: {errorMessage}</Styled.UnloadedMessage>
      ) : (
            <Styled.OptionsRow>
              <Styled.VendorOrdersContainer>
                <Table
                  data={suggestedOrders?.data}
                  headers={headers}
                />
                <Styled.Buttonontainer>
                  <Styled.Button onClick={handleCreateOrderClick}>Create Order</Styled.Button>
                </Styled.Buttonontainer>
              </Styled.VendorOrdersContainer>
            </Styled.OptionsRow>            
      )}
      <UnitModal
        unitData={unitsList}
        unitID={selectedUnit}
        unitName={selectedUnitName}
        show={showModal}
        handleClose={() => {
          setUnitShowModal(false);
        }}
        handleUnitSelection={handleUnitSelection}
      />

      <VendorModal
        vendorData={vendorsList}
        vendorID={selectedVendor}
        vendorName={selectedVendorName}
        show={showVendorModal}
        handleClose={() => {
          setVendorShowModal(false);
        }}
        handleVendorSelection={handleVendorSelection}
      />
      <CalendarModal
        handleClose={handleCloseModal}
        modalOpen={showDateModal}
        isDateRang={true}
        handleDateSelection={handleDateSelection}
        selectedYear={selectedYear}
      />          
    </Styled.PageContainer>
  );
};

export default SuggestedOrder;
