import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { RiDeleteBin6Line } from 'react-icons/ri';
import SearchBar from '../common/SearchBar';
import HoverBorderButton from '../buttons/HoverBorderButton';

const LONG_PRESS_DELAY = 300;

const DraggableRow = ({ item, isTemplate, onDelete, onLongPressDragStart, extraHeaders }) => {
    const [timeoutId, setTimeoutId] = useState(null);

    const handleMouseDown = () => {
        const id = setTimeout(() => onLongPressDragStart(item.id), LONG_PRESS_DELAY);
        setTimeoutId(id);
    };

    const handleMouseUp = () => clearTimeout(timeoutId);

    useEffect(() => () => clearTimeout(timeoutId), [timeoutId]);

    return (
        <>
            <td className="px-4 py-1 border-b w-[30%]">{item.id}</td>
            <td className="px-4 py-1 border-b w-[30%]">{item.description}</td>
            {isTemplate && (
                <>
                    {/* {extraHeaders.map((_, index) =>{
                        console.log('===index===',index)
                        return ( */}
                    <td className="px-4 py-1 border-b w-[20%]">
                        <input className="w-full px-2 py-1 border rounded" type="text" />
                    </td>
                    {/* // )})} */}
                    <td className="px-4 py-1 border-b w-[10%]">
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
    dorpabaleidTwo
}) => {
    const [items, setItems] = useState([]);
    const [templateItems, setTemplateItems] = useState([]);
    const [draggingId, setDraggingId] = useState(null);
    const [uniqueIdCounter, setUniqueIdCounter] = useState(1);

    useEffect(() => {
        // setItems([...initialTableOneData]); // Shallow copy ensures new reference
        setItems(initialTableOneData);
    }, [initialTableOneData]);
    const handleLongPressDragStart = (id) => {
        setDraggingId(id);
    };

    const handleDragEnd = (result) => {
        setDraggingId(null);
        const { source, destination } = result;

        if (!destination || source.droppableId === destination.droppableId) return;

        if (source.droppableId === dorpabaleidOne && destination.droppableId === dorpabaleidTwo) {
            const itemToAdd = items.find((item) => item.id === draggingId);
            if (itemToAdd && !templateItems.some((item) => item.id === itemToAdd.id)) {
                setTemplateItems((prev) => [
                    ...prev,
                    { ...itemToAdd, uniqueKey: uniqueIdCounter },
                ]);
                setUniqueIdCounter((prev) => prev + 1);
            }
        }
    };

    const handleDelete = (uniqueKey) => {
        setTemplateItems((prev) => prev.filter((item) => item.uniqueKey !== uniqueKey));
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex w-full gap-4 justify-between">
                <Droppable droppableId={dorpabaleidOne}>
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="w-[40%] p-[15px]"
                        >
                            <div className="flex items-center space-x-2 mb-4 justify-between">
                                <h2 className="text-2xl font-bold mb-4">{tableOneName}</h2>
                                <div className="w-[200px]">
                                    <SearchBar extraClass="w-full" />
                                </div>
                            </div>
                            <div className="rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] p-[15px]">
                                <table className="min-w-full table-auto">
                                    <thead>
                                        <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset]">
                                            {tableOneHeaders.map((header, index) => (
                                                <th key={index} className="px-4 py-2 text-left">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                                {(provided) => (
                                                    <tr
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onMouseDown={() => handleLongPressDragStart(item.id)}
                                                    >
                                                        <DraggableRow item={item} isTemplate={false} />
                                                    </tr>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </Droppable>
                <Droppable droppableId={dorpabaleidTwo}>
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="w-[55%] rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] p-[15px]"
                        >
                            <h2 className="text-2xl font-bold mb-4">{tableTwoName}</h2>
                            <table className="min-w-full table-auto">
                                <thead>
                                    <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset]">
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
                                        <Draggable key={item.uniqueKey} draggableId={item.uniqueKey.toString()} index={index}>
                                            {(provided) => (
                                                <tr
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <DraggableRow
                                                        item={item}
                                                        isTemplate={true}
                                                        onDelete={handleDelete}
                                                        extraHeaders={tableTwoHeaders}
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
            <div className="flex mb-[30px] w-full justify-end">
                <HoverBorderButton>Save</HoverBorderButton>
                <HoverBorderButton >Cancel</HoverBorderButton>
            </div>
        </DragDropContext>
    );
};

export default EditAndAddDndTable;
