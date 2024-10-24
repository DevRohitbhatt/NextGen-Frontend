import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { CiSquareMinus, CiSquarePlus } from 'react-icons/ci';
import {
	Loader,
	UnitSelector,
	CalendarModal,
	UnitModal,
	ExportOptions,
	DateSelector,
	PdfBuilder,
	ExcelExport as exportToExcel,
	TableHOC,
	Dropdown,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';
import salesVsLabor from '../../assets/introJSSteps/salesVsLabor';

const columnHelper = createColumnHelper();

const SalesVsLabor = () => {
	const {
		companyID,
		alignmentID,
		unitsAndAreas: unitsAndAreasList,
		groupOrUnitAccess,
		defaultUnitID,
		groupOrUnitAccessName,
		defaultUnitName,
	} = useSelector((state) => state.globalState);

	const [salesVsLaborData, setSalesVsLaborData] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Sales Vs Labor Report, please try again later.'
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

	const [selectedReportType, setSelectedReportType] = useState('Hourly');
	const reportTypeOptions = [{ name: 'Hourly' }, { name: 'Half Hour' }, { name: 'Qtr Hour' }];
	const [groupBy, setGroupBy] = useState('Date');
	const groupByOptions = [{ name: 'Date' }, { name: 'Unit' }];

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: salesVsLabor(),
		initialStep: 0,
		stepsEnabled: false,
	});

	// columns for tableHOC
	const memoizedColumns = useMemo(
		() => [
			columnHelper.accessor('unitName', {
				id: 'unitName',
				header: 'Unit',
				dataType: 'string',
			}),
			columnHelper.accessor('date', {
				id: 'date',
				header: 'Date',
				dataType: 'string',
			}),
			columnHelper.accessor('time', {
				id: 'time',
				header: 'Time',
				dataType: 'string',
			}),
			columnHelper.accessor('grossSales', {
				id: 'grossSales',
				header: 'Gross Sales',
				cell: ({ row }) => `$${calculateSum(row, 'grossSales')}`,
				dataType: 'number',
				footer: ({ table }) => <div className='text-center'>${calculateFooterSum(table, 'grossSales')}</div>,
			}),
			columnHelper.accessor('sales', {
				id: 'sales',
				header: 'Sales',
				cell: ({ row }) => `$${calculateSum(row, 'sales')}`,
				dataType: 'number',
				footer: ({ table }) => <div className='text-center'>${calculateFooterSum(table, 'sales')}</div>,
			}),
			columnHelper.accessor('variableLaborMinutes', {
				id: 'variableLaborMinutes',
				header: 'Variable Labor Minutes',
				cell: ({ row }) => calculateSum(row, 'variableLaborMinutes'),
				dataType: 'number',
				footer: ({ table }) => (
					<div className='text-center'>{calculateFooterSum(table, 'variableLaborMinutes')}</div>
				),
			}),

			columnHelper.accessor('variableLaborHours', {
				id: 'variableLaborHours',
				header: 'Variable Labor Hours',
				cell: ({ row }) => calculateSum(row, 'variableLaborHours'),
				dataType: 'number',
				footer: ({ table }) => (
					<div className='text-center'>${calculateFooterSum(table, 'variableLaborHours')}</div>
				),
			}),
			columnHelper.accessor('variableLaborDollars', {
				id: 'variableLaborDollars',
				header: 'Variable Labor Dollars',
				cell: ({ row }) => `$${calculateSum(row, 'variableLaborDollars')}`,
				dataType: 'number',
				footer: ({ table }) => (
					<div className='text-center'>${calculateFooterSum(table, 'variableLaborDollars')}</div>
				),
			}),
			columnHelper.accessor('laborPercent', {
				id: 'laborPercent',
				header: 'Labor Percent',
				cell: ({ row }) => `${calculateSum(row, 'laborPercent')}%`,
				dataType: 'number',
				footer: ({ table }) => <div className='text-center'>{calculateFooterSum(table, 'laborPercent')}%</div>,
			}),
		],
		[]
	);
	const [columns, setColumns] = useState(memoizedColumns);

	const calculateSum = (row, accessor) => {
		if (row.getCanExpand()) {
			const sum = row.subRows.reduce((acc, subrow) => {
				if (subrow.getCanExpand()) {
					return (
						acc +
						subrow.subRows.reduce(
							(subAcc, subSubrow) => subAcc + parseFloat(subSubrow.original[accessor]),
							0
						)
					);
				} else {
					return acc + parseFloat(subrow.original[accessor]);
				}
			}, 0);
			return accessor === 'variableLaborMinutes' ? sum : sum.toFixed(2);
		} else {
			return row.original[accessor];
		}
	};

	const calculateFooterSum = (table, accessor) => {
		return table
			.getCoreRowModel()
			.rows.reduce((acc, row) => acc + parseFloat(row.original[accessor]), 0)
			.toFixed(accessor === 'variableLaborMinutes' ? 0 : 2);
	};

	useEffect(() => {
		if (groupOrUnitAccess || defaultUnitID) {
			setSelectedUnit(groupOrUnitAccess || defaultUnitID);
		}
		if (groupOrUnitAccessName || defaultUnitName) {
			setSelectedUnitName(groupOrUnitAccessName || defaultUnitName);
		}
	}, [defaultUnitID, groupOrUnitAccess, defaultUnitName, groupOrUnitAccessName]);

	const fetchSalesVsLabourReport = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'salesVsLabor',
				urlParams: {
					companyId: companyID,
					alignmentId: alignmentID,
					memberId: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
					reportType: reportTypeOptions.findIndex((option) => option.name === selectedReportType) + 1,
				},
			};

			const result = await getCall(getData);

			const newData = result.data.map((item) => ({
				date: dateFormat(new Date(item.date), 'mm-dd-yyyy'),
				unitName: item.unitName,
				time: dateFormat(new Date(0, 0, 0, item.hour), 'h:MM TT'),
				grossSales: item.salesGross.toFixed(2),
				sales: item.sales.toFixed(2),
				variableLaborMinutes: item.variableLaborMinutes,
				variableLaborHours: (item.variableLaborMinutes / 60).toFixed(2),
				variableLaborDollars: item.variableLabor.toFixed(2),
				laborPercent: (item.laborPct * 100).toFixed(2),
			}));

			setSalesVsLaborData(newData);
			handleGroupByChange(groupBy);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Sales Vs Labor data: ', error);
		}
	};

	const handleUnitSelection = (unitName, unitID) => {
		setSelectedUnitName(unitName);
		setSelectedUnit(unitID);
		setUnitShowModal(false);
	};

	const handleDateSelection = (from, to) => {
		setSelectedFromDate(from);
		setSelectedToDate(to);
		setShowDateModal(false);
	};

	const handleGroupByChange = (option) => {
		setGroupBy(option);
		const groupByColumns = {
			Date: ['date', 'unitName'],
			Unit: ['unitName', 'date'],
		};

		const selectedGroupByColumns = groupByColumns[option] || [];
		const newColumns = memoizedColumns.map((column) => ({
			...column,
			groupBy: selectedGroupByColumns.includes(column.id),
			show: !selectedGroupByColumns.includes(column.id),
		}));

		const orderedColumns = [];
		selectedGroupByColumns.forEach((colId) => {
			const colIndex = newColumns.findIndex((column) => column.id === colId);
			if (colIndex > -1) {
				orderedColumns.push(newColumns[colIndex]);
				newColumns.splice(colIndex, 1); // Remove the column from its original position
			}
		});

		// Combine the ordered columns with the remaining columns
		const finalColumns = [...orderedColumns, ...newColumns];

		finalColumns.unshift(
			columnHelper.display({
				id: 'actions',
				cell: ({ row }) => {
					if (!row.getCanExpand()) return null;

					const label =
						row.depth < selectedGroupByColumns.length
							? `${finalColumns.find((col) => col.id === selectedGroupByColumns[row.depth])?.header}: ${
									row.original[selectedGroupByColumns[row.depth]]
							  } `
							: '';

					return (
						<div
							{...{
								style: { cursor: 'pointer', paddingLeft: `${row.depth * 2}rem` },
								className: 'flex items-center gap-2 font-bold top-0 bottom-0 capitalize',
							}}
						>
							{row.getIsExpanded() ? (
								<CiSquareMinus className='text-[20px]' />
							) : (
								<CiSquarePlus className='text-[20px]' />
							)}
							{label}
						</div>
					);
				},
				size: 20,
			})
		);

		setColumns(finalColumns);
	};

	// Function to handle the PDF export
	const handlePDFClick = () => {
		const pdfData = {
			title: 'Sales Vs Labor Report',
			subHeaders: [
				`Unit:${selectedUnitName} | Date Range:${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(
					selectedToDate,
					'mm-dd-yyyy'
				)}`,
			],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body: [
				{
					type: 'table',
					widths: new Array(columns.slice(1).length).fill('auto'),
					dataTypes: columns.slice(1).map((column) => column.dataType),
					data: {
						columnHeaders: columns.slice(1).map((column) => column.header),
						rows: salesVsLaborData.map((row) =>
							columns.slice(1).map((column) => ({
								value: row[column.id],
								cellType: column.dataType,
								columnName: column.header,
							}))
						),
					},
				},
			],
		};

		PdfBuilder(pdfData);
	};

	// Function to handle the CSV export
	const handleCSVClick = () => {
		const csvHeaders = columns.slice(1).map((column) => column.header);
		const csvData = salesVsLaborData.map((row) =>
			columns
				.slice(1)
				.map((column) => `"${row[column.id]}"`)
				.join(',')
		);
		const csvString = [csvHeaders.join(','), ...csvData].join('\n');
		const blob = new Blob([csvString], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const tempLink = document.createElement('a');
		tempLink.href = url;
		tempLink.setAttribute('download', 'salesVsLabor.csv');
		tempLink.click();
	};

	// Function to handle the Excel export
	const handleExcelClick = () => {
		const data = [
			{
				name: `Unit:${selectedUnitName}`,
				columns: columns.slice(1).map((column) => ({ name: column.header, filterButton: true })),
				data: salesVsLaborData.map((row) => columns.slice(1).map((column) => row[column.id])),
			},
		];

		const filename = 'salesVsLabor';
		const spreadSheetTitle = 'Sales Vs Labor Report';
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const Table = <TableHOC columns={columns} data={salesVsLaborData} isFooter={true} />;

	return (
		<>
			<div className='w-[85%] mx-auto'>
				<Steps
					enabled={introSteps.stepsEnabled}
					steps={introSteps.steps}
					initialStep={introSteps.initialStep}
					onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
				/>
				<h2 className='my-4 text-2xl leading-tight text-left pageTitle'>Sales Vs Labor</h2>
				<header className='optionsBar flex justify-between items-center mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
					<div className='flex items-center'>
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
						<div className='w-36 reportType-selector'>
							<Dropdown
								title='Report'
								options={reportTypeOptions}
								selectedOption={selectedReportType}
								onOptionChange={(option) => setSelectedReportType(option)}
							/>
						</div>
						<div className='w-32 ml-2 group-by'>
							<Dropdown
								title='Group By'
								options={groupByOptions}
								selectedOption={groupBy}
								onOptionChange={(option) => setGroupBy(option)}
							/>
						</div>
						<div className='run-button' onClick={fetchSalesVsLabourReport}>
							<div className='py-3 ml-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
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

				{/* Display the table if there is no error and the data is not loading */}

				{isError ? (
					<div>{errorMessage}</div>
				) : (
					<div className='relative w-full min-h-56'>
						<Loader loading={isLoading} />
						{!isLoading &&
							(salesVsLaborData.length > 0 ? (
								<div className='paged-table'>{Table}</div>
							) : !selectedUnit ? (
								<div className='mt-10 text-xl font-medium text-center'>No Unit Selected</div>
							) : (
								<div className='mt-10 text-xl font-medium text-center'>No data available</div>
							))}
					</div>
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

export default SalesVsLabor;
