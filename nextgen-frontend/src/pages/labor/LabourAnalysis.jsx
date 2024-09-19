import { useEffect, useMemo, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import {
	Dropdown,
	Loader,
	UnitSelector,
	CalendarModal,
	UnitModal,
	ExportOptions,
	DateSelector,
	PdfBuilder,
	ExcelExport as exportToExcel,
	TableHOC2,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import labourAnalysis from './../../assets/introJSSteps/labourAnalysis';

const columnHelper = createColumnHelper();

const LabourAnalysis = () => {
	const [companyId, setCompanyId] = useState();
	const [alignmentId, setAlignmentId] = useState();
	const [memberId, setMemberId] = useState();
	const [unitsAndAreasList, setUnitsAndAreasList] = useState([]);
	const [voidsReportData, setVoidsReportData] = useState([]);
	const [filteredVoidsReportData, setFilteredVoidsReportData] = useState([]);

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

	//dropdown state variables
	const [jobDescription, setJobDescription] = useState('All');
	const jobDescriptionOptions = [
		{ name: 'All' },
		{ name: 'Hourly Manager' },
		{ name: 'Salary Manager' },
		{ name: 'Shift Supervisor' },
		{ name: 'Test User' },
		{ name: 'Request Off' },
		{ name: 'None' },
	];

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: labourAnalysis(),
		initialStep: 0,
		stepsEnabled: false,
	});

	// columns for tableHOC
	const columns = useMemo(
		() => [
			columnHelper.accessor('date', {
				id: 'date',
				header: 'Date',
				cell: ({ getValue, row }) =>
					row.getCanExpand() ? (
						<div className={`flex items-center gap-2 font-bold absolute inset-0 w-96] `}>
							{row.getIsExpanded() ? <IoIosArrowUp /> : <IoIosArrowDown />}
							UnitName: {row.original.unitName} (Count : {row.subRows.length}, $
							{row.subRows.reduce((acc, curr) => acc + curr.original.price, 0).toFixed(2)})
						</div>
					) : getValue() ? (
						dateFormat(getValue(), 'mm-dd-yyyy')
					) : (
						''
					),
				dataType: 'date',
			}),
			columnHelper.accessor('hour', {
				id: 'hour',
				header: 'Hour',
				dataType: 'number',
			}),
			columnHelper.accessor('minute', {
				id: 'minute',
				header: 'Minute',
				dataType: 'number',
			}),
			columnHelper.accessor('voidReason', {
				id: 'voidReason',
				header: 'Void Reason',
				dataType: 'string',
			}),
			columnHelper.accessor('employeeName', {
				id: 'employeeName',
				header: 'Employee',
				dataType: 'string',
			}),
			columnHelper.accessor('managerName', {
				id: 'managerName',
				header: 'Manager',
				dataType: 'string',
			}),
			columnHelper.accessor('fullDescription', {
				id: 'fullDescription',
				header: 'Description',
				dataType: 'string',
			}),
			columnHelper.accessor('posCheckId', {
				id: 'posCheckId',
				header: 'POS Check ID',
				dataType: 'number',
			}),
			columnHelper.accessor('tableName', {
				id: 'tableName',
				header: 'Table Name',
				dataType: 'string',
			}),
			columnHelper.accessor('revenueID', {
				id: 'revenueID',
				header: 'Revenue ID',
				footer: ({ table }) =>
					`Count: ${table.getCoreRowModel().rows.reduce((acc, row) => acc + row.subRows.length, 0)}`,
				dataType: 'number',
			}),
			columnHelper.accessor('price', {
				id: 'price',
				header: 'Price',
				footer: ({ table }) =>
					`$${table
						.getCoreRowModel()
						.rows.reduce(
							(acc, row) => acc + row.subRows.reduce((acc, curr) => acc + curr.original.price, 0),
							0
						)
						.toFixed(2)}`,
				dataType: 'number',
			}),
			columnHelper.accessor('tendersUsed', {
				id: 'tendersUsed',
				header: 'Tenders',
				dataType: 'string',
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

	// Fetching Units and Areas
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

	// Function to get the voids report
	const handleVoidsReport = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'voids',
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
				},
			};

			const result = await getCall(getData);
			const newData = {
				data: result.data.map((row) => ({
					subRows: row.voids.map((item) => ({
						date: item.date,
						hour: item.hour,
						minute: item.minute,
						voidReason: item.voidReason,
						employeeName: item.employeeName,
						managerName: item.managerName,
						fullDescription: item.fullDescription,
						posCheckId: item.posCheckId,
						tableName: item.tableName,
						revenueID: item.revenueID,
						price: item.price,
						tendersUsed: item.tendersUsed,
					})),
					unitName: unitsAndAreasList?.units?.find((unit) => unit.unitID === row.unitId)?.unitName,
				})),
			};

			setVoidsReportData(newData.data);
			setFilteredVoidsReportData(newData.data);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Labour Analysis  data: ', error);
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

	const Table = <TableHOC2 columns={columns} data={filteredVoidsReportData} expandCollapseButtons={true} />;

	return (
		<>
			<Loader loading={isLoading} />
			<div className='w-[85%] mx-auto'>
				<Steps
					enabled={introSteps.stepsEnabled}
					steps={introSteps.steps}
					initialStep={introSteps.initialStep}
					onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
				/>
				<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'>Labour Analysis</h2>
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
						<div className='w-48'>
							<Dropdown
								title='Job Description'
								options={jobDescriptionOptions}
								onOptionChange={(option) => setJobDescription(option)}
								selectedOption={jobDescription}
							/>
						</div>
						<div className='run-button' onClick={handleVoidsReport}>
							<div className='py-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-primary hover:text-white hover:bg-primary text-nowrap rounded-3xl mt-7'>
								Run
							</div>
						</div>
					</div>
					<div>
						<ExportOptions
							includePDF={true}
							//handlePDFClick={handlePDFClick}
							includeExcel={true}
							//handleExcelClick={handleExcelClick}
							includeHelp={true}
							handleHelpClick={() => setIntroSteps({ ...introSteps, stepsEnabled: true })}
						/>
					</div>
				</header>

				{isError ? (
					<div>{errorMessage}</div>
				) : (
					!isLoading &&
					(filteredVoidsReportData.length > 0 ? (
						<div className='paged-table'>{Table}</div>
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

export default LabourAnalysis;
