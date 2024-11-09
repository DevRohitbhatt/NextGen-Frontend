import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { RiDeleteBin6Line } from 'react-icons/ri';
import SearchBar from '../common/SearchBar';
import HoverBorderButton from '../buttons/HoverBorderButton';

const LONG_PRESS_DELAY = 300;

const DraggableRow = ({ item, isTemplate, onDelete, onLongPressDragStart, extraHeaders, onQuantityChange }) => {
    const [timeoutId, setTimeoutId] = useState(null);

    const handleMouseDown = () => {
        const menuID = setTimeout(() => onLongPressDragStart(item.menuID), LONG_PRESS_DELAY);
        setTimeoutId(menuID);
    };

    const handleMouseUp = () => clearTimeout(timeoutId);

    useEffect(() => () => clearTimeout(timeoutId), [timeoutId]);

    return (
        <>
            <td className="px-4 py-1 w-[30%]">{item.menuID}</td>
            <td className="px-4 py-1 w-[30%]">{item.description}</td>
            {isTemplate && (
                <>
                    <td className="px-4 py-1 w-[20%]">
                        <input
                            className="w-full px-2 py-1 border rounded"
                            value={item.cookItemQuantity || ""}
                            onChange={(e) => onQuantityChange(item.uniqueKey, e.target.value)}
                            type="text"
                        />
                    </td>
                    <td className="px-4 py-1 w-[10%]">
                        <button
                            className="text-red-500 hover:text-red-700"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item.uniqueKey);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            style={{ pointerEvents: 'auto' }}
                        >
                            <RiDeleteBin6Line />
                        </button>
                    </td>
                </>
            )}
        </>
    );
};

