import React, { useEffect, useState } from 'react';
import {
	DndContext,
	closestCenter,
	useSensor,
	useSensors,
	PointerSensor,
	KeyboardSensor,
	DragOverlay,
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
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

function ConfirmationModal({ onConfirm, onClose, open }) {
	if (!open) return null;

	return (
		<div className='fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75'>
			<div className='p-6 bg-white rounded shadow-lg'>
				<p className='mb-4'>Do you want to Copy or Move this item to the new group?</p>
				<div className='flex justify-end space-x-4'>
					<button
						onClick={() => onConfirm('move')}
						className='px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700'
					>
						Move
					</button>
					<button
						onClick={() => onConfirm('copy')}
						className='px-4 py-2 text-white bg-green-500 rounded hover:bg-green-700'
					>
						Copy
					</button>
					<button onClick={onClose} className='px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-700'>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}

function DraggableRow({ id, onClick, children, selectdRow, activeRow }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
	const [localStyle, setLocalStyle] = useState({
		transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : 'translate3d(0, 0, 0)',
		transition: transform ? transition : 'transform 0.25s ease, opacity 0.25s ease',
		opacity: isDragging ? 0.9 : 1,
	});

	return (
		<tr
			ref={setNodeRef}
			style={localStyle}
			{...attributes}
			{...listeners}
			onMouseDown={(e) => {
				e.stopPropagation();
			}}
			onTouchStart={(e) => {
				e.stopPropagation();
			}}
			onClick={(e) => {
				e.stopPropagation(), onClick(e);
			}}
			className={`flex justify-between px-2  hover:bg-gray-200 draggable-row ${
				selectdRow === activeRow ? 'bg-gray-200' : 'bg-white'
			}`}
		>
			{children}
		</tr>
	);
}

function DndTable(props) {
	const [data, setData] = useState(props.data);
	const [expanded, setExpanded] = useState({});
	const [searchQuery, setSearchQuery] = useState('');
	const [activeId, setActiveId] = useState(null);
	const [draggingItem, setDraggingItem] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [dragDetails, setDragDetails] = useState({ active: null, over: null });
	const [selectedId, setSelectedId] = useState('');

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
		useSensor(PointerSensor, {
			activationConstraint: {
				delay: 150, // Adjust delay for drag initiation
				tolerance: 20, // Movement tolerance before drag starts
			},
			onStart: (event) => {
				if (event.target.hasAttribute('data-no-drag')) {
					event.preventDefault();
				}
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragStart = (event) => {
		const id = event.active.id;
		setActiveId(id);

		const group = data.find((g) => g.id === id || g.subRows.some((row) => row.id === id));
		if (group) {
			const item = group.id === id ? group : group.subRows.find((row) => row.id === id);
			setDraggingItem(item);
		}
	};

	const handleDragEnd = (event) => {
		const { active, over } = event;

		if (!over || active.id === over.id) return;

		const activeGroupIndex = data.findIndex((group) => group.id === active.id);
		const overGroupIndex = data.findIndex((group) => group.id === over.id);

		if (activeGroupIndex !== -1 && overGroupIndex !== -1) {
			// Moving a group to another position within the main groups
			const newData = arrayMove(data, activeGroupIndex, overGroupIndex);
			setData(newData);
			setActiveId(null);
			setDraggingItem(null);
		} else {
			const activeGroup = data.find((group) => group.subRows.some((row) => row.id === active.id));
			const overGroup = data.find((group) => group.id === over.id);

			if (overGroup) {
				// If a sub-row is dropped onto a group
				setDragDetails({ active, over });
				setModalOpen(true);
			} else if (activeGroup) {
				// Moving within the same group or across different groups
				const overSubRowGroup = data.find((group) => group.subRows.some((row) => row.id === over.id));

				if (activeGroup.id === overSubRowGroup?.id) {
					// Move within the same group without confirmation
					const activeSubRowIndex = activeGroup.subRows.findIndex((row) => row.id === active.id);
					const overSubRowIndex = overSubRowGroup.subRows.findIndex((row) => row.id === over.id);

					let newData = [...data];
					const [movedItem] = newData[data.indexOf(activeGroup)].subRows.splice(activeSubRowIndex, 1);
					newData[data.indexOf(overSubRowGroup)].subRows.splice(overSubRowIndex, 0, movedItem);

					setData(newData);
					setActiveId(null);
					setDraggingItem(null);
				} else {
					// Dragging a sub-row to a different group
					setDragDetails({ active, over });
					setModalOpen(true);
				}
			}
		}
	};

	const handleConfirm = (action) => {
		const { active, over } = dragDetails;

		const activeGroup = data.find((group) => group.subRows.some((row) => row.id === active.id));
		const overGroup =
			data.find((group) => group.id === over.id) ||
			data.find((group) => group.subRows.some((row) => row.id === over.id));

		if (activeGroup && overGroup) {
			const activeSubRowIndex = activeGroup.subRows.findIndex((row) => row.id === active.id);

			let newData = [...data];
			const [movedItem] = newData[data.indexOf(activeGroup)].subRows.splice(activeSubRowIndex, 1);

			if (action === 'move') {
				// Move to the new group
				newData[data.indexOf(overGroup)].subRows.push(movedItem);
			} else if (action === 'copy') {
				// Duplicate and place into the new group
				const copiedItem = { ...movedItem, id: Date.now().toString() }; // New unique id
				newData[data.indexOf(overGroup)].subRows.push(copiedItem);

				// Re-insert the moved item if copied
				newData[data.indexOf(activeGroup)].subRows.splice(activeSubRowIndex, 0, movedItem);
			}

			setData(newData);
		}

		setModalOpen(false);
		setDraggingItem(null);
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

	useEffect(() => {
		if (selectedId !== '') {
			props.selectedForPriceInfo(selectedId);
		}
	}, [selectedId]);

	const allItems = data.flatMap((group) => [group, ...group.subRows]);

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			modifiers={[restrictToVerticalAxis]}
		>
			<div className='flex items-center justify-between my-4 space-x-4'>
				<div className='flex items-center my-4 space-x-4'>
					<button
						onClick={() => collapseAll()}
						className={`flex items-center w-[164px] justify-center gap-[10px] px-5 py-[10px] font-medium border-solid focus:outline-none relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button ${
							Object.keys(expanded).length >= data?.length
								? 'text-[var(--tw-primary)] bg-white'
								: 'bg-[var(--tw-primary)] text-white'
						}`}
					>
						Collapse All
						<IoIosArrowDown />
					</button>
					<button
						onClick={() => expandAll()}
						className={`flex items-center w-[164px] justify-center gap-[10px] px-5 py-[10px] border-solid font-medium focus:outline-none relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button ${
							Object.values(expanded).every((val) => val === true) &&
							Object.keys(expanded).length === data?.length
								? 'bg-[var(--tw-primary)] text-white'
								: 'text-[var(--tw-primary)] bg-white'
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
					className='search-bar rounded-full h-[30px] w-[24%] border border-gray-200 p-5'
				/>
			</div>
			<div className='overflow-y-auto max-h-[75vh] border border-gray-300 rounded'>
				<SortableContext items={allItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
					<table className='min-w-full bg-white'>
						<tbody className='divide-y-2'>
							{data.map((group) => {
								const filteredSubRows = group.subRows.filter((item) =>
									item.description.toLowerCase().includes(searchQuery)
								);

								return (
									<React.Fragment key={group.id}>
										<DraggableRow
											activeRow={group.id}
											selectdRow={selectedId}
											className='bg-blue-500'
											id={group.id}
											onClick={(e) => {
												e.stopPropagation(), console.log('ppppp'), setSelectedId(group.id);
											}}
										>
											<td className='flex items-center gap-2 px-2 cursor-pointer'>
												<div
													data-no-drag
													onClick={(e) => {
														e.stopPropagation(), toggleExpand(group.id);
													}}
													className='flex items-center gap-2 px-2 cursor-pointer '
													onMouseDown={(e) => {
														e.stopPropagation();
													}}
													onTouchStart={(e) => {
														e.stopPropagation();
													}}
													onPointerDown={(e) => {
														e.stopPropagation();
														toggleExpand(group.id);
													}}
												>
													{expanded[group.id] ? <CiSquareMinus /> : <CiSquarePlus />}
												</div>
												<div className='flex items-center gap-2 px-2 '> {group.groupName}</div>
											</td>
											<td className='px-2'>$ {group.total} </td>
										</DraggableRow>
										{expanded[group.id] && filteredSubRows.length > 0 && (
											<SortableContext
												items={group.subRows}
												strategy={verticalListSortingStrategy}
											>
												{filteredSubRows.map((item) => (
													<DraggableRow
														activeRow={item}
														selectdRow={selectedId}
														key={item.id}
														id={item.id}
														onClick={() => {
															setSelectedId(item);
														}}
													>
														<td className='w-1/3 px-2 pl-10'>{item.description}</td>
														<td className='w-1/3 px-2 text-left'>
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
			<DragOverlay>
				{draggingItem && (
					<tr className='drag-overlay-style'>
						<td className='w-1/3 px-2 pl-10'>{draggingItem.description || draggingItem.groupName}</td>
						<td className='w-1/3 px-2 text-center'>{draggingItem.countDescription || ''}</td>
						<td className='w-1/3 px-2 text-right'>
							${draggingItem.lineItemCost?.toFixed(2) || draggingItem.total}
						</td>
					</tr>
				)}
			</DragOverlay>
			<ConfirmationModal open={modalOpen} onConfirm={handleConfirm} onClose={() => setModalOpen(false)} />
		</DndContext>
	);
}

export default DndTable;
