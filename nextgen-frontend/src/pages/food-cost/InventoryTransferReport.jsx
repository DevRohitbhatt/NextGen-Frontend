import { useEffect, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import inventoryTransferReport from '../../assets/introJSSteps/inventoryTransferReport';
import {
	Dropdown,
	UnitSelector,
	CalendarModal,
	UnitModal,
	ExportOptions,
	DateSelector,
	SimpleTable as Table,
	PdfBuilder,
} from '../../components';
import exportToExcel from '../../components/exportOptions/ExcelExport';

const InventoryTransferReport = () => {
	const [companyId, setCompanyId] = useState();
	const [alignmentId, setAlignmentId] = useState();
	const [memberId, setMemberId] = useState();
	const [unitsAndAreasList, setUnitsAndAreasList] = useState([]);
	const [inventoryTransferReportData, setInventoryTransferReportData] = useState([]);

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
		},
	]);

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

	// Function to get the inventory transfer report
	const handleInventoryTransferReport = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'inventoryTransferReportData',
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
					unitIds: selectedUnit,
					fromDate: selectedFromDate.toISOString().split('T')[0],
					toDate: selectedToDate.toISOString().split('T')[0],
					reportType: reportType,
				},
			};

			const result = await getCall(getData);
			setInventoryTransferReportData(result);
			handleHeaders();
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting inventory transfer report data: ', error);
		}
	};

	// Function to handle the headers based on the report type
	const handleHeaders = () => {
		if (reportType === 'Detail') {
			setHeaders([
				{
					key: 'fromUnit',
					label: 'From Unit',
					cellType: 'string',
					toolTip: '',
					toolTipDirection: '',
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
		setselectedUnitName(unitName);
		setSelectedUnit(unitID);
		setUnitShowModal(false);
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
				`${selectedFromDate.toLocaleDateString()} - ${selectedToDate.toLocaleDateString()} | ${selectedUnitName}`,
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
								value: row[header.key],
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
			[headers.map((header) => row[header.key])].join(',')
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
				data: inventoryTransferReportData.data.map((row) => headers.map((header) => row[header.key])),
			},
		];

		const filename = 'InventoryTransferReport';
		const spreadSheetTitle = 'Inventory Transfer Report';
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
			<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'>Inventory Transfer Report</h2>
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
						options={dropdownOptions}
						title='Report Type'
						selectedOption={reportType}
						onOptionChange={(optionValue) => setReportType(optionValue)}
					/>
					<div className='run-button' onClick={handleInventoryTransferReport}>
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
				inventoryTransferReportData?.data && (
					<div>
						<Table data={inventoryTransferReportData?.data} headers={headers} onRowClick={() => {}} />
					</div>
				)
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

export default InventoryTransferReport;