const EditAndAddDndTable = ({
    tableOneName,
    tableTwoName,
    tableOneHeaders,
    tableTwoHeaders,
    initialTableOneData,
    dorpabaleidOne,
    dorpabaleidTwo,
    onSave,
    isPaginationEnabled // New prop to control pagination
}) => {
    const [items, setItems] = useState([]);
    const [templateItems, setTemplateItems] = useState([]);
    const [draggingId, setDraggingId] = useState(null);
    const [uniqueIdCounter, setUniqueIdCounter] = useState(1);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        setItems(initialTableOneData);
    }, [initialTableOneData]);

    const handleLongPressDragStart = (menuID) => {
        setDraggingId(menuID);
    };

    const handleDragEnd = (result) => {
        setDraggingId(null);
        const { source, destination } = result;

        if (!destination || source.droppableId === destination.droppableId) return;

        if (source.droppableId === dorpabaleidOne && destination.droppableId === dorpabaleidTwo) {
            const itemToAdd = items.find((item) => item.menuID === draggingId);
            if (itemToAdd && !templateItems.some((item) => item.menuID === itemToAdd.menuID)) {
                setTemplateItems((prev) => [
                    ...prev,
                    { ...itemToAdd, uniqueKey: uniqueIdCounter, draggableId: `${itemToAdd.menuID}-${uniqueIdCounter}` },
                ]);
                setUniqueIdCounter((prev) => prev + 1);
            }
        }
    };

    const handleDelete = (uniqueKey) => {
        setTemplateItems((prev) => prev.filter((item) => item.uniqueKey !== uniqueKey));
    };

    const handleQuantityChange = (uniqueKey, newQuantity) => {
        setTemplateItems((prev) =>
            prev.map((item) =>
                item.uniqueKey === uniqueKey ? { ...item, cookItemQuantity: newQuantity } : item
            )
        );
    };

    // Pagination Calculations
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const paginatedItems = isPaginationEnabled
        ? items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        : items;

    const handleChangeItemsPerPage = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleSave = () => {
        if (onSave) {
            onSave(templateItems);
        }
    };

    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex w-full gap-4 justify-between">
                <Droppable droppableId={dorpabaleidOne}>
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="w-[40%] p-[15px] h-[55vh]"
                        >
                            <div className="flex items-center space-x-2 mb-4 justify-between">
                                <h2 className="text-2xl font-bold mb-4">{tableOneName}</h2>
                                <div className="w-[200px]">
                                    <SearchBar onSearch={(e)=>{console.log(e)}} extraClass="w-full" />
                                </div>
                            </div>
                            <div className="rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] px-[15px] tableHOC pr-1 max-h-full overflow-auto">
                                <table className="min-w-full table-auto max-h-[433px] ">
                                    <thead className='sticky top-0 bg-white'>
                                        <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset]">
                                            {tableOneHeaders.map((header, index) => (
                                                <th key={index} className="px-4 py-2 text-left">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedItems.map((item, index) => (
                                            <Draggable key={item.menuID} draggableId={item.menuID} index={index}>
                                                {(provided, snapshot) => (
                                                    <tr
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onMouseDown={() => handleLongPressDragStart(item.menuID)}
                                                        className={"shadow-[0_-1px_0_rgba(0,0,0,0.2)_inset]"}
                                                    >
                                                        {/* <div className='border-b w-full'> */}
                                                        <DraggableRow item={item} isTemplate={false} />
                                                        {/* </div> */}
                                                    </tr>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </tbody>
                                </table>
                                {isPaginationEnabled && (
                                    <div className="flex items-center justify-between sticky bottom-0 bg-white">
                                        <div className="flex gap-2">
                                            <button onClick={goToFirstPage} disabled={currentPage === 1}>First</button>
                                            <button onClick={goToPrevPage} disabled={currentPage === 1}>Prev</button>
                                            <span className='mt-2'>Page {currentPage} of {totalPages}</span>
                                            <button onClick={goToNextPage} disabled={currentPage === totalPages}>Next</button>
                                            <button onClick={goToLastPage} disabled={currentPage === totalPages}>Last</button>
                                        </div>
                                        <select value={itemsPerPage} onChange={handleChangeItemsPerPage} className="border rounded px-2">
                                            <option value={5}>5 per page</option>
                                            <option value={10}>10 per page</option>
                                            <option value={20}>20 per page</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Droppable>
                <Droppable droppableId={dorpabaleidTwo}>
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="w-[55%] rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] px-[15px]  tableHOC overflow-auto pr-1 h-[60vh] "
                        >
                            <table className="min-w-full table-auto ">
                                <thead className=' sticky top-0 bg-white z-10'>
                                    <h2 className="text-2xl font-bold w-full ">{tableTwoName}</h2>
                                    <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset] bg-white">
                                        {tableTwoHeaders.map((header, index) => (
                                            <th key={index} className="px-4 py-2 text-left">{header}</th>
                                        ))}
                                        <th className="px-4 py-2 text-left">Qty of UOM</th>
                                        <th className="px-4 py-2 text-left">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {templateItems.length === 0 && (
                                        <tr>
                                            <td colSpan={tableTwoHeaders.length + 2} className="text-center py-4">
                                                This is where you should drop an item to create a template
                                            </td>
                                        </tr>
                                    )}
                                    {templateItems.map((item, index) => (
                                        <Draggable key={item.draggableId} draggableId={item.draggableId} index={index}>
                                            {(provided, snapshot) => (
                                                <tr
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`shadow-[0_-1px_0_rgba(0,0,0,0.2)_inset] ${snapshot.isDragging ? 'dragging-row' : ''}`}
                                                >
                                                    <DraggableRow
                                                        item={item}
                                                        isTemplate={true}
                                                        onDelete={handleDelete}
                                                        extraHeaders={tableTwoHeaders}
                                                        onQuantityChange={handleQuantityChange}
                                                    />
                                                </tr>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Droppable>
            </div>
            <div className="flex mb-[10px] w-full justify-end">
                <HoverBorderButton onClick={handleSave}>Save</HoverBorderButton>
                <HoverBorderButton>Cancel</HoverBorderButton>
            </div>
        </DragDropContext>
    );
};

export default EditAndAddDndTable;

