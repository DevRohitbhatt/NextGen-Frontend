import { useEffect, useMemo, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { useLocation } from 'react-router-dom';
import { CiSquareMinus, CiSquarePlus } from 'react-icons/ci';
import {
	UnitSelector,
	CalendarModal,
	UnitModal,
	ExportOptions,
	DateSelector,
	PdfBuilder,
	ExcelExport as exportToExcel,
	TableHOC2,
	Dropdown,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import varianceFoodCost from './../../assets/introJSSteps/varianceFoodCost';

const columnHelper = createColumnHelper();

const Countsheets = () => {
	const location = useLocation();
	const [countsheet, setCountsheet] = useState({});
	const [countsheetDetails, setCountsheetDetails] = useState([]);

	const [selectedFromDate, setSelectedFromDate] = useState(
		new Date(new Date().getFullYear(), new Date().getMonth(), 0)
	);
	const [selectedToDate, setSelectedToDate] = useState(new Date());
	const [showDateModal, setShowDateModal] = useState(false);

	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Variance Food Cost Report, please try again later.'
	);

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: varianceFoodCost(),
		initialStep: 0,
		stepsEnabled: false,
	});

	const columns = useMemo(
		() => [
			columnHelper.accessor('groupName', {
				id: 'groupName',
				cell: ({ row, getValue }) =>
					getValue() ? (
						<div
							{...{
								style: { cursor: 'pointer', paddingLeft: `${row.depth * 2}rem` },
								className: 'flex items-center gap-2',
							}}
						>
							{row.getIsExpanded() ? (
								<CiSquareMinus className='text-[20px]' />
							) : (
								<CiSquarePlus className='text-[20px]' />
							)}
							{getValue()}
						</div>
					) : null,
			}),
			columnHelper.accessor('description', {
				id: 'description',
				header: '',
			}),
			columnHelper.accessor('countDescription', {
				id: 'countDescription',
			}),
			columnHelper.accessor('lineItemCost', {
				id: 'lineItemCost',
				cell: ({ row, getValue }) =>
					row.getCanExpand()
						? row.subRows.reduce((acc, subRow) => acc + subRow.original.lineItemCost, 0).toFixed(2)
						: getValue(),
			}),
		],
		[]
	);

	useEffect(() => {
		console.log(location.state.countsheet);
		setCountsheet(location.state.countsheet);

		fetchCountsheetDetails();
	}, []);

	const fetchCountsheetDetails = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'countsheetDetails',
				urlParams: {
					companyId: location.state.companyId,
					// countsheetID: location.state.countsheet?.inventoryCountSheetID,
					countsheetID: '603513',
				},
			};

			const result = await getCall(getData);

			console.log('result', result);

			const newData = result.data.map((item) => ({
				groupName: item.groupName,
				subRows: item.countSheetDetailModels.map((subItem) => ({
					description: subItem.description,
					countDescription: subItem.countDescription,
					lineItemCost: subItem.lineItemCost,
				})),
			}));

			console.log(newData);

			setCountsheetDetails(newData);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			console.error('Error fetching countsheet details: ', error);
		}
	};

	const handleExcelClick = () => {
		const data = [
			{
				name: 'Countsheets',
				columns: columns.map((column) => ({ name: column.id, filterButton: true })),
				data: countsheetDetails.flatMap((row) => row.subRows.map((subRow) => Object.values(subRow))),
			},
		];

		const filename = 'Countsheets';
		const spreadSheetTitle = 'Countsheets';
		const date = `${selectedFromDate.toLocaleDateString()} - ${selectedToDate.toLocaleDateString()}`;

		exportToExcel(data, filename, spreadSheetTitle, date, countsheet?.name);
	};

	const Table = <TableHOC2 columns={columns} data={countsheetDetails} isHeader={false} />;

	return (
		<div className='w-[85%] mx-auto'>
			<Steps
				enabled={introSteps.stepsEnabled}
				steps={introSteps.steps}
				initialStep={introSteps.initialStep}
				onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
			/>
			<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'>{countsheet?.name}</h2>
			<header className='lg:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center'>
				<div className=''>
					<div className='flex gap-1'>
						<h3>Date:</h3>
						<span>{countsheet?.saveDateTime?.split('T')[0]}</span>
					</div>
					<div className='mt-5'>
						<h3>Last saved by {countsheet?.userName} - 09/04/24 09:50</h3>
						<span className='underline cursor-pointer'>Click to insert comment</span>
					</div>
				</div>
				<div>
					<ExportOptions
						includeExcel={true}
						handleExcelClick={handleExcelClick}
						includePrint={true}
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
				countsheetDetails.length > 0 && <div className='paged-table'>{Table}</div>
			)}
		</div>
	);
};

export default Countsheets;
