import React, { useRef, useState } from 'react';
import {
    DndContext,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable';
import { CiSquareMinus, CiSquarePlus } from 'react-icons/ci';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

function DraggableRow({ id, onClick, children }) {
    const timer = useRef(null);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        opacity: isDragging ? 0.9 : 1,
    };



    const handleMouseDown = () => {
        timer.current = setTimeout(() => {
            timer.current = null;
        }, 200);
    };

    const handleMouseUp = () => {

        if (timer.current) {
            clearTimeout(timer);
            onClick(onClick);
        }
    };
    return (
        <tr
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className='hover:bg-gray-200 bg-white flex justify-between px-2'
        >
            {children}
        </tr>
    );
}

function DndTable(props) {
    const [data, setData] = useState(props.data);
    const [expanded, setExpanded] = useState({});

    const toggleExpand = (groupId) => {
        setExpanded((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
    };
    const expandAll = () => {
        const allExpanded = data.reduce((acc, group) => {
            acc[group.id] = true;
            return acc;
        }, {});
        setExpanded(allExpanded);
    };

    const collapseAll = () => {
        setExpanded({});
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeGroupIndex = data.findIndex(group => group.id === active.id);
        const overGroupIndex = data.findIndex(group => group.id === over.id);

        if (activeGroupIndex !== -1 && overGroupIndex !== -1) {
            const newData = arrayMove(data, activeGroupIndex, overGroupIndex);
            setData(newData);
        } else {
            const activeGroup = data.find(group => group.subRows.some(row => row.id === active.id));
            const overGroup = data.find(group => group.subRows.some(row => row.id === over.id));

            if (activeGroup && overGroup) {
                const activeSubRowIndex = activeGroup.subRows.findIndex(row => row.id === active.id);
                const overSubRowIndex = overGroup.subRows.findIndex(row => row.id === over.id);

                let newData = [...data];
                const [movedItem] = newData[data.indexOf(activeGroup)].subRows.splice(activeSubRowIndex, 1);

                if (activeGroup.id === overGroup.id) {
                    newData[data.indexOf(overGroup)].subRows.splice(overSubRowIndex, 0, movedItem);
                } else {
                    newData[data.indexOf(overGroup)].subRows.splice(overSubRowIndex, 0, movedItem);
                }

                setData(newData);
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}

        >
            <div className='flex items-center my-4 space-x-4 '>
                <button
                    onClick={() => collapseAll()}
                    className={`flex items-center gap-2 px-4 py-3 border-2 border-solid border-[var(--tw-primary)]  hover:text-white hover:bg-[var(--tw-primary)] focus:outline-none transition-[color] delay-[0.0833333333s] duration-[250ms] ${true
                        ? 'text-[var(--tw-primary)] bg-[var(--tw-secondary)]'
                        : 'bg-[var(--tw-primary)] text-white'
                        }`}
                >
                    Collapse All
                    <IoIosArrowDown />
                </button>
                <button
                    onClick={() => expandAll()}
                    className={`flex items-center gap-2 px-4 py-3 border-2 border-solid border-[var(--tw-primary)]  hover:text-white hover:bg-[var(--tw-primary)] focus:outline-none transition-[color] delay-[0.0833333333s] duration-[250ms] ${true
                        ? 'bg-[var(--tw-primary)] text-white'
                        : 'text-[var(--tw-primary)] bg-[var(--tw-secondary)]'
                        }`}
                >
                    Expand All
                    <IoIosArrowUp />
                </button>
            </div>
            <div className="overflow-y-auto max-h-[75vh] border border-gray-300 rounded tableHOC">
                <SortableContext items={data} strategy={verticalListSortingStrategy}>
                    <table className="min-w-full bg-white border-none ">

                        <tbody className='divide-y-2 '>
                            {data.map((group) => (
                                <React.Fragment key={group.id}>
                                    {/* Parent Row */}
                                    <DraggableRow className='bg-blue-500' id={group.id} onClick={() => [toggleExpand(group.id)]}>
                                        <td className="px-2  cursor-pointer  flex items-center gap-2 ">
                                            {expanded[group.id] ? <CiSquareMinus /> : <CiSquarePlus />} {group.groupName}
                                        </td>
                                        <td className="px-2  "> {group.total} </td>
                                    </DraggableRow>

                                    {/* Child Rows */}
                                    {expanded[group.id] && (
                                        <SortableContext items={group.subRows} strategy={verticalListSortingStrategy}>
                                            {group.subRows.map((item) => (
                                                <DraggableRow key={item.id} id={item.id} onClick={() => { }} >
                                                    <td className="px-2 w-1/3  pl-10"> {item.description}</td>
                                                    <td className="px-2 w-1/3 text-center">{item.countDescription}</td>
                                                    <td className="px-2 w-1/3 text-right">{item.lineItemCost}</td>
                                                </DraggableRow>
                                            ))}
                                        </SortableContext>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                        <div className="bg-gray-100 sticky bottom-0 text-right px-4">
                           Total inventory value ${data.reduce((total, group) =>
                                total + group.subRows.reduce((subTotal, item) => subTotal + item.lineItemCost, 0), 0).toFixed(2)}
                        </div>
                    </table>
                </SortableContext>
            </div>
        </DndContext>
    );
}

export default DndTable;
