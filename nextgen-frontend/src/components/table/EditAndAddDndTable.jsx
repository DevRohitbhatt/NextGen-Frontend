import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RiDeleteBin6Line } from 'react-icons/ri';
import SearchBar from '../common/SearchBar';

// Draggable row component
const DraggableRow = ({ item, isTemplate }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        backgroundColor: '#fff',
        cursor: 'grab',
    };

    return (
        <tr ref={setNodeRef} {...attributes} {...listeners} style={style}>
            <td className="px-4 py-2 border-b">{item.id}</td>
            <td className="px-4 py-2 border-b">{item.description}</td>
            {isTemplate && (
                <>
                    <td className="px-4 py-2 border-b">
                        <input className="w-full px-2 py-1 border rounded" type="text" />
                    </td>
                    <td className="px-4 py-2 border-b">
                        <button className="text-red-500 hover:text-red-700">
                            <RiDeleteBin6Line />
                        </button>
                    </td>
                </>
            )}
        </tr>
    );
};

// Droppable Table component
const DroppableTable = ({ id, items, setItems, title, isTemplate }) => {
    const { setNodeRef } = useDroppable({
        id,
    });

    return (
        <div>
            <table ref={setNodeRef} className="min-w-full table-auto">
                <thead>
                    <tr className="shadow-[0_-1px_0_var(--tw-primary)_inset]">
                        <th className="px-4 py-2 text-left w-[30%]">Menu ID</th>
                        <th className="px-4 py-2 text-left w-[30%]">Description</th>
                        {isTemplate && (
                            <>
                                <th className="px-4 py-2 text-left w-[20%]">Qty of UOM</th>
                                <th className="px-4 py-2 text-left w-[10%]"  >Action</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    <SortableContext items={items} strategy={verticalListSortingStrategy}>
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={isTemplate ? 4 : 2} className="text-center py-4">
                                    This is where you should drop a item to create a tamplate
                                </td>
                            </tr>
                        )}
                        {items.map((item) => (
                            <DraggableRow key={item.id} item={item} isTemplate={isTemplate} />
                        ))}
                    </SortableContext>
                </tbody>
            </table>
        </div>
    );
};

const EditAndAddDndTable = () => {
    const [items, setItems] = useState([
        { id: '10210104', description: '(4) Biscuit', qty: 4 },
        { id: '10210112', description: '(12) Biscuit', qty: 12 },
        { id: '10210101', description: '(1) Biscuit', qty: 1 },
        { id: '10210106', description: '(6) Biscuit', qty: 6 },
        { id: '10210107', description: '(8) Biscuit', qty: 8 },
    ]);

    const [templateItems, setTemplateItems] = useState([
    ]);

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) return;

        const activeTable = items.find((item) => item.id === active.id) ? 'items' : 'templateItems';
        const targetTable = over.id === 'table1' ? 'items' : 'templateItems';

        if (activeTable !== targetTable) {
            // Moving between tables
            if (activeTable === 'items') {
                const draggedItem = items.find((item) => item.id === active.id);
                // setItems((prev) => prev.filter((item) => item.id !== active.id));
                setTemplateItems((prev) => [...prev, draggedItem]);
            } else {
                const draggedItem = templateItems.find((item) => item.id === active.id);
                setTemplateItems((prev) => prev.filter((item) => item.id !== active.id));
                setItems((prev) => [...prev, draggedItem]);
            }
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex w-full gap-4 justify-between">
                <div className="w-[40%]">

                    <div className="flex items-center space-x-2 mb-4 justify-between">
                        <h2 className="text-2xl font-bold mb-4 whitespace-nowrap">Menu Items</h2>
                        <div className="w-[200px]">
                            <SearchBar
                                extraClass="w-full"
                            />
                        </div>

                    </div>

                    <div className="rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] p-[15px]">
                        <DroppableTable id="table1" items={items} setItems={setItems} isTemplate={false} />
                    </div>


                </div>
                <div className="w-[55%]">
                    <div className="w-full rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] p-[15px]">
                        <h2 className="text-2xl font-bold mb-4 whitespace-nowrap">List of item</h2>
                        <div className="">
                            <DroppableTable id="table2" items={templateItems} setItems={setTemplateItems} isTemplate={true} />
                        </div>
                    </div>
                    <div className="flex mt-[30px] w-full justify-end">
                        <button className="relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] w-[110px] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button mr-[20px]">Save</button>
                        <button className="relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] w-[110px] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button">Cancel</button>
                    </div>
                </div>
            </div>

            {/* tablr  */}
            {/* <DroppableTable id="table1" items={items} setItems={setItems} title="Table 1" isTemplate={false} />
                <DroppableTable id="table2" items={templateItems} setItems={setTemplateItems} title="Table 2" isTemplate={true} /> */}

        </DndContext>
    );
};

export default EditAndAddDndTable;
