import { useEffect, useMemo, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import voidsReport from '../../assets/introJSSteps/voidsReport';
import {
	Dropdown,
	UnitSelector,
	CalendarModal,
	UnitModal,
	ExportOptions,
	DateSelector,
	PdfBuilder,
	ExcelExport as exportToExcel,
	TableHOC,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

const Voids = () => {
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

	//dropdown variables
	const [fromFilter, setFromFilter] = useState(0);
	const [toFilter, setToFilter] = useState(0);
	const dropdownOptions = Array.from({ length: 24 }, (_, index) => ({ name: (index + 1).toString() }));

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: voidsReport(),
		initialStep: 0,
		stepsEnabled: false,
	});

	// columns for tableHOC
	const columns = useMemo(
		() => [
			columnHelper.accessor('unitId', {
				id: 'unitId',
				header: 'Unit ID',
				dataType: 'number',
			}),
			columnHelper.accessor('date', {
				id: 'date',
				header: 'Date',
				cell: ({ getValue }) => {
					const date = new Date(getValue());
					const formattedDate = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
					return formattedDate;
				},
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
			columnHelper.accessor('checkId', {
				id: 'checkId',
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

	const Table = TableHOC(columns, filteredVoidsReportData, false);

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
			setFromFilter(0);
			setToFilter(0);
			const getData = {
				url: 'voids',
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
					memberId: selectedUnit,
					fromDate: selectedFromDate.toISOString().split('T')[0],
					toDate: selectedToDate.toISOString().split('T')[0],
				},
			};

			const result = await getCall(getData);
			const newData = {
				...result,
				data: result.data.map((row) => ({
					...row,
					subrows: row.voids,
				})),
			};

			setVoidsReportData(newData.data);
			setFilteredVoidsReportData(newData.data);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting voids report data: ', error);
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

	// Function to handle the hour filter
	const handleFromByHour = (hour) => {
		setFromFilter(hour);

		const filteredData = voidsReportData.map((row) => ({
			...row,
			// Filter the voids by the selected hour
			subrows: row.subrows.filter((subRow) => +subRow.hour >= hour && +subRow.hour <= toFilter),
		}));

		setFilteredVoidsReportData(filteredData);
	};

	// Function to handle the hour filter
	const handleToByHour = (hour) => {
		setToFilter(hour);

		const filteredData = voidsReportData.map((row) => ({
			...row,
			// Filter the voids by the selected hour
			subrows: row.subrows.filter((subRow) => +subRow.hour <= hour && +subRow.hour >= fromFilter),
		}));

		setFilteredVoidsReportData(filteredData);
	};

	// Function to handle the PDF export
	const handlePDFClick = () => {
		if (!columns || columns.length === 0) {
			console.error('Columns are not defined or empty');
			return;
		}

		if (!voidsReportData || voidsReportData.length === 0) {
			console.error('Voids report data is not defined or empty');
			return;
		}

		const pdfData = {
			title: 'Voids Report',
			subHeaders: [
				`${selectedFromDate.toLocaleDateString()} - ${selectedToDate.toLocaleDateString()} | ${selectedUnitName}`,
			],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body: buildPDFBody(),
		};

		PdfBuilder(pdfData);
	};

	const buildPDFBody = () => {
		const body = voidsReportData.map((row) => {
			const unit = unitsAndAreasList?.units?.find((unit) => unit.unitID === row.unitId);
			const title = unit ? unit.unitName : '';
			return {
				type: 'table',
				title: title,
				widths: new Array(columns.length).fill('auto'),
				dataTypes: columns.map((column) => column.dataType),
				data: formatPDFData(row.voids),
			};
		});

		return body;
	};

	const formatPDFData = (data) => {
		return {
			columnHeaders: columns.map((column) => column.header),
			rows: data.map((row) =>
				columns.map((column) => ({
					value: row[column.id],
					cellType: '',
					columnName: column.id,
				}))
			),
		};
	};

	// Function to handle the CSV export
	const handleCSVClick = () => {
		const csvHeaders = columns.map((column) => column.header);
		const csvData = voidsReportData.flatMap((row) => row.voids.map((voidRow) => Object.values(voidRow).join(',')));
		const csvString = [csvHeaders.join(','), ...csvData].join('\n');
		const blob = new Blob([csvString], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const tempLink = document.createElement('a');
		tempLink.href = url;
		tempLink.setAttribute('download', 'voids.csv');
		tempLink.click();
	};

	// Function to handle the Excel export
	const handleExcelClick = () => {
		const data = [
			{
				name: 'Voids Report',
				columns: columns.map((column) => ({ name: column.header, filterButton: true })),
				data: voidsReportData.flatMap((row) => row.voids.map((voidRow) => Object.values(voidRow))),
			},
		];

		const filename = 'voidsReport';
		const spreadSheetTitle = 'Voids Report';
		const date = `${selectedFromDate.toLocaleDateString()} - ${selectedToDate.toLocaleDateString()}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	return (
		<div className='w-[85%] mx-auto'>
			<Steps
				enabled={introSteps.stepsEnabled}
				steps={introSteps.steps}
				initialStep={introSteps.initialStep}
				onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
			/>
			<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'>Voids Report</h2>
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
					<div className='filterByHour-selector'>
						<span className='text-xl font-bold '>Filter By Hour</span>
						<div className='flex '>
							<div className='flex items-center '>
								<span className='font-bold '>From: </span>
								<Dropdown
									options={dropdownOptions}
									title=''
									selectedOption={fromFilter}
									onOptionChange={handleFromByHour}
								/>
							</div>
							<div className='flex items-center '>
								<span className='font-bold '>To: </span>
								<Dropdown
									options={dropdownOptions}
									title=''
									selectedOption={toFilter}
									onOptionChange={handleToByHour}
								/>
							</div>
						</div>
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
						handlePDFClick={handlePDFClick}
						includeCSV={true}
						handleCSVClick={handleCSVClick}
						includeExcel={true}
						handleExcelClick={handleExcelClick}
						includeHelp={true}
						handleHelpClick={() => setIntroSteps({ ...introSteps, stepsEnabled: true })}
					/>
				</div>
			</header>

			{isLoading ? (
				<div>Loading...</div>
			) : isError ? (
				<div>{errorMessage}</div>
			) : (
				filteredVoidsReportData.length > 0 && <div className='paged-table'>{Table}</div>
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

export default Voids;
