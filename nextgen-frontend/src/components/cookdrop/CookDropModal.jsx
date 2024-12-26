import { useState } from "react";
import HhmmssSelector from "../common/HhmmssSelector";
import EditAndAddDndTable from "../table/EditAndAddDndTable";
import { postCall } from "../../apis/network";
import ReactDOM from "react-dom";
import { toast } from "react-toastify";

export const CreateItemModal = ({addHeaderFields,
    projectAheadOptions,
    sourceType,
    sourceTypeDropDown,
    addMenuItems,
    saveDisable,
    initDataLoading,
    setAddHeaderFields,
    setDropdownPosition,
    setSourceType,
    setSourceTypeDropDown,
    setSaveDisable,
    setOpenCreateItemModal,
    dropdownPosition,
    moreOptionsDropdown,
    addInventoryItems,
    getAddNewCookData,
    getCookAllItemData,
    openCreateItemModal,
    companyStateId
}) => {
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
      if (!cookInterval || cookInterval == "0") invalid.cookInterval = true;
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
        newItem.inventoryOrMenuItemName = newItem.description;
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
        console.log("errrrrr",error)
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
                    className={`bg-gray-200 p-2 w-full rounded-full   ${
                      invalidFields.cookItemName
                        ? "border border-red-500"
                        : "border-none "
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
                    showErrorFeild={invalidFields.cookInterval}
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
                    value={safetyFactor+"%"}
                    className={`bg-gray-200 p-2 w-[105px] rounded-full   ${
                      invalidFields.safetyFactor
                        ? "border border-red-500"
                        : "border-none"
                    }`}
                    onChange={(e) => {
                      const inputValue = e.target.value.replace(/%/g, ""); // Remove '%' from the input
                      if (!isNaN(inputValue)) {
                        // Ensure the value is a valid number
                        onChangeHeaderValues({ target: { value: inputValue } }, "safetyFactor");
                      }
                    }}
                    onBlur={(e) => {
                      const inputValue = e.target.value.replace(/%/g, ""); // Remove '%' on blur
                      if (!isNaN(inputValue)) {
                        onChangeHeaderValues({ target: { value: inputValue } }, "safetyFactor");
                      }
                    }}
                  />
                </td>
                <td className="px-2 py-2 ">
                  <select
                    value={projectAhead}
                    onChange={(e) => {
                      onChangeHeaderValues(e, "projectAhead");
                    }}
                    style={{ outline: "none" }}
                    className="bg-gray-200 p-2 rounded-full border-none box-content whitespace-nowrap w-[105px] text-left text-sm"
                  >
                    
                      {projectAheadOptions.map((projAhed) => (
                        <option
                          className="rounded-xl text-left bg-white w-[105px]  shadow-[0px_5px_20px_-10px_rgba(0,_0,_0,_0.5)] p-2"
                          value={projAhed.name}
                        >
                          <div className="w-[90px] bg-[#f9f9f9] text-sm m-5">
                            {projAhed.name}
                          </div>
                        </option>
                      ))}
                   
                  </select>
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
                    className={`bg-gray-200 p-2 w-[90px] rounded-full  ${
                      validateFields.unitOfMeasure
                        ? "border border-red-500"
                        : "border-none"
                    } `}
                    onChange={(e) => {
                      onChangeHeaderValues(e, "unitOfMeasure");
                    }}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    value={mixMultiplier+"%"}
                    className={`bg-gray-200 p-2 w-[115px] rounded-full  ${
                      validateFields.mixMultiplier
                        ? "border-red-500 border"
                        : "border-none"
                    }`}
                    onChange={(e) => {
                      const inputValue = e.target.value.replace(/%/g, ""); // Remove '%' from the input
                      if (!isNaN(inputValue)) {
                        // Ensure the value is a valid number
                        onChangeHeaderValues({ target: { value: inputValue } }, "mixMultiplier");
                      }
                    }}
                    onBlur={(e) => {
                      const inputValue = e.target.value.replace(/%/g, ""); // Remove '%' on blur
                      if (!isNaN(inputValue)) {
                        onChangeHeaderValues({ target: { value: inputValue } }, "mixMultiplier");
                      }
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
            dropabaleidOne={"items"}
            dropabaleidTwo={"itemstemplate"}
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
            dropabaleidOne={"inventory"}
            dropabaleidTwo={"inventorytemplate"}
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


 export const CreateEditItemModal = ({
    allDataFeilds,
    isHeaderLoaded,
    editsourceType,
    sourceTypeDropDown,
    addMenuItems,
    initDataLoading,
    saveDisable,
    setAllDataFeilds,
    editCookData,
    setDropdownPosition,
    setSourceTypeDropDown,
    dropdownPosition,
    getAddNewCookData,
    setEditSourceType,
    addInventoryItems,
    openEditItemModal,
    setOpenEditItemModal,
    setSaveDisable,
    companyStateId,
    getCookAllItemData
 }) => {
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
        newItem.inventoryOrMenuItemName = newItem.description;
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
        console.log("---er",error)
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
                    value={isHeaderLoaded ? "Loading..." : safetyFactor+"%"}
                    className="bg-gray-200 p-2 w-[105px]  rounded-full  border-none "
                    onChange={(e) => {
                      const inputValue = e.target.value.replace(/%/g, ""); // Remove '%' from the input
                      if (!isNaN(inputValue)) {
                        // Ensure the value is a valid number
                        onChangeHeaderValues({ target: { value: inputValue } }, "safetyFactor");
                      }
                    }}
                    onBlur={(e) => {
                      const inputValue = e.target.value.replace(/%/g, ""); // Remove '%' on blur
                      if (!isNaN(inputValue)) {
                        onChangeHeaderValues({ target: { value: inputValue } }, "safetyFactor");
                      }
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
                    value={isHeaderLoaded ? "Loading..." : mixMultiplier +"%"}
                    className="bg-gray-200 p-2 w-[115px] rounded-full  border-none "
                    onChange={(e) => {
                      const inputValue = e.target.value.replace(/%/g, ""); // Remove '%' from the input
                      if (!isNaN(inputValue)) {
                        // Ensure the value is a valid number
                        onChangeHeaderValues({ target: { value: inputValue } }, "mixMultiplier");
                      }
                    }}
                    onBlur={(e) => {
                      const inputValue = e.target.value.replace(/%/g, ""); // Remove '%' on blur
                      if (!isNaN(inputValue)) {
                        onChangeHeaderValues({ target: { value: inputValue } }, "mixMultiplier");
                      }
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
            dropabaleidOne={"items"}
            dropabaleidTwo={"itemstemplate"}
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
            dropabaleidOne={"inventory"}
            dropabaleidTwo={"inventorytemplate"}
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