import React, { useRef, useState } from 'react';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
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
			className='flex justify-between px-2 bg-white hover:bg-gray-200'
		>
			{children}
		</tr>
	);
}

function DndTable(props) {
	const [data, setData] = useState(props.data);
	const [expanded, setExpanded] = useState({});
	const [searchQuery, setSearchQuery] = useState('');

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

		const activeGroupIndex = data.findIndex((group) => group.id === active.id);
		const overGroupIndex = data.findIndex((group) => group.id === over.id);

		if (activeGroupIndex !== -1 && overGroupIndex !== -1) {
			const newData = arrayMove(data, activeGroupIndex, overGroupIndex);
			setData(newData);
		} else {
			const activeGroup = data.find((group) => group.subRows.some((row) => row.id === active.id));
			const overGroup = data.find((group) => group.subRows.some((row) => row.id === over.id));

			if (activeGroup && overGroup) {
				const activeSubRowIndex = activeGroup.subRows.findIndex((row) => row.id === active.id);
				const overSubRowIndex = overGroup.subRows.findIndex((row) => row.id === over.id);

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

	const handleSearch = (e) => {
		const query = e.target.value.toLowerCase();
		setSearchQuery(query);

		const newExpanded = {};
		data.forEach((group) => {
			if (group.subRows.some((item) => item.description.toLowerCase().includes(query))) {
				newExpanded[group.id] = true;
			}
		});
		setExpanded(newExpanded);
	};

	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
			<div className='flex items-center justify-between my-4 space-x-4'>
				<div className='flex items-center my-4 space-x-4'>
					<button
						onClick={() => collapseAll()}
						className={`flex items-center gap-2 px-4 py-3 border-2 border-solid border-[var(--tw-primary)]  hover:text-white hover:bg-[var(--tw-primary)] focus:outline-none transition-[color] delay-[0.0833333333s] duration-[250ms] ${
							true
								? 'text-[var(--tw-primary)] bg-[var(--tw-secondary)]'
								: 'bg-[var(--tw-primary)] text-white'
						}`}
					>
						Collapse All
						<IoIosArrowDown />
					</button>
					<button
						onClick={() => expandAll()}
						className={`flex items-center gap-2 px-4 py-3 border-2 border-solid border-[var(--tw-primary)]  hover:text-white hover:bg-[var(--tw-primary)] focus:outline-none transition-[color] delay-[0.0833333333s] duration-[250ms] ${
							true
								? 'bg-[var(--tw-primary)] text-white'
								: 'text-[var(--tw-primary)] bg-[var(--tw-secondary)]'
						}`}
					>
						Expand All
						<IoIosArrowUp />
					</button>
				</div>
				<input
					type='text'
					value={searchQuery}
					onChange={handleSearch}
					placeholder='Search...'
					className=' search-bar rounded-full h-[30px] w-[24%] flex items-center outline-none border border-gray-200 p-5 pr-[18px] pl-[18px] shadow-[0_0_10px_rgba(0,0,0,0.08)] my-auto justify-start transition-all hover:border-[var(--tw-primary)] '
				/>
			</div>
			<div className='overflow-y-auto max-h-[75vh] border border-gray-300 rounded tableHOC'>
				<SortableContext items={data} strategy={verticalListSortingStrategy}>
					<table className='min-w-full bg-white border-none '>
						<tbody className='divide-y-2 '>
							{data.map((group) => {
								// Filter subRows based on the search query
								const filteredSubRows = group.subRows.filter((item) =>
									item.description.toLowerCase().includes(searchQuery)
								);

								return (
									<React.Fragment key={group.id}>
										{/* Parent Row */}
										<DraggableRow
											className='bg-blue-500'
											id={group.id}
											onClick={() => [toggleExpand(group.id)]}
										>
											<td className='flex items-center gap-2 px-2 cursor-pointer '>
												{expanded[group.id] ? <CiSquareMinus /> : <CiSquarePlus />}{' '}
												{group.groupName}
											</td>
											<td className='px-2 '> {group.total} </td>
										</DraggableRow>

										{/* Child Rows */}
										{expanded[group.id] && filteredSubRows.length > 0 && (
											<SortableContext
												items={group.subRows}
												strategy={verticalListSortingStrategy}
											>
												{filteredSubRows.map((item) => (
													<DraggableRow key={item.id} id={item.id} onClick={() => {}}>
														<td className='w-1/3 px-2 pl-10'> {item.description}</td>
														<td className='w-1/3 px-2 text-center'>
															{item.countDescription}
														</td>
														<td className='w-1/3 px-2 text-right'>{item.lineItemCost}</td>
													</DraggableRow>
												))}
											</SortableContext>
										)}
									</React.Fragment>
								);
							})}
						</tbody>
						<div className='sticky bottom-0 px-4 text-right bg-gray-100'>
							Total inventory value $
							{data
								.reduce(
									(total, group) =>
										total +
										group.subRows.reduce((subTotal, item) => subTotal + item.lineItemCost, 0),
									0
								)
								.toFixed(2)}
						</div>
					</table>
				</SortableContext>
			</div>
		</DndContext>
	);
}

export default DndTable;
