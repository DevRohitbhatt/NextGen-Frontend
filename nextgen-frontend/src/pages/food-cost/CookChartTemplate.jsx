import React, { useEffect, useState } from "react";
import { CalendarModal, Dropdown, ExportOptions, ForcastedSales, Loader, Modal, SearchBar, UnitModal, UnitSelector } from "../../components";
import { Steps } from "intro.js-react";
import { useSelector } from "react-redux";
import { RiDeleteBin6Line } from "react-icons/ri";
import EditAndAddDndTable from "../../components/table/EditAndAddDndTable";
import HoverBorderButton from "../../components/buttons/HoverBorderButton";
import { getCall, postCall } from "../../apis/network";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { FaAngleUp, FaChevronDown, FaChevronUp } from "react-icons/fa";

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
    const [leftItems, setLeftItems] = useState([
        { id: '10210104', description: '(4) Biscuit', qty: 4 },
        { id: '10210112', description: '(12) Biscuit', qty: 12 },
        { id: '10210101', description: '(1) Biscuit', qty: 1 },
        { id: '10210106', description: '(6) Biscuit', qty: 6 },
        { id: '10210107', description: '(8) Biscuit', qty: 8 },
    ]);
    const [addMenuItems, setAddMenuItems] = useState([]);
    const [addIntryItems, setAddIntryItems] = useState([]);
    const [sourceType, setSourceType] = useState('Menu Items');
    const [sourceTypeDropDown, setSourceTypeDropDown] = useState(false);
    const [showFullTable, setShowFullTable] = useState(false);
    const [rightTableData, setRightTableData] = useState(null);

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
    const handleOpenEditItemModal = () => {
        getEditCookData(sourceType)
        setOpenEditItemModal(true)
    }

    //Create new item data call
    const getAddNewCookData = async (type) => {
        if (type === "Menu Items") {
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
                setCookChartData({})
                console.error(error)
            }
        } else if (type === "Inventory item") {
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
                setCookChartData({})
                console.error(error)
            }
        }
    }
    //Get all item data call
    const getCookAllItemData = async () => {
        try {
            const getData = {
                fullUrl: 'api/cookdrop/getcookdropcookallitems',
                urlParams: {
                    companyId: 1083,
                },
            };
            const result = await getCall(getData);
            setCookAllData(result.data)
        } catch (error) {

        }

    }
    //Edit  item data call
    const getEditCookData = async () => {
        try {
            const getData = {
                fullUrl: 'api/cookdrop/getcookdropcookitem',
                urlParams: {
                    companyId: 1083,
                    cookDropCookItemID: "8CE44AD2-19E1-4976-945A-AF990B75F74C"
                },
            };
            const result = await getCall(getData);
            result.data[0].listCookDropCookItemDetails.forEach((items) => items.menuID = items.inventoryOrMenuItemID + "")
            SetEditCookData(result.data[0].listCookDropCookItemDetails);
            let { cookItemName, unitOfMeasure, sourceType, cookInterval, safetyFactor, mixMultiplier, projectAhead, cookTimeSeconds, holdTimeSeconds, laborFixedSeconds, createdOn, deletedOn, deletedBy, laborVarSeconds } = result.data[0];
            setAllDataFeilds(result.data[0])

        } catch (error) {

        }
    }

    useEffect(() => {
        getCookAllItemData()
    }, [])

    const createEditItemModal = () => {
        let { cookItemName, unitOfMeasure, cookInterval, safetyFactor, mixMultiplier, projectAhead, cookTimeSeconds, holdTimeSeconds, laborFixedSeconds, laborVarSeconds } = allDataFeilds;

        const onChangeHeaderValues = (value, name) => {
            setAllDataFeilds((prev) => ({
                ...prev, [name]: value.target.value
            }))
        }
        const savedData = async (saved) => {
            let values = saved
            values.forEach((item) => {
                delete item.menuID;
                delete item.uniqueKey;
                item.cookItemQuantity = parseInt(item.cookItemQuantity)
            })
            let body = allDataFeilds
            body.listCookDropCookItemDetails = values;
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
            <div className="gap-[30px] flex justify-between mx-auto p-4 h-[100%] flex-col" >
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
                                    <input
                                        type="text"
                                        value={cookInterval}
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                        onChange={(e) => { onChangeHeaderValues(e, "cookInterval") }}
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <input
                                        type="text"
                                        value={cookTimeSeconds}
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                        onChange={(e) => { onChangeHeaderValues(e, "cookTimeSeconds") }}
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <input
                                        type="text"
                                        value={holdTimeSeconds}
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                        onChange={(e) => { onChangeHeaderValues(e, "holdTimeSeconds") }}
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
                                    <input
                                        type="text"
                                        value={laborFixedSeconds}
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                        onChange={(e) => { onChangeHeaderValues(e, "laborFixedSeconds") }}
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <input
                                        type="text"
                                        value={laborVarSeconds}
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                        onChange={(e) => { onChangeHeaderValues(e, "laborVarSeconds") }}
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <div className="relative">
                                        <button
                                            className="bg-gray-200 p-2 rounded-full border-none box-content whitespace-nowrap w-[130px]"
                                            onClick={() =>
                                                setSourceTypeDropDown(!sourceTypeDropDown)
                                            }
                                        >
                                            {sourceType}
                                            {/* <i className="ml-2 fa fa-chevron-down"></i> */}
                                        </button>
                                        {sourceTypeDropDown && <div className="absolute z-20 mt-2 w-full bg-white rounded shadow-lg">
                                            <ul className="text-left">
                                                <li
                                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => handleSourceTypeChange('Menu Items')}
                                                >
                                                    Menu Items
                                                </li>
                                                <li
                                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => handleSourceTypeChange('Inventory item')}
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
                {sourceType === "Menu Items" ?

                    <EditAndAddDndTable
                        key="menu-items-edit"
                        tableOneName="Menu Items"
                        tableTwoName="Selected Items"
                        tableOneHeaders={['Menu ID', 'Description']}
                        tableTwoHeaders={['Menu ID', 'Description']}
                        initialTableOneData={editCookData}
                        dorpabaleidOne={"items"}
                        dorpabaleidTwo={"itemstemplate"}
                        onSave={(saved) => {
                            savedData(saved);
                        }}
                    />
                    :
                    <EditAndAddDndTable
                        key="inventory-items-edit"
                        tableOneName="Inventory item"
                        tableTwoName="List of item"
                        tableOneHeaders={['Inventory ID', 'Description']}
                        tableTwoHeaders={['Inventory ID', 'Description']}
                        initialTableOneData={addIntryItems}
                        dorpabaleidOne={"inventory"}
                        dorpabaleidTwo={"inventorytemplate"}
                    />
                }
            </div>
        )
    }

    const createItemModal = () => {
        const handleSourceTypeChange = async (type) => {
            await getAddNewCookData(type)
            setSourceType(type);
            setSourceTypeDropDown(false);
        };
        return (
            <div className="gap-[30px] flex justify-between mx-auto p-4 h-[100%] flex-col" >
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
                                        value="Classic Wing"
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <input
                                        type="text"
                                        value="30 Min"
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <input
                                        type="text"
                                        value="0012:00"
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <input
                                        type="text"
                                        value="00.60:00"
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <input
                                        type="text"
                                        value="10%"
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <input
                                        type="text"
                                        value="N"
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <input
                                        type="text"
                                        value="00:00"
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <input
                                        type="text"
                                        value="00:00"
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                    />
                                </td>
                                <td className="px-4 py-2 ">
                                    <div className="relative">
                                        <button
                                            className="bg-gray-200 p-2 rounded-full border-none box-content whitespace-nowrap w-[130px]"
                                            onClick={() =>
                                                setSourceTypeDropDown(!sourceTypeDropDown)
                                            }
                                        >
                                            {sourceType}
                                            {/* <i className="ml-2 fa fa-chevron-down"></i> */}
                                        </button>
                                        {sourceTypeDropDown && <div className="absolute z-50 mt-2 w-full bg-white rounded shadow-lg">
                                            <ul className="text-left">
                                                <li
                                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => handleSourceTypeChange('Menu Items')}
                                                >
                                                    Menu Items
                                                </li>
                                                <li
                                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => handleSourceTypeChange('Inventory item')}
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
                                        value="Each"
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value="54.0%"
                                        className="bg-gray-200 p-2 w-full rounded-full  border-none box-content"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </div>
                {sourceType === "Menu Items" ?

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
                    />
                }
            </div>
        )
    }

    const handleDragEnd = (result) => {
        const { source, destination } = result;

        if (!destination) return;

        if (source.droppableId === "left" && destination.droppableId === "right") {
            // Set the data for the right table on drop
            setRightTableData({
                title: "Biscuits",
                description: "Increment 0015:00, Cook time 0020:00, Hold 0060:00, Safety 10%",
                items: leftItems, // Assuming leftItems holds the table data
            });
            setShowFullTable(false); // Reset view to show only title and description initially
        }
    };

    return (
        <>
            <Loader loading={isLoading} />
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
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <div className="flex w-full gap-4 justify-between">
                                    <div className=" w-[40%]  justify-between">
                                        <Droppable droppableId="left">
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.droppableProps} className="w-full">
                                                    <div className="flex items-center space-x-2 mb-4 justify-between">
                                                        <h2 className="text-xl font-bold">Cook Items</h2>
                                                        <HoverBorderButton onClick={() => handleOpenCreateItemModal()}>Create New Item</HoverBorderButton>
                                                    </div>

                                                    <Draggable draggableId="left-table" index={0}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] p-[15px]"
                                                            >
                                                                <div className="p-4 rounded-lg bg-gray-100">
                                                                    <h2 className="font-bold text-xl">Biscuits</h2>
                                                                    <p className="font-semibold text-lg">
                                                                        Increment 0015:00, Cook time 0020:00, Hold 0060:00, Safety 10%
                                                                    </p>
                                                                </div>
                                                                <table className="min-w-full table-auto">
                                                                    <thead>
                                                                        <tr className="border-b border-b-[var(--tw-primary)]">
                                                                            <th className="px-4 py-2 text-left">Item ID</th>
                                                                            <th className="px-4 py-2 text-left">Description</th>
                                                                            <th className="px-4 py-2 text-left">QTY</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {leftItems.map((item, index) => (
                                                                            <tr key={item.id} className="border-b">
                                                                                <td className="px-4 py-2">{item.id}</td>
                                                                                <td className="px-4 py-2">{item.description}</td>
                                                                                <td className="px-4 py-2">{item.qty}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                        <div className="flex justify-end mt-[15px]">
                                            <button
                                                className="bg-green-600 text-white p-2 rounded-lg mr-[20px] py-[15px] px-[35px]"
                                                onClick={() => handleOpenEditItemModal(true)}
                                            >
                                                Edit
                                            </button>
                                            <button className="bg-red-600 text-white p-2 rounded-lg py-[15px] px-[35px]">Delete</button>
                                        </div>
                                    </div>
                                    {/* Right Column - Template */}
                                    <Droppable droppableId="right">
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps} className="w-[55%]">
                                                <div className="rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] p-[15px]">
                                                    <h2 className="text-2xl font-bold mb-4">Template</h2>
                                                    {rightTableData ? (
                                                        <div
                                                            className="p-4 rounded-lg bg-gray-100 cursor-pointer relative"
                                                            onClick={() => setShowFullTable(!showFullTable)}
                                                        >
                                                            <h2 className="font-bold text-xl">{rightTableData.title}</h2>
                                                            <p className="font-semibold text-lg relative">{rightTableData.description}
                                                            </p>
                                                            <span
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // To prevent triggering the parent 
                                                                    setRightTableData(null);
                                                                    console.log("pawaneep singh")
                                                                }}
                                                                className="absolute top-1/2 right-10 transform -translate-y-1/2 text-red-500 hover:text-red-700 z-9"
                                                            >
                                                                <RiDeleteBin6Line />
                                                            </span>
                                                            <span
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // To prevent triggering the parent 
                                                                    setShowFullTable(!showFullTable)
                                                                }}
                                                                className="absolute top-1/2 right-4 transform -translate-y-1/2 z-9"
                                                            >
                                                               {showFullTable ? <FaChevronDown /> : <FaChevronUp /> }
                                                            </span>

                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500">Drop the Cook Items table here</p>
                                                    )}
                                                    {showFullTable && rightTableData && (
                                                        <table className="min-w-full table-auto mt-4">
                                                            <thead>
                                                                <tr className="border-b border-b-[var(--tw-primary)]">
                                                                    <th className="px-4 py-2 text-left">Item ID</th>
                                                                    <th className="px-4 py-2 text-left">Description</th>
                                                                    <th className="px-4 py-2 text-left">QTY</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {rightTableData.items.map((item) => (
                                                                    <tr key={item.id} className="border-b">
                                                                        <td className="px-4 py-2">{item.id}</td>
                                                                        <td className="px-4 py-2">{item.description}</td>
                                                                        <td className="px-4 py-2">{item.qty}</td>

                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    )}
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