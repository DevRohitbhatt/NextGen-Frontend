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
	const { companyID, alignmentID, unitsAndAreas, defaultUnitID, defaultUnitName } = useSelector(
		(state) => state.globalState
	);
	const [inventoryWeeksOnHandReportData, setInventoryWeeksOnHandReportData] = useState([]);
	const [total, setTotal] = useState(0);

	//loading and error state variables
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Inventory Weeks On Hand report, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
	const [showUnitModal, setShowUnitModal] = useState(false); // State to manage modal visibility

	//dropdown variables
	const [usage, setUsage] = useState('4 Weeks Avg - Actual');
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
				size: 200,
				filterFn: 'arrIncludesSome',
				isFilterMenu: true,
			}),
			columnHelper.accessor('inventoryItemName', {
				id: 'inventoryItemName',
				header: <div className='w-full text-left'>Inventory Item</div>,
				cell: ({ getValue }) => <div className='w-full text-left'>{getValue()}</div>,
				dataType: 'string',
				size: 400,
				filterFn: 'arrIncludesSome',
				isFilterMenu: true,
			}),
			columnHelper.accessor('department', {
				id: 'department',
				header: 'Department',
				dataType: 'string',
				size: 120,
				filterFn: 'arrIncludesSome',
				isFilterMenu: true,
			}),
			columnHelper.accessor('subDepartment', {
				id: 'subDepartment',
				header: 'Sub Department',
				dataType: 'string',
				size: 120,
				filterFn: 'arrIncludesSome',
				isFilterMenu: true,
			}),
			columnHelper.accessor('latestCountDate', {
				id: 'latestCountDate',
				header: 'Latest Count Date',
				dataType: 'string',
				size: 120,
				filterFn: 'arrIncludesSome',
				isFilterMenu: true,
			}),
			columnHelper.accessor('caseUnitOfMeasureName', {
				id: 'caseUnitOfMeasureName',
				header: 'UOM',
				dataType: 'string',
				size: 150,
				filterFn: 'arrIncludesSome',
				isFilterMenu: true,
			}),
			columnHelper.accessor('casesOnHandAtLastCount', {
				id: 'casesOnHandAtLastCount',
				header: 'On Hand At Last Count',
				cell: ({ getValue }) => getValue(),
				filterFn: 'weakEquals',
				isFilterMenu: true,
				dataType: 'number',
				footer: ({ table }) => (
					<div className='font-bold text-center'>
						{`Total = ${table
							.getFilteredRowModel()
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
				filterFn: 'weakEquals',
				isFilterMenu: true,
			}),
			columnHelper.accessor('casesTransferredInSinceLastCount', {
				id: 'casesTransferredInSinceLastCount',
				header: 'Cases Transferred In Since Last Count',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
				filterFn: 'weakEquals',
				isFilterMenu: true,
			}),
			columnHelper.accessor('casesTransferredOutSinceLastCount', {
				id: 'casesTransferredOutSinceLastCount',
				header: 'Cases Transferred Out Since Last Count',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
				filterFn: 'weakEquals',
				isFilterMenu: true,
			}),
			columnHelper.accessor('casesWastedSinceLastCount', {
				id: 'casesWastedSinceLastCount',
				header: 'Cases Wasted Since Last Count',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
				filterFn: 'weakEquals',
				isFilterMenu: true,
			}),
			columnHelper.accessor('casesAddedSinceLastCount', {
				id: 'casesAddedSinceLastCount',
				header: 'Added Since Last Count',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
				filterFn: 'weakEquals',
				isFilterMenu: true,
			}),
			columnHelper.accessor('casesUsedEstimate', {
				id: 'casesUsedEstimate',
				header: 'Used Estimate',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
				filterFn: 'weakEquals',
				isFilterMenu: true,
			}),
			columnHelper.accessor('estimatedCasesOnHandNow', {
				id: 'estimatedCasesOnHandNow',
				header: 'Estimated Cases On Hand',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
				filterFn: 'weakEquals',
				isFilterMenu: true,
			}),
			columnHelper.accessor('estimatedValueOnHandNow', {
				id: 'estimatedValueOnHandNow',
				header: 'Estimated $ On Hand Now',
				cell: ({ getValue }) => `$${getValue() !== 0 ? getValue().toFixed(2) : 0}`,
				dataType: 'number',
				filterFn: 'weakEquals',
				isFilterMenu: true,
			}),
			columnHelper.accessor('averageCasesUsedPerWeek', {
				id: 'averageCasesUsedPerWeek',
				header: 'Average Used Per Week',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
				filterFn: 'weakEquals',
				isFilterMenu: true,
			}),
			columnHelper.accessor('averageValueUsedPerWeek', {
				id: 'averageValueUsedPerWeek',
				header: 'Average $ Used Per Week',
				cell: ({ getValue }) => `$${getValue() !== 0 ? getValue().toFixed(2) : 0}`,
				dataType: 'number',
				filterFn: 'weakEquals',
				isFilterMenu: true,
			}),
			columnHelper.accessor('salesYieldWeeklyAverage', {
				id: 'salesYieldWeeklyAverage',
				header: 'Sales Yield Weekly Average',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'string',
				filterFn: 'weakEquals',
				isFilterMenu: true,
			}),
			columnHelper.accessor('inventoryWeeksOnHandNow', {
				id: 'inventoryWeeksOnHandNow',
				header: 'Inventory Weeks On Hand Now',
				cell: ({ getValue }) => (getValue() !== 0 ? getValue().toFixed(2) : 0),
				dataType: 'number',
				filterFn: 'weakEquals',
				isFilterMenu: true,
			}),
		],
		[]
	);

	useEffect(() => {
		if (defaultUnitID) {
			setSelectedUnit(defaultUnitID);
		}
		if (defaultUnitName) {
			setSelectedUnitName(defaultUnitName);
		}
	}, [defaultUnitID, defaultUnitName]);

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
		setShowUnitModal(false);
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
		const csvHeaders = columns.map((column) => (typeof column.header === 'object' ? column.header.props.children : column.header));
		const csvData = inventoryWeeksOnHandReportData.map((row) =>
			[columns.map((column) => row[column.id])].join(',')
		);
		const date = dateFormat(new Date(), 'mm-dd-yyyy');
		const csvString = [`InventoryWeeksOnHand ${date}`, '', csvHeaders.join(','), ...csvData].join('\n');
		const blob = new Blob([csvString], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const tempLink = document.createElement('a');
		tempLink.href = url;
		tempLink.setAttribute('download', 'inventoryWeeksOnHand.csv');
		tempLink.click();
	};

	// // Function to handle the Excel export
	const handleExcelClick = () => {
		if (inventoryWeeksOnHandReportData.length === 0) return;

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
		<TableHOC
			columns={columns}
			data={inventoryWeeksOnHandReportData}
			isPaginated={true}
			isFooter={true}
			enableColumnFilters={true}
		/>
	);

	return (
		<>
			<div className='w-10/12 mx-auto pageContainer'>
				<Steps
					enabled={introSteps.stepsEnabled}
					steps={introSteps.steps}
					initialStep={introSteps.initialStep}
					onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
				/>
				<h2 className='my-4 text-2xl leading-tight text-left pageTitle'>Inventory Weeks On Hand</h2>
				<header className='optionsBar flex justify-between items-center mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]'>
					<div className='flex items-center'>
						<UnitSelector
							companyID={companyID}
							alignmentID={alignmentID}
							memberID={selectedUnit}
							memberName={selectedUnitName}
							includeAreas={true}
							setMemberName={setSelectedUnitName}
							onClick={() => setShowUnitModal(true)}
						/>

						<Dropdown
							options={dropdownOptions}
							title='Usage Estimation Model'
							selectedOption={usage}
							onOptionChange={handleUsageChange}
						/>
						<div className='run-button' onClick={fetchInventoryWeeksOnHandReport}>
							<div className='py-3 ml-1 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7'>
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
					<div className='relative w-full min-h-56'>
						<Loader loading={isLoading} />
						{!isLoading &&
							(inventoryWeeksOnHandReportData.length > 0 ? (
								<div className='mt-4'>
									{total > 0 && (
										<div className='text-2xl font-medium min-w-fit'>{`Total $: ${total}`}</div>
									)}
									{Table}
								</div>
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
						show={showUnitModal}
						includeAreas={true}
						handleClose={() => {
							setShowUnitModal(false);
						}}
						handleUnitSelection={handleUnitSelection}
					/>
				</div>
			</div>
		</>
	);
};

export default InventoryWeeksOnHand;
