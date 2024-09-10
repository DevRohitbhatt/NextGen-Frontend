import { useEffect, useMemo, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
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
    VendorSelector,
    VendorModal
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import PurchaseAnalysi from '../../assets/introJSSteps/PurchaseAnalysis';
import {useLocation } from 'react-router-dom';

const columnHelper = createColumnHelper();

const PurchaseAnalysis = () => {
	const [companyId, setCompanyId] = useState();
	const [alignmentId, setAlignmentId] = useState();
	const [unitsAndAreasList, setUnitsAndAreasList] = useState([]);
    const [vendorsList, setVendorsList] = useState([]);
	const [purchasetData, setPurchaseData] = useState([]);
	const [isTableRendered, setIsTableRendered] = useState(true);
	//loading and error state variables
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(
		'There was an error trying to load the Purchase Analysis Report, please try again later.'
	);

	//selected unit state variables
	const [selectedUnit, setSelectedUnit] = useState();
	const [selectedUnitName, setselectedUnitName] = useState('No Unit Selected');
	const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility
	
    //selected vendor state variables
	const [selectedVendor, setSelectedVendor] = useState(0);
	const [selectedVendorName, setselectedVendorName] = useState('All Vendors');
	const [showVendorModal, setVendorShowModal] = useState(false); // State to manage modal visibility


	//calendar state variables
	const [selectedFromDate, setSelectedFromDate] = useState(
		new Date(new Date().getFullYear(), new Date().getMonth(), 0)
	);
	const [selectedToDate, setSelectedToDate] = useState(new Date());
	const [showDateModal, setShowDateModal] = useState(false);

	//dropdown variables
	const [view, setView] = useState('None');
	const viewOptions = [
        { name: 'Unit - GLCode' },
        { name: 'Unit - Department' }, 
        { name: 'Unit - Inventory Item' },
        { name: 'Unit - Vendor Item - Inventory Item'},
        { name: 'Unit - Vendor- Invoice' },
        { name: 'Vendor - GLCode' },
        { name: 'Vendor - Department' }        
        ];

    //location for state
    const location = useLocation();

	//IntroJS variables for the help steps
	const [introSteps, setIntroSteps] = useState({
		steps: PurchaseAnalysi(),
		initialStep: 0,
		stepsEnabled: false,
	});
	
	const handleTotalViewChange = (option) => {
		setView(option);
	};


	// columns for tableHOC
	const columns = useMemo(
        () => [
          columnHelper.display({
            id: "actions",
            cell: ({ row }) =>
              row.getCanExpand() ? (
                <div
                  {...{
                    onClick: row.getToggleExpandedHandler(),
                    style: {
                      cursor: "pointer",
                      paddingLeft: `${row.depth * 2}rem`,
                    },
                    className: "inline-block",
                  }}
                >
                  {row.getIsExpanded() ? (
                    <CiSquareMinus className="text-[20px]" />
                  ) : (
                    <CiSquarePlus className="text-[20px]" />
                  )}
                </div>
              ) : null,
            size: "80",
          }),
          columnHelper.accessor("department", {
            id: "department",
            header: "Department",
            dataType: "string",
            size: "200",
          }),
          columnHelper.accessor("unitId", {
            id: "unitId",
            header: "Unit ID",
            dataType: "string",
            size: "150",
          }),
          columnHelper.accessor("date", {
            id: "date",
            header: "Date",
            dataType: "string", // Adjust if you format the date differently
            size: "150",
          }),
          columnHelper.accessor("name", {
            id: "vendorName",
            header: "Vendor Name",
            dataType: "string",
            size: "200",
          }),
          columnHelper.accessor("vendorInvoiceReference", {
            id: "vendorInvoiceReference",
            header: "Invoice Ref.",
            dataType: "string",
            size: "150",
          }),
          columnHelper.accessor("totalAmountIncludingTax", {
            id: "totalAmountIncludingTax",
            header: "Total Amount ($)",
            dataType: "number",
            size: "150",
          }),
         
          columnHelper.accessor("inventoryItemDescription", {
            id: "description",
            header: "Description",
            dataType: "string",
            size: "250",
          }),
          columnHelper.accessor("quantity", {
            id: "quantity",
            header: "Quantity",
            dataType: "number",
            size: "100",
          }),
          columnHelper.accessor("price", {
            id: "price",
            header: "Price ($)",
            dataType: "number",
            size: "100",
          }),
          columnHelper.accessor("taxAmount", {
            id: "taxAmount",
            header: "Tax Amount ($)",
            dataType: "number",
            size: "150",
          }),
          columnHelper.accessor("extPrice", {
            id: "extPrice",
            header: "Extended Price ($)",
            dataType: "number",
            size: "150",
          }),
          columnHelper.accessor("companyGLCode", {
            id: "companyGLCode",
            header: "Company GL Code",
            dataType: "string",
            size: "200",
          }),
          columnHelper.accessor("companyName", {
            id: "companyName",
            header: "Company Name",
            dataType: "string",
            size: "200",
          }),
        ],
        []
      );
      
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
				setCompanyId(1021);
				setAlignmentId(1110);
				setSelectedUnit(0);
				fetchData(1021, 1110, 5199);
			}
		} else {
			setErrorMessage('There was an issue loading your Purchase report, please try again later.');
		}
	}, []);


    useEffect(() => {
		fetchPurchaseDetails();
	}, []);

	const fetchPurchaseDetails = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			const getData = {
				url: 'PurchaseAnalysis',
				urlParams: {
					companyID: location.state?.companyId,
					alignmentID: location.state?.alignmentID,
					memberID: location.state?.memberID,
					fromDate: location.state?.fromDate,
					toDate: location.state?.toDate,
					vendorId:location.state?.vendorId
				},
			};

			const result = await getCall(getData);

			const newData = result.data.map((item) => ({
                department: item.department,  // Assuming department is part of `item`
                subRows: [
                  {
                    department: item.department,
                    unitId: item.unitId,
                    date: new Date(item.date).toLocaleDateString("en-CA"),
                    vendorName: item.name,
                    vendorInvoiceReference: item.vendorInvoiceReference,
                    totalAmountIncludingTax: item.totalAmountIncludingTax,
                    description: item.inventoryItemDescription,
                    quantity: item.quantity,
                    price: item.price,
                    taxAmount: item.taxAmount,
                    extPrice: item.extPrice,
                    companyGLCode: item.companyGLCode,
                    companyName: item.companyName || "N/A",  // Handle null companyName
                  }
                ]
              }));

			setPurchaseData(newData);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			console.error('Error fetching Purchase Analysis details: ', error);
		}
	};

	const fetchData = async (companyId, alignmentId, selectedUnit) => {
		setIsLoading(true);
		await Promise.all([fetchUnits(companyId, alignmentId, selectedUnit), fetchVendors(companyId)]);
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

    // This function fetches the vendors.
	const fetchVendors = async (companyID) => {
		try {
			setIsError(false);
			const getData = {
				url: 'vendors',
				urlParams: {
					companyID: companyID,
				},
			};

			const result = await getCall(getData);
			setVendorsList(result);
		} catch (error) {
			setIsError(true);
			setErrorMessage('There was an issue loading your vendors, please try again later.');
			console.error('Error getting vendors: ', error);
		}
	};

	// Function to get the voids report
	const handleRun = async () => {
		try {
			setIsLoading(true);
			setIsError(false);
			setIsTableRendered(false);

			const getData = {
				url: 'PurchaseAnalysis',
				urlParams: {
					companyId: companyId,
					alignmentId: alignmentId,
					memberId: selectedUnit,
					fromDate: selectedFromDate.toLocaleDateString('en-CA'),
					toDate: selectedToDate.toLocaleDateString('en-CA'),
					vendorId:selectedVendor
				},
			};

			const result = await getCall(getData);

			const newData = result.data.map((item) => ({
                department: item.department,  // Assuming department is part of `item`
                subRows: [
                  {
                    department: item.department,
                    unitId: item.unitId,
                    date: new Date(item.date).toLocaleDateString("en-CA"),
                    vendorName: item.name,
                    vendorInvoiceReference: item.vendorInvoiceReference,
                    totalAmountIncludingTax: item.totalAmountIncludingTax,
                    description: item.inventoryItemDescription,
                    quantity: item.quantity,
                    price: item.price,
                    taxAmount: item.taxAmount,
                    extPrice: item.extPrice,
                    companyGLCode: item.companyGLCode,
                    companyName: item.companyName || "N/A",  // Handle null companyName
                  }
                ]
              }));
              

			setPurchaseData(newData);
			setIsLoading(false);
		} catch (error) {
			setIsError(true);
			setIsLoading(false);
			setErrorMessage('There was an issue loading your data, please try again later.');
			console.error('Error getting Labor By Pay Period Report data: ', error);
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

    const handleVendorSelection = (selectedVendorName, vendorList) => {
		setselectedVendorName(selectedVendorName);
		setSelectedVendor(vendorList[0].id);
		setVendorShowModal(false);
	};


	// Function to handle the PDF export
	const handlePDFClick = () => {
		if (!columns || columns.length === 0) {
			console.error('Columns are not defined or empty');
			return;
		}

		if (!purchasetData || purchasetData.length === 0) {
			console.error('Purchase report data is not defined or empty');
			return;
		}

		const pdfData = {
			title: 'Purchase Analysis Report',
			subHeaders: [
				`${selectedFromDate.toLocaleDateString()} - ${selectedToDate.toLocaleDateString()} | ${selectedUnitName}`,
			],
			exportType: 'pdf',
			pageOrientation: 'landscape',
			body: buildPDFBody(),
		};

		PdfBuilder(pdfData);
	};

	const buildPDFBody = () => {
        const body = purchasetData.map((row) => {
          // Find the unit name corresponding to the row's unit
          const unit = unitsAndAreasList?.units?.find(
            (unit) => unit.unitName === row.unitName
          );
          const title = unit ? unit.unitName : "";
      
          return {
            type: "table",
            title: title,
            widths: [
              "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto",
              "auto","auto"
            ], // Adjust widths based on number of columns
            dataTypes: [
              "string", "string", "string", "string", "string", "number", "string", 
              "number", "number", "number", "number"
            ], // Data types aligned with the table columns
            data: formatPDFData(row.subRows), // Apply formatPDFData to subRows
          };
        });
      
        return body;
      };
      

      const formatPDFData = (data) => {
        return {
          columnHeaders: [
            "Department",
            "Unit ID",
            "Date",
            "Vendor",
            "Invoice Ref #",
            "Invoice Total",
            "GL Code",
            "Item Quantity",
            "Item Price",
            "Item Tax",
            "Item Totalt",
          ],
          rows: data.map((row) => [
            {
                value: row.department,
                cellType: "string",
            },
            {
              value: row.unitId,
              cellType: "string",
            },
            {
              value: new Date(row.date).toLocaleDateString('en-CA'),
              cellType: "string",
            },
            {
              value: row.vendorName,
              cellType: "string",
            },
            {
              value: row.vendorInvoiceReference,
              cellType: "string",
            },
            {
              value: row.totalAmountIncludingTax,
              cellType: "number",
            },
            {
                value: row.companyGLCode,
                cellType: "string",
            },
            {
              value: row.quantity,
              cellType: "number",
            },
            {
              value: row.price,
              cellType: "number",
            },
            {
              value: row.taxAmount,
              cellType: "number",
            },
            {
              value: row.extPrice,
              cellType: "number",
            },
          ]),
        };
      };
      
	

	// // Function to handle the Excel export
	
    const handleExcelClick = () => {
       
        const data = [
          {
            name: "Purchase Analysis Report",
            columns: [
              { name: "Department", filter: "text" },
              { name: "Unit ID", filter: "text" },
              { name: "Date", filter: "text" },
              { name: "Vendor", filter: "text" },
              { name: "Vendor Invoice Reference", filter: "text" },
              { name: "Total Amount (Tax Included)", filter: "text" },
              { name: "Description", filter: "text" },
              { name: "Quantity", filter: "number" },
              { name: "Price", filter: "number" },
              { name: "Tax Amount", filter: "number" },
              { name: "Extended Price", filter: "number" },
              { name: "Company GL Code", filter: "text" },
              { name: "Company Name", filter: "text" },
            ],
            data: purchasetData.flatMap((item) =>
              item.subRows.map((subItem) => ({
                department: item.department,
                unitId: subItem.unitId,
                date: new Date(subItem.date).toLocaleDateString("en-CA"),
                vendor: subItem.vendorName,
                vendorInvoiceReference: subItem.vendorInvoiceReference,
                totalAmountIncludingTax: subItem.totalAmountIncludingTax,
                description: subItem.description,
                quantity: subItem.quantity,
                price: subItem.price,
                taxAmount: subItem.taxAmount,
                extPrice: subItem.extPrice,
                companyGLCode: subItem.companyGLCode,
                companyName: subItem.companyName || "N/A", // Handle null values
              }))
            ),
          },
        ];
      
        const filename = `PurchaseAnalysisReport_${selectedFromDate.toLocaleDateString("en-CA")}`;
        const spreadSheetTitle = "Purchase Analysis Report";
        const date = `${selectedFromDate.toLocaleDateString("en-CA")} - ${selectedToDate.toLocaleDateString("en-CA")}`;
        exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
      };
      

	const Table = (
		<TableHOC2
			columns={columns}
			data={purchasetData}
			view={view}
			isTableRendered={isTableRendered}
			setIsTableRendered={setIsTableRendered}
            expandCollapseButtons={true}
		/>
	);

	return (
		<div className='w-[85%] mx-auto'>
			<Steps
				enabled={introSteps.stepsEnabled}
				steps={introSteps.steps}
				initialStep={introSteps.initialStep}
				onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
			/>
			<h2 className='mt-4 mb-10 text-3xl font-semibold capitalize'>Purchase Analysis Report</h2>
			<header className='lg:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center'>
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
                    <VendorSelector
								vendorID={selectedVendor}
								vendorName={selectedVendorName}
								setVendorName={setselectedVendorName}
								onClick={() => setVendorShowModal(true)}
							/>

					<div className='run-button' onClick={handleRun}>
						<div className='py-3 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-primary hover:text-white hover:bg-primary text-nowrap rounded-3xl mt-7'>
							Run
						</div>
					</div>
				</div>
				<div>
					<ExportOptions
						includePDF={true}
						handlePDFClick={handlePDFClick}
						includeCSV={false}
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
				<>
					{purchasetData.length > 0 && (
						<div className='w-52 display-flex'>
							<Dropdown
								title='Group By'
								options={viewOptions}
								selectedOption={view}
								onOptionChange={handleTotalViewChange}
							/>
						</div>
					)}

					{purchasetData.length > 0 && <div className='paged-table'>{Table}</div>}
				</>
			)}{' '}
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
                
                <VendorModal
					vendorData={vendorsList}
					vendorID={selectedVendor}
					vendorName={selectedVendorName}
					show={showVendorModal}
					handleClose={() => {
						setVendorShowModal(false);
					}}
					handleVendorSelection={handleVendorSelection}
					isMultiVendor={true}
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

export default PurchaseAnalysis;
