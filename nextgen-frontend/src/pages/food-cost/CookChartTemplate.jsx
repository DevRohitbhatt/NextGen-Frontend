import React, { useEffect, useState } from "react";
import { CalendarModal, Dropdown, ExportOptions, ForcastedSales, Loader, Modal, SearchBar, UnitModal, UnitSelector } from "../../components";
import { Steps } from "intro.js-react";
import { useSelector } from "react-redux";
import { RiDeleteBin6Line } from "react-icons/ri";
import EditAndAddDndTable from "../../components/table/EditAndAddDndTable";
import HoverBorderButton from "../../components/buttons/HoverBorderButton";

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


    const [items, setItems] = useState([
        { id: '10210104', description: '(4) Biscuit', qty: 4 },
        { id: '10210112', description: '(12) Biscuit', qty: 12 },
        { id: '10210101', description: '(1) Biscuit', qty: 1 },
        { id: '10210106', description: '(6) Biscuit', qty: 6 },
        { id: '10210107', description: '(8) Biscuit', qty: 8 },
    ]);

    const [inv, setInv] = useState([
        { id: '10210134', description: '(4) Biscuit', qty: 4 },
        { id: '102101132', description: '(12) Biscuit', qty: 12 },
        { id: '102101031', description: '(1) Biscuit', qty: 1 },
        { id: '102101036', description: '(6) Biscuit', qty: 6 },
        { id: '102101037', description: '(8) Biscuit', qty: 8 },
    ]);
    const [templateItems, setTemplateItems] = useState([
        { id: '10210112', description: '(12) Biscuit', qty: 12 },
        { id: '10210104', description: '(4) Biscuit', qty: 4 },
    ]);
    const [sourceType, setSourceType] = useState('Menu Items');
    const [sourceTypeDropDown, setSourceTypeDropDown] = useState(false);

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

    const createItemModal = () => {
        const handleSourceTypeChange = (type) => {
            setSourceType(type);
            setSourceTypeDropDown(false);
        };
        return (
            <div className="gap-[40px] flex justify-between mx-auto p-4 h-[100%] flex-col" >
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
                                        {sourceTypeDropDown && <div className="absolute z-10 mt-2 w-full bg-white rounded shadow-lg">
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

                {/* start  */}
                {sourceType === "Menu Items" ?

                    <EditAndAddDndTable
                        key="menu-items"
                        tableOneName="Menu Items"
                        tableTwoName="Selected Items"
                        tableOneHeaders={['Menu ID', 'Description']}
                        tableTwoHeaders={['Menu ID', 'Description']}
                        initialTableOneData={items}
                        dorpabaleidOne={"items"}
                        dorpabaleidTwo={"itemstemplate"}
                    />
                    :
                    <EditAndAddDndTable
                        key="inventory-items"
                        tableOneName="Inventory item"
                        tableTwoName="List of item"
                        tableOneHeaders={['Inventory ID', 'Description']}
                        tableTwoHeaders={['Inventory ID', 'Description']}
                        initialTableOneData={inv}
                        dorpabaleidOne={"inventory"}
                        dorpabaleidTwo={"inventorytemplate"}
                    />
                }
            </div>
        )
    }

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
                        <div className="container mx-auto  px-1 py-4">
                            <div className="flex w-full gap-4 justify-between">
                                <div className="w-[40%]">

                                    <div className="flex items-center space-x-2 mb-4 justify-between" >
                                        <h2 className="text-xl font-bold ">Cook Items</h2>
                                        <div className="w-[300px]">
                                            <SearchBar
                                                extraClass="w-full"
                                            />
                                        </div>
                                        <HoverBorderButton onClick={() => { setOpenCreateItemModal(true) }} >
                                            Create New Item
                                        </HoverBorderButton>
                                    </div>

                                    <div className="rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] p-[15px]">
                                        <div className="p-4 border rounded-lg bg-gray-100 mb-4">
                                            <p className="font-semibold">
                                                Biscuits, Increment 0015:00, Cook time 0020:00, Hold 0060:00, Safety 10%
                                            </p>
                                        </div>

                                        {/* Table */}
                                        <table className="min-w-full table-auto">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="px-4 py-2 text-left border-b">Item ID</th>
                                                    <th className="px-4 py-2 text-left border-b">Description</th>
                                                    <th className="px-4 py-2 text-left border-b">QTY</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="px-4 py-2 border-b">{item.id}</td>
                                                        <td className="px-4 py-2 border-b">{item.description}</td>
                                                        <td className="px-4 py-2 border-b">{item.qty}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Edit and Delete Buttons */}
                                    <div className="flex justify-end mt-4">
                                        <button className="bg-green-600 text-white p-2 rounded-lg mr-[20px] py-[15px] px-[35px]">Edit</button>
                                        <button className="bg-red-600 text-white p-2 rounded-lg py-[15px] px-[35px]">Delete</button>
                                    </div>
                                </div>

                                {/* Right Column - Template */}
                                <div className="w-[55%] rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] p-[15px]">
                                    <h2 className="text-2xl font-bold mb-4">Template</h2>

                                    <div className="">
                                        <div className="p-4 border rounded-lg bg-gray-100 mb-4">
                                            <p className="font-semibold">
                                                Biscuits, Increment 0015:00, Cook time 0020:00, Hold 0060:00, Safety 10%
                                            </p>
                                        </div>

                                        {/* Template Table */}
                                        <table className="min-w-full table-auto">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="px-4 py-2 text-left border-b">Item ID</th>
                                                    <th className="px-4 py-2 text-left border-b">Description</th>
                                                    <th className="px-4 py-2 text-left border-b">QTY</th>
                                                    <th className="px-4 py-2 text-left border-b">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {templateItems.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="px-4 py-2 border-b">{item.id}</td>
                                                        <td className="px-4 py-2 border-b">{item.description}</td>
                                                        <td className="px-4 py-2 border-b">{item.qty}</td>
                                                        <td className="px-4 py-2 border-b">
                                                            <button className="text-red-500 hover:text-red-700">
                                                                <RiDeleteBin6Line />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
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
        </>
    );
}

export default CookChartTemplate;