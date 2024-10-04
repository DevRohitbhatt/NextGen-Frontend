import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getCall } from "../../../apis/network.js";
import * as Styled from "./styles/SuggestedOrderListStyles.jsx";
import {
  UnitSelector,
  VendorSelector,
  DateSelector,
  SimpleTable as Table,
  UnitModal,
  PurchaseOrderModal,
  VendorModal,
  CalendarModal,
  OrderModal,
  ExportOptions,
  PdfBuilder,
} from "../../../components/index.js";
import { setVendorsList } from "../../../reducer/slices/globalState.js";
import { Steps } from "intro.js-react";
import SuggestedOrderListIntro from "../../../assets/introJSSteps/SuggestedOrderListIntro.jsx";

const tooltips = {
  deliveryDate:
    "Date the order should be delivered. If using a Suggested Order integrated vendor, this date comes from the vendor otherwise the Delivery Date is populated with the START date of your order span when the order was created.",
  createdBy: "User logged on when the order was originally created.",
  createdOn: "The system date and time when the order was originally created.",
  submittedOn: "The system date and time when the order was Submitted.",
  orderStatus:
    "For NON Integrated Suggested Order vendors, the status will display “Submitted” if the order Submit action has occurred, otherwise the Order Status will display “Not Submitted” for any order state i.e. created, saved, etc. For integrated vendors, the Order Status will come from the vendor.",
  orderSpan: "Forecasted dates and sales selected for this order.",
  direction: "left",
};

