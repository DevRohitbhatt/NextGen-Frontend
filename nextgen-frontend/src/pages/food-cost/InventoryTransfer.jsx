import { useEffect, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import dateFormat from 'dateformat';
import { useSelector } from 'react-redux';
import inventoryTransferReport from '../../assets/introJSSteps/inventoryTransferReport';
import {
	Dropdown,
	Loader,
	UnitSelector,
	CalendarModal,
	UnitModal,
	ExportOptions,
	DateSelector,
	ExcelExport as exportToExcel,
	SimpleTable as Table,
	PdfBuilder,
} from '../../components';

const InventoryTransfer = () => {
	const {
		companyID,
		alignmentID,
		unitsAndAreas,
		groupOrUnitAccess,
		defaultUnitID,
		groupOrUnitAccessName,
		defaultUnitName,
	} = useSelector((state) => state.globalState);
	const [inventoryTransferReportData, setInventoryTransferReportData] = useState([]);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Inventory Transfer Report, please try again later.'
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
	const [reportType, setReportType] = useState('Detail');
	const dropdownOptions = [{ name: 'Detail' }, { name: 'Unit Summary' }];

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: inventoryTransferReport(),
		initialStep: 0,
		stepsEnabled: false,
	});

	const [headers, setHeaders] = useState([
		{
			key: 'fromUnit',
			label: 'From Unit',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			width: '260px',
		},
		{
			key: 'toUnit',
			label: 'To Unit',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
		},
		{
			key: 'transferTime',
			label: 'Transfer Time',
			cellType: 'date',
			toolTip: '',
			toolTipDirection: '',
		},
		{
			key: 'department',
			label: 'Department',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			width: '150px',
		},
		{
			key: 'inventoryItem',
			label: 'Inventory Item',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
		},
		{
			key: 'transferQuantity',
			label: 'Transfer Quantity',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
		},
		{
			key: 'transferValue',
			label: 'Transfer Value',
			cellType: 'number',
			toolTip: '',
			toolTipDirection: '',
			width: '125px',
		},
	]);

	useEffect(() => {
		if (groupOrUnitAccess || defaultUnitID) {
			setSelectedUnit(groupOrUnitAccess || defaultUnitID);
		}
		if (groupOrUnitAccessName || defaultUnitName) {
			setSelectedUnitName(groupOrUnitAccessName || defaultUnitName);
		}
	}, [defaultUnitID, groupOrUnitAccess, defaultUnitName, groupOrUnitAccessName]);

	// Function to get the inventory transfer report
	const fetchInventoryTransferReport = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'inventoryTransferReportData',
				urlParams: {
					companyId: companyID,
					alignmentId: alignmentID,
					unitIds: selectedUnit,
					fromDate: dateFormat(selectedFromDate, 'yyyy-mm-dd'),
					toDate: dateFormat(selectedToDate, 'yyyy-mm-dd'),
					reportType: reportType,
				},
			};

			const result = await getCall(getData);
			setInventoryTransferReportData(result);
			changeHeadersBasedOnReportType();
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting inventory transfer report data: ', error);
		}
	};

	// Function to handle the headers based on the report type
	const changeHeadersBasedOnReportType = () => {
		if (reportType === 'Detail') {
			setHeaders([
				{
					key: 'fromUnit',
					label: 'From Unit',
					cellType: 'string',
					toolTip: '',
					toolTipDirection: '',
					width: '260px',
				},
				{
					key: 'toUnit',
					label: 'To Unit',
					cellType: 'string',
					toolTip: '',
					toolTipDirection: '',
				},
				{
					key: 'transferTime',
					label: 'Transfer Time',
					cellType: 'dateTime',
					toolTip: '',
					toolTipDirection: '',
				},
				{
					key: 'department',
					label: 'Department',
					cellType: 'string',
					toolTip: '',
					toolTipDirection: '',
					width: '150px',
				},
				{
					key: 'inventoryItem',
					label: 'Inventory Item',
					cellType: 'string',
					toolTip: '',
					toolTipDirection: '',
				},
				{
					key: 'transferQuantity',
					label: 'Transfer Quantity',
					cellType: 'string',
					toolTip: '',
					toolTipDirection: '',
				},
				{
					key: 'transferValue',
					label: 'Transfer Value',
					cellType: 'integer',
					toolTip: '',
					toolTipDirection: '',
					width: '125px',
				},
			]);
		} else {
			setHeaders([
				{
					key: 'unit',
					label: 'Unit',
					cellType: 'string',
					toolTip: '',
					toolTipDirection: '',
				},
				{
					key: 'transferInCount',
					label: 'Transfer In Count',
					cellType: 'integer',
					toolTip: '',
					toolTipDirection: '',
				},
				{
					key: 'transferOutCount',
					label: 'Transfer Out Count',
					cellType: 'integer',
					toolTip: '',
					toolTipDirection: '',
				},
				{
					key: 'totalTransferInValue',
					label: 'Total Transfer In Value',
					cellType: 'integer',
					toolTip: '',
					toolTipDirection: '',
				},
				{
					key: 'totalTransferOutValue',
					label: 'Total Transfer Out Value',
					cellType: 'integer',
					toolTip: '',
					toolTipDirection: '',
				},
				{
					key: 'totalNetTransferValue',
					label: 'Total Net Transfer Value',
					cellType: 'integer',
					toolTip: '',
					toolTipDirection: '',
				},
			]);
		}
	};

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

	// Function to handle the PDF export
	const handlePDFClick = () => {
		if (!inventoryTransferReportData?.data) return;

		const pdfData = {
			title: 'Inventory Transfer Report',
			subHeaders: [
				`${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(
					selectedToDate,
					'mm-dd-yyyy'
				)} | ${selectedUnitName}`,
			],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body: [
				{
					type: 'table',
					widths: headers.map(() => 'auto'),
					dataTypes: headers.map((header) => header.cellType),
					data: {
						columnHeaders: headers.map((header) => header.label),
						rows: inventoryTransferReportData.data.map((row) =>
							headers.map((header) => ({
								value:
									header.key === 'transferTime'
										? dateFormat(row[header.key], 'mm/dd/yyyy hh:MM TT')
										: row[header.key],
								cellType: header.cellType,
								columnName: header.label,
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
		if (!inventoryTransferReportData?.data) return;
		const csvHeaders = headers.map((header) => header.label);
		const csvData = inventoryTransferReportData.data.map((row) =>
			[
				headers.map((header) =>
					header.key === 'transferTime' ? dateFormat(row[header.key], 'mm/dd/yyyy hh:MM TT') : row[header.key]
				),
			].join(',')
		);
		const csvString = [csvHeaders.join(','), ...csvData].join('\n');
		const blob = new Blob([csvString], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const tempLink = document.createElement('a');
		tempLink.href = url;
		tempLink.setAttribute('download', 'InventoryTransferReport.csv');
		tempLink.click();
	};

	// Function to handle the Excel export
	const handleExcelClick = () => {
		if (!inventoryTransferReportData?.data) return;

		const data = [
			{
				name: 'Inventory Transfer Report',
				columns: headers.map((header) => ({ name: header.label, filterButton: true })),
				data: inventoryTransferReportData.data.map((row) =>
					headers.map((header) =>
						header.key === 'transferTime'
							? dateFormat(row[header.key], 'mm/dd/yyyy hh:MM TT')
							: row[header.key]
					)
				),
			},
		];

		const filename = 'InventoryTransferReport';
		const spreadSheetTitle = 'Inventory Transfer Report';
		const date = `${dateFormat(selectedFromDate, 'mm-dd-yyyy')} to ${dateFormat(selectedToDate, 'mm-dd-yyyy')}`;

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	return (
		<>
			<div className='w-[85%] mx-auto'>
				<Steps
					enabled={introSteps.stepsEnabled}
					steps={introSteps.steps}
					initialStep={introSteps.initialStep}
					onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
				/>
				<h2 className='my-4 text-2xl leading-tight text-left pageTitle'>Inventory Transfer</h2>
				<header className='optionsBar flex justify-between items-center mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
					<div className='flex items-center'>
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

						<div className='w-48'>
							<Dropdown
								options={dropdownOptions}
								title='Report Type'
								selectedOption={reportType}
								onOptionChange={(optionValue) => setReportType(optionValue)}
							/>
						</div>
						<div className='run-button' onClick={fetchInventoryTransferReport}>
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
						{!isLoading && (
							<>
								{inventoryTransferReportData?.data ? (
									<div>
										<Table
											data={inventoryTransferReportData.data}
											headers={headers}
											onRowClick={() => {}}
										/>
									</div>
								) : !selectedUnit ? (
									<div className='mt-10 text-xl font-medium text-center'>No Unit Selected</div>
								) : (
									<div className='mt-10 text-xl font-medium text-center'>No data available</div>
								)}
							</>
						)}
					</div>
				)}

				<div>
					<UnitModal
						unitData={unitsAndAreas}
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

export default InventoryTransfer;
