import React, { useEffect, useRef, useState } from "react";
import {
  CalendarModal,
  ExportOptions,
  Loader,
  Modal,
  SearchBar,
  UnitModal,
  UnitSelector,
} from "../../components";
import { Steps } from "intro.js-react";
import { useSelector } from "react-redux";
import { RiDeleteBin6Line } from "react-icons/ri";
import EditAndAddDndTable from "../../components/table/EditAndAddDndTable";
import HoverBorderButton from "../../components/buttons/HoverBorderButton";
import { deleteCall, getCall, postCall } from "../../apis/network";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import {
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaPlusCircle,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import {
  convertMinutesToHHMM,
  formatTime,
} from "../../functions/utils/timeConvertFunction";
import HhmmssSelector from "../../components/common/HhmmssSelector";
import ReactDOM from "react-dom";
import cookChartTemplates from "../../assets/introJSSteps/cookChartTemplate";
import { Link } from "react-router-dom";

const CookChartTemplate = (props) => {
  const {
    companyID,
    alignmentID,
    unitsAndAreas: unitsAndAreasList,
    defaultUnitID,
    defaultUnitName,
    userID,
  } = useSelector((state) => state.globalState);
  const [isSave, setIsSave] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "There was an error trying to load the Cook drop template Report, please try again later."
  );

  const [selectedUnit, setSelectedUnit] = useState();
  const [selectedUnitName, setSelectedUnitName] = useState("Loading...");
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [selectedFromDate, setSelectedFromDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 0)
  );
  const [selectedToDate, setSelectedToDate] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
  const [openEditItemModal, setOpenEditItemModal] = useState(false);
  const [cookAllData, setCookAllData] = useState([]);
  const [editCookData, setEditCookData] = useState([]);
  const [allDataFeilds, setAllDataFeilds] = useState({});
  const [filteredData, setFilteredData] = useState(cookAllData);
  const [addMenuItems, setAddMenuItems] = useState([]);
  const [addInventoryItems, setAddInventoryItems] = useState([]);
  const [sourceType, setSourceType] = useState("Menu");
  const [editsourceType, setEditSourceType] = useState("Menu");
  const [sourceTypeDropDown, setSourceTypeDropDown] = useState(false);
  const [showFullTable, setShowFullTable] = useState({});
  const [rightTableData, setRightTableData] = useState([]);
  const [addHeaderFields, setAddHeaderFields] = useState({
    cookItemName: "",
    unitOfMeasure: "",
    cookInterval: 0,
    safetyFactor: 0,
    mixMultiplier: 0,
    projectAhead: "",
    cookTimeSeconds: 0,
    holdTimeSeconds: 0,
    laborFixedSeconds: 0,
    laborVarSeconds: 0,
    sourceType: "Menu",
    createdOn: "0001-01-01T00:00:00",
    createdBy: 0,
    deletedOn: "0001-01-01T00:00:00",
    deletedBy: 0,
    companyID: companyID,
    cookDropCookItemID: null,
  });
  const moreOptionsDropdown = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const leftColumnRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [saveDisable, setSaveDisable] = useState(false);
  const [initDataLoading, setInitDataLoading] = useState(false);
  const [isHeaderLoaded, setIsHeaderLoaded] = useState(false);
  const projectAheadOptions = [{ name: "y" }, { name: "n" }];
  const [view, setView] = useState("y");
  const [introSteps, setIntroSteps] = useState({
    steps: cookChartTemplates(),
    initialStep: 0,
    stepsEnabled: false,
  });
  const [companyStateId, setCompanyStateId] = useState("");
  useEffect(() => {
    const handleScroll = () => {
      if (leftColumnRef.current) {
        const offsetTop = leftColumnRef.current.getBoundingClientRect().top;
        setIsSticky(offsetTop <= 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (defaultUnitID) {
      setSelectedUnit(() => defaultUnitID);
    }
    if (defaultUnitName) {
      setSelectedUnitName(() => defaultUnitName);
    }
    if (companyID) {
      setCompanyStateId(() => companyID);
    }
    if (userID) {
      setAddHeaderFields((prev) => ({
        ...prev,
        createdBy: userID,
        deletedBy: userID,
      }));
    }
  }, [defaultUnitID, defaultUnitName, userID]);

  const handleUnitSelection = (unitName, unitID) => {
    setSelectedUnitName(unitName);
    setSelectedUnit(unitID);
    setShowUnitModal(false);
  };

  const handleDateSelection = (from, to) => {
    setSelectedFromDate(from);
    setSelectedToDate(to);
    setShowDateModal(false);
  };
  const handleOpenCreateItemModal = () => {
    getAddNewCookData(sourceType);
    setOpenCreateItemModal(true);
  };
  //open edit Modal
  const handleOpenEditItemModal = async (id, type) => {
    setEditSourceType(type);
    getAddNewCookData(type);
    setOpenEditItemModal(true);
    const editData = await getEditCookData(id);
    const deepCopiedData = JSON.parse(JSON.stringify(editData.data[0]));
    setAllDataFeilds(deepCopiedData);
  };

  // get Template data api
  const getTemplateData = async () => {
    try {
      const getData = {
        fullUrl: "api/cookdrop/getcookdroptemplate",
        urlParams: {
          companyId: companyStateId,
          memberID: selectedUnit,
          templateName: "Default",
        },
      };

      const result = await getCall(getData);
      let resultData = result.data;
      if (result.data.length > 0) {
        for (let i = 0; i < resultData.length; i++) {
          setRightTableData((prev) => [
            ...prev,
            {
              title: resultData[i].cookItemName,
              description: `Cook Interval ${convertMinutesToHHMM(
                resultData[i].cookInterval
              )}, Cook time ${formatTime(
                resultData[i].cookTimeSeconds
              )}, Hold ${formatTime(resultData[i].holdTimeSeconds)}, Safety ${
                resultData[i].safetyFactor
              }%`,
              items: resultData[i].listCookDropCookItemDetails.map(
                (detail) => ({
                  id: detail.inventoryOrMenuItemID,
                  inventoryOrMenuItemName: detail.inventoryOrMenuItemName,
                  qty: detail.cookItemQuantity,
                })
              ),
              cookDropCookItemID: resultData[i].cookDropCookItemID,
            },
          ]);
        }
      } else {
        setRightTableData([]);
      }
    } catch (error) {}
  };

  //Create new item data call
  const getAddNewCookData = async (type) => {
    setInitDataLoading(true);
    if (type === "Menu") {
      try {
        const getData = {
          fullUrl: "api/menus/getMenuItemsByCompanyID",
          urlParams: {
            companyId: companyStateId,
          },
        };

        const result = await getCall(getData);
        if (result?.data && result?.data.length) {
          result.data.forEach((items) => (items.menuID = items.itemID + ""));
          setAddMenuItems(result.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setInitDataLoading(false);
      }
    } else if (type === "Inventory") {
      try {
        const getData = {
          fullUrl: "api/prepcharttemplate/getinventorylist",
          urlParams: {
            companyId: companyStateId,
          },
        };

        const result = await getCall(getData);
        if (result?.data && result?.data.length) {
          result.data.forEach(
            (items) => (items.menuID = items.inventoryItemID + "")
          );
          setAddInventoryItems(result.data);
        }
      } catch (error) {
      } finally {
        setInitDataLoading(false);
      }
    }
  };
  //Get all item data call
  const getCookAllItemData = async () => {
    setIsLoading(true);
    try {
      const getData = {
        fullUrl: "api/cookdrop/getcookdropcookitem",
        urlParams: {
          companyId: companyStateId,
        },
      };
      const result = await getCall(getData, false);

      setCookAllData(result.data);
      setFilteredData(result.data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };
  //Edit  item data call
  const getEditCookData = async (id) => {
    setIsHeaderLoaded(true);
    try {
      const getData = {
        fullUrl: "api/cookdrop/getcookdropcookitembyid",
        urlParams: {
          companyId: companyStateId,
          cookDropCookItemID: id,
        },
      };
      const result = await getCall(getData, false);
      result.data[0].listCookDropCookItemDetails.forEach(
        (items) => (items.menuID = items.inventoryOrMenuItemID + "")
      );
      setEditCookData(result.data[0].listCookDropCookItemDetails);

      return result;
    } catch (error) {
    } finally {
      setIsHeaderLoaded(false);
    }
  };


  const handleSave = () => {
    setIsSave(true);
    setShowUnitModal(true);
  };
 const handleUnitSaveSelection = (units) => {
  debugger
    toast.info('Saving data...', { autoClose: false });
    saveTemplateData(units);
  };
  const saveTemplateData = async (units) => {
    let body = {
      companyID: companyStateId,
      unitID: units.map((unit) => unit.id),
      templateName: "Default",
      cookDropTemplateID: null,
      createdBy: userID,
      cookDropTemplateDetailList: [],
    };

    rightTableData.map((item) =>
      body.cookDropTemplateDetailList.push(item.cookDropCookItemID)
    );

    try {
      const postData = {
        fullUrl: "api/cookdrop/savecookdroptemplate",
        urlParams: {
          companyID: companyStateId,
        },
        bodyData: body,
      };

      let result = await postCall(postData);
      if (result?.errors === null) {
        toast.success("Saved...", { autoClose: 1500 });
      } else {
        toast.error("Failed to save", { autoClose: 1000 });
      }
    } catch (error) {
      toast.error("Failed to save", { autoClose: 1000 });
    }
  };

  useEffect(() => {
    if (companyStateId && selectedUnit) {
      getCookAllItemData();
      getTemplateData();
    }
  }, [companyStateId, selectedUnit]);

  const createEditItemModal = () => {
    let {
      cookItemName,
      unitOfMeasure,
      cookInterval,
      safetyFactor,
      mixMultiplier,
      projectAhead,
      cookTimeSeconds,
      holdTimeSeconds,
      laborFixedSeconds,
      laborVarSeconds,
      sourceType,
    } = allDataFeilds;
    const handleSourceTypeChange = async (type) => {
      await getAddNewCookData(type);
      setEditSourceType(type);
      setSourceTypeDropDown(false);
    };

    const onChangeHeaderValues = (e, name) => {
      let value = e.target.value;

      setAllDataFeilds((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
    const savedData = async (saved) => {
      setSaveDisable(true);
      let values = saved.map((item) => {
        let newItem = { ...item };
        newItem.inventoryOrMenuItemID = parseInt(newItem.menuID);
        delete newItem.menuID;
        delete newItem.uniqueKey;
        delete newItem.draggableId;
        newItem.cookItemQuantity = parseInt(newItem.cookItemQuantity);
        newItem.InventoryOrMenuItemName = newItem.description;
        delete newItem?.description;
        return newItem;
      });
      let body = allDataFeilds;
      body.listCookDropCookItemDetails = values;
      body.sourceType = editsourceType;
      try {
        const postData = {
          fullUrl: "api/cookdrop/savecookdropcookitem",
          urlParams: { companyID: companyStateId },
          bodyData: body,
        };

        let result = await postCall(postData);
        if (result?.error == null) {
          await getCookAllItemData();
          toast.success("Saved...", { autoClose: 1500 });
          setOpenEditItemModal(false);
        } else {
          toast.error("Failed to save", { autoClose: 1500 });
        }
      } catch (error) {
        toast.error("Failed to save", { autoClose: 1500 });
      } finally {
        setSaveDisable(false);
      }
    };

    return (
      <div className="gap-[20px] flex justify-between mx-auto p-4 h-[100%] flex-col">
        <div className=" xl:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center tableHOC overflow-x-auto overflow-y-visible">
          <table className="min-w-full table-auto ">
            <thead className="">
              <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset]">
                <th className="px-4 py-2 text-left text-sm text-nowrap">
                  Group Name
                </th>
                <th className="px-4 py-2 text-left text-sm text-nowrap">
                  Cook Interval
                </th>
                <th className="px-4 py-2 text-left text-sm text-nowrap">
                  Cook time
                </th>
                <th className="px-4 py-2 text-left text-sm text-nowrap">
                  Hold Time
                </th>
                <th className="px-4 py-2 text-left text-sm text-nowrap">
                  Safety Factor
                </th>
                <th className="px-4 py-2 text-left text-sm text-nowrap">
                  Project Ahead
                </th>
                <th className="px-2 py-2 text-left text-sm text-nowrap">
                  Labor Fixed
                </th>
                <th className="px-4 py-2 text-left text-sm text-nowrap">
                  Labor Var
                </th>
                <th className="px-4 py-2 text-left text-sm text-nowrap">
                  Source Type
                </th>
                <th className="px-4 py-2 text-left text-sm text-nowrap">UOM</th>
                <th className="px-4 py-2 text-left text-sm text-nowrap">
                  Mix Multiplier
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="">
                <td className="px-2 py-2 ">
                  <input
                    type="text"
                    value={isHeaderLoaded ? "Loading..." : cookItemName}
                    className="bg-gray-200 p-2 w-full rounded-full  border-none "
                    onChange={(e) => {
                      onChangeHeaderValues(e, "cookItemName");
                    }}
                  />
                </td>
                <td className="px-2 py-2 ">
                  <HhmmssSelector
                    initialSeconds={cookInterval * 60}
                    key={"cookInterval"}
                    onTimeChange={(e) => {
                      setAllDataFeilds((prev) => ({
                        ...prev,
                        ["cookInterval"]: e / 60,
                      }));
                    }}
                    enableSeconds={false}
                    initDataLoading={isHeaderLoaded}
                  />
                </td>
                <td className="px-2 py-2 ">
                  <HhmmssSelector
                    initialSeconds={cookTimeSeconds}
                    key={"cookTimeSeconds"}
                    onTimeChange={(e) => {
                      setAllDataFeilds((prev) => ({
                        ...prev,
                        ["cookTimeSeconds"]: e,
                      }));
                    }}
                    initDataLoading={isHeaderLoaded}
                  />
                </td>
                <td className="px-2 py-2 ">
                  <HhmmssSelector
                    initialSeconds={holdTimeSeconds}
                    key={"holdTimeSeconds"}
                    onTimeChange={(e) => {
                      setAllDataFeilds((prev) => ({
                        ...prev,
                        ["holdTimeSeconds"]: e,
                      }));
                    }}
                    initDataLoading={isHeaderLoaded}
                  />
                </td>
                <td className="px-2 py-2 ">
                  <input
                    type="text"
                    value={isHeaderLoaded ? "Loading..." : safetyFactor}
                    className="bg-gray-200 p-2 w-[105px]  rounded-full  border-none "
                    onChange={(e) => {
                      onChangeHeaderValues(e, "safetyFactor");
                    }}
                  />
                </td>
                <td className="px-2 py-2 ">
                  <input
                    type="text"
                    value={isHeaderLoaded ? "Loading..." : projectAhead}
                    className="bg-gray-200 p-2 w-[130px] rounded-full  border-none "
                    onChange={(e) => {
                      onChangeHeaderValues(e, "projectAhead");
                    }}
                  />
                </td>
                <td className="px-2 py-2 ">
                  <HhmmssSelector
                    initialSeconds={laborFixedSeconds}
                    key={"laborFixedSeconds"}
                    onTimeChange={(e) => {
                      setAllDataFeilds((prev) => ({
                        ...prev,
                        ["laborFixedSeconds"]: e,
                      }));
                    }}
                    initDataLoading={isHeaderLoaded}
                  />
                </td>
                <td className="px-2 py-2 ">
                  <HhmmssSelector
                    initialSeconds={laborVarSeconds}
                    key={"laborVarSeconds"}
                    onTimeChange={(e) => {
                      setAllDataFeilds((prev) => ({
                        ...prev,
                        ["laborVarSeconds"]: e,
                      }));
                    }}
                    initDataLoading={isHeaderLoaded}
                  />
                </td>
                <td className="px-2 py-2 ">
                  <div className="relative">
                    <button
                      className="bg-gray-200 p-2 rounded-full border-none box-content whitespace-nowrap w-[130px] text-left"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const rect = e.target.getBoundingClientRect();
                        setDropdownPosition({
                          top: rect.bottom + window.scrollY, // Position just below the button
                          left: rect.left + window.scrollX, // Align with the button's left edge
                        });
                        setSourceTypeDropDown(!sourceTypeDropDown);
                      }}
                    >
                      {editsourceType} item
                    </button>
                    {sourceTypeDropDown &&
                      ReactDOM.createPortal(
                        <div
                          className="absolute z-[9999] top-[105%] left-0 bg-white shadow-lg rounded-lg p-2"
                          style={{
                            position: "absolute",
                            top: `${dropdownPosition.top}px`,
                            left: `${dropdownPosition.left}px`,
                            minWidth: "150px",
                          }}
                        >
                          <button
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                            onClick={() => handleSourceTypeChange("Menu")}
                          >
                            Menu Items
                          </button>
                          <button
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                            onClick={() => handleSourceTypeChange("Inventory")}
                          >
                            Inventory Items
                          </button>
                        </div>,
                        document.body
                      )}
                  </div>
                </td>
                <td className="px-2 py-2 ">
                  <input
                    type="text"
                    value={isHeaderLoaded ? "Loading..." : unitOfMeasure}
                    className="bg-gray-200 p-2 w-[90px] rounded-full  border-none "
                    onChange={(e) => {
                      onChangeHeaderValues(e, "unitOfMeasure");
                    }}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    value={isHeaderLoaded ? "Loading..." : mixMultiplier}
                    className="bg-gray-200 p-2 w-[115px] rounded-full  border-none "
                    onChange={(e) => {
                      onChangeHeaderValues(e, "mixMultiplier");
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {editsourceType === "Menu" ? (
          <EditAndAddDndTable
            key="menu-items-edit"
            tableOneName="Menu Items"
            tableTwoName="Selected Items"
            tableOneHeaders={["Menu ID", "Description"]}
            tableTwoHeaders={["Menu ID", "Description"]}
            initialTableOneData={addMenuItems}
            initialTemplateItems={
              sourceType == editsourceType ? editCookData : []
            }
            dorpabaleidOne={"items"}
            dorpabaleidTwo={"itemstemplate"}
            onSave={(saved) => {
              savedData(saved);
            }}
            isPaginationEnabled={addMenuItems.length > 0}
            onCancel={() => setOpenEditItemModal(!openEditItemModal)}
            initDataLoading={initDataLoading}
            initialTemplateLoade={isHeaderLoaded}
            isSaveDisable={saveDisable}
          />
        ) : (
          <EditAndAddDndTable
            key="inventory-items-edit"
            tableOneName="Inventory item"
            tableTwoName="List of item"
            tableOneHeaders={["Inventory ID", "Description"]}
            tableTwoHeaders={["Inventory ID", "Description"]}
            initialTableOneData={addInventoryItems}
            initialTemplateItems={
              sourceType == editsourceType ? editCookData : []
            }
            dorpabaleidOne={"inventory"}
            dorpabaleidTwo={"inventorytemplate"}
            onSave={(saved) => {
              savedData(saved);
            }}
            isPaginationEnabled={addInventoryItems.length > 0}
            onCancel={() => setOpenEditItemModal(!openEditItemModal)}
            initDataLoading={initDataLoading}
            isSaveDisable={saveDisable}
          />
        )}
      </div>
    );
  };

  const createItemModal = () => {
    let {
      cookItemName,
      unitOfMeasure,
      cookInterval,
      safetyFactor,
      mixMultiplier,
      projectAhead,
      cookTimeSeconds,
      holdTimeSeconds,
      laborFixedSeconds,
      laborVarSeconds,
    } = addHeaderFields;
    const [invalidFields, setInvalidFields] = useState({});

    const validateFields = () => {
      const invalid = {};

      if (!cookItemName.trim()) invalid.cookItemName = true;
      if (!cookInterval) invalid.cookInterval = true;
      if (!safetyFactor) invalid.safetyFactor = true;
      if (!projectAhead.trim()) invalid.projectAhead = true;
      if (!unitOfMeasure.trim()) invalid.unitOfMeasure = true;
      if (!mixMultiplier) invalid.mixMultiplier = true;

      setInvalidFields(invalid);
      return Object.keys(invalid).length === 0; // Return true if all fields are valid
    };

    const onChangeHeaderValues = (e, name) => {
      const value = e.target.value.trim();

      // Clear the error for the current field
      setInvalidFields((prev) => ({ ...prev, [name]: false }));

      setAddHeaderFields((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleSourceTypeChange = (type) => {
      setSourceType(type);
      setSourceTypeDropDown(false);
      getAddNewCookData(type);
    };

    const handleSave = (data) => {
      debugger;
      if (validateFields()) {
        // Proceed with save if fields are valid
        savedData(data);
      } else {
        toast.error("Please fill out all required fields.", {
          autoClose: 1500,
        });
      }
    };

    const savedData = async (saved) => {
      setSaveDisable(true);
      let values = saved.map((item) => {
        let newItem = { ...item };
        newItem.inventoryOrMenuItemID = parseInt(newItem.menuID);
        delete newItem.menuID;
        delete newItem.uniqueKey;
        delete newItem.draggableId;
        newItem.cookItemQuantity = parseInt(newItem.cookItemQuantity);
        newItem.InventoryOrMenuItemName = newItem.description;
        delete newItem.description;
        return newItem;
      });
      let body = addHeaderFields;
      body.listCookDropCookItemDetails = values;
      body.sourceType = sourceType;
      try {
        const postData = {
          fullUrl: "api/cookdrop/savecookdropcookitem",
          urlParams: {
            companyID: companyStateId,
          },
          bodyData: body,
        };

        let result = await postCall(postData);
        if (result?.error == null) {
          await getCookAllItemData();
          toast.success("Saved...", { autoClose: 1500 });
          setAddHeaderFields({
            cookItemName: "",
            unitOfMeasure: "",
            cookInterval: 0,
            safetyFactor: 0,
            mixMultiplier: 0,
            projectAhead: "",
            cookTimeSeconds: 0,
            holdTimeSeconds: 0,
            laborFixedSeconds: 0,
            laborVarSeconds: 0,
            sourceType: "Menu",
            createdOn: "0001-01-01T00:00:00",
            createdBy: 0,
            deletedOn: "0001-01-01T00:00:00",
            deletedBy: 0,
            companyID: companyStateId,
            cookDropCookItemID: null,
          });
          setOpenCreateItemModal(false);
        } else {
          toast.error("Failed to save", { autoClose: 1500 });
        }
      } catch (error) {
        toast.error("Failed to save", { autoClose: 1500 });
      } finally {
        setSaveDisable(false);
      }
    };

    return (
      <div className="lg:gap-[20px] gap-[5px] flex justify-between mx-auto lg:p-4 p-2 h-[100%] flex-col ">
        <div className=" xl:flex space-y-3 xl:space-y-0 lg:py-3 lg:px-4 py-1 px-1  lg:rounded-[30px] rounded-[10px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center tableHOC pr-1 max-h-full  overflow-x-auto overflow-y-visible">
          <table className="min-w-full table-auto table ">
            <thead className="">
              <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset]">
                <th className="lg:px-4 lg:py-2 px-2 py-2 text-left text-sm text-nowrap">
                  Group Name
                </th>
                <th className="lg:px-4 lg:py-2 px-2 py-2 text-left text-sm text-nowrap">
                  Cook Interval
                </th>
                <th className="lg:px-4 lg:py-2 px-2 py-2 text-left text-sm text-nowrap">
                  Cook time
                </th>
                <th className="lg:px-4 lg:py-2 px-2 py-2 text-left text-sm text-nowrap">
                  Hold Time
                </th>
                <th className="lg:px-4 lg:py-2 px-2 py-2 text-left text-sm text-nowrap">
                  Safety Factor
                </th>
                <th className="lg:px-4 lg:py-2 px-2 py-2 text-left text-sm text-nowrap">
                  Project Ahead
                </th>
                <th className="lg:px-4 lg:py-2 px-2 py-2 text-left text-sm text-nowrap">
                  Labor Fixed
                </th>
                <th className="lg:px-4 lg:py-2 px-2 py-2 text-left text-sm text-nowrap">
                  Labor Var
                </th>
                <th className="lg:px-4 lg:py-2 px-2 py-2 text-left text-sm text-nowrap">
                  Source Type
                </th>
                <th className="lg:px-4 lg:py-2 px-2 py-2 text-left text-sm text-nowrap">
                  UOM
                </th>
                <th className="lg:px-4 lg:py-2 px-2 py-2 text-left text-sm  text-nowrap">
                  Mix Multiplier
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="">
                <td className="px-2 py-2 ">
                  <input
                    type="text"
                    value={cookItemName}
                    className={`bg-gray-200 p-2 w-full rounded-full  border-none  ${
                      invalidFields.cookItemName ? "border-red-500" : ""
                    }`}
                    onChange={(e) => {
                      onChangeHeaderValues(e, "cookItemName");
                    }}
                  />
                </td>
                <td className="px-2 py-2 ">
                  <HhmmssSelector
                    enableSeconds={false}
                    initialSeconds={cookInterval * 60}
                    onTimeChange={(e) => {
                      setAddHeaderFields((prev) => ({
                        ...prev,
                        ["cookInterval"]: e / 60,
                      }));
                    }}
                  />
                </td>
                <td className="px-2 py-2 ">
                  <HhmmssSelector
                    initialSeconds={cookTimeSeconds}
                    onTimeChange={(e) => {
                      setAddHeaderFields((prev) => ({
                        ...prev,
                        ["cookTimeSeconds"]: e,
                      }));
                    }}
                  />
                </td>
                <td className="px-2 py-2 ">
                  <HhmmssSelector
                    initialSeconds={holdTimeSeconds}
                    onTimeChange={(e) => {
                      setAddHeaderFields((prev) => ({
                        ...prev,
                        ["holdTimeSeconds"]: e,
                      }));
                    }}
                  />
                </td>
                <td className="px-2 py-2 ">
                  <input
                    type="text"
                    value={safetyFactor}
                    className="bg-gray-200 p-2 w-[105px] rounded-full  border-none "
                    onChange={(e) => {
                      onChangeHeaderValues(e, "safetyFactor");
                    }}
                  />
                </td>
                <td className="px-2 py-2 ">
                  {/* <input
                    type="text"
                    value={projectAhead}
                    className="bg-gray-200 p-2 w-[130px] rounded-full  border-none "
                    onChange={(e) => {
                      onChangeHeaderValues(e, "projectAhead");
                    }}
                  /> */}
                  {/* <Dropdown
								title=''
								options={projectAheadOptions}
								selectedOption={view}
								onOptionChange={(o)=>console.log(o)}
							/> */}
                  <div className="border  mx-0 ml-0 lg:text-[16px] text-[12px] bg-gray-200 p-2 w-[105px] rounded-full  border-none ">
                    <select
                      value={projectAhead}
                      onChange={(e) => {
                        onChangeHeaderValues(e, "projectAhead");
                      }}
                      style={{ outline: "none" }}
                      className="  mx-4 lg:text-[16px] text-[12px] bg-gray-200 p-0 w-[80%] rounded-full  border-none "
                    >
                      <option value={"y"}>Y</option>
                      <option value={"n"}>N</option>
                    </select>
                  </div>
                </td>
                <td className="px-2 py-2 ">
                  <HhmmssSelector
                    initialSeconds={laborFixedSeconds}
                    onTimeChange={(e) => {
                      setAddHeaderFields((prev) => ({
                        ...prev,
                        ["laborFixedSeconds"]: e,
                      }));
                    }}
                  />
                </td>
                <td className="px-2 py-2 ">
                  <HhmmssSelector
                    initialSeconds={laborVarSeconds}
                    onTimeChange={(e) => {
                      setAddHeaderFields((prev) => ({
                        ...prev,
                        ["laborVarSeconds"]: e,
                      }));
                    }}
                  />
                </td>
                <td className="px-2 py-2 overflow-visible ">
                  <div className="relative">
                    <button
                      className="bg-gray-200 p-2 rounded-full border-none box-content whitespace-nowrap w-[120px] text-left text-sm"
                      onClick={(e) => {
                        e.preventDefault(),
                          e.stopPropagation(),
                          setDropdownPosition({
                            top:
                              e.target.getBoundingClientRect().bottom +
                              window.scrollY, // Position just below the button
                            left:
                              e.target.getBoundingClientRect().left +
                              window.scrollX, // Align with the button's left edge
                          });
                        setSourceTypeDropDown(!sourceTypeDropDown);
                      }}
                    >
                      {sourceType} item
                    </button>
                    {sourceTypeDropDown &&
                      ReactDOM.createPortal(
                        <div
                          className="absolute z-[9999]  top-[105%] left-0 rounded-xl text-center bg-white  shadow-[0px_5px_20px_-10px_rgba(0,_0,_0,_0.5)] p-2"
                          style={{
                            position: "absolute",
                            top: `${dropdownPosition.top}px`,
                            left: `${dropdownPosition.left}px`,
                            minWidth: "150px",
                          }}
                          ref={moreOptionsDropdown}
                        >
                          <div className="mb-2 option ">
                            <button
                              className="w-[100%] bg-[#f9f9f9] text-sm"
                              onClick={(e) => {
                                handleSourceTypeChange("Menu");
                              }}
                            >
                              Menu Items
                            </button>
                          </div>
                          <div className="mb-2 option ">
                            <button
                              className="w-[100%] bg-[#f9f9f9] text-nowrap text-sm"
                              onClick={() =>
                                handleSourceTypeChange("Inventory")
                              }
                            >
                              Inventory item
                            </button>
                          </div>
                        </div>,
                        document.body
                      )}
                  </div>
                </td>
                <td className="px-2 py-2 ">
                  <input
                    type="text"
                    value={unitOfMeasure}
                    className="bg-gray-200 p-2 w-[90px] rounded-full  border-none "
                    onChange={(e) => {
                      onChangeHeaderValues(e, "unitOfMeasure");
                    }}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    value={mixMultiplier}
                    className="bg-gray-200 p-2 w-[115px] rounded-full  border-none  "
                    onChange={(e) => {
                      onChangeHeaderValues(e, "mixMultiplier");
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {sourceType === "Menu" ? (
          <EditAndAddDndTable
            key="menu-items"
            tableOneName="Menu Items"
            tableTwoName="Items"
            tableOneHeaders={["Menu ID", "Description"]}
            tableTwoHeaders={["Menu ID", "Description"]}
            initialTableOneData={addMenuItems}
            dorpabaleidOne={"items"}
            dorpabaleidTwo={"itemstemplate"}
            isPaginationEnabled={addMenuItems.length > 100}
            onSave={(saved) => {
              handleSave(saved);
            }}
            onCancel={() => setOpenCreateItemModal(!openCreateItemModal)}
            isSaveDisable={saveDisable}
            initDataLoading={initDataLoading}
          />
        ) : (
          <EditAndAddDndTable
            key="inventory-items"
            tableOneName="Inventory item"
            tableTwoName="Items"
            tableOneHeaders={["Inventory ID", "Description"]}
            tableTwoHeaders={["Inventory ID", "Description"]}
            initialTableOneData={addInventoryItems}
            dorpabaleidOne={"inventory"}
            dorpabaleidTwo={"inventorytemplate"}
            onSave={(saved) => {
              handleSave(saved);
            }}
            onCancel={() => setOpenCreateItemModal(!openCreateItemModal)}
            isSaveDisable={saveDisable}
            isPaginationEnabled={addInventoryItems.length > 100}
            initDataLoading={initDataLoading}
          />
        )}
      </div>
    );
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (source.droppableId === "left" && destination.droppableId === "right") {
      const draggedItem = cookAllData.find(
        (item) => item.cookDropCookItemID === result.draggableId
      );

      const exists = rightTableData.some(
        (table) => table.cookDropCookItemID === draggedItem.cookDropCookItemID
      );
      if (exists) {
        toast.error("Item already exists in the right table", {
          autoClose: 1500,
        });
        return;
      }

      // Append the new table data to the right side
      setRightTableData((prev) => [
        ...prev,
        {
          title: draggedItem.cookItemName,
          description: `Cook Interval ${convertMinutesToHHMM(
            draggedItem.cookInterval
          )}, Cook time ${formatTime(
            draggedItem.cookTimeSeconds
          )}, Hold ${formatTime(draggedItem.holdTimeSeconds)}, Safety ${
            draggedItem.safetyFactor
          }%`,
          items: draggedItem.listCookDropCookItemDetails.map((detail) => ({
            id: detail.inventoryOrMenuItemID,
            inventoryOrMenuItemName: detail.inventoryOrMenuItemName,
            qty: detail.cookItemQuantity,
          })),
          cookDropCookItemID: draggedItem.cookDropCookItemID,
        },
      ]);
    }
  };

  const toggleTableVisibility = (tableId) => {
    setShowFullTable((prev) => ({
      ...prev,
      [tableId]: !prev[tableId],
    }));
  };

  const removeTable = (tableId) => {
    setRightTableData((prev) =>
      prev.filter((table) => table.cookDropCookItemID !== tableId)
    );
  };

  const handleSearch = (searchTerm) => {
    const filtered = cookAllData.filter((item) =>
      item.cookItemName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const deleteCookItem = async (id) => {
    setFilteredData((prev) =>
      prev.filter((item) => item.cookDropCookItemID !== id)
    );
    try {
      let body = {
        companyId: companyStateId,
        cookDropCookItemID: id,
        userID: userID,
        undeleteYN: "N",
      };
      const deleteData = {
        fullUrl: "api/cookdrop/deletecookdropcookitem",
        urlParams: { ...body },
        bodyData: body,
      };
      await deleteCall(deleteData);
    } catch (error) {}
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (
      moreOptionsDropdown.current &&
      !moreOptionsDropdown.current.contains(event.target)
    ) {
      setSourceTypeDropDown(false);
    }
  };

 
  const addTemplateUsingMobile = (data) => {
    let resultData = data;
    setRightTableData((prev) => [
      ...prev,
      {
        title: resultData.cookItemName,
        description: `Cook Interval ${convertMinutesToHHMM(
          resultData.cookInterval
        )}, Cook time ${formatTime(
          resultData.cookTimeSeconds
        )}, Hold ${formatTime(resultData.holdTimeSeconds)}, Safety ${
          resultData.safetyFactor
        }%`,
        items: resultData.listCookDropCookItemDetails.map((detail) => ({
          id: detail.inventoryOrMenuItemID,
          inventoryOrMenuItemName: detail.inventoryOrMenuItemName,
          qty: detail.cookItemQuantity,
        })),
        cookDropCookItemID: resultData.cookDropCookItemID,
      },
    ]);
  };

  return (
    <>
      <ToastContainer />
      <div className="xl:w-[85%] sm:w-[97%] mx-auto">
        <Steps
          enabled={introSteps.stepsEnabled}
          steps={introSteps.steps}
          initialStep={introSteps.initialStep}
          onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
        />
        <h2 className="my-4 text-xl xl:text-2xl leading-tight text-left pageTitle hidden lg:block">
          Cook Drop Templates
        </h2>
        <div className="lg:hidden bg-[#EFEFEF]  justify-between align-middle flex mb-5 p-2">
          <h2 className="lg:hidden my-auto text-base leading-tight text-left pageTitle font-bold ml-[5px] text-nowrap ">
            Cook Drop Templates
          </h2>
          <ExportOptions
            includeSave={true}
            includeHelp={true}
            handleSaveClick={() => {
              handleSave();
            }}
            handleHelpClick={() =>
              setIntroSteps({ ...introSteps, stepsEnabled: true })
            }
          />
        </div>
        <header className="flex  space-y-3 xl:space-y-0 py-3 px-4 rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center">
          <div className="flex items-center space-x-3 ">
            <UnitSelector
              companyId={companyID}
              alignmentId={alignmentID}
              memberID={selectedUnit}
              memberName={selectedUnitName}
              setMemberName={setSelectedUnitName}
              onClick={() => setShowUnitModal(true)}
              handleClose={() => setShowUnitModal(false)}
              isSaveUnit={isSave}
              isMultiUnit={isSave}
              includeAreas={false}
              // handleSaveButtonClick={!isSave ? handleOkButtonClick : () => {}}
            handleUnitSaveSelection={handleUnitSaveSelection}
            handleUnitSelection={handleUnitSelection}
            />
          </div>
          <div className="hidden lg:block">
            <ExportOptions
              includeSave={true}
              includeHelp={true}
              handleSaveClick={() => {
                handleSave();
              }}
              handleHelpClick={() =>
                setIntroSteps({ ...introSteps, stepsEnabled: true })
              }
            />
          </div>
        </header>

        {isError ? (
          <div>{errorMessage}</div>
        ) : !isLoading ? (
          <>
            <div className="container mx-auto  px-1 py-4 max-w-full cooktemplate lg:hidden block ">
              <Loader loading={isLoading} />
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex w-full gap-4 justify-between flex-col">
                  <Droppable droppableId="left">
                    {(provided) => (
                      <div
                        ref={(node) => {
                          provided.innerRef(node);
                          leftColumnRef.current = node;
                        }}
                        {...provided.droppableProps}
                        className="w-[100%] "
                      >
                        <div
                          className={`sticky top-[1px] ${
                            isSticky
                              ? "bg-[#fff] z-10 py-3 rounded-2xl px-2 shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)]"
                              : ""
                          }`}
                        >
                          <div
                            className={`flex items-center  space-x-2 ${
                              isSticky ? "" : "mb-4"
                            } justify-between`}
                          >
                            <h2 className="xl:text-xl text-base font-bold">
                              Cook Items
                            </h2>
                            <div className="w-[60%] xl:w-[30%] ml-[10px] mr-[10px] ">
                              {" "}
                              <SearchBar
                                onSearch={handleSearch}
                                extraClass="w-full"
                              />
                            </div>
                            <HoverBorderButton
                              extraClass={
                                "!mt-[5px] !mb-[5px] create-New-CookItem"
                              }
                              onClick={() => handleOpenCreateItemModal()}
                            >
                              Create New Item
                            </HoverBorderButton>
                          </div>
                        </div>
                        {filteredData.map((item, index) => (
                          <div className="mt-[15px]">
                            <Draggable
                              key={item.cookDropCookItemID + "l"}
                              draggableId={item.cookDropCookItemID}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] p-[15px] mb-5"
                                >
                                  <div className="p-4 rounded-lg bg-gray-100 relative">
                                    <div className=" xl:w-[85%] lg:w-[75%] w-[65%]">
                                      <h2 className="font-bold xl:text-xl text-base capitalize">
                                        {item.cookItemName}
                                      </h2>
                                      <p className="font-semibold text-sm xl:text-lg">
                                        {`Cook Interval ${convertMinutesToHHMM(
                                          item.cookInterval
                                        )}, Cook time ${formatTime(
                                          item.cookTimeSeconds
                                        )}, Hold ${formatTime(
                                          item.holdTimeSeconds
                                        )}, Safety ${item.safetyFactor}%`}
                                      </p>
                                    </div>

                                    <span
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        addTemplateUsingMobile(item);
                                      }}
                                      className="absolute top-1/2 text-xl right-20 font-bold transform -translate-y-1/2 text-blue-600 hover:text-blue-800 cursor-pointer  z-9"
                                    >
                                      <FaPlusCircle />
                                    </span>
                                    <span
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditItemModal(
                                          item.cookDropCookItemID,
                                          item.sourceType
                                        );
                                      }}
                                      className="absolute top-1/2 text-xl right-12 transform -translate-y-1/2 text-green-600 hover:text-green-800 cursor-pointer  z-9"
                                    >
                                      <FaEdit className="" />
                                    </span>
                                    <span
                                      onClick={(e) => {
                                        e.stopPropagation(),
                                          e.preventDefault(),
                                          deleteCookItem(
                                            item.cookDropCookItemID
                                          );
                                      }}
                                      className="absolute cursor-pointer top-1/2 text-xl right-4 transform -translate-y-1/2 z-9 text-red-500 hover:text-red-700"
                                    >
                                      <RiDeleteBin6Line />
                                    </span>
                                  </div>
                                  <div className="tableHOC overflow-auto max-h-[250px]">
                                    <table className="min-w-full table-auto relative">
                                      <thead className="bg-white sticky top-0 z-9">
                                        <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset] ">
                                          <th className="px-4 py-2 text-left">
                                            Item ID
                                          </th>
                                          <th className="px-4 py-2 text-left">
                                            Description
                                          </th>
                                          <th className="px-4 py-2 text-left">
                                            QTY
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {item.listCookDropCookItemDetails.map(
                                          (menuItem) => (
                                            <tr
                                              key={
                                                menuItem.inventoryOrMenuItemID
                                              }
                                              className="border-b"
                                            >
                                              <td className="px-4 py-2">
                                                {menuItem.inventoryOrMenuItemID}
                                              </td>
                                              <td className="px-4 py-2">
                                                {
                                                  menuItem.inventoryOrMenuItemName
                                                }
                                              </td>
                                              <td className="px-4 py-2">
                                                {menuItem.cookItemQuantity}
                                              </td>
                                            </tr>
                                          )
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          </div>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <Droppable droppableId="right">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="w-[100%] sticky top-0 cook-template"
                      >
                        <div className="rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] p-[15px] sticky top-0 ">
                          <h2 className="text-base font-bold mb-4 ">
                            Template
                          </h2>
                          <div className=" tableHOC overflow-auto h-[90vh]">
                            {rightTableData.length === 0 && (
                              <p className="text-gray-500">
                                Drop the Cook Items here
                              </p>
                            )}
                            {rightTableData.map((table) => (
                              <div
                                key={table.cookDropCookItemID + "R"}
                                className=" mb-4 relative bg-gray-100 p-1 rounded-lg tableHOC overflow-auto"
                              >
                                <div
                                  className="cursor-pointer p-4 rounded-lg bg-gray-100 relative"
                                  onClick={() =>
                                    toggleTableVisibility(
                                      table.cookDropCookItemID
                                    )
                                  }
                                >
                                  <div className=" w-[90%]">
                                    <h2 className="font-bold text-xl capitalize">
                                      {table.title}
                                    </h2>
                                    <p className="font-semibold text-lg">
                                      {table.description}
                                    </p>
                                  </div>
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeTable(table.cookDropCookItemID);
                                    }}
                                    className="absolute top-1/2 right-10 transform -translate-y-1/2 text-red-500 hover:text-red-700 z-9"
                                  >
                                    <RiDeleteBin6Line />
                                  </span>
                                  <span
                                    onClick={(e) => {}}
                                    className="absolute top-1/2 right-4 transform -translate-y-1/2 z-9"
                                  >
                                    {showFullTable[table.cookDropCookItemID] ? (
                                      <FaChevronUp />
                                    ) : (
                                      <FaChevronDown />
                                    )}
                                  </span>
                                </div>

                                {showFullTable[table.cookDropCookItemID] && (
                                  <div className="tableHOC overflow-auto max-h-[245px]">
                                    <table className="min-w-full table-auto mt-0 bg-white">
                                      <thead className="border-b border-b-[var(--tw-primary)] sticky top-0 z-9 bg-white">
                                        <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset] ">
                                          <th className="px-4 py-2 text-left">
                                            Item ID
                                          </th>
                                          <th className="px-4 py-2 text-left">
                                            Description
                                          </th>
                                          <th className="px-4 py-2 text-left">
                                            QTY
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {table.items.map((item, index) => (
                                          <tr
                                            key={item.id}
                                            className={`border-b`}
                                          >
                                            <td className="px-4 py-2">
                                              {item.id}
                                            </td>
                                            <td className="px-4 py-2">
                                              {item.inventoryOrMenuItemName}
                                            </td>
                                            <td className="px-4 py-2">
                                              {item.qty}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              </DragDropContext>
            </div>
            <div className="container mx-auto  px-1 py-4 max-w-full cooktemplate lg:!block !hidden">
              <Loader loading={isLoading} />
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex w-full gap-4 justify-between">
                  <Droppable droppableId="left">
                    {(provided) => (
                      <div
                        ref={(node) => {
                          provided.innerRef(node);
                          leftColumnRef.current = node;
                        }}
                        {...provided.droppableProps}
                        className="w-[40%] "
                      >
                        <div
                          className={`sticky top-[1px] ${
                            isSticky
                              ? "bg-[#fff] z-10 py-3 rounded-2xl px-2 shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)]"
                              : ""
                          }`}
                        >
                          <div
                            className={`flex items-center space-x-2 ${
                              isSticky ? "" : "mb-4"
                            } justify-between`}
                          >
                            <h2 className="xl:text-xl text-base font-bold">
                              Cook Items
                            </h2>
                            <div className="w-[60%] xl:w-[30%] ml-[10px] mr-[10px]">
                              {" "}
                              <SearchBar
                                onSearch={handleSearch}
                                extraClass="w-full"
                              />
                            </div>
                            <HoverBorderButton
                              extraClass={
                                "!mt-[5px] !mb-[5px] create-New-CookItem"
                              }
                              onClick={() => handleOpenCreateItemModal()}
                            >
                              Create New Item
                            </HoverBorderButton>
                          </div>
                        </div>
                        {filteredData.map((item, index) => (
                          <div>
                            <Draggable
                              key={item.cookDropCookItemID}
                              draggableId={item.cookDropCookItemID}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] p-[15px] mb-5"
                                >
                                  <div className="p-4 rounded-lg bg-gray-100 relative">
                                    <div className=" xl:w-[85%] w-[75%]">
                                      <h2 className="font-bold xl:text-xl text-base capitalize">
                                        {item.cookItemName}
                                      </h2>
                                      <p className="font-semibold text-sm xl:text-lg">
                                        {`Cook Interval ${convertMinutesToHHMM(
                                          item.cookInterval
                                        )}, Cook time ${formatTime(
                                          item.cookTimeSeconds
                                        )}, Hold ${formatTime(
                                          item.holdTimeSeconds
                                        )}, Safety ${item.safetyFactor}%`}
                                      </p>
                                    </div>
                                    <span
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditItemModal(
                                          item.cookDropCookItemID,
                                          item.sourceType
                                        );
                                      }}
                                      className="absolute top-1/2 text-xl right-12 transform -translate-y-1/2 text-green-600 hover:text-green-800 cursor-pointer  z-9"
                                    >
                                      <FaEdit className="" />
                                    </span>
                                    <span
                                      onClick={(e) => {
                                        e.stopPropagation(),
                                          e.preventDefault(),
                                          deleteCookItem(
                                            item.cookDropCookItemID
                                          );
                                      }}
                                      className="absolute cursor-pointer top-1/2 text-xl right-4 transform -translate-y-1/2 z-9 text-red-500 hover:text-red-700"
                                    >
                                      <RiDeleteBin6Line />
                                    </span>
                                  </div>
                                  <div className="tableHOC overflow-auto max-h-[250px]">
                                    <table className="min-w-full table-auto relative">
                                      <thead className="bg-white sticky top-0 z-9">
                                        <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset] ">
                                          <th className="px-4 py-2 text-left">
                                            Item ID
                                          </th>
                                          <th className="px-4 py-2 text-left">
                                            Description
                                          </th>
                                          <th className="px-4 py-2 text-left">
                                            QTY
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {item.listCookDropCookItemDetails.map(
                                          (menuItem) => (
                                            <tr
                                              key={
                                                menuItem.inventoryOrMenuItemID
                                              }
                                              className="border-b"
                                            >
                                              <td className="px-4 py-2">
                                                {menuItem.inventoryOrMenuItemID}
                                              </td>
                                              <td className="px-4 py-2">
                                                {
                                                  menuItem.inventoryOrMenuItemName
                                                }
                                              </td>
                                              <td className="px-4 py-2">
                                                {menuItem.cookItemQuantity}
                                              </td>
                                            </tr>
                                          )
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          </div>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <Droppable droppableId="right">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="w-[55%] sticky top-0 cook-template"
                      >
                        <div className="absolute right-[-20px]">
                          <Link to={"/CookChart"} className="text-[#213547]">
                            <HoverBorderButton
                              extraClass={
                                "!mt-[5px] !mb-[20px]  create-New-CookItem "
                              }
                              // onClick={() => handleOpenCreateItemModal()}
                            >
                              Display Chart
                            </HoverBorderButton>
                          </Link>
                        </div>
                        <div className="rounded-2xl mt-[70px]  shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] p-[15px] sticky top-0 ">
                          <h2 className="text-2xl font-bold mb-4 ">Template</h2>
                          <div className=" tableHOC overflow-auto h-[70vh]">
                            {rightTableData.length === 0 && (
                              <p className="text-gray-500">
                                Drop the Cook Items tables here
                              </p>
                            )}
                            {rightTableData.map((table) => (
                              <div
                                key={table.cookDropCookItemID}
                                className=" mb-4 relative bg-gray-100 p-1 rounded-lg tableHOC overflow-auto"
                              >
                                <div
                                  className="cursor-pointer p-4 rounded-lg bg-gray-100 relative"
                                  onClick={() =>
                                    toggleTableVisibility(
                                      table.cookDropCookItemID
                                    )
                                  }
                                >
                                  <div className=" w-[90%]">
                                    <h2 className="font-bold text-xl capitalize">
                                      {table.title}
                                    </h2>
                                    <p className="font-semibold text-lg">
                                      {table.description}
                                    </p>
                                  </div>
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeTable(table.cookDropCookItemID);
                                    }}
                                    className="absolute top-1/2 right-10 transform -translate-y-1/2 text-red-500 hover:text-red-700 z-9"
                                  >
                                    <RiDeleteBin6Line />
                                  </span>
                                  <span
                                    onClick={(e) => {}}
                                    className="absolute top-1/2 right-4 transform -translate-y-1/2 z-9"
                                  >
                                    {showFullTable[table.cookDropCookItemID] ? (
                                      <FaChevronUp />
                                    ) : (
                                      <FaChevronDown />
                                    )}
                                  </span>
                                </div>

                                {showFullTable[table.cookDropCookItemID] && (
                                  <div className="tableHOC overflow-auto max-h-[245px]">
                                    <table className="min-w-full table-auto mt-0 bg-white">
                                      <thead className="border-b border-b-[var(--tw-primary)] sticky top-0 z-9 bg-white">
                                        <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset] ">
                                          <th className="px-4 py-2 text-left">
                                            Item ID
                                          </th>
                                          <th className="px-4 py-2 text-left">
                                            Description
                                          </th>
                                          <th className="px-4 py-2 text-left">
                                            QTY
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {table.items.map((item, index) => (
                                          <tr
                                            key={item.id}
                                            className={`border-b`}
                                          >
                                            <td className="px-4 py-2">
                                              {item.id}
                                            </td>
                                            <td className="px-4 py-2">
                                              {item.inventoryOrMenuItemName}
                                            </td>
                                            <td className="px-4 py-2">
                                              {item.qty}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              </DragDropContext>
            </div>
          </>
        ) : !selectedUnit ? (
          <div className="mt-10 text-xl font-medium text-center">
            No Unit Selected
          </div>
        ) : (
          <div className="mt-10 text-xl font-medium text-center">
            No data available
          </div>
        )}
        <Loader loading={isLoading} />
        <div>
          <UnitModal
            unitData={unitsAndAreasList}
            memberID={selectedUnit}
            memberName={selectedUnitName}
            show={showUnitModal}
          
            handleClose={() => {
              setShowUnitModal(false);
            }}
            handleUnitSelection={handleUnitSelection}
            isSaveUnit={isSave}
            isMultiUnit={isSave}
            includeAreas={isSave}
            // handleSaveButtonClick={!isSave ? handleOkButtonClick : () => {}}
          handleUnitSaveSelection={handleUnitSaveSelection}
          />
          <CalendarModal
            handleClose={() => setShowDateModal(false)}
            modalOpen={showDateModal}
            isDateRange={true}
            handleDateSelection={handleDateSelection}
            handleFromDateChange={(fromDate) => setSelectedFromDate(fromDate)}
            handleToDateChange={(toDate) => setSelectedToDate(toDate)}
            selectedFromDate={selectedFromDate}
            selectedToDate={selectedToDate}
          />
        </div>
      </div>
      <Modal
        isOpen={openCreateItemModal}
        onClose={() => {
          setOpenCreateItemModal(!openCreateItemModal);
        }}
        title={"Add new cook drop item"}
      >
        {createItemModal()}
      </Modal>

      <Modal
        isOpen={openEditItemModal}
        onClose={() => {
          setOpenEditItemModal(!openEditItemModal);
        }}
        title={"Edit cook drop item"}
      >
        {createEditItemModal()}
      </Modal>
    </>
  );
};

export default CookChartTemplate;
