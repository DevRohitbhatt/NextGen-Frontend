import React, { useEffect, useState } from "react";
import { CalendarModal, Dropdown, ExportOptions, ForcastedSales, Loader, Modal, SearchBar, UnitModal, UnitSelector } from "../../components";
import { Steps } from "intro.js-react";
import { useSelector } from "react-redux";
import { RiDeleteBin6Line } from "react-icons/ri";
import EditAndAddDndTable from "../../components/table/EditAndAddDndTable";
import HoverBorderButton from "../../components/buttons/HoverBorderButton";
import { getCall, postCall } from "../../apis/network";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { formatTime } from "../../functions/utils/timeConvertFunction";
import HhmmssSelector from "../../components/common/HhmmssSelector";

const CookChartTemplate = (props) => {
    const {
        companyID,
        alignmentID,
        unitsAndAreas: unitsAndAreasList,
        defaultUnitID,
        defaultUnitName,
    } = useSelector((state) => state.globalState);


    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(
        'There was an error trying to load the Cook drop template Report, please try again later.'
    );


    const [selectedUnit, setSelectedUnit] = useState();
    const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [selectedFromDate, setSelectedFromDate] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 0)
    );
    const [selectedToDate, setSelectedToDate] = useState(new Date());
    const [showDateModal, setShowDateModal] = useState(false);
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false)
    const [openEditItemModal, setOpenEditItemModal] = useState(false)
    const [cookAllData, setCookAllData] = useState([])
    const [editCookData, SetEditCookData] = useState([]);
    const [allDataFeilds, setAllDataFeilds] = useState({});
    const [filteredData, setFilteredData] = useState(cookAllData);
    const [addMenuItems, setAddMenuItems] = useState([]);
    const [addIntryItems, setAddIntryItems] = useState([]);
    const [sourceType, setSourceType] = useState('Menu');
    const [editsourceType, setEditSourceType] = useState('Menu');
    const [sourceTypeDropDown, setSourceTypeDropDown] = useState(false);
    const [showFullTable, setShowFullTable] = useState({});
    const [rightTableData, setRightTableData] = useState([]);
    const [addHeadrFeilds, setAddHeadrFeilds] = useState({
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
        "createdOn": "0001-01-01T00:00:00",
        "createdBy": 0,
        "deletedOn": "0001-01-01T00:00:00",
        "deletedBy": 0,
        companyID: 1083,
        cookDropCookItemID: null
    })


    useEffect(() => {
        if (defaultUnitID) {
            setSelectedUnit(defaultUnitID);
        }
        if (defaultUnitName) {
            setSelectedUnitName(defaultUnitName);
        }
    }, [defaultUnitID, defaultUnitName]);



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
        getAddNewCookData(sourceType)
        setOpenCreateItemModal(true)
    }
    //open edit Modal
    const handleOpenEditItemModal = async (id, type) => {
        setEditSourceType(type)
        getAddNewCookData(type)
        const editData = await getEditCookData(id)
        const deepCopiedData = JSON.parse(JSON.stringify(editData.data[0]));
        setAllDataFeilds(deepCopiedData)
        setOpenEditItemModal(true)
    }

    //Create new item data call
    const getAddNewCookData = async (type) => {
        setIsLoading(true)
        if (type === "Menu") {
            try {
                const getData = {
                    fullUrl: 'api/cookdrop/getmenuitems',
                    urlParams: {
                        companyId: 1083,
                    },
                };

                const result = await getCall(getData);
                if (result?.data && result?.data.length) {
                    result.data.forEach((items) => items.menuID = items.menuID + "")
                    setAddMenuItems(result.data)

                }
            } catch (error) {

                console.error(error)
            } finally {
                setIsLoading(false)
            }
        } else if (type === "Inventory") {
            try {
                const getData = {
                    fullUrl: 'api/prepcharttemplate/getinventorylist',
                    urlParams: {
                        companyId: 1083,
                    },
                };

                const result = await getCall(getData);
                if (result?.data && result?.data.length) {
                    result.data.forEach((items) => items.menuID = items.inventoryItemID + "")
                    setAddIntryItems(result.data)
                }
            } catch (error) {
                // setCookChartData({})
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
    }
    //Get all item data call
    const getCookAllItemData = async () => {
        setIsLoading(true)
        try {
            const getData = {
                fullUrl: 'api/cookdrop/getcookdropcookitem',
                urlParams: {
                    companyId: 1083
                },
            };
            const result = await getCall(getData, false);
            setCookAllData(result.data)
            setFilteredData(result.data)
        } catch (error) {

        } finally {
            setIsLoading(false)
        }

    }
    //Edit  item data call
    const getEditCookData = async (id) => {
        setIsLoading(true)
        try {
            const getData = {
                fullUrl: 'api/cookdrop/getcookdropcookitem',
                urlParams: {
                    companyId: 1083,
                    cookDropCookItemID: id
                },
            };
            const result = await getCall(getData, false);
            result.data[0].listCookDropCookItemDetails.forEach((items) => items.menuID = items.inventoryOrMenuItemID + "")
            SetEditCookData(result.data[0].listCookDropCookItemDetails);
            
            return result
        } catch (error) {

        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getCookAllItemData()
    }, [])

    const createEditItemModal = () => {
        let { cookItemName, unitOfMeasure, cookInterval, safetyFactor, mixMultiplier, projectAhead, cookTimeSeconds, holdTimeSeconds, laborFixedSeconds, laborVarSeconds, sourceType } = allDataFeilds;
        const handleSourceTypeChange = async (type) => {
            await getAddNewCookData(type)
            setEditSourceType(type);
            setSourceTypeDropDown(false);
        };

        const onChangeHeaderValues = (e, name) => {
            let value = e.target.value;

            setAllDataFeilds((prev) => ({
                ...prev, [name]: value
            }))
        }
        const savedData = async (saved) => {
            let values = saved
            values.forEach((item) => {
                item.inventoryOrMenuItemID = item.menuID
                delete item.menuID;
                delete item.uniqueKey;
                delete item.draggableId
                item.cookItemQuantity = parseInt(item.cookItemQuantity)
            })
            let body = allDataFeilds
            body.listCookDropCookItemDetails = values;
            body.sourceType = editsourceType;
            try {
                const postData = {
                    fullUrl: 'api/cookdrop/savecookdropcookitem',
                    urlParams: {
                    },
                    bodyData: body,
                };

                let result = await postCall(postData);
                if (result?.error == null) {
                    await getCookAllItemData();
                    toast.success('Saved...', { autoClose: 1500 });
                    setOpenEditItemModal(false);

                } else {
                    toast.error('Failed to save', { autoClose: 1500 });
                }
            } catch (error) {
                toast.error('Failed to save', { autoClose: 1500 });
                console.log(error)
            }

        }



        return (
            <div className="gap-[20px] flex justify-between mx-auto p-4 h-[100%] flex-col" >
                <div className=" xl:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center">
                    <table className="min-w-full table-auto ">
                        <thead className="">
                            <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset]">
                                <th className="px-4 py-2 text-left text-sm ">Group Name</th>
                                <th className="px-4 py-2 text-left text-sm ">Cook Interval</th>
                                <th className="px-4 py-2 text-left text-sm">Cook time</th>
                                <th className="px-4 py-2 text-left text-sm">Hold Time</th>
                                <th className="px-4 py-2 text-left text-sm">Safety Factor</th>
                                <th className="px-4 py-2 text-left text-sm">Project Ahead</th>
                                <th className="px-4 py-2 text-left text-sm">Labor Fixed</th>
                                <th className="px-4 py-2 text-left text-sm ">Labor Var</th>
                                <th className="px-4 py-2 text-left text-sm">Source Type</th>
                                <th className="px-4 py-2 text-left text-sm">UOM</th>
                                <th className="px-4 py-2 text-left text-sm">Mix Multiplier</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="">
                                <td className="px-4 py-2 ">
                                    <input
                                        type="text"
                                        value={cookItemName}
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                        onChange={(e) => { onChangeHeaderValues(e, "cookItemName") }}
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <HhmmssSelector initialSeconds={cookInterval}
                                        key={"cookInterval"}
                                        onTimeChange={(e) => {
                                            setAllDataFeilds((prev) => ({
                                                ...prev, ["cookInterval"]: e
                                            }))
                                        }}
                                        enableSeconds={false}
                                    />

                                </td>
                                <td className="px-4 py-2 ">
                                    <HhmmssSelector initialSeconds={cookTimeSeconds}
                                        key={"cookTimeSeconds"}
                                        onTimeChange={(e) => {
                                            setAllDataFeilds((prev) => ({
                                                ...prev, ["cookTimeSeconds"]: e
                                            }))
                                        }}
                                    />

                                </td>
                                <td className="px-4 py-2 ">
                                    <HhmmssSelector initialSeconds={holdTimeSeconds}
                                        key={"holdTimeSeconds"}
                                        onTimeChange={(e) => {
                                            setAllDataFeilds((prev) => ({
                                                ...prev, ["holdTimeSeconds"]: e
                                            }))
                                        }}
                                    />

                                </td>
                                <td className="px-4 py-2 ">
                                    <input
                                        type="text"
                                        value={safetyFactor}
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                        onChange={(e) => { onChangeHeaderValues(e, "safetyFactor") }}
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <input
                                        type="text"
                                        value={projectAhead}
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                        onChange={(e) => { onChangeHeaderValues(e, "projectAhead") }}
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <HhmmssSelector initialSeconds={laborFixedSeconds}
                                        key={"laborFixedSeconds"}
                                        onTimeChange={(e) => {
                                            setAllDataFeilds((prev) => ({
                                                ...prev, ["laborFixedSeconds"]: e
                                            }))
                                        }}
                                    />

                                </td>
                                <td className="px-4 py-2 ">
                                    <HhmmssSelector initialSeconds={laborVarSeconds}
                                        key={"laborVarSeconds"}
                                        onTimeChange={(e) => {
                                            setAllDataFeilds((prev) => ({
                                                ...prev, ["laborVarSeconds"]: e
                                            }))
                                        }}
                                    />

                                </td>
                                <td className="px-4 py-2 ">
                                    <div className="relative">
                                        <button
                                            className="bg-gray-200 p-2 rounded-full border-none box-content whitespace-nowrap w-[130px] text-left"
                                            onClick={() =>
                                                setSourceTypeDropDown(!sourceTypeDropDown)
                                            }
                                        >
                                            {editsourceType} item
                                            {/* <i className="ml-2 fa fa-chevron-down"></i> */}
                                        </button>
                                        {sourceTypeDropDown && <div className="absolute z-20 mt-2 w-full bg-white rounded shadow-lg">
                                            <ul className="text-left">
                                                <li
                                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => handleSourceTypeChange('Menu')}
                                                >
                                                    Menu Items
                                                </li>
                                                <li
                                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => handleSourceTypeChange('Inventory')}
                                                >
                                                    Inventory item
                                                </li>
                                            </ul>
                                        </div>}
                                    </div>
                                </td>
                                <td className="px-4 py-2 ">
                                    <input
                                        type="text"
                                        value={unitOfMeasure}
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                        onChange={(e) => { onChangeHeaderValues(e, "unitOfMeasure") }}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={mixMultiplier}
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                        onChange={(e) => { onChangeHeaderValues(e, "mixMultiplier") }}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </div>

                {editsourceType === "Menu" ?
                    <EditAndAddDndTable
                        key="menu-items-edit"
                        tableOneName="Menu Items"
                        tableTwoName="Selected Items"
                        tableOneHeaders={['Menu ID', 'Description']}
                        tableTwoHeaders={['Menu ID', 'Description']}
                        initialTableOneData={addMenuItems}
                        initialTemplateItems={sourceType == editsourceType ? editCookData : []}
                        dorpabaleidOne={"items"}
                        dorpabaleidTwo={"itemstemplate"}
                        onSave={(saved) => {
                            savedData(saved);
                        }}
                        isPaginationEnabled={true}
                        onCancel={() => setOpenEditItemModal(!openEditItemModal)}
                    />
                    :
                    <EditAndAddDndTable
                        key="inventory-items-edit"
                        tableOneName="Inventory item"
                        tableTwoName="List of item"
                        tableOneHeaders={['Inventory ID', 'Description']}
                        tableTwoHeaders={['Inventory ID', 'Description']}
                        initialTableOneData={addIntryItems}
                        initialTemplateItems={sourceType == editsourceType ? editCookData : []}
                        dorpabaleidOne={"inventory"}
                        dorpabaleidTwo={"inventorytemplate"}
                        onSave={(saved) => {
                            savedData(saved);
                        }}
                        onCancel={() => setOpenEditItemModal(!openEditItemModal)}
                    />
                }

            </div>
        )
    }

    const convertToSeconds = (timeString) => {
        const timeParts = timeString.split(':');
        let seconds = 0;

        if (timeParts.length === 2) { // HH:MM format
            const [hours, minutes] = timeParts;
            seconds = parseInt(hours) * 3600 + parseInt(minutes) * 60;
        } else if (timeParts.length === 3) { // HH:MM:SS format
            const [hours, minutes, secs] = timeParts;
            seconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(secs);
        }

        return seconds;
    };
    const convertToHHMMSS = (seconds) => {
        const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    };


    const createItemModal = () => {
        let { cookItemName, unitOfMeasure, cookInterval, safetyFactor, mixMultiplier, projectAhead, cookTimeSeconds, holdTimeSeconds, laborFixedSeconds, laborVarSeconds } = addHeadrFeilds;

        const onChangeHeaderValues = (e, name) => {
            let value = e.target.value;
            // if (name === "cookInterval" || name === "cookTimeSeconds") {
            //     // Convert the time input to seconds
            //     value = convertToSeconds(value);
            // }
            setAddHeadrFeilds((prev) => ({
                ...prev, [name]: value
            }))
        }

        const handleSourceTypeChange = async (type) => {
            await getAddNewCookData(type)
            setSourceType(type);
            setSourceTypeDropDown(false);
        };



        const savedData = async (saved) => {
            let values = saved
            console.log(values)
            values.forEach((item) => {
                item.inventoryOrMenuItemID = parseInt(item.menuID);
                delete item.menuID;
                delete item.uniqueKey;
                delete item.draggableId
                item.cookItemQuantity = parseInt(item.cookItemQuantity)
            })
            let body = addHeadrFeilds
            body.listCookDropCookItemDetails = values;
            body.sourceType = sourceType;
            console.log(body)
            try {
                const postData = {
                    fullUrl: 'api/cookdrop/savecookdropcookitem',
                    urlParams: {
                    },
                    bodyData: body,
                };

                let result = await postCall(postData);
            } catch (error) {
                console.log(error)
            }

        }


        return (
            <div className="gap-[20px] flex justify-between mx-auto p-4 h-[100%] flex-col" >
                <div className=" xl:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center">
                    <table className="min-w-full table-auto ">
                        <thead className="">
                            <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset]">
                                <th className="px-4 py-2 text-left text-sm ">Group Name</th>
                                <th className="px-4 py-2 text-left text-sm ">Cook Interval</th>
                                <th className="px-4 py-2 text-left text-sm">Cook time</th>
                                <th className="px-4 py-2 text-left text-sm">Hold Time</th>
                                <th className="px-4 py-2 text-left text-sm">Safety Factor</th>
                                <th className="px-4 py-2 text-left text-sm">Project Ahead</th>
                                <th className="px-4 py-2 text-left text-sm">Labor Fixed</th>
                                <th className="px-4 py-2 text-left text-sm ">Labor Var</th>
                                <th className="px-4 py-2 text-left text-sm">Source Type</th>
                                <th className="px-4 py-2 text-left text-sm">UOM</th>
                                <th className="px-4 py-2 text-left text-sm">Mix Multiplier</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="">
                                <td className="px-4 py-2 ">
                                    <input
                                        type="text"
                                        value={cookItemName}
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                        onChange={(e) => { onChangeHeaderValues(e, "cookItemName") }}
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <HhmmssSelector
                                        enableSeconds={false}
                                        initialSeconds={cookInterval}
                                        onTimeChange={(e) => {
                                            setAddHeadrFeilds((prev) => ({
                                                ...prev, ["cookInterval"]: e
                                            }))
                                        }}
                                    />

                                </td>
                                <td className="px-4 py-2 ">
                                    <HhmmssSelector initialSeconds={cookTimeSeconds}
                                        onTimeChange={(e) => {
                                            setAddHeadrFeilds((prev) => ({
                                                ...prev, ["cookTimeSeconds"]: e
                                            }))
                                        }} />
                                </td>
                                <td className="px-4 py-2 ">
                                    <HhmmssSelector initialSeconds={holdTimeSeconds}
                                        onTimeChange={(e) => {
                                            setAddHeadrFeilds((prev) => ({
                                                ...prev, ["holdTimeSeconds"]: e
                                            }))
                                        }}
                                    />

                                </td>
                                <td className="px-4 py-2 ">
                                    <input
                                        type="number"
                                        value={safetyFactor}
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                        onChange={(e) => { onChangeHeaderValues(e, "safetyFactor") }}
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <input
                                        type="text"
                                        value={projectAhead}
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                        onChange={(e) => { onChangeHeaderValues(e, "projectAhead") }}
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <HhmmssSelector initialSeconds={laborFixedSeconds}
                                        onTimeChange={(e) => {
                                            setAddHeadrFeilds((prev) => ({
                                                ...prev, ["laborFixedSeconds"]: e
                                            }))
                                        }}
                                    />

                                </td>
                                <td className="px-4 py-2 ">
                                    <HhmmssSelector initialSeconds={laborVarSeconds}
                                        onTimeChange={(e) => {
                                            setAddHeadrFeilds((prev) => ({
                                                ...prev, ["laborVarSeconds"]: e
                                            }))
                                        }}
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <div className="relative">
                                        <button
                                            className="bg-gray-200 p-2 rounded-full border-none box-content whitespace-nowrap w-[130px] text-left"
                                            onClick={() =>
                                                setSourceTypeDropDown(!sourceTypeDropDown)
                                            }
                                        >
                                            {sourceType} item

                                        </button>
                                        {sourceTypeDropDown && <div className="absolute z-50 mt-2 w-full bg-white rounded shadow-lg">
                                            <ul className="text-left">
                                                <li
                                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => handleSourceTypeChange('Menu')}
                                                >
                                                    Menu Items
                                                </li>
                                                <li
                                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => handleSourceTypeChange('Inventory')}
                                                >
                                                    Inventory item
                                                </li>
                                            </ul>
                                        </div>}
                                    </div>
                                </td>
                                <td className="px-4 py-2 ">
                                    <input
                                        type="text"
                                        value={unitOfMeasure}
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                        onChange={(e) => { onChangeHeaderValues(e, "unitOfMeasure") }}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={mixMultiplier}
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                        onChange={(e) => { onChangeHeaderValues(e, "mixMultiplier") }}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </div>
                {sourceType === "Menu" ?

                    <EditAndAddDndTable
                        key="menu-items"
                        tableOneName="Menu Items"
                        tableTwoName="Items"
                        tableOneHeaders={['Menu ID', 'Description']}
                        tableTwoHeaders={['Menu ID', 'Description']}
                        initialTableOneData={addMenuItems}

                        dorpabaleidOne={"items"}
                        dorpabaleidTwo={"itemstemplate"}
                        isPaginationEnabled={addMenuItems.length > 100}
                        onSave={(saved) => {
                            savedData(saved);
                        }}
                        onCancel={() => setOpenCreateItemModal(!openCreateItemModal)}
                    />
                    :
                    <EditAndAddDndTable
                        key="inventory-items"
                        tableOneName="Inventory item"
                        tableTwoName="Items"
                        tableOneHeaders={['Inventory ID', 'Description']}
                        tableTwoHeaders={['Inventory ID', 'Description']}
                        initialTableOneData={addIntryItems}
                        dorpabaleidOne={"inventory"}
                        dorpabaleidTwo={"inventorytemplate"}
                        onSave={(saved) => {
                            savedData(saved);
                        }}
                        onCancel={() => setOpenCreateItemModal(!openCreateItemModal)}
                    />
                }
            </div>
        )
    }

    const handleDragEnd = (result) => {
        const { source, destination } = result;

        // Exit if there's no destination
        if (!destination) return;

        // If dropped in the right table area
        if (source.droppableId === 'left' && destination.droppableId === 'right') {
            const draggedItem = cookAllData.find(
                (item) => item.cookDropCookItemID === result.draggableId
            );

            // Check if item already exists in the right table to avoid duplicates
            const exists = rightTableData.some(
                (table) => table.cookDropCookItemID === draggedItem.cookDropCookItemID
            );
            if (exists) {
                toast.error('Item already exists in the right table', { autoClose: 1500 });
                return;
            }

            // Append the new table data to the right side
            setRightTableData((prev) => [
                ...prev,
                {
                    title: draggedItem.cookItemName,
                    description: `Increment 0015:00, Cook time ${draggedItem.cookTimeSeconds}, Hold ${draggedItem.holdTimeSeconds}, Safety ${draggedItem.safetyFactor}%`,
                    items: draggedItem.listCookDropCookItemDetails.map((detail) => ({
                        id: detail.inventoryOrMenuItemID,
                        description: detail.description,
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


    return (
        <>
            <ToastContainer />
            <div className='w-[85%] mx-auto'>
                <h2 className='my-4 text-2xl leading-tight text-left pageTitle'>Cook Drop Templates</h2>
                <header className='xl:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center'>
                    <div className='flex items-center space-x-3 '>
                        <UnitSelector
                            companyId={companyID}
                            alignmentId={alignmentID}
                            memberID={selectedUnit}
                            memberName={selectedUnitName}
                            includeAreas={true}
                            setMemberName={setSelectedUnitName}
                            onClick={() => setShowUnitModal(true)}
                        />

                    </div>
                    <div>
                        <ExportOptions
                            includeSave={true}
                            includeHelp={true}
                        />
                    </div>
                </header>

                {isError ? (
                    <div>{errorMessage}</div>
                ) : (
                    !isLoading &&
                    (true ? (
                        <div className="container mx-auto  px-1 py-4 max-w-full">
                            <Loader loading={isLoading} />
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <div className="flex w-full gap-4 justify-between">
                                    {/* Left Column - Cook Items */}
                                    <Droppable droppableId="left">
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="w-[40%]"
                                            >
                                                <div className="flex items-center space-x-2 mb-4 justify-between">
                                                    <h2 className="text-xl font-bold">Cook Items</h2>
                                                    <div className="w-[30%] ml-[10px] mr-[10px]"> <SearchBar onSearch={handleSearch} extraClass="w-full" /></div>
                                                    <HoverBorderButton onClick={() => handleOpenCreateItemModal()}>Create New Item</HoverBorderButton>
                                                </div>

                                                {filteredData.map((item, index) => (
                                                    <div>
                                                        <Draggable key={item.cookDropCookItemID} draggableId={item.cookDropCookItemID} index={index}>
                                                            {(provided) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className="rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] p-[15px] mb-5"
                                                                >
                                                                    <div className="p-4 rounded-lg bg-gray-100">
                                                                        <h2 className="font-bold text-xl capitalize">{item.cookItemName}</h2>
                                                                        <p className="font-semibold text-lg">
                                                                            {`Increment 0015:00, Cook time ${formatTime(item.cookTimeSeconds)}, Hold ${formatTime(item.holdTimeSeconds)}, Safety ${item.safetyFactor}%`}
                                                                        </p>
                                                                    </div>
                                                                    <div className="tableHOC overflow-auto max-h-[250px]">
                                                                        <table className="min-w-full table-auto relative">
                                                                            <thead className="bg-white sticky top-0 z-9">
                                                                                <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset] ">
                                                                                    <th className="px-4 py-2 text-left">Item ID</th>
                                                                                    <th className="px-4 py-2 text-left">Description</th>
                                                                                    <th className="px-4 py-2 text-left">QTY</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {item.listCookDropCookItemDetails.map((menuItem) => (
                                                                                    <tr key={menuItem.inventoryOrMenuItemID} className="border-b">
                                                                                        <td className="px-4 py-2">{menuItem.inventoryOrMenuItemID}</td>
                                                                                        <td className="px-4 py-2">{menuItem.description}</td>
                                                                                        <td className="px-4 py-2">{menuItem.cookItemQuantity}</td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                        <div className="flex justify-end mt-[15px] mb-[15px]">
                                                            <button
                                                                className="bg-green-600 text-white p-2 rounded-lg py-[10px] px-[35px] mr-[20px] border-none"
                                                                onClick={() => { handleOpenEditItemModal(item.cookDropCookItemID, item.sourceType) }}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button className="bg-red-600 text-white p-2 rounded-lg py-[10px] px-[35px]">Delete</button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>

                                    {/* Right Column - Template */}
                                    <Droppable droppableId="right">
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps} className="w-[55%]">
                                                <div className="rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] p-[15px]">
                                                    <h2 className="text-2xl font-bold mb-4">Template</h2>
                                                    {rightTableData.length === 0 && (
                                                        <p className="text-gray-500">Drop the Cook Items tables here</p>
                                                    )}
                                                    {rightTableData.map((table) => (
                                                        <div key={table.cookDropCookItemID} className=" mb-4 relative bg-gray-100 p-1 rounded-lg ">
                                                            <div className="cursor-pointer p-4 rounded-lg bg-gray-100 relative" onClick={() => toggleTableVisibility(table.cookDropCookItemID)}>
                                                                <h2 className="font-bold text-xl capitalize">{table.title}</h2>
                                                                <p className="font-semibold text-lg">{table.description}</p>
                                                                <span
                                                                    onClick={(e) => {
                                                                        e.stopPropagation(); // To prevent triggering the parent 
                                                                        removeTable(table.cookDropCookItemID);
                                                                    }}
                                                                    className="absolute top-1/2 right-10 transform -translate-y-1/2 text-red-500 hover:text-red-700 z-9"
                                                                >
                                                                    <RiDeleteBin6Line />
                                                                </span>
                                                                <span
                                                                    onClick={(e) => {
                                                                    }}
                                                                    className="absolute top-1/2 right-4 transform -translate-y-1/2 z-9"
                                                                >
                                                                    {showFullTable[table.cookDropCookItemID] ? <FaChevronUp /> : <FaChevronDown />}
                                                                </span>
                                                            </div>

                                                            {showFullTable[table.cookDropCookItemID] && (
                                                                <div className="tableHOC overflow-auto max-h-[245px]">
                                                                    <table className="min-w-full table-auto mt-0 bg-white">
                                                                        <thead className="border-b border-b-[var(--tw-primary)] sticky top-0 z-9 bg-white">
                                                                            <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset] ">
                                                                                <th className="px-4 py-2 text-left">Item ID</th>
                                                                                <th className="px-4 py-2 text-left">Description</th>
                                                                                <th className="px-4 py-2 text-left">QTY</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {table.items.map((item, index) => (
                                                                                <tr key={item.id} className={`border-b`}>
                                                                                    <td className="px-4 py-2">{item.id}</td>
                                                                                    <td className="px-4 py-2">{item.description}</td>
                                                                                    <td className="px-4 py-2">{item.qty}</td>
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
                                        )}
                                    </Droppable>
                                </div>
                            </DragDropContext>
                        </div>
                    ) : !selectedUnit ? (
                        <div className='mt-10 text-xl font-medium text-center'>No Unit Selected</div>
                    ) : (
                        <div className='mt-10 text-xl font-medium text-center'>No data available</div>
                    ))
                )}

                <div>
                    <UnitModal
                        unitData={unitsAndAreasList}
                        memberID={selectedUnit}
                        memberName={selectedUnitName}
                        show={showUnitModal}
                        includeAreas={false}
                        handleClose={() => {
                            setShowUnitModal(false);
                        }}
                        handleUnitSelection={handleUnitSelection}
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
                onClose={() => { setOpenCreateItemModal(!openCreateItemModal) }}
                title={"Add new cook drop item"}
            >
                {createItemModal()}
            </Modal>

            <Modal
                isOpen={openEditItemModal}
                onClose={() => { setOpenEditItemModal(!openEditItemModal) }}
                title={"Edit cook drop item"}
            >
                {createEditItemModal()}
            </Modal>
        </>
    );
}

export default CookChartTemplate;