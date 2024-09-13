import { useEffect, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import inventoryWeekOnHand from '../../assets/introJSSteps/inventoryWeeksOnHand.js';
import {
	Dropdown,
	UnitSelector,
	UnitModal,
	ExportOptions,
	ExcelExport as exportToExcel,
	SimpleTable as Table,
} from '../../components';

const InventoryWeeksOnHand = () => {
	const [companyId, setCompanyId] = useState();
	const [alignmentId, setAlignmentId] = useState();
	const [memberId, setMemberId] = useState();
	const [unitsAndAreasList, setUnitsAndAreasList] = useState([]);
	const [inventoryWeeksOnHandReportData, setInventoryWeeksOnHandReportData] = useState([]);
	const [total, setTotal] = useState(0);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Employee Information, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setselectedUnitName] = useState('No Unit Selected');
	const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

	//dropdown variables
	const [usage, setUsage] = useState('Last Week Avg - Actual');
	const [weekBefore, setWeekBefore] = useState(1);
	const dropdownOptions = [
		{ name: 'Last Week Avg - Actual' },
		{ name: '2 Weeks Avg - Actual' },
		{ name: '3 Weeks Avg - Actual' },
		{ name: '4 Weeks Avg - Actual' },
	];

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: inventoryWeekOnHand(),
		initialStep: 0,
		stepsEnabled: false,
	});

	const headers = [
		{
			key: 'unitName',
			label: 'Unit Name',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px', // Minimum width of the column
			maxWidth: '250px', // Maximum width of the column
		},
		{
			key: 'inventoryItemName',
			label: 'Inventory Item',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '120px',
			maxWidth: '100px',
		},
		{
			key: 'department',
			label: 'Department',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '130px',
			maxWidth: '200px',
		},
		{
			key: 'subDepartment',
			label: 'Sub Department',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
		},
		{
			key: 'latestCountDate',
			label: 'Latest Count Date',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
		},
		{
			key: 'caseUnitOfMeasureName',
			label: 'UOM',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
		},
		{
			key: 'casesOnHandAtLastCount',
			label: 'On Hand At Last Count',
			cellType: 'number',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '100px',
			maxWidth: '150px',
		},
		{
			key: 'casesPurchasedSinceLastCount',
			label: 'Cases Purchased Since Last Count',
			cellType: 'number',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '200px',
			maxWidth: '300px',
		},
		{
			key: 'casesTransferredInSinceLastCount',
			label: 'Cases Transferred In Since Last Count',
			cellType: 'number',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '200px',
			maxWidth: '300px',
		},
		{
			key: 'casesTransferredOutSinceLastCount',
			label: 'Cases Transferred Out Since Last Count',
			cellType: 'number',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '120px',
			maxWidth: '180px',
		},
		{
			key: 'casesWastedSinceLastCount',
			label: 'Cases Wasted Since Last Count',
			cellType: 'number',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '100px',
			maxWidth: '150px',
		},
		{
			key: 'casesAddedSinceLastCount',
			label: 'Added Since Last Count',
			cellType: 'number',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '100px',
			maxWidth: '120px',
		},
		{
			key: 'casesUsedEstimate',
			label: 'Used Estimate',
			cellType: 'number',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
		},
		{
			key: 'estimatedCasesOnHandNow',
			label: 'Estimated Cases On Hand',
			cellType: 'number',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
		},
		{
			key: 'estimatedValueOnHandNow',
			label: 'Estimated $ On Hand Now',
			cellType: 'number',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
		},
		{
			key: 'averageCasesUsedPerWeek',
			label: 'Average Used Per Week',
			cellType: 'number',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '100px',
			maxWidth: '150px',
		},
		{
			key: 'averageValueUsedPerWeek',
			label: 'Average $ Used Per Week',
			cellType: 'number',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '200px',
			maxWidth: '300px',
		},
		{
			key: 'salesYieldWeeklyAverage',
			label: 'Sales Yield Weekly Average',
			cellType: 'string',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
		},
		{
			key: 'inventoryWeeksOnHandNow',
			label: 'Inventory Weeks On Hand Now',
			cellType: 'number',
			toolTip: '',
			toolTipDirection: '',
			minWidth: '150px',
			maxWidth: '200px',
		},
	];

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

	// This function fetches the units and areas.
	const fetchUnits = async (companyId, alignmentId, memberId) => {
		try {
			setIsError(false);
			const getData = {
				url: 'unitsAndArea',
				urlParams: {
					companyID: companyId,
					alignmentID: alignmentId,
					memberID: memberId,
				},
			};

			const result = await getCall(getData);
			setUnitsAndAreasList(result.data);
		} catch (error) {
			setIsError(true);
			setErrorMessage('There was an issue loading your units, please try again later.');
			console.error('Error getting units: ', error);
		}
	};

	// Fetching Employee Information
	const fetchInventoryWeeksOnHandReport = async () => {
		try {
			setIsError(false);
			setIsLoading(true);
			const getData = {
				url: 'InventoryWeeksOnHand',
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
					memberId: selectedUnit,
					weeksBack: weekBefore,
				},
			};

			const result = await getCall(getData);

			const newData = {
				data: result.data.map((item) => ({
					...item,
					inventoryItemName: `${item.qsrInventoryItemID} - ${item.inventoryItemName}`,
				})),
			};

			const total = result.data.reduce((acc, item) => acc + item.estimatedValueOnHandNow, 0);

			setTotal(total);

			setInventoryWeeksOnHandReportData(newData);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage(
				'There was an issue loading your Inventory Weeks On Hand information, please try again later.'
			);
			console.error('Error getting employee information: ', error);
		}
	};

	// Function to handle the unit selection
	const handleUnitSelection = async (unitName, unitID) => {
		setselectedUnitName(unitName);
		setSelectedUnit(unitID);
		setUnitShowModal(false);
	};

	// function	to handle the usage change
	const handleUsageChange = (option) => {
		switch (option) {
			case 'Last Week Avg - Actual':
				setUsage('Last Week Avg - Actual');
				setWeekBefore(1);
				break;
			case '2 Weeks Avg - Actual':
				setUsage('2 Weeks Avg - Actual');
				setWeekBefore(2);
				break;
			case '3 Weeks Avg - Actual':
				setUsage('3 Weeks Avg - Actual');
				setWeekBefore(3);
				break;
			case '4 Weeks Avg - Actual':
				setUsage('4 Weeks Avg - Actual');
				setWeekBefore(4);
				break;
			default:
				break;
		}
	};
	// // Function to handle the PDF export
	// const handlePDFClick = () => {
	// 	if (!inventoryWeeksOnHandReportData?.data) return;

	// 	const pdfData = {
	// 		title: `Inventory Weeks On Hand | ${usage}`,
	// 		subHeaders: [new Date().toLocaleDateString()],
	// 		exportType: 'pdf',
	// 		pageOrientation: 'landscape',
	// 		body: [
	// 			{
	// 				type: 'table',
	// 				widths: headers.map(() => 'auto'),
	// 				dataTypes: headers.map((header) => header.cellType),
	// 				data: {
	// 					columnHeaders: headers.map((header) => header.label),
	// 					rows: inventoryWeeksOnHandReportData.data.map((row) =>
	// 						headers.map((header) => ({
	// 							value: row[header.key],
	// 							cellType: header.cellType,
	// 							columnName: header.label,
	// 						}))
	// 					),
	// 				},
	// 			},
	// 		],
	// 	};

	// 	PdfBuilder(pdfData);
	// };

	// Function to handle the CSV export
	const handleCSVClick = () => {
		if (!inventoryWeeksOnHandReportData?.data) return;
		const csvHeaders = headers.map((header) => header.label);
		const csvData = inventoryWeeksOnHandReportData.data.map((row) =>
			[headers.map((header) => row[header.key])].join(',')
		);
		const csvString = [csvHeaders.join(','), ...csvData].join('\n');
		const blob = new Blob([csvString], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const tempLink = document.createElement('a');
		tempLink.href = url;
		tempLink.setAttribute('download', 'inventoryWeeksOnHand.csv');
		tempLink.click();
	};

	// // Function to handle the Excel export
	const handleExcelClick = () => {
		if (!inventoryWeeksOnHandReportData?.data) return;

		const data = [
			{
				name: `Inventory Weeks On Hand | ${usage}`,
				columns: headers.map((header) => ({ name: header.label, filterButton: true })),
				data: inventoryWeeksOnHandReportData.data.map((row) => headers.map((header) => row[header.key])),
			},
		];

		const filename = 'Inventory Weeks On Hand';
		const spreadSheetTitle = 'Inventory Weeks On Hand';
		const date = new Date().toLocaleDateString();

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
			<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'>Inventory Weeks On Hand</h2>
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

					<Dropdown
						options={dropdownOptions}
						title='Usage Estimation Model'
						selectedOption={usage}
						onOptionChange={handleUsageChange}
					/>
					<div className='run-button' onClick={fetchInventoryWeeksOnHandReport}>
						<div className='py-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-primary hover:text-white hover:bg-primary text-nowrap rounded-3xl mt-7'>
							Run
						</div>
					</div>
				</div>
				<div className='flex items-center gap-10'>
					<ExportOptions
						includePDF={false}
						//handlePDFClick={handlePDFClick}
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
				inventoryWeeksOnHandReportData?.data && (
					<div className='mt-4'>
						{total > 0 && <div className='text-2xl font-bold min-w-fit'>{`Total $: ${total}`}</div>}
						<Table
							data={inventoryWeeksOnHandReportData?.data}
							headers={headers}
							onRowClick={() => {}}
							isPaginated={false}
						/>
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
			</div>
		</div>
	);
};

export default InventoryWeeksOnHand;
