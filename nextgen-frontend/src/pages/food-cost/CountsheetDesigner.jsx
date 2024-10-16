import { useEffect, useMemo, useState, useRef } from 'react';
import { getCall } from '../../apis/network';
import { useLocation } from 'react-router-dom';
import { CiSquareMinus, CiSquarePlus } from 'react-icons/ci';
import { ExportOptions, PdfBuilder, ExcelExport as exportToExcel, DndTable, DateSelector } from '../../components';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

const CountsheetDesigner = () => {
	const location = useLocation();
	const [countsheet, setCountsheet] = useState({});
	const [countsheetDetails, setCountsheetDetails] = useState([]);

	// State variables for loading and error handling
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the countsheet Report, please try again later.'
	);
	const [isDropdownVisible, setIsDropdownVisible] = useState(false);
	const moreOptionsDropdown = useRef(null);

	const countTypeMap = {
		WE: 'Weekly',
		DA: 'Daily',
		MO: 'Monthly',
		SH: 'Shift',
	};

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
			newData.forEach((element, index) => {
				element.id = index + 1;
				element.total = element.subRows.reduce((acc, subRow) => acc + subRow.lineItemCost, 0).toFixed(2);
				element.subRows.forEach((el, ind) => {
					el.id = index + 1 + '' + ind;
				});
			});
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

		const filename = 'Countsheets';
		const spreadSheetTitle = 'Countsheets';
		const date = countsheet?.dateTime;

		exportToExcel(data, filename, spreadSheetTitle, date, countsheet?.name);
	};

	const handleClickOutside = (event) => {
		if (moreOptionsDropdown.current && !moreOptionsDropdown.current.contains(event.target)) {
			setIsDropdownVisible(false);
		}
	};

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const Table = (
		<>
			<div className='rounded-2xl border-[1px] shadow-[0_5px_35px_-5px_rgba(0,0,0,0.3)] mt-3 p-3'>
				<DndTable
					columns={columns}
					initialData={countsheetDetails}
					isHeader={false}
					isFooter={true}
					expandCollapseButtons={true}
					data={countsheetDetails}
					setData={setCountsheetDetails}
				/>
			</div>
		</>
	);

	return (
		<div className='w-[85%] mx-auto'>
			<h2 className='my-4 text-2xl leading-tight text-left pageTitle'>
				{`${countsheet?.name} --
				${countTypeMap[countsheet?.countType] || ''} Countsheet`}
			</h2>
			<header className='lg:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center sticky top-0'>
				<div className='flex items-center gap-2'>
					<DateSelector fromDate={new Date(countsheet?.dateTime)} isDateRange={false} isEditable={false} />

					<div className='flex items-center justify-between mt-8  px-6 py-3 text-center capitalize border-2 border-solid cursor-pointer text-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)]'>
						Insert Comment
					</div>

					<div className='relative flex items-center justify-center py-3 mt-8 text-center capitalize cursor-pointer w-28 whitespace-nowrap rounded-3xl '>
						<div
							onClick={() => setIsDropdownVisible(!isDropdownVisible)}
							className='items-center justify-center w-full px-6 py-3 text-center capitalize  cursor-pointer whitespace-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)] border-2 border-solid'
						>
							<span className='cursor-pointer select-none'> More...</span>
						</div>
						{isDropdownVisible && (
							<div
								className='absolute top-[90%] left-0 rounded-xl text-center bg-white  shadow-[0px_5px_20px_-10px_rgba(0,_0,_0,_0.5)] z-10 p-2'
								ref={moreOptionsDropdown}
							>
								<div className='mb-2 option '>
									<button className='w-[100%] bg-[#f9f9f9]'>Pricing Info</button>
								</div>
								<div className='mb-2 option '>
									<button className='w-[100%] bg-[#f9f9f9]'>Countsheet History</button>
								</div>
								<div className='mb-2 option'>
									<button className='w-[100%] bg-[#f9f9f9]'>Copy Counts</button>
								</div>
								<div className='mb-2 option'>
									<button className='w-[100%] bg-[#f9f9f9]'>Delete Countsheet</button>
								</div>
							</div>
						)}
					</div>

					<div className='mt-8'>
						<h3>{`Last saved by ${countsheet?.userName} - ${countsheet?.saveDateTime?.split('T')[0]} ${
							countsheet?.saveDateTime?.split('T')[1]
						}`}</h3>
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
