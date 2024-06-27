import React, { useState, useEffect } from "react";
import * as Styled from "./styles/SuggestedOrderListStyles.jsx";
import UnitSelector from "../../components/UnitSelector.jsx";
import VendorSelector from "../../components/VendorSelector.jsx";
import DateSelector from "../../components/DateSelector.jsx";
import Table from '../../components/SimpleTable.jsx';
import UnitModal from "../../components/UnitModal.jsx";
import VendorModal from "../../components/VendorModal.jsx";
import CalendarModal from "../../components/ModalDate.jsx";
import OrderModal from "../../components/OrderModal.jsx";
import { UnitsAndAreasAPI } from "../../apis/UnitsAndAreasAPI.jsx";
import { VendorAPI } from "../../apis/VendorAPI.jsx";
import { SuggestedOrderAPI } from "../../apis/SuggestedOrderAPI.jsx";
import ExportOptions from "../../components/ExportOptions.jsx";
import PdfBuilder from "../../components/PdfBuilder.jsx";

const SuggestedOrderList = () => {
  const [userID, setUserID] = useState();
  const [companyID, setCompanyID] = useState();
  const [alignmentID, setAlignmentID] = useState();  
  const [isActive, setIsActive] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("There was an error trying to load the Suggested Order, please try again later.");

  const [unitsList, setUnitsList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState();
  const [selectedUnitName, setselectedUnitName] = useState("No Unit Selected");
  const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

  const [vendorsList, setVendorsList] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(0);
  const [selectedVendorName, setselectedVendorName] = useState("No Vendor Selected");    
  const [showVendorModal, setVendorShowModal] = useState(false); // State to manage modal visibility
  
  const [selectedToDate, setSelectedToDate] = useState(new Date());
  const [selectedFromDate, setSelectedFromDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showDateModal, setShowDateModal] = useState(false); // State to manage modal visibility
  
  const [suggestedOrders, setSuggestedOrders] = useState([]);  
  const [showCreateOrderModal, setCreateOrderShowModal] = useState(false);
 
  const headers = [
    { key: 'unitName', label: 'Unit Name', cellType: 'string' },
    { key: 'vendorName', label: 'Vendor Name', cellType: 'string' },
    { key: 'deliveryDate', label: 'Delivery Date', cellType: 'date' },
    { key: 'createdBy', label: 'Created By', cellType: 'string' },
    { key: 'createdOn', label: 'Created On',cellType: 'dateTime' },
    { key: 'modifiedOn', label: 'Submitted On', cellType: 'dateTime'},
    { key: 'status', label: 'Order Status', cellType: 'string' },
    { key: 'orderSpan', label: 'Order Span', cellType: 'string' }
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
        fetchData(parameters.CompanyID, parameters.AlignmentId, parameters.User_GroupOrUnitAccess, parameters.User_DefaultUnitID);
      } else {
        
        console.log("testing mode");
        setCompanyID(1021)
        setAlignmentID(1110)
        setUserID(5199)
        setIsActive(0)
        setSelectedUnit(0)
        fetchData(1021, 1110, 5199, 0)
      }
    }
    else {      
      console.log("testing")
      setErrorMessage("There was an issue loading your orders, please try again later.");
    }

  }, []);

  const fetchData = (companyID, alignmentID, groupOrUnitAccess, unitID) => {
    setIsLoading(true);    
    fetchUnits(companyID, alignmentID, groupOrUnitAccess);
    fetchVendors(companyID);
    fetchSuggestedOrders(companyID, alignmentID, groupOrUnitAccess, unitID, selectedVendor);
    setIsLoading(false); 
  };

  const fetchUnits =  (companyID, alignmentID, groupOrUnitAccess) => {
    UnitsAndAreasAPI.getbyid(companyID, alignmentID, groupOrUnitAccess)
    .then((data) => {      
      setUnitsList(data.data);
    }).catch((error) => {
      console.error("Error getting units: ", error);
    });
  };

  const fetchVendors =  (companyID) => {
    console.log("vendors")
    VendorAPI.getVendorsByCompany(companyID)
    .then((data) => {
      setVendorsList(data);
    }).catch((error) => {
      console.error("Error getting vendors: ", error);
    });
  };

  const fetchSuggestedOrders = (companyID, alignmentID, memberID, unitID, vendorID) => {
    console.log("fetching orders", unitID)
    SuggestedOrderAPI.getOrderList(companyID, alignmentID, memberID, unitID ,vendorID, selectedFromDate.toISOString().split('T')[0], selectedToDate.toISOString().split('T')[0])
    .then((data) => {
      data.map((x) => {
        if(x.status !== "Submitted") 
          x.modifiedOn = "";

        const formatFromDate = formatDate(x.orderFromDate);
        const formatToDate = formatDate(x.orderToDate);
        x.orderSpan = `${formatFromDate} - ${formatToDate}`;
      });
      setSuggestedOrders(data);
    }).catch((error) => {
      console.error("Error getting orders: ", error);
    });    
  };

  const formatDate = (orderDate) => {
    let date = new Date(orderDate);
    const day = date.toString().substr(0, 3);
    date = date.toLocaleString('en-US');
    const formattedDate = `${day}, ${date}`;
    return formattedDate;
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
    fetchSuggestedOrders(companyID, alignmentID, userID, unitID, selectedVendor);
  };

  const handleVendorSelection = (vendorName, vendorID) => {
    setselectedVendorName(vendorName);
    setSelectedVendor(vendorID);
    setVendorShowModal(false);
    fetchSuggestedOrders(companyID, alignmentID, userID, selectedUnit, vendorID);
  };

 const handleDateSelection = () => {   
    setShowDateModal(false);
    fetchSuggestedOrders(companyID, alignmentID, userID, selectedUnit, selectedVendor);
  };

  const handleFromDateChange = (fromDate) => {
    setSelectedFromDate(fromDate);
  };

  const handleToDateChange = (toDate) => {
    setSelectedToDate(toDate);
  };

  const handleCreateOrderClick = () => { 
    setCreateOrderShowModal(true);   
  };

  const handlePDFClick = () => {
    const pdfData = {
      title: "Suggested Order",
      exportType: "pdf",
      body: [
        {
          type: "table/Column",
          title: "Suggested Order",
          widths: [100, 75, 75, 75, 75, 75, 75, 75, 75],
          data: suggestedOrders,
        },
      ],
    };
    PdfBuilder(pdfData);
  };

  const handleExcelClick = () => {
    const excelData = {
      title: "Suggested Order",
      exportType: "excel",
      body: [
        {
          type: "table/Column",
          title: "Suggested Order",
          widths: [100, 75, 75, 75, 75, 75, 75, 75, 75],
          data: suggestedOrders,
        },
      ],
    };
    PdfBuilder(excelData);
  };
  
  return (
    <Styled.PageContainer>
      <Styled.PageTitle>Suggested Order</Styled.PageTitle>
      <Styled.OptionsRow>
        <Styled.DateAndUnitContainer>
          <UnitSelector
            companyID={companyID}
            alignmentID={alignmentID}
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
            toDate={selectedToDate}
            fromDate={selectedFromDate}
            onClick={handleDateSelectorClick}
            isDateRange={true}
          />
        </Styled.DateAndUnitContainer>
        <ExportOptions
          includeAdd={true}
          handleAddClick={() => {setCreateOrderShowModal(true)}}
          includePDF={true}
          handlePDFClick={handlePDFClick}
          includeExcel={true}
          handleExcelClick={handleExcelClick}
          includeHelp={true}
          handleHelpClick={() => {console.log("Help")}}
        />
      </Styled.OptionsRow>
      {isLoading ? (
        <Styled.UnloadedMessage>Loading...</Styled.UnloadedMessage>
      ) : isError ? (
        <Styled.UnloadedMessage>{errorMessage}</Styled.UnloadedMessage>
      ) : (
            <Styled.OptionsRow>
              <OrderModal
                companyID={companyID}
                alignmentID={alignmentID}
                memberID={userID}
                unitData={unitsList}
                vendorData={vendorsList}
                unitID={selectedUnit}
                unitName={selectedUnitName}
                show={showCreateOrderModal}
                handleClose={() => {
                  setCreateOrderShowModal(false);
                }}
                handleUnitSelection={handleUnitSelection}
                title="CREATE ORDER"
              />
              <Styled.VendorOrdersContainer>
                <Table
                  data={suggestedOrders?.data}
                  headers={headers}
                />
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
        handleFromDateChange= {handleFromDateChange}
        handleToDateChange= {handleToDateChange}
        selectedYear={selectedYear}
      />          
    </Styled.PageContainer>
  );
};

export default SuggestedOrderList;
