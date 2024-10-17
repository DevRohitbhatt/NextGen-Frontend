import { useEffect, useMemo, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { useSelector } from 'react-redux';
import voidsReport from '../../assets/introJSSteps/voidsReport';
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
	TableHOC,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';

const columnHelper = createColumnHelper();

const Voids = () => {
	const {
		companyID,
		alignmentID,
		unitsAndAreas: unitsAndAreasList,
		defaultUnitID,
		defaultUnitName,
		groupOrUnitAccess,
		groupOrUnitAccessName
	} = useSelector((state) => state.globalState);

	const [voidsReportData, setVoidsReportData] = useState([]);
	const [filteredVoidsReportData, setFilteredVoidsReportData] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Voids Report, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
	const [showUnitModal, setShowUnitModal] = useState(false); // State to manage modal visibility

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
			columnHelper.accessor('date', {
				id: 'date',
				header: 'Date',
				size: 130,
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
				size: 100,
			}),
			columnHelper.accessor('minute', {
				id: 'minute',
				header: 'Minute',
				dataType: 'number',
				size: 100,
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
				size: 200,
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
				size: 130,
				footer: ({ table }) =>
					`Count: ${table.getCoreRowModel().rows.reduce((acc, row) => acc + row.subRows.length, 0)}`,
				dataType: 'number',
			}),
			columnHelper.accessor('price', {
				id: 'price',
				header: 'Price',
				size: 100,
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
		if (groupOrUnitAccess || defaultUnitID) {
			setSelectedUnit(groupOrUnitAccess || defaultUnitID);
		}
		if (groupOrUnitAccessName || defaultUnitName) {
			setSelectedUnitName(groupOrUnitAccessName || defaultUnitName);
		}
	}, [
		defaultUnitID,
		groupOrUnitAccess,
		defaultUnitName,
		groupOrUnitAccessName,
	]);

	const fetchVoidsReport = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			setFromFilter(0);
			setToFilter(0);
			const getData = {
				url: 'voids',
				urlParams: {
					companyId: companyID,
					alignmentId: alignmentID,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
				},
			};

			const result = await getCall(getData);
			const newData = {
				...result,
				data: result.data.map((row) => ({
					...row,
					subRows: row.voids.map((item) => ({
						unitName: unitsAndAreasList?.units?.find((unit) => unit.unitID === row.unitId)?.unitName,
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
			console.error('Error getting voids report data: ', error);
		}
	};

	// Function to handle the unit selection
	const handleUnitSelection = (unitName, unitID) => {
		setSelectedUnitName(unitName);
		setSelectedUnit(unitID);
		setShowUnitModal(false);
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
			subRows: row.subRows.filter((subRow) => +subRow.hour >= hour && +subRow.hour <= toFilter),
		}));

		setFilteredVoidsReportData(filteredData);
	};

	// Function to handle the hour filter
	const handleToByHour = (hour) => {
		setToFilter(hour);

		const filteredData = voidsReportData.map((row) => ({
			...row,
			// Filter the voids by the selected hour
			subRows: row.subRows.filter((subRow) => +subRow.hour <= hour && +subRow.hour >= fromFilter),
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
				`${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(
					selectedToDate,
					'mm-dd-yyyy'
				)} | ${selectedUnitName}`,
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
		const csvHeaders = [
			'Unit Name',
			'Date',
			'Hour',
			'Minute',
			'Void Reason',
			'Employee',
			'Manager',
			'Description',
			'POS Check ID',
			'Table Name',
			'Revenue ID',
			'Price',
			'Tenders',
		];
		const csvData = voidsReportData.flatMap((row) =>
			row.subRows.map((voidRow) => Object.values(voidRow).join(','))
		);

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
				columns: [
					{ name: 'Unit Name', filterButton: true },
					{ name: 'Date', filterButton: true },
					{ name: 'Hour', filterButton: true },
					{ name: 'Minute', filterButton: true },
					{ name: 'Void Reason', filterButton: true },
					{ name: 'Employee', filterButton: true },
					{ name: 'Manager', filterButton: true },
					{ name: 'Description', filterButton: true },
					{ name: 'POS Check ID', filterButton: true },
					{ name: 'Table Name', filterButton: true },
					{ name: 'Revenue ID', filterButton: true },
					{ name: 'Price', filterButton: true },
					{ name: 'Tenders', filterButton: true },
				],
				data: voidsReportData.flatMap((row) => row.subRows.map((voidRow) => Object.values(voidRow))),
			},
		];

		const filename = 'voidsReport';
		const spreadSheetTitle = 'Voids Report';
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const Table = <TableHOC columns={columns} data={filteredVoidsReportData} expandCollapseButtons={true} />;

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
				<h2 className='my-4 text-2xl leading-tight text-left pageTitle'>Voids Report</h2>
				<header className='xl:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center'>
					<div className='flex items-center space-x-3 '>
						<UnitSelector
							companyId={companyID}
							alignmentId={alignmentID}
							memberID={selectedUnit}
							memberName={selectedUnitName}
							includeAreas={true}
							setMemberName={setSelectedUnitName}
							onClick={() => setShowUnitModal(true)}
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
						<div className='run-button' onClick={fetchVoidsReport}>
							<div className='py-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
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
						show={showUnitModal}
						includeAreas={true}
						handleClose={() => {
							setShowUnitModal(false);
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

export default Voids;
