import React, { useEffect, useRef, useState } from 'react';
import { CalendarModal, ExportOptions, Loader, Modal, SearchBar, UnitModal, UnitSelector } from '../../components';
import { Steps } from 'intro.js-react';
import { useSelector } from 'react-redux';
import { RiDeleteBin6Line } from 'react-icons/ri';
import HoverBorderButton from '../../components/buttons/HoverBorderButton';
import { deleteCall, getCall, postCall } from '../../apis/network';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { FaChevronDown, FaChevronUp, FaEdit, FaPlusCircle } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import { convertMinutesToHHMM, formatTime } from '../../functions/utils/timeConvertFunction';
import cookChartTemplates from '../../assets/introJSSteps/cookChartTemplate';
import { Link } from 'react-router-dom';
import { CreateEditItemModal, CreateItemModal } from '../../components/cookdrop/CookDropModal';

const CookChartTemplate = (props) => {
	const {
		companyID,
		alignmentID,
		unitsAndAreas: unitsAndAreasList,
		defaultUnitID,
		defaultUnitName,
		userID,
	} = useSelector((state) => state.globalState);
	const [isSave, setIsSave] = useState(false);
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
	const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
	const [openEditItemModal, setOpenEditItemModal] = useState(false);
	const [cookAllData, setCookAllData] = useState([]);
	const [editCookData, setEditCookData] = useState([]);
	const [allDataFeilds, setAllDataFeilds] = useState({});
	const [filteredData, setFilteredData] = useState(cookAllData);
	const [addMenuItems, setAddMenuItems] = useState([]);
	const [addInventoryItems, setAddInventoryItems] = useState([]);
	const [sourceType, setSourceType] = useState('Menu');
	const [editsourceType, setEditSourceType] = useState('Menu');
	const [sourceTypeDropDown, setSourceTypeDropDown] = useState(false);
	const [showFullTable, setShowFullTable] = useState({});
	const [rightTableData, setRightTableData] = useState([]);
	const [addHeaderFields, setAddHeaderFields] = useState({
		cookItemName: '',
		unitOfMeasure: '',
		cookInterval: 0,
		safetyFactor: 0,
		mixMultiplier: 0,
		projectAhead: 'y',
		cookTimeSeconds: 0,
		holdTimeSeconds: 0,
		laborFixedSeconds: 0,
		laborVarSeconds: 0,
		sourceType: 'Menu',
		createdOn: '0001-01-01T00:00:00',
		createdBy: 0,
		deletedOn: '0001-01-01T00:00:00',
		deletedBy: 0,
		companyID: companyID,
		cookDropCookItemID: null,
	});
	const moreOptionsDropdown = useRef(null);
	const [isSticky, setIsSticky] = useState(false);
	const leftColumnRef = useRef(null);
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
	const [modalPosition, setModalPosition] = useState({});
	const [saveDisable, setSaveDisable] = useState(false);
	const [initDataLoading, setInitDataLoading] = useState(false);
	const [isHeaderLoaded, setIsHeaderLoaded] = useState(false);
	const projectAheadOptions = [{ name: 'y' }, { name: 'n' }];
	const [view, setView] = useState('y');
	const [introSteps, setIntroSteps] = useState({
		steps: cookChartTemplates(),
		initialStep: 0,
		stepsEnabled: false,
	});
	const [companyStateId, setCompanyStateId] = useState('');
	useEffect(() => {
		const handleScroll = () => {
			if (leftColumnRef.current) {
				const offsetTop = leftColumnRef.current.getBoundingClientRect().top;
				setIsSticky(offsetTop <= 0);
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	useEffect(() => {
		if (defaultUnitID) {
			setSelectedUnit(() => defaultUnitID);
		}
		if (defaultUnitName) {
			setSelectedUnitName(() => defaultUnitName);
		}
		if (companyID) {
			setCompanyStateId(() => companyID);
		}
		if (userID) {
			setAddHeaderFields((prev) => ({
				...prev,
				createdBy: userID,
				deletedBy: userID,
			}));
		}
	}, [defaultUnitID, defaultUnitName, userID]);

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
		getAddNewCookData(sourceType);
		setOpenCreateItemModal(true);
	};
	//open edit Modal
	const handleOpenEditItemModal = async (id, type) => {
		setEditSourceType(type);
		getAddNewCookData(type);
		setOpenEditItemModal(true);
		const editData = await getEditCookData(id);
		const deepCopiedData = JSON.parse(JSON.stringify(editData.data[0]));
		setAllDataFeilds(deepCopiedData);
	};

	// get Template data api
	const getTemplateData = async () => {
		try {
			const getData = {
				fullUrl: 'api/cookdrop/getcookdroptemplate',
				urlParams: {
					companyId: companyStateId,
					memberID: selectedUnit,
					templateName: 'Default',
				},
			};

			const result = await getCall(getData);
			let resultData = result.data;
			if (result.data.length > 0) {
				for (let i = 0; i < resultData.length; i++) {
					setRightTableData((prev) => [
						...prev,
						{
							title: resultData[i].cookItemName,
							description: `Cook Interval ${convertMinutesToHHMM(
								resultData[i].cookInterval
							)}, Cook time ${formatTime(resultData[i].cookTimeSeconds)}, Hold ${formatTime(
								resultData[i].holdTimeSeconds
							)}, Safety ${resultData[i].safetyFactor}%, UOM ${
								resultData[i].unitOfMeasure
							}, Mix Multiplier ${resultData[i].mixMultiplier}%`,
							items: resultData[i].listCookDropCookItemDetails.map((detail) => ({
								id: detail.inventoryOrMenuItemID,
								inventoryOrMenuItemName: detail.inventoryOrMenuItemName,
								qty: detail.cookItemQuantity,
							})),
							cookDropCookItemID: resultData[i].cookDropCookItemID,
						},
					]);
				}
			} else {
				setRightTableData([]);
			}
		} catch (error) {}
	};

	//Create new item data call
	const getAddNewCookData = async (type) => {
		setInitDataLoading(true);
		if (type === 'Menu') {
			try {
				const getData = {
					fullUrl: 'api/menus/getMenuItemsByCompanyID',
					urlParams: {
						companyId: companyStateId,
					},
				};

				const result = await getCall(getData);
				if (result?.data && result?.data.length) {
					result.data.forEach((items) => (items.menuID = items.itemID + ''));
					setAddMenuItems(result.data);
				}
			} catch (error) {
				console.error(error);
			} finally {
				setInitDataLoading(false);
			}
		} else if (type === 'Inventory') {
			try {
				const getData = {
					fullUrl: 'api/prepcharttemplate/getinventorylist',
					urlParams: {
						companyId: companyStateId,
					},
				};

				const result = await getCall(getData);
				if (result?.data && result?.data.length) {
					result.data.forEach((items) => (items.menuID = items.inventoryItemID + ''));
					setAddInventoryItems(result.data);
				}
			} catch (error) {
			} finally {
				setInitDataLoading(false);
			}
		}
	};
	//Get all item data call
	const getCookAllItemData = async () => {
		setIsLoading(true);
		try {
			const getData = {
				fullUrl: 'api/cookdrop/getcookdropcookitem',
				urlParams: {
					companyId: companyStateId,
				},
			};
			const result = await getCall(getData, false);

			setCookAllData(result.data);
			setFilteredData(result.data);
		} catch (error) {
		} finally {
			setIsLoading(false);
		}
	};
	//Edit  item data call
	const getEditCookData = async (id) => {
		setIsHeaderLoaded(true);
		try {
			const getData = {
				fullUrl: 'api/cookdrop/getcookdropcookitembyid',
				urlParams: {
					companyId: companyStateId,
					cookDropCookItemID: id,
				},
			};
			const result = await getCall(getData, false);
			result.data[0].listCookDropCookItemDetails.forEach(
				(items) => (items.menuID = items.inventoryOrMenuItemID + '')
			);
			setEditCookData(result.data[0].listCookDropCookItemDetails);

			return result;
		} catch (error) {
		} finally {
			setIsHeaderLoaded(false);
		}
	};

	const handleSave = () => {
		setIsSave(true);
		setShowUnitModal(true);
	};
	const handleUnitSaveSelection = (units) => {
		toast.info('Saving data...', { autoClose: 1500 });
		saveTemplateData(units);
	};
	const saveTemplateData = async (units) => {
		let body = {
			companyID: companyStateId,
			unitID: units.map((unit) => unit.id),
			templateName: 'Default',
			cookDropTemplateID: null,
			createdBy: userID,
			cookDropTemplateDetailList: [],
		};

		rightTableData.map((item) => body.cookDropTemplateDetailList.push(item.cookDropCookItemID));

		try {
			const postData = {
				fullUrl: 'api/cookdrop/savecookdroptemplate',
				urlParams: {
					companyID: companyStateId,
				},
				bodyData: body,
			};

			let result = await postCall(postData);
			if (result?.errors === null) {
				toast.success('Saved...', { autoClose: 1500 });
			} else {
				toast.error('Failed to save', { autoClose: 1000 });
			}
		} catch (error) {
			toast.error('Failed to save', { autoClose: 1000 });
		} finally {
			isSave(false);
		}
	};

	useEffect(() => {
		if (companyStateId && selectedUnit) {
			getCookAllItemData();
			getTemplateData();
		}
	}, [companyStateId, selectedUnit]);

	const handleDragEnd = (result) => {
		const { source, destination } = result;

		if (!destination) return;

		if (source.droppableId === 'left' && destination.droppableId === 'right') {
			const draggedItem = cookAllData.find((item) => item.cookDropCookItemID === result.draggableId);

			const exists = rightTableData.some((table) => table.cookDropCookItemID === draggedItem.cookDropCookItemID);
			if (exists) {
				toast.error('Item already exists in the right table', {
					autoClose: 1500,
				});
				return;
			}

			// Append the new table data to the right side
			setRightTableData((prev) => [
				...prev,
				{
					title: draggedItem.cookItemName,
					description: `Cook Interval ${convertMinutesToHHMM(
						draggedItem.cookInterval
					)}, Cook time ${formatTime(draggedItem.cookTimeSeconds)}, Hold ${formatTime(
						draggedItem.holdTimeSeconds
					)}, Safety ${draggedItem.safetyFactor}%, UOM ${draggedItem.unitOfMeasure}, Mix Multiplier ${
						draggedItem.mixMultiplier
					}%`,
					items: draggedItem.listCookDropCookItemDetails.map((detail) => ({
						id: detail.inventoryOrMenuItemID,
						inventoryOrMenuItemName: detail.inventoryOrMenuItemName,
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
		setRightTableData((prev) => prev.filter((table) => table.cookDropCookItemID !== tableId));
	};

	const handleSearch = (searchTerm) => {
		const filtered = cookAllData.filter((item) =>
			item.cookItemName.toLowerCase().includes(searchTerm.toLowerCase())
		);
		setFilteredData(filtered);
	};

	const deleteCookItem = async (id) => {
		setFilteredData((prev) => prev.filter((item) => item.cookDropCookItemID !== id));
		try {
			let body = {
				companyId: companyStateId,
				cookDropCookItemID: id,
				userID: userID,
				undeleteYN: 'N',
			};
			const deleteData = {
				fullUrl: 'api/cookdrop/deletecookdropcookitem',
				urlParams: { ...body },
				bodyData: body,
			};
			await deleteCall(deleteData);
		} catch (error) {}
	};

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside);
		window.addEventListener('scroll', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			window.removeEventListener('scroll', handleClickOutside);
		};
	}, []);

	const handleClickOutside = (event) => {
		if (moreOptionsDropdown.current && !moreOptionsDropdown.current.contains(event.target)) {
			setSourceTypeDropDown(false);
		}
	};

	const addTemplateUsingMobile = (data) => {
		let resultData = data;
		setRightTableData((prev) => [
			...prev,
			{
				title: resultData.cookItemName,
				description: `Cook Interval ${convertMinutesToHHMM(resultData.cookInterval)}, Cook time ${formatTime(
					resultData.cookTimeSeconds
				)}, Hold ${formatTime(resultData.holdTimeSeconds)}, Safety ${resultData.safetyFactor}%, UOM ${
					resultData.unitOfMeasure
				}, Mix Multiplier ${resultData.mixMultiplier}%`,
				items: resultData.listCookDropCookItemDetails.map((detail) => ({
					id: detail.inventoryOrMenuItemID,
					inventoryOrMenuItemName: detail.inventoryOrMenuItemName,
					qty: detail.cookItemQuantity,
				})),
				cookDropCookItemID: resultData.cookDropCookItemID,
			},
		]);
	};

	return (
		<>
			<ToastContainer />
			<div className='xl:w-[85%] sm:w-[97%] mx-auto'>
				<Steps
					enabled={introSteps.stepsEnabled}
					steps={introSteps.steps}
					initialStep={introSteps.initialStep}
					onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
				/>
				<h2 className='hidden my-4 text-xl leading-tight text-left xl:text-2xl pageTitle lg:block'>
					Cook Drop Templates
				</h2>
				<div className='lg:hidden bg-[#EFEFEF]  justify-between align-middle flex mb-5 p-2'>
					<h2 className='lg:hidden my-auto text-base leading-tight text-left pageTitle font-bold ml-[5px] text-nowrap '>
						Cook Drop Templates
					</h2>
					<ExportOptions
						includeSave={true}
						includeHelp={true}
						handleSaveClick={() => {
							handleSave();
						}}
						handleHelpClick={() => setIntroSteps({ ...introSteps, stepsEnabled: true })}
					/>
				</div>
				<header className='flex  space-y-3 xl:space-y-0 py-3 px-4 rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center'>
					<div className='flex items-center space-x-3 '>
						<UnitSelector
							companyId={companyID}
							alignmentId={alignmentID}
							memberID={selectedUnit}
							memberName={selectedUnitName}
							setMemberName={setSelectedUnitName}
							onClick={() => setShowUnitModal(true)}
							handleClose={() => setShowUnitModal(false)}
							includeAreas={false}
						/>
					</div>
					<div className='hidden lg:block'>
						<ExportOptions
							includeSave={true}
							includeHelp={true}
							handleSaveClick={() => {
								handleSave();
							}}
							handleHelpClick={() => setIntroSteps({ ...introSteps, stepsEnabled: true })}
						/>
					</div>
				</header>

				{isError ? (
					<div>{errorMessage}</div>
				) : !isLoading ? (
					<>
						<div className='container block max-w-full px-1 py-4 mx-auto cooktemplate lg:hidden '>
							<Loader loading={isLoading} />
							<DragDropContext onDragEnd={handleDragEnd}>
								<div className='flex flex-col justify-between w-full gap-4'>
									<Droppable droppableId='left'>
										{(provided) => (
											<div
												ref={(node) => {
													provided.innerRef(node);
													leftColumnRef.current = node;
												}}
												{...provided.droppableProps}
												className='w-[100%] '
											>
												<div
													className={`sticky top-[1px] ${
														isSticky
															? 'bg-[#fff] z-10 py-3 rounded-2xl px-2 shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)]'
															: ''
													}`}
												>
													<div
														className={`flex items-center  space-x-2 ${
															isSticky ? '' : 'mb-4'
														} justify-between`}
													>
														<h2 className='text-base font-bold xl:text-xl'>Cook Items</h2>
														<div className='w-[60%] xl:w-[30%] ml-[10px] mr-[10px] '>
															{' '}
															<SearchBar onSearch={handleSearch} extraClass='w-full' />
														</div>
														<HoverBorderButton
															extraClass={'!mt-[5px] !mb-[5px] create-New-CookItem'}
															onClick={() => handleOpenCreateItemModal()}
														>
															Create New Item
														</HoverBorderButton>
													</div>
												</div>
												{filteredData.map((item, index) => (
													<div className='mt-[15px]'>
														<Draggable
															key={item.cookDropCookItemID + 'l'}
															draggableId={item.cookDropCookItemID}
															index={index}
														>
															{(provided) => (
																<div
																	ref={provided.innerRef}
																	{...provided.draggableProps}
																	{...provided.dragHandleProps}
																	className='rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] p-[15px] mb-5'
																>
																	<div className='relative p-4 bg-gray-100 rounded-lg'>
																		<div className=' xl:w-[85%] lg:w-[75%] w-[65%]'>
																			<h2 className='text-base font-bold capitalize xl:text-xl'>
																				{item.cookItemName}
																			</h2>
																			<p className='text-sm font-semibold xl:text-lg'>
																				{`Cook Interval ${convertMinutesToHHMM(
																					item.cookInterval
																				)}, Cook time ${formatTime(
																					item.cookTimeSeconds
																				)}, Hold ${formatTime(
																					item.holdTimeSeconds
																				)}, Safety ${item.safetyFactor}%`}
																			</p>
																		</div>

																		<span
																			onClick={(e) => {
																				e.stopPropagation();
																				e.preventDefault();
																				addTemplateUsingMobile(item);
																			}}
																			className='absolute text-xl font-bold text-blue-600 transform -translate-y-1/2 cursor-pointer top-1/2 right-20 hover:text-blue-800 z-9'
																		>
																			<FaPlusCircle />
																		</span>
																		<span
																			onClick={(e) => {
																				e.stopPropagation();
																				handleOpenEditItemModal(
																					item.cookDropCookItemID,
																					item.sourceType
																				);
																			}}
																			className='absolute text-xl text-green-600 transform -translate-y-1/2 cursor-pointer top-1/2 right-12 hover:text-green-800 z-9'
																		>
																			<FaEdit className='' />
																		</span>
																		<span
																			onClick={(e) => {
																				e.stopPropagation(),
																					e.preventDefault(),
																					deleteCookItem(
																						item.cookDropCookItemID
																					);
																			}}
																			className='absolute text-xl text-red-500 transform -translate-y-1/2 cursor-pointer top-1/2 right-4 z-9 hover:text-red-700'
																		>
																			<RiDeleteBin6Line />
																		</span>
																	</div>
																	<div className='tableHOC overflow-auto max-h-[250px]'>
																		<table className='relative min-w-full table-auto'>
																			<thead className='sticky top-0 bg-white z-9'>
																				<tr className='shadow-[0_-1px_0_var(--tw-primary)_inset] '>
																					<th className='px-4 py-2 text-left'>
																						Item ID
																					</th>
																					<th className='px-4 py-2 text-left'>
																						Description
																					</th>
																					<th className='px-4 py-2 text-left'>
																						QTY
																					</th>
																				</tr>
																			</thead>
																			<tbody>
																				{item.listCookDropCookItemDetails.map(
																					(menuItem) => (
																						<tr
																							key={
																								menuItem.inventoryOrMenuItemID
																							}
																							className='border-b'
																						>
																							<td className='px-4 py-2'>
																								{
																									menuItem.inventoryOrMenuItemID
																								}
																							</td>
																							<td className='px-4 py-2'>
																								{
																									menuItem.inventoryOrMenuItemName
																								}
																							</td>
																							<td className='px-4 py-2'>
																								{
																									menuItem.cookItemQuantity
																								}
																							</td>
																						</tr>
																					)
																				)}
																			</tbody>
																		</table>
																	</div>
																</div>
															)}
														</Draggable>
													</div>
												))}
												{provided.placeholder}
											</div>
										)}
									</Droppable>

									<Droppable droppableId='right'>
										{(provided) => (
											<div
												ref={provided.innerRef}
												{...provided.droppableProps}
												className='w-[100%] sticky top-0 cook-template'
											>
												<div className='rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] p-[15px] sticky top-0 '>
													<h2 className='mb-4 text-base font-bold '>Template</h2>
													<div className=' tableHOC overflow-auto h-[90vh]'>
														{rightTableData.length === 0 && (
															<p className='text-gray-500'>Drop the Cook Items here</p>
														)}
														{rightTableData.map((table) => (
															<div
																key={table.cookDropCookItemID + 'R'}
																className='relative p-1 mb-4 overflow-auto bg-gray-100 rounded-lg tableHOC'
															>
																<div
																	className='relative p-4 bg-gray-100 rounded-lg cursor-pointer'
																	onClick={() =>
																		toggleTableVisibility(table.cookDropCookItemID)
																	}
																>
																	<div className=' w-[90%]'>
																		<h2 className='text-xl font-bold capitalize'>
																			{table.title}
																		</h2>
																		<p className='text-lg font-semibold'>
																			{table.description}
																		</p>
																	</div>
																	<span
																		onClick={(e) => {
																			e.stopPropagation();
																			removeTable(table.cookDropCookItemID);
																		}}
																		className='absolute text-red-500 transform -translate-y-1/2 top-1/2 right-10 hover:text-red-700 z-9'
																	>
																		<RiDeleteBin6Line />
																	</span>
																	<span
																		onClick={(e) => {}}
																		className='absolute transform -translate-y-1/2 top-1/2 right-4 z-9'
																	>
																		{showFullTable[table.cookDropCookItemID] ? (
																			<FaChevronUp />
																		) : (
																			<FaChevronDown />
																		)}
																	</span>
																</div>

																{showFullTable[table.cookDropCookItemID] && (
																	<div className='tableHOC overflow-auto max-h-[245px]'>
																		<table className='min-w-full mt-0 bg-white table-auto'>
																			<thead className='border-b border-b-[var(--tw-primary)] sticky top-0 z-9 bg-white'>
																				<tr className='shadow-[0_-1px_0_var(--tw-primary)_inset] '>
																					<th className='px-4 py-2 text-left'>
																						Item ID
																					</th>
																					<th className='px-4 py-2 text-left'>
																						Description
																					</th>
																					<th className='px-4 py-2 text-left'>
																						QTY
																					</th>
																				</tr>
																			</thead>
																			<tbody>
																				{table.items.map((item, index) => (
																					<tr
																						key={item.id}
																						className={`border-b`}
																					>
																						<td className='px-4 py-2'>
																							{item.id}
																						</td>
																						<td className='px-4 py-2'>
																							{
																								item.inventoryOrMenuItemName
																							}
																						</td>
																						<td className='px-4 py-2'>
																							{item.qty}
																						</td>
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
											</div>
										)}
									</Droppable>
								</div>
							</DragDropContext>
						</div>
						<div className='container mx-auto  px-1 py-4 max-w-full cooktemplate lg:!block !hidden'>
							<Loader loading={isLoading} />
							<DragDropContext onDragEnd={handleDragEnd}>
								<div className='flex justify-between w-full gap-4'>
									<Droppable droppableId='left'>
										{(provided) => (
											<div
												ref={(node) => {
													provided.innerRef(node);
													leftColumnRef.current = node;
												}}
												{...provided.droppableProps}
												className='w-[40%] '
											>
												<div
													className={`sticky top-[1px] ${
														isSticky
															? 'bg-[#fff] z-10 py-3 rounded-2xl px-2 shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)]'
															: ''
													}`}
												>
													<div
														className={`flex items-center space-x-2 ${
															isSticky ? '' : 'mb-4'
														} justify-between`}
													>
														<h2 className='text-base font-bold xl:text-xl'>Cook Items</h2>
														<div className='w-[60%] xl:w-[30%] ml-[10px] mr-[10px]'>
															{' '}
															<SearchBar onSearch={handleSearch} extraClass='w-full' />
														</div>
														<HoverBorderButton
															extraClass={'!mt-[5px] !mb-[5px] create-New-CookItem'}
															onClick={() => handleOpenCreateItemModal()}
														>
															Create New Item
														</HoverBorderButton>
													</div>
												</div>
												{filteredData.map((item, index) => (
													<div>
														<Draggable
															key={item.cookDropCookItemID}
															draggableId={item.cookDropCookItemID}
															index={index}
														>
															{(provided) => (
																<div
																	ref={provided.innerRef}
																	{...provided.draggableProps}
																	{...provided.dragHandleProps}
																	className='rounded-2xl shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] p-[15px] mb-5'
																>
																	<div className='relative p-4 bg-gray-100 rounded-lg'>
																		<div className=' xl:w-[85%] w-[75%]'>
																			<h2 className='text-base font-bold capitalize xl:text-xl'>
																				{item.cookItemName}
																			</h2>
																			<p className='text-sm font-semibold xl:text-lg'>
																				{`Cook Interval ${convertMinutesToHHMM(
																					item.cookInterval
																				)}, Cook time ${formatTime(
																					item.cookTimeSeconds
																				)}, Hold ${formatTime(
																					item.holdTimeSeconds
																				)}, Safety ${item.safetyFactor}%, UOM ${
																					item.unitOfMeasure
																				}, Mix Multiplier ${
																					item.mixMultiplier
																				}% `}
																			</p>
																		</div>
																		<span
																			onClick={(e) => {
																				e.stopPropagation();
																				handleOpenEditItemModal(
																					item.cookDropCookItemID,
																					item.sourceType
																				);
																			}}
																			className='absolute text-xl text-green-600 transform -translate-y-1/2 cursor-pointer top-1/2 right-12 hover:text-green-800 z-9'
																		>
																			<FaEdit className='' />
																		</span>
																		<span
																			onClick={(e) => {
																				e.stopPropagation(),
																					e.preventDefault(),
																					deleteCookItem(
																						item.cookDropCookItemID
																					);
																			}}
																			className='absolute text-xl text-red-500 transform -translate-y-1/2 cursor-pointer top-1/2 right-4 z-9 hover:text-red-700'
																		>
																			<RiDeleteBin6Line />
																		</span>
																	</div>
																	<div className='tableHOC overflow-auto max-h-[250px]'>
																		<table className='relative min-w-full table-auto'>
																			<thead className='sticky top-0 bg-white z-9'>
																				<tr className='shadow-[0_-1px_0_var(--tw-primary)_inset] '>
																					<th className='px-4 py-2 text-left'>
																						Item ID
																					</th>
																					<th className='px-4 py-2 text-left'>
																						Description
																					</th>
																					<th className='px-4 py-2 text-left'>
																						QTY
																					</th>
																				</tr>
																			</thead>
																			<tbody>
																				{item.listCookDropCookItemDetails.map(
																					(menuItem) => (
																						<tr
																							key={
																								menuItem.inventoryOrMenuItemID
																							}
																							className='border-b'
																						>
																							<td className='px-4 py-2'>
																								{
																									menuItem.inventoryOrMenuItemID
																								}
																							</td>
																							<td className='px-4 py-2'>
																								{
																									menuItem.inventoryOrMenuItemName
																								}
																							</td>
																							<td className='px-4 py-2'>
																								{
																									menuItem.cookItemQuantity
																								}
																							</td>
																						</tr>
																					)
																				)}
																			</tbody>
																		</table>
																	</div>
																</div>
															)}
														</Draggable>
													</div>
												))}
												{provided.placeholder}
											</div>
										)}
									</Droppable>

									<Droppable droppableId='right'>
										{(provided) => (
											<div
												ref={provided.innerRef}
												{...provided.droppableProps}
												className='w-[55%] sticky top-0 cook-template'
											>
												<div className='absolute right-[-20px]'>
													<Link to={'/CookChart'} className='text-[#213547]'>
														<HoverBorderButton
															extraClass={'!mt-[5px] !mb-[20px]  create-New-CookItem '}
															// onClick={() => handleOpenCreateItemModal()}
														>
															Display Chart
														</HoverBorderButton>
													</Link>
												</div>
												<div className='rounded-2xl mt-[70px]  shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] p-[15px] sticky top-0 '>
													<h2 className='mb-4 text-2xl font-bold '>Template</h2>
													<div className=' tableHOC overflow-auto h-[70vh]'>
														{rightTableData.length === 0 && (
															<p className='text-gray-500'>
																Drop the Cook Items tables here
															</p>
														)}
														{rightTableData.map((table) => (
															<div
																key={table.cookDropCookItemID}
																className='relative p-1 mb-4 overflow-auto bg-gray-100 rounded-lg tableHOC'
															>
																<div
																	className='relative p-4 bg-gray-100 rounded-lg cursor-pointer'
																	onClick={() =>
																		toggleTableVisibility(table.cookDropCookItemID)
																	}
																>
																	<div className=' w-[90%]'>
																		<h2 className='text-xl font-bold capitalize'>
																			{table.title}
																		</h2>
																		<p className='text-lg font-semibold'>
																			{table.description}
																		</p>
																	</div>
																	<span
																		onClick={(e) => {
																			e.stopPropagation();
																			removeTable(table.cookDropCookItemID);
																		}}
																		className='absolute text-red-500 transform -translate-y-1/2 top-1/2 right-10 hover:text-red-700 z-9'
																	>
																		<RiDeleteBin6Line />
																	</span>
																	<span
																		onClick={(e) => {}}
																		className='absolute transform -translate-y-1/2 top-1/2 right-4 z-9'
																	>
																		{showFullTable[table.cookDropCookItemID] ? (
																			<FaChevronUp />
																		) : (
																			<FaChevronDown />
																		)}
																	</span>
																</div>

																{showFullTable[table.cookDropCookItemID] && (
																	<div className='tableHOC overflow-auto max-h-[245px]'>
																		<table className='min-w-full mt-0 bg-white table-auto'>
																			<thead className='border-b border-b-[var(--tw-primary)] sticky top-0 z-9 bg-white'>
																				<tr className='shadow-[0_-1px_0_var(--tw-primary)_inset] '>
																					<th className='px-4 py-2 text-left'>
																						Item ID
																					</th>
																					<th className='px-4 py-2 text-left'>
																						Description
																					</th>
																					<th className='px-4 py-2 text-left'>
																						QTY
																					</th>
																				</tr>
																			</thead>
																			<tbody>
																				{table.items.map((item, index) => (
																					<tr
																						key={item.id}
																						className={`border-b`}
																					>
																						<td className='px-4 py-2'>
																							{item.id}
																						</td>
																						<td className='px-4 py-2'>
																							{
																								item.inventoryOrMenuItemName
																							}
																						</td>
																						<td className='px-4 py-2'>
																							{item.qty}
																						</td>
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
											</div>
										)}
									</Droppable>
								</div>
							</DragDropContext>
						</div>
					</>
				) : !selectedUnit ? (
					<div className='mt-10 text-xl font-medium text-center'>No Unit Selected</div>
				) : (
					<div className='mt-10 text-xl font-medium text-center'>No data available</div>
				)}
				<Loader loading={isLoading} />
				<div>
					<UnitModal
						unitData={unitsAndAreasList}
						memberID={selectedUnit}
						memberName={selectedUnitName}
						show={showUnitModal}
						handleClose={() => {
							setShowUnitModal(false);
						}}
						handleUnitSelection={handleUnitSelection}
						isSaveUnit={isSave}
						isMultiUnit={isSave}
						includeAreas={isSave}
						handleUnitSaveSelection={handleUnitSaveSelection}
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
				setModalPosition={setModalPosition}
				onClose={() => {
					setOpenCreateItemModal(!openCreateItemModal);
				}}
				title={'Add new cook drop item'}
			>
				<CreateItemModal
					projectAheadOptions={projectAheadOptions}
					addHeaderFields={addHeaderFields}
					sourceType={sourceType}
					sourceTypeDropDown={sourceTypeDropDown}
					addMenuItems={addMenuItems}
					saveDisable={saveDisable}
					initDataLoading={initDataLoading}
					setAddHeaderFields={setAddHeaderFields}
					modalPosition={modalPosition}
					setDropdownPosition={setDropdownPosition}
					setSourceType={setSourceType}
					setSourceTypeDropDown={setSourceTypeDropDown}
					setSaveDisable={setSaveDisable}
					setOpenCreateItemModal={setOpenCreateItemModal}
					dropdownPosition={dropdownPosition}
					moreOptionsDropdown={moreOptionsDropdown}
					addInventoryItems={addInventoryItems}
					getAddNewCookData={getAddNewCookData}
					getCookAllItemData={getCookAllItemData}
					openCreateItemModal={openCreateItemModal}
					companyStateId={companyStateId}
				/>
			</Modal>

			<Modal
				isOpen={openEditItemModal}
				setModalPosition={setModalPosition}
				onClose={() => {
					setOpenEditItemModal(!openEditItemModal);
				}}
				title={'Edit cook drop item'}
			>
				<CreateEditItemModal
					allDataFeilds={allDataFeilds}
					isHeaderLoaded={isHeaderLoaded}
					editsourceType={editsourceType}
					sourceTypeDropDown={sourceTypeDropDown}
					addMenuItems={addMenuItems}
					initDataLoading={initDataLoading}
					saveDisable={saveDisable}
					setAllDataFeilds={setAllDataFeilds}
					editCookData={editCookData}
					modalPosition={modalPosition}
					setDropdownPosition={setDropdownPosition}
					setSourceTypeDropDown={setSourceTypeDropDown}
					dropdownPosition={dropdownPosition}
					getAddNewCookData={getAddNewCookData}
					setEditSourceType={setEditSourceType}
					addInventoryItems={addInventoryItems}
					setSaveDisable={setSaveDisable}
					companyStateId={companyStateId}
					setOpenEditItemModal={setOpenEditItemModal}
					openEditItemModal={openEditItemModal}
					getCookAllItemData={getCookAllItemData}
				/>
			</Modal>
		</>
	);
};

export default CookChartTemplate;