const SuggestedOrderList = () => {
  const dispatch = useDispatch();
  const globalState = useSelector((state) => state.globalState);
  const companyID = useSelector((state) => state.globalState.companyID);
  const alignmentID = useSelector((state) => state.globalState.alignmentID);
  const unitsList = useSelector((state) => state.globalState.unitsAndAreas);
  const vendorsList = useSelector((state) => state.globalState.vendorsList);
  const userID = useSelector((state) => state.globalState.userID);
  const groupOrUnitAccessID = useSelector(
    (state) => state.globalState.groupOrUnitAccess
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "There was an error trying to load the Suggested Order, please try again later."
  );

  const [selectedUnit, setSelectedUnit] = useState();
  const [selectedUnitName, setSelectedUnitName] = useState("Loading...");
  const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

  const [selectedVendor, setSelectedVendor] = useState(0);
  const [selectedVendorName, setselectedVendorName] = useState("All Vendors");
  const [showVendorModal, setVendorShowModal] = useState(false); // State to manage modal visibility
  const [selectedToDate, setSelectedToDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  );
  const [selectedFromDate, setSelectedFromDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [showDateModal, setShowDateModal] = useState(false); // State to manage modal visibility

  const [suggestedOrders, setSuggestedOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showCreateOrderModal, setCreateOrderShowModal] = useState(false);
  const [showSuggestedModal, setShowSuggestedModal] = useState(false);
  const [purchaseOrderID, setPurchaseOrderID] = useState(0);
  const headers = [
    {
      key: "unitName",
      label: "Unit Name",
      cellType: "string",
      toolTip: "",
      toolTipDirection: "",
    },
    {
      key: "vendorName",
      label: "Vendor Name",
      cellType: "string",
      toolTip: "",
      toolTipDirection: "",
    },
    {
      key: "deliveryDate",
      label: "Delivery Date",
      cellType: "date",
      toolTip: tooltips.deliveryDate,
      toolTipDirection: tooltips.direction,
    },
    {
      key: "createdByName",
      label: "Created By",
      cellType: "string",
      toolTip: tooltips.createdBy,
      toolTipDirection: tooltips.direction,
    },
    {
      key: "createdOn",
      label: "Created On",
      cellType: "dateTime",
      toolTip: tooltips.createdOn,
      toolTipDirection: tooltips.direction,
    },
    {
      key: "submittedOn",
      label: "Submitted On",
      cellType: "dateTime",
      toolTip: tooltips.submittedOn,
      toolTipDirection: tooltips.direction,
    },
    {
      key: "status",
      label: "Order Status",
      cellType: "string",
      toolTip: tooltips.orderStatus,
      toolTipDirection: tooltips.direction,
    },
    {
      key: "orderSpan",
      label: "Order Span",
      cellType: "string",
      toolTip: tooltips.orderSpan,
      toolTipDirection: tooltips.direction,
    },
  ];
  const [introSteps, setIntroSteps] = useState({
    steps: SuggestedOrderListIntro(),
    initialStep: 0,
    stepsEnabled: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (globalState.groupOrUnitAccess || globalState.defaultUnitID) {
      setSelectedUnit(globalState.groupOrUnitAccess || globalState.defaultUnitID);
    }
    if (globalState.groupOrUnitAccessName || globalState.defaultUnitName) {
      setSelectedUnitName(
        globalState.groupOrUnitAccessName || globalState.defaultUnitName
      );
    }
  }, [
    globalState.defaultUnitID,
		globalState.groupOrUnitAccess,
    globalState.defaultUnitName,
    globalState.groupOrUnitAccessName,
  ]);

  useEffect(() => {
    if (companyID && alignmentID && (groupOrUnitAccessID || selectedUnit)) {
      fetchData(companyID, alignmentID, groupOrUnitAccessID || selectedUnit);
    } else {
      setErrorMessage(
        "There was an issue loading your orders, please try again later."
      );
    }
  }, [companyID, alignmentID, groupOrUnitAccessID, selectedUnit]);

  const fetchData = async (companyID, alignmentID, selectedUnit) => {
    setIsLoading(true);
    await Promise.all([
      fetchVendors(companyID),
      fetchSuggestedOrders(
        companyID,
        alignmentID,
        selectedUnit,
        selectedVendor,
        selectedFromDate,
        selectedToDate
      ),
    ]);
    setIsLoading(false);
  };

  // This function fetches the vendors.
  const fetchVendors = async (companyID) => {
    try {
      setIsError(false);
      const getData = {
        url: "vendors",
        urlParams: {
          companyID: companyID,
        },
      };

      const result = await getCall(getData);
      dispatch(setVendorsList(result));
    } catch (error) {
      setIsError(true);
      setErrorMessage(
        "There was an issue loading your vendors, please try again later."
      );
      console.error("Error getting vendors: ", error);
    }
  };

  // This function fetches the suggested orders.
  const fetchSuggestedOrders = async (
    companyID,
    alignmentID,
    memberID,
    vendorID,
    fromDate,
    toDate
  ) => {
    try {
			setIsLoading(true);
      setIsError(false);
      const getData = {
        url: "orderList",
        urlParams: {
          companyID: companyID,
          alignmentID: alignmentID,
          memberID: memberID,
          vendorID: vendorID,
          fromDate: fromDate.toISOString().split("T")[0],
          toDate: toDate.toISOString().split("T")[0],
        },
      };

      const result = await getCall(getData);
      result?.data?.map((x) => {
        const formatFromDate = formatDate(x.orderFromDate);
        const formatToDate = formatDate(x.orderToDate);
        x.deliveryDate = formatDate(x.orderFromDate);
        x.orderSpan = `${formatFromDate} - ${formatToDate}`;
      });
      setSuggestedOrders(result );
      setFilteredOrders(result);
    } catch (error) {
      setIsError(true);
      setErrorMessage(
        "There was an issue loading your orders, please try again later."
      );
      console.error("Error getting orders: ", error);
    }
		setIsLoading(false);
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
    setSelectedUnitName(unitName);
    setSelectedUnit(unitID);
    setUnitShowModal(false);
    fetchSuggestedOrders(
      companyID,
      alignmentID,
      unitID,
      selectedVendor,
      selectedFromDate,
      selectedToDate
    );
  };

  const handleVendorSelection = (selectedVendorName, vendorList) => {
    setselectedVendorName(selectedVendorName);
    setSelectedVendor(vendorList[0].id);
    setVendorShowModal(false);
    filterSuggestedOrders(vendorList);
  };

  const filterSuggestedOrders = (vendorList) => {
    console.log(vendorList);
    if (vendorList.length === 0) {
      setFilteredOrders(suggestedOrders);
      return;
    }

    const vendorListLookup = vendorList.map((vendor) => vendor.id);
    console.log(vendorListLookup);
    console.log(suggestedOrders);
    let filteredOrders = suggestedOrders.data.filter((order) => {
      return vendorListLookup.includes(order.vendorID);
    });
    console.log(filteredOrders);
    setFilteredOrders({ data: filteredOrders });
  };

  const handleDateSelection = (from, to) => {
		console.log(from, to);
    setSelectedFromDate(from);
    setSelectedToDate(to);
    setShowDateModal(false);
    fetchSuggestedOrders(
      companyID,
      alignmentID,
      selectedUnit,
      selectedVendor,
      from,
      to
    );
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
      navigate("/SuggestedOrder", {
        state: {
          company: companyID,
          unit: selectedRow.unitID,
          unitName: selectedRow.unitName,
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
    if (!filteredOrders.data.length) return;
    const vendorName =
      selectedVendor === 0 ? "All Vendors" : selectedVendorName;
    const pdfData = {
      title: "Suggested Orders",
      subHeaders: [
        `${formatDate(selectedFromDate)} - ${formatDate(
          selectedToDate
        )}  |  ${selectedUnitName}  |  ${vendorName}`,
      ],
      exportType: "pdf",
      pageOrientation: "landscape",
      body: [
        {
          type: "table",
          widths: [
            "auto",
            "auto",
            "auto",
            "auto",
            "auto",
            "auto",
            "auto",
            "auto",
          ],
          dataTypes: [
            "string",
            "string",
            "date",
            "string",
            "string",
            "string",
            "string",
            "string",
          ],
          data: {
            columnHeaders: [
              "Unit Name",
              "Vendor Name",
              "Delivery Date",
              "Created By",
              "Created On",
              "Submitted On",
              "Order Status",
              "Order Span",
            ],
            rows: filteredOrders.data.map((row) => [
              { value: row.unitName, cellType: "", columnName: "Unit Name" },
              {
                value: row.vendorName,
                cellType: "",
                columnName: "Vendor Name",
              },
              {
                value: row.deliveryDate,
                cellType: "",
                columnName: "Delivery Date",
              },
              {
                value: row.createdByName,
                cellType: "",
                columnName: "Created By",
              },
              { value: row.createdOn, cellType: "", columnName: "Created On" },
              {
                value: row.submittedOn,
                cellType: "",
                columnName: "Submitted On",
              },
              { value: row.status, cellType: "", columnName: "Order Status" },
              { value: row.orderSpan, cellType: "", columnName: "Order Span" },
            ]),
          },
        },
      ],
    };

    PdfBuilder(pdfData);
  };

  const handleCSVClick = () => {
    if (!filteredOrders.data.length) return;

    const headers = [
      "Unit Name",
      "Vendor Name",
      "Delivery Date",
      "Created By",
      "Created On",
      "Submitted On",
      "Order Status",
      "Order Span",
    ];
    const csvData = filteredOrders.data.map((row) =>
      [
        row.unitName,
        row.vendorName,
        row.deliveryDate,
        row.createdByName,
        row.createdOn,
        row.submittedOn,
        row.status,
        row.orderSpan,
      ].join(",")
    );

    const csvString = [headers.join(","), ...csvData].join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const tempLink = document.createElement("a");
    tempLink.href = url;
    tempLink.setAttribute("download", "SuggestedOrders.csv");
    tempLink.click();
  };

  const handleIntroJSStart = () => {
    setIntroSteps({ ...introSteps, stepsEnabled: true });
  };

  return (
    <Styled.PageContainer>
      <Steps
        enabled={introSteps.stepsEnabled}
        steps={introSteps.steps}
        initialStep={introSteps.initialStep}
        onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
      />
      <Styled.PageTitle>Suggested Order</Styled.PageTitle>
      <Styled.OptionsRow>
        <Styled.DateAndUnitContainer>
          <UnitSelector
            companyID={companyID}
            alignmentID={alignmentID}
            memberID={selectedUnit}
            memberName={selectedUnitName}
            includeAreas={true}
            setMemberName={setSelectedUnitName}
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
          includeCSV={true}
          handleCSVClick={handleCSVClick}
          includeHelp={true}
          handleHelpClick={handleIntroJSStart}
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
