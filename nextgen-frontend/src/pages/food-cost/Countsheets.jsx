import { useEffect, useMemo, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { Link } from 'react-router-dom';
import voidsReport from '../../assets/introJSSteps/voidsReport';
import { Dropdown, UnitSelector, CalendarModal, UnitModal, DateSelector, TableHOC2 } from '../../components';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

const Countsheets = () => {
	const [companyId, setCompanyId] = useState();
	const [alignmentId, setAlignmentId] = useState();
	const [memberId, setMemberId] = useState();
	const [unitsAndAreasList, setUnitsAndAreasList] = useState([]);
	const [countsheetData, setCountsheetData] = useState([]);
	const [filteredCountsheetData, setFilteredCountsheetData] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Inventory Transfer Report, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setselectedUnitName] = useState('No Unit Selected');
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
			columnHelper.accessor('unitId', {
				id: 'unitId',
				header: 'Unit',
				cell: ({ getValue }) => unitsAndAreasList.units.find((unit) => unit.unitID === getValue()).unitName,
				size: 300,
			}),
			columnHelper.accessor('countType', {
				id: 'countType',
				header: 'Type',
				cell: ({ getValue, row }) => {
					return getValue() === 'DA'
						? 'Daily'
						: getValue() === 'WE'
						? 'Weekly'
						: getValue() === 'MO'
						? 'Monthly'
						: getValue() === 'WA'
						? 'Waste'
						: getValue() === 'IT'
						? `Transfer ${parseInt(row.original.transferDestUnitID) === selectedUnit ? 'from' : 'to'} ${
								parseInt(row.original.transferDestUnitID) === selectedUnit
									? row.original.name
									: row.original.transferUnit
						  }`
						: 'none';
				},
				size: 300,
			}),
			columnHelper.accessor('dateTime', {
				id: 'dateTime',
				header: 'Date',
				size: 100,
			}),
			columnHelper.accessor(
				(row) => {
					const date = new Date(row.saveDateTime);

					// Get hours, minutes, and AM/PM
					const hours = date.getHours() % 12 || 12; // Convert to 12-hour format
					const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure two digits
					const ampm = date.getHours() >= 12 ? 'PM' : 'AM';

					// Format the date as MM/DD/YYYY
					const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

					// Combine formatted date and time
					return `${row.userName} - ${formattedDate} ${hours}:${minutes} ${ampm}`;
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
				cell: ({ getValue }) => getValue()?.toFixed(2),
				size: 200,
			}),
		],
		[]
	);

	useEffect(() => {
		// Fetch initial data
		if (!selectedUnit) {
			let parameters = decodeURIComponent(window.location.search.replace('?data=', ''));
			if (parameters) {
				parameters = JSON.parse(parameters);
				setCompanyId(parameters.CompanyId);
				setAlignmentId(parameters.AlignmentId);
				localStorage.setItem('companyId', parameters.CompanyId);
				localStorage.setItem('alignmentId', parameters.AlignmentId);
				fetchData(parameters.CompanyID, parameters.AlignmentId);
			} else if (localStorage.getItem('groupOrUnitAccess')) {
				setCompanyId(parseInt(localStorage.getItem('companyId')));
				setAlignmentId(parseInt(localStorage.getItem('alignmentId')));
				fetchData(localStorage.getItem('companyId'), localStorage.getItem('alignmentId'));
			} else {
				console.log('testing mode');
				setCompanyId(1021);
				setAlignmentId(1110);
				setMemberId(5199);
				setSelectedUnit(0);
				fetchData(1021, 1110, 5199);
			}
		} else {
			setErrorMessage('There was an issue loading your orders, please try again later.');
		}
	}, []);

	const fetchData = async (companyId, alignmentId, selectedUnit) => {
		setIsLoading(true);
		await Promise.all([fetchUnits(companyId, alignmentId, selectedUnit)]);
		setIsLoading(false);
	};

	const fetchUnits = async (companyId, alignmentId, memberId) => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'unitsAndArea',
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
					memberId: memberId,
				},
			};

			const result = await getCall(getData);
			setUnitsAndAreasList(result.data);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your units, please try again later.');
			console.error('Error getting units: ', error);
		}
	};

	useEffect(() => {
		if (selectedUnit && selectedFromDate && selectedToDate) {
			handleCountsheet();
		}
	}, [selectedUnit, selectedFromDate, selectedToDate]);

	// Function to fetch the countsheet data
	const handleCountsheet = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'getCountsheets',
				urlParams: {
					companyID: companyId,
					alignmentID: alignmentId,
					memberID: selectedUnit,
					fromDate: selectedFromDate.toLocaleDateString('en-CA'),
					toDate: selectedToDate.toLocaleDateString('en-CA'),
				},
			};

			const result = await getCall(getData);

			const newData = result.data
				.filter((data) => data.inventoryCountSheetID > 0)
				.map((data) => ({
					...data,
					companyId: companyId,
					transferUnit: unitsAndAreasList.units.find(
						(unit) => unit.unitID === parseInt(data.transferDestUnitID)
					)?.unitName,
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
		setselectedUnitName(unitName);
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
		} else if (
			option === 'Daily' ||
			option === 'Weekly' ||
			option === 'Monthly' ||
			option === 'Ordering' ||
			option === 'Transfer' ||
			option === 'Waste'
		) {
			setFilteredCountsheetData(countsheetData.filter((data) => data.countType === viewMap[option]));
		}
	};

	const Table = (
		<TableHOC2
			columns={columns}
			data={filteredCountsheetData}
			isHeader={true}
			headerPosition='flex-start'
			dataPosition='text-left'
		/>
	);

	return (
		<div className='w-[85%] mx-auto'>
			<Steps
				enabled={introSteps.stepsEnabled}
				steps={introSteps.steps}
				initialStep={introSteps.initialStep}
				onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
			/>
			<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'>Browse Countsheets</h2>
			<header className='xl:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center'>
				<div className='flex items-center space-x-3 '>
					<UnitSelector
						companyId={companyId}
						alignmentId={alignmentId}
						memberId={selectedUnit}
						memberName={selectedUnitName}
						includeAreas={true}
						setMemberName={setselectedUnitName}
						onClick={() => setUnitShowModal(true)}
					/>
					<DateSelector
						toDate={selectedToDate}
						fromDate={selectedFromDate}
						isDateRange={true}
						onClick={() => setShowDateModal(true)}
					/>
					<Dropdown
						title='Type'
						options={countDropdownOptions}
						selectedOption={view}
						onOptionChange={handleCountType}
					/>
					{/* <div className='run-button' onClick={handleCountsheet}>
						<div className='py-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-primary hover:text-white hover:bg-primary text-nowrap rounded-3xl mt-7'>
							Run
						</div>
					</div> */}
				</div>
			</header>

			{isLoading ? (
				<div>Loading...</div>
			) : isError ? (
				<div>{errorMessage}</div>
			) : (
				countsheetData.length > 0 && <div className='paged-table'>{Table}</div>
			)}

			<div>
				<UnitModal
					unitData={unitsAndAreasList}
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
	);
};

export default Countsheets;
