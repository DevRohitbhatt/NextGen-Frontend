import { useEffect, useMemo, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import voidsReport from '../../assets/introJSSteps/voidsReport';
import { Dropdown, Loader, UnitSelector, CalendarModal, UnitModal, DateSelector, TableHOC } from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';

const columnHelper = createColumnHelper();

const Countsheets = () => {
	const { companyID, alignmentID, unitsAndAreas, groupOrUnitAccess, defaultUnitID, groupOrUnitAccessName, defaultUnitName } = useSelector((state) => state.globalState);
	const [countsheetData, setCountsheetData] = useState([]);
	const [filteredCountsheetData, setFilteredCountsheetData] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the countsheets Report, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
	const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState(
		new Date(new Date().getFullYear(), new Date().getMonth(), 0)
	);
	const [selectedToDate, setSelectedToDate] = useState(new Date());
	const [showDateModal, setShowDateModal] = useState(false);

	//dropdown variables
	const [view, setView] = useState('All');
	const countDropdownOptions = [
		{ name: 'All' },
		{ name: 'Daily' },
		{ name: 'Weekly' },
		{ name: 'Monthly' },
		{ name: 'Ordering' },
		{ name: 'Transfer' },
		{ name: 'Waste' },
	];
	const viewMap = {
		All: 'All',
		Daily: 'DA',
		Weekly: 'WE',
		Monthly: 'MO',
		Ordering: 'OR',
		Transfer: 'IT',
		Waste: 'WA',
	};

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: voidsReport(),
		initialStep: 0,
		stepsEnabled: false,
	});

	const columns = useMemo(
		() => [
			columnHelper.display({
				id: 'action',
				cell: ({ row }) => (
					<Link
						to='/CountsheetDesigner'
						className='underline cursor-pointer'
						state={{ companyId: row.original.companyId, countsheet: row.original }}
					>
						Open
					</Link>
				),
				size: 60,
			}),
			columnHelper.accessor('unitName', {
				id: 'unitName',
				header: 'Unit',
				size: 200,
			}),
			columnHelper.accessor('countType', {
				id: 'countType',
				header: 'Type',
				cell: ({ getValue, row }) => {

					return getValue() !== 'IT' ? Object.keys(viewMap).find((key) => viewMap[key] === getValue())
						: `${row.original.transfer}`;
				},
				size: 200,
			}),
			columnHelper.accessor('dateTime', {
				id: 'dateTime',
				header: 'Date',
				size: 180,
			}),
			columnHelper.accessor(
				(row) => {
					const formattedDate = `${row.userName} - ${dateFormat(row.saveDateTime, 'mm/dd/yyyy h:MM TT')}`;
					// Combine formatted date and time
					return formattedDate;
				},
				{
					id: 'lastEditedBy',
					header: 'Last Edited By',
					size: 300,
				}
			),
			columnHelper.accessor('comment', {
				id: 'comment',
				header: 'Comment',
			}),
			columnHelper.accessor('totalLineItemCost', {
				id: 'totalLineItemCost',
				header: 'Total Inventory Value',
				cell: ({ getValue }) => `$${getValue()?.toFixed(2)}`,
				size: 200,
			}),
		],
		[]
	);

	useEffect(() => {
		if (groupOrUnitAccess || defaultUnitID) {
			console.log(groupOrUnitAccess, defaultUnitID);

			setSelectedUnit(groupOrUnitAccess || defaultUnitID);
		}
		if (groupOrUnitAccessName || defaultUnitName) {
			console.log(groupOrUnitAccessName, defaultUnitName);

			setSelectedUnitName(groupOrUnitAccessName || defaultUnitName);
		}
	}, [
		defaultUnitID,
		groupOrUnitAccess,
		defaultUnitName,
		groupOrUnitAccessName,
	]);

	useEffect(() => {
		if (selectedUnit && selectedFromDate && selectedToDate) {
			getCountsheetData();
		}
	}, [selectedUnit, selectedFromDate, selectedToDate]);

	// Function to fetch the countsheet data
	const getCountsheetData = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'getCountsheets',
				urlParams: {
					companyID: companyID,
					alignmentID: alignmentID,
					memberID: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
				},
			};

			const result = await getCall(getData);

			const newData = result.data
				.filter((data) => data.inventoryCountSheetID > 0)
				.map((data) => ({
					...data,
					companyId: companyID,
					unitName: unitsAndAreas.units.find((unit) => unit.unitID === parseInt(data.unitId))?.unitName,
					transfer: `Transfer ${data.unitId === selectedUnit
						? data.transferDestUnitID === 0
							? 'to ???'
							: 'to ' +
							unitsAndAreas.units.find(
								(unit) => unit.unitID === parseInt(data.transferDestUnitID)
							)?.unitName
						: 'from ' + data.name
						}`,
				}));

			setCountsheetData(newData);
			setFilteredCountsheetData(newData);
			setView('All');
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setErrorMessage('There was an issue loading your countsheets, please try again later.');
			console.error('Error getting countsheets: ', error);
		}
	};

	// Function to handle the unit selection
	const handleUnitSelection = (unitName, unitID) => {
		setSelectedUnitName(unitName);
		setSelectedUnit(unitID);
		setUnitShowModal(false);
	};

	// Function to handle the date selection
	const handleDateSelection = (from, to) => {
		setSelectedFromDate(from);
		setSelectedToDate(to);
		setShowDateModal(false);
	};

	// Function to handle the count type selection
	const handleCountType = (option) => {

		setView(option);
		if (option === 'All') {
			setFilteredCountsheetData(countsheetData);
		} else if (viewMap[option]) {
			setFilteredCountsheetData(countsheetData.filter((data) => data.countType === viewMap[option]));
		}
	};

	const Table = (
		<TableHOC
			columns={columns}
			data={filteredCountsheetData}
			isHeader={true}
			headerPosition='flex-start'
			dataPosition='text-left'
		/>
	);

	return (
		<>
			<div className='w-[85%] mx-auto'>

				<Steps
					enabled={introSteps.stepsEnabled}
					steps={introSteps.steps}
					initialStep={introSteps.initialStep}
					onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
				/>
				<h2 className='my-4 text-2xl leading-tight text-left pageTitle'>Browse Countsheets</h2>
				<header className='xl:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center'>
					<div className='flex items-center space-x-3 '>
						<UnitSelector
							companyId={companyID}
							alignmentId={alignmentID}
							memberID={selectedUnit}
							memberName={selectedUnitName}
							includeAreas={true}
							setMemberName={setSelectedUnitName}
							onClick={() => setUnitShowModal(true)}
						/>
						<DateSelector
							toDate={selectedToDate}
							fromDate={selectedFromDate}
							isDateRange={true}
							onClick={() => setShowDateModal(true)}
						/>
						<div className='w-36'>
							<Dropdown
								title='Type'
								options={countDropdownOptions}
								selectedOption={view}
								onOptionChange={handleCountType}
							/>
						</div>
					</div>
				</header>

				{/* Display the table if there is no error and the data is not loading */}
				{isError ? (
					<div>{errorMessage}</div>
				) : (
					<div className='relative w-full min-h-56'>
						<Loader loading={isLoading} />
						{
							!isLoading &&
							(countsheetData.length > 0 ? (
								<div className='paged-table'>
									{Table}</div>
							) : !selectedUnit ? (
								<div className='mt-10 text-xl font-medium text-center'>No Unit Selected</div>
							) : (
								<div className='mt-10 text-xl font-medium text-center'>No data available</div>
							))}
					</div>
				)}
				<div>
					<UnitModal
						unitData={unitsAndAreas}
						memberID={selectedUnit}
						memberName={selectedUnitName}
						show={showModal}
						includeAreas={true}
						handleClose={() => {
							setUnitShowModal(false);
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
		</>
	);
};

export default Countsheets;
