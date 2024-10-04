import { useEffect, useState, useMemo } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { useSelector } from 'react-redux';
import inventoryWeekOnHand from '../../assets/introJSSteps/inventoryWeeksOnHand.js';
import {
	Dropdown,
	Loader,
	UnitSelector,
	UnitModal,
	ExportOptions,
	ExcelExport as exportToExcel,
	TableHOC,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import dateFormat from 'dateformat';

const columnHelper = createColumnHelper();

const InventoryWeeksOnHand = () => {
	const globalState = useSelector((state) => state.globalState);
	const companyID = useSelector((state) => state.globalState.companyID);
	const alignmentID = useSelector((state) => state.globalState.alignmentID);
	const unitsAndAreasList = useSelector((state) => state.globalState.unitsAndAreas);

	const [inventoryWeeksOnHandReportData, setInventoryWeeksOnHandReportData] = useState([]);
	const [total, setTotal] = useState(0);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Employee Information, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('No Unit Selected');
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

	const columns = useMemo(
		() => [
			columnHelper.accessor('unitName', {
				id: 'unitName',
				header: 'Unit Name',
				dataType: 'string',
			}),
			columnHelper.accessor('inventoryItemName', {
				id: 'inventoryItemName',
				header: 'Inventory Item',
				dataType: 'string',
			}),
			columnHelper.accessor('department', {
				id: 'department',
				header: 'Department',
				dataType: 'string',
			}),
			columnHelper.accessor('subDepartment', {
				id: 'subDepartment',
				header: 'Sub Department',
				dataType: 'string',
			}),
			columnHelper.accessor('latestCountDate', {
				id: 'latestCountDate',
				header: 'Latest Count Date',
				dataType: 'string',
			}),
			columnHelper.accessor('caseUnitOfMeasureName', {
				id: 'caseUnitOfMeasureName',
				header: 'UOM',
				dataType: 'string',
			}),
			columnHelper.accessor('casesOnHandAtLastCount', {
				id: 'casesOnHandAtLastCount',
				header: 'On Hand At Last Count',
				cell: ({ getValue }) => getValue().toFixed(2),
				dataType: 'number',
				footer: ({ table }) => (
					<div className='font-bold text-center'>
						{`Total = ${table
							.getCoreRowModel()
							.rows.reduce((acc, row) => acc + row.original.casesOnHandAtLastCount, 0)
							.toFixed(2)}`}
					</div>
				),
			}),
			columnHelper.accessor('casesPurchasedSinceLastCount', {
				id: 'casesPurchasedSinceLastCount',
				header: 'Cases Purchased Since Last Count',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
			}),
			columnHelper.accessor('casesTransferredInSinceLastCount', {
				id: 'casesTransferredInSinceLastCount',
				header: 'Cases Transferred In Since Last Count',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
			}),
			columnHelper.accessor('casesTransferredOutSinceLastCount', {
				id: 'casesTransferredOutSinceLastCount',
				header: 'Cases Transferred Out Since Last Count',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
			}),
			columnHelper.accessor('casesWastedSinceLastCount', {
				id: 'casesWastedSinceLastCount',
				header: 'Cases Wasted Since Last Count',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
			}),
			columnHelper.accessor('casesAddedSinceLastCount', {
				id: 'casesAddedSinceLastCount',
				header: 'Added Since Last Count',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
			}),
			columnHelper.accessor('casesUsedEstimate', {
				id: 'casesUsedEstimate',
				header: 'Used Estimate',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
			}),
			columnHelper.accessor('estimatedCasesOnHandNow', {
				id: 'estimatedCasesOnHandNow',
				header: 'Estimated Cases On Hand',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
			}),
			columnHelper.accessor('estimatedValueOnHandNow', {
				id: 'estimatedValueOnHandNow',
				header: 'Estimated $ On Hand Now',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
			}),
			columnHelper.accessor('averageCasesUsedPerWeek', {
				id: 'averageCasesUsedPerWeek',
				header: 'Average Used Per Week',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
			}),
			columnHelper.accessor('averageValueUsedPerWeek', {
				id: 'averageValueUsedPerWeek',
				header: 'Average $ Used Per Week',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
			}),
			columnHelper.accessor('salesYieldWeeklyAverage', {
				id: 'salesYieldWeeklyAverage',
				header: 'Sales Yield Weekly Average',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'string',
			}),
			columnHelper.accessor('inventoryWeeksOnHandNow', {
				id: 'inventoryWeeksOnHandNow',
				header: 'Inventory Weeks On Hand Now',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
			}),
		],
		[]
	);

	useEffect(() => {
		if (globalState.groupOrUnitAccess || globalState.defaultUnitID) {
			setSelectedUnit(globalState.groupOrUnitAccess || globalState.defaultUnitID);
		}
		if (globalState.groupOrUnitAccessName || globalState.defaultUnitName) {
			setSelectedUnitName(globalState.groupOrUnitAccessName || globalState.defaultUnitName);
		}
	}, [
		globalState.defaultUnitID,
		globalState.groupOrUnitAccess,
		globalState.defaultUnitName,
		globalState.groupOrUnitAccessName,
	]);

	// Fetching Employee Information
	const fetchInventoryWeeksOnHandReport = async () => {
		try {
			setIsError(false);
			setIsLoading(true);
			const getData = {
				url: 'InventoryWeeksOnHand',
				urlParams: {
					companyId: companyID,
					alignmentId: alignmentID,
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

			const total = result.data.reduce((acc, item) => acc + item.estimatedValueOnHandNow, 0).toFixed(2);

			setTotal(total);

			setInventoryWeeksOnHandReportData(newData.data);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage(
				'There was an issue loading your Inventory Weeks On Hand information, please try again later.'
			);
			console.error('Error getting Inventory Weeks On Hand Data: ', error);
		}
	};

	// Function to handle the unit selection
	const handleUnitSelection = async (unitName, unitID) => {
		setSelectedUnitName(unitName);
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

	// Function to handle the CSV export
	const handleCSVClick = () => {
		if (inventoryWeeksOnHandReportData.length === 0) return;
		const csvHeaders = columns.map((column) => column.header);
		const csvData = inventoryWeeksOnHandReportData.map((row) =>
			[columns.map((column) => row[column.id])].join(',')
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
		if (inventoryWeeksOnHandReportData === 0) return;

		const data = [
			{
				name: `Inventory Weeks On Hand | ${usage}`,
				columns: columns.map((column) => ({ name: column.header, filterButton: true })),
				data: inventoryWeeksOnHandReportData.map((row) => columns.map((column) => row[column.id])),
			},
		];

		const filename = 'Inventory Weeks On Hand';
		const spreadSheetTitle = 'Inventory Weeks On Hand';
		const date = dateFormat(new Date(), 'mm-dd-yyyy');

		exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
	};

	const Table = (
		<TableHOC columns={columns} data={inventoryWeeksOnHandReportData} isPaginated={true} isFooter={true} />
	);

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
				<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'>Inventory Weeks On Hand</h2>
				<header className='xl:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center'>
					<div className='flex items-center space-x-3 '>
						<UnitSelector
							companyID={companyID}
							alignmentID={alignmentID}
							memberID={selectedUnit}
							memberName={selectedUnitName}
							includeAreas={true}
							setMemberName={setSelectedUnitName}
							onClick={() => setUnitShowModal(true)}
						/>

						<Dropdown
							options={dropdownOptions}
							title='Usage Estimation Model'
							selectedOption={usage}
							onOptionChange={handleUsageChange}
						/>
						<div className='run-button' onClick={fetchInventoryWeeksOnHandReport}>
							<div className='py-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
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

				{/* Display the table if there is no error and the data is not loading */}
				{isError ? (
					<div>{errorMessage}</div>
				) : (
					!isLoading &&
					(inventoryWeeksOnHandReportData.length > 0 ? (
						<div className='mt-4'>
							{total > 0 && <div className='text-2xl font-bold min-w-fit'>{`Total $: ${total}`}</div>}
							{Table}
						</div>
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
				</div>
			</div>
		</>
	);
};

export default InventoryWeeksOnHand;
