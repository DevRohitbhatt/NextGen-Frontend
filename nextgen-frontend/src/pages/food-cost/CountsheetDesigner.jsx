import { useEffect, useMemo, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { useLocation } from 'react-router-dom';
import { CiSquareMinus, CiSquarePlus } from 'react-icons/ci';
import { ExportOptions, PdfBuilder, ExcelExport as exportToExcel, TableHOC } from '../../components';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

const CountsheetDesigner = () => {
	const location = useLocation();
	const [countsheet, setCountsheet] = useState({});
	const [countsheetDetails, setCountsheetDetails] = useState([]);

	const [selectedFromDate, setSelectedFromDate] = useState(
		new Date(new Date().getFullYear(), new Date().getMonth(), 0)
	);
	const [selectedToDate, setSelectedToDate] = useState(new Date());

	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Variance Food Cost Report, please try again later.'
	);

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
					`$${
						row.getCanExpand()
							? row.subRows.reduce((acc, subRow) => acc + subRow.original.lineItemCost, 0).toFixed(2)
							: getValue()
					}`,
				footer: ({ table }) =>
					`Total Inventory Value: $${table
						.getCoreRowModel()
						.rows.reduce(
							(acc, row) =>
								acc + row.subRows.reduce((acc, subRow) => acc + subRow.original.lineItemCost, 0),
							0
						)
						.toFixed(2)}`,
			}),
		],
		[]
	);

	useEffect(() => {
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
					countsheetID: location.state.countsheet?.inventoryCountSheetID,
				},
			};

			const result = await getCall(getData);

			const newData = result.data.map((item) => ({
				groupName: item.groupName,
				subRows: item.countSheetDetailModels.map((subItem) => ({
					description: subItem.description,
					countDescription: subItem.countDescription,
					lineItemCost: subItem.lineItemCost,
				})),
			}));

			setCountsheetDetails(newData);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			console.error('Error fetching countsheet details: ', error);
		}
	};

	// Function to handle the PDF export
	const handlePrintClick = () => {
		if (!columns || columns.length === 0) {
			console.error('Columns are not defined or empty');
			return;
		}

		if (!countsheetDetails || countsheetDetails.length === 0) {
			console.error('Countsheet data is not defined or empty');
			return;
		}

		const pdfData = {
			title: 'Countsheet',
			subHeaders: [`${countsheet?.dateTime} | ${countsheet?.name}`],
			exportType: 'print',
			pageOrientation: 'portrait',
			body: buildPDFBody(),
		};

		PdfBuilder(pdfData);
	};

	const buildPDFBody = () => {
		const body = countsheetDetails.map((row) => {
			const title = row.groupName;
			return {
				type: 'table',
				title: title,
				widths: new Array(columns.length - 1).fill('auto'),
				dataTypes: columns.slice(1).map((column) => column.dataType),
				data: formatPDFData(row.subRows),
			};
		});

		return body;
	};

	const formatPDFData = (data) => {
		return {
			columnHeaders: ['Description', 'Count Description', 'Line Item Cost'],
			rows: data.map((row) =>
				columns.slice(1).map((column) => ({
					value: row[column.id],
					cellType: '',
					columnName: column.id,
				}))
			),
		};
	};

	const handleExcelClick = () => {
		const data = countsheetDetails.map((row) => ({
			name: row.groupName,
			columns: columns.slice(1).map((column) => ({ name: column.id, filterButton: true })),
			data: row.subRows.map((subRow) => columns.slice(1).map((column) => subRow[column.id])),
		}));

		console.log('data', data);

		const filename = 'Countsheets';
		const spreadSheetTitle = 'Countsheets';
		const date = countsheet?.dateTime;

		exportToExcel(data, filename, spreadSheetTitle, date, countsheet?.name);
	};

	const Table = (
		<TableHOC
			columns={columns}
			data={countsheetDetails}
			isHeader={false}
			isFooter={true}
			expandCollapseButtons={true}
		/>
	);

	return (
		<div className='w-[85%] mx-auto'>
			<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'>
				{`${countsheet?.name} --
				${
					countsheet?.countType === 'WE'
						? 'Weekly'
						: countsheet?.countType === 'DA'
						? 'Daily'
						: countsheet?.countType === 'MO'
						? 'Monthly'
						: countsheet?.countType === 'SH'
						? 'Shift'
						: ''
				} Countsheet`}
			</h2>
			<header className='lg:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center'>
				<div className=''>
					<div className='flex gap-1'>
						<h3>Date:</h3>
						<span>{countsheet?.dateTime}</span>
					</div>
					<div className='mt-5'>
						<h3>{`Last saved by ${countsheet?.userName} - ${countsheet?.saveDateTime?.split('T')[0]} ${
							countsheet?.saveDateTime?.split('T')[1]
						}`}</h3>
						<span className='underline cursor-pointer'>Click to insert comment</span>
					</div>
				</div>
				<div>
					<ExportOptions
						includeExcel={true}
						handleExcelClick={handleExcelClick}
						includePrint={true}
						handlePrintClick={handlePrintClick}
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

export default CountsheetDesigner;
