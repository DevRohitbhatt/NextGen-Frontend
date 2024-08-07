import React, { useState, useEffect } from "react";
import * as Styled from "./styles/SuggestedOrderListStyles.jsx";
import UnitSelector from "../../components/UnitSelector.jsx";
import VendorSelector from "../../components/VendorSelector.jsx";
import DateSelector from "../../components/DateSelector.jsx";
import Table from "../../components/SimpleTable.jsx";
import UnitModal from "../../components/UnitModal.jsx";
import PurchaseOrderModal from "../../components/PurchaseOrderModal.jsx";
import VendorModal from "../../components/VendorModal.jsx";
import CalendarModal from "../../components/DateModal.jsx";
import OrderModal from "../../components/OrderModal.jsx";
import { UnitsAndAreasAPI } from "../../apis/UnitsAndAreasAPI.jsx";
import { VendorAPI } from "../../apis/VendorAPI.jsx";
import { SuggestedOrderAPI } from "../../apis/food-cost/SuggestedOrderAPI.jsx";
import ExportOptions from "../../components/ExportOptions.jsx";
import PdfBuilder from "../../components/PdfBuilder.jsx";
import { useNavigate } from "react-router-dom";

const SuggestedOrderList = () => {
  const [groupOrUnitAccessID, setGroupOrUnitAccessID] = useState();
  const [companyID, setCompanyID] = useState();
  const [alignmentID, setAlignmentID] = useState();
  const [userID, setUserID] = useState();
  const [isActive, setIsActive] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "There was an error trying to load the Suggested Order, please try again later."
  );

  const [unitsList, setUnitsList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState();
  const [selectedUnitName, setselectedUnitName] = useState("No Unit Selected");
  const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

  const [vendorsList, setVendorsList] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(0);
  const [selectedVendorName, setselectedVendorName] =
    useState("No Vendor Selected");
  const [selectedVendorList, setSelectedVendorList] = useState([]);
  const [showVendorModal, setVendorShowModal] = useState(false); // State to manage modal visibility

  const [selectedToDate, setSelectedToDate] = useState(new Date());
  const [selectedFromDate, setSelectedFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showDateModal, setShowDateModal] = useState(false); // State to manage modal visibility

  const [suggestedOrders, setSuggestedOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showCreateOrderModal, setCreateOrderShowModal] = useState(false);
  const [showSuggestedModal, setShowSuggestedModal] = useState(false);
  const [purchaseOrderID, setPurchaseOrderID] = useState(0);
  const headers = [
    { key: "unitName", label: "Unit Name", cellType: "string" },
    { key: "vendorName", label: "Vendor Name", cellType: "string" },
    { key: "deliveryDate", label: "Delivery Date", cellType: "date" },
    { key: "createdByName", label: "Created By", cellType: "string" },
    { key: "createdOn", label: "Created On", cellType: "dateTime" },
    { key: "submittedOn", label: "Submitted On", cellType: "dateTime" },
    { key: "status", label: "Order Status", cellType: "string" },
    { key: "orderSpan", label: "Order Span", cellType: "string" },
  ];

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial data
    if (!selectedUnit) {
      let parameters = decodeURIComponent(
        window.location.search.replace("?data=", "")
      );
      if (parameters) parameters = JSON.parse(parameters);
      parameters ? setCompanyID(parameters.CompanyID) : setCompanyID();
      parameters ? setAlignmentID(parameters.AlignmentId) : setAlignmentID();
      parameters ? setUserID(parameters.User_UserID) : setUserID();
      parameters
        ? setSelectedUnit(
            parameters.User_GroupOrUnitAccess || parameters.User_DefaultUnitID
          )
        : setSelectedUnit();
      parameters
        ? setGroupOrUnitAccessID(parameters.User_GroupOrUnitAccess)
        : setGroupOrUnitAccessID();
      parameters ? setIsActive(parameters.UnitID) : setIsActive();
      if (parameters.User_DefaultUnitID) {
        fetchData(
          parameters.CompanyID,
          parameters.AlignmentId,
          parameters.User_GroupOrUnitAccess || parameters.User_DefaultUnitID
        );
      } else {
        console.log("testing mode");
        setCompanyID(1021);
        setAlignmentID(1110);
        setGroupOrUnitAccessID(5199);
        setIsActive(0);
        setSelectedUnit(0);
        fetchData(1021, 1110, 5199);
      }
    } else {
      setErrorMessage(
        "There was an issue loading your orders, please try again later."
      );
    }
  }, []);

  const fetchData = (companyID, alignmentID, selectedUnit) => {
    setIsLoading(true);
    fetchUnits(companyID, alignmentID, selectedUnit);
    fetchVendors(companyID);
    fetchSuggestedOrders(companyID, alignmentID, selectedUnit, selectedVendor);
    setIsLoading(false);
  };

  const fetchUnits = (companyID, alignmentID, memberID) => {
    UnitsAndAreasAPI.getbyid(companyID, alignmentID, memberID)
      .then((data) => {
        setUnitsList(data.data);
      })
      .catch((error) => {
        console.error("Error getting units: ", error);
      });
  };

  const fetchVendors = (companyID) => {
    VendorAPI.getVendorsByCompany(companyID)
      .then((data) => {
        setVendorsList(data);
      })
      .catch((error) => {
        console.error("Error getting vendors: ", error);
      });
  };

  const fetchSuggestedOrders = (companyID, alignmentID, memberID, vendorID) => {
    SuggestedOrderAPI.getOrderList(
      companyID,
      alignmentID,
      memberID,
      vendorID,
      selectedFromDate.toISOString().split("T")[0],
      selectedToDate.toISOString().split("T")[0]
    )
      .then((data) => {
        data.data.map((x) => {
          const formatFromDate = formatDate(x.orderFromDate);
          const formatToDate = formatDate(x.orderToDate);
          x.orderSpan = `${formatFromDate} - ${formatToDate}`;
        });
        setSuggestedOrders(data);
        setFilteredOrders(data);
      })
      .catch((error) => {
        console.error("Error getting orders: ", error);
      });
  };

  const formatDate = (orderDate) => {
    const date = new Date(orderDate);
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-based, so add 1
    const year = date.getFullYear();

    const formattedDate = `${month}/${day}/${year}`;
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
    fetchSuggestedOrders(companyID, alignmentID, unitID, selectedVendor);
  };

  const handleVendorSelection = (selectedVendorName, vendorList) => {
    setselectedVendorName(selectedVendorName);
    setSelectedVendorList(vendorList);
    setVendorShowModal(false);
    filterSuggestedOrders(vendorList);
  };

  const filterSuggestedOrders = (vendorList) => {
    if (vendorList.length === 0) {
      setFilteredOrders(suggestedOrders);
      return;
    }

    const vendorListLookup = vendorList.map((vendor) => vendor.id);
    let filteredOrders = suggestedOrders.data.filter((order) => {
      return vendorListLookup.includes(order.vendorID);
    });
    setFilteredOrders((Prev) => ({ ...Prev, data: filteredOrders }));
  };

  const handleDateSelection = (from, to) => {
    setSelectedFromDate(from);
    setSelectedToDate(to);
    setShowDateModal(false);
    fetchSuggestedOrders(companyID, alignmentID, selectedUnit, selectedVendor);
  };

  const handleFromDateChange = (fromDate) => {
    setSelectedFromDate(fromDate);
  };

  const handleToDateChange = (toDate) => {
    setSelectedToDate(toDate);
  };

  const handleRowItemClick = (selectedRow) => {
    if (selectedRow.purchaseOrderID > 0 || selectedRow.purchaseOrderID !== 0) {
      setPurchaseOrderID(selectedRow.purchaseOrderID);
      setShowSuggestedModal(true);
      return;
    } else if (
      selectedRow.status !== "Submitted" ||
      selectedRow.purchaseOrderID == 0
    ) {
      const toDate = new Date(selectedRow.orderToDate);
      const fromDate = new Date(selectedRow.orderFromDate);
      let selectedDates = [fromDate, toDate];
      console.log(selectedRow);
      navigate("/SuggestedOrder", {
        state: {
          company: companyID,
          unit: selectedUnit,
          unitName: selectedRow.unitID,
          user: userID,
          vendorID: selectedRow.vendorID,
          vendorName: selectedRow.vendorName,
          orderID: selectedRow.suggestedOrderID,
          dates: selectedDates,
        },
      });
    }
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
            memberID={selectedUnit}
            memberName={selectedUnitName}
            includeAreas={true}
            setMemberName={setselectedUnitName}
            onClick={() => setUnitShowModal(true)}
          />
          <VendorSelector
            vendorID={selectedVendor}
            vendorName={selectedVendorName}
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
          handleAddClick={() => {
            setCreateOrderShowModal(true);
          }}
          includePDF={true}
          handlePDFClick={handlePDFClick}
          includeExcel={true}
          handleExcelClick={handleExcelClick}
          includeHelp={true}
          handleHelpClick={() => {
            console.log("Help");
          }}
        />
      </Styled.OptionsRow>

      <PurchaseOrderModal
        companyID={companyID}
        purchaseOrderID={purchaseOrderID}
        show={showSuggestedModal}
        setShow={setShowSuggestedModal}
        handleClose={() => {
          setShowSuggestedModal(false);
          setPurchaseOrderID(0);
        }}
      />

      {isLoading ? (
        <Styled.UnloadedMessage>Loading...</Styled.UnloadedMessage>
      ) : isError ? (
        <Styled.UnloadedMessage>{errorMessage}</Styled.UnloadedMessage>
      ) : (
        <Styled.OptionsRow>
          <OrderModal
            companyID={companyID}
            alignmentID={alignmentID}
            userID={userID}
            memberID={groupOrUnitAccessID}
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
              data={filteredOrders?.data}
              headers={headers}
              onRowClick={handleRowItemClick}
            />
          </Styled.VendorOrdersContainer>
        </Styled.OptionsRow>
      )}
      <UnitModal
        unitData={unitsList}
        memberID={selectedUnit}
        memberName={selectedUnitName}
        show={showModal}
        includeAreas={true}
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
        isMultiVendor={true}
      />
      <CalendarModal
        handleClose={handleCloseModal}
        modalOpen={showDateModal}
        isDateRange={true}
        handleDateSelection={handleDateSelection}
        handleFromDateChange={handleFromDateChange}
        handleToDateChange={handleToDateChange}
        selectedFromDate={selectedFromDate}
        selectedToDate={selectedToDate}
      />
    </Styled.PageContainer>
  );
};

export default SuggestedOrderList;
