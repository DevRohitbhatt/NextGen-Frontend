import { useEffect, useMemo, useState, useRef } from "react";
import { getCall } from "../../apis/network";
import { useLocation } from "react-router-dom";
import { CiSquareMinus, CiSquarePlus } from "react-icons/ci";
import {
  ExportOptions,
  PdfBuilder,
  ExcelExport as exportToExcel,
  DndTable,
  DateSelector,
  CalendarModal,
  Modal,
  Loader,
} from "../../components";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper();

const CountsheetDesigner = () => {
  const location = useLocation();
  const [countsheet, setCountsheet] = useState({});
  const [countsheetDetails, setCountsheetDetails] = useState([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState();

  // State variables for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [priceInfoModal, setPriceInfoModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "There was an error trying to load the countsheet Report, please try again later."
  );

  //calendar state variables
  const [selectedFromDate, setSelectedFromDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 0)
  );
  const [showDateModal, setShowDateModal] = useState(false);

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const moreOptionsDropdown = useRef(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedPriceInfoData, setSelectedPriceInfoData] = useState([]);
  const [possibleErrorsModal, setPossibleErrorsModal] = useState(false);
  const [possibleErrorsData, setPossibleErrorsData] = useState([]);
  const [receivedData, setReceivedData] = useState(null);

  const countTypeMap = {
    WE: "Weekly",
    DA: "Daily",
    MO: "Monthly",
    SH: "Shift",
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const companyID = searchParams.get("companyID");
    const countsheetData = searchParams.get("countsheet");

    if (countsheetData) {
      const parsedData = JSON.parse(countsheetData);
      setReceivedData({ companyID, countsheet: parsedData });
      setCountsheet(parsedData);
      setSelectedFromDate(new Date(parsedData.dateTime));
    }
  }, [location.search]);

  useEffect(() => {
    if (receivedData) {
      fetchCountsheetDetails();
    }
  }, [receivedData]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("groupName", {
        id: "groupName",
        cell: ({ row, getValue }) =>
          getValue() ? (
            <div
              {...{
                style: {
                  cursor: "pointer",
                  paddingLeft: `${row.depth * 2}rem`,
                },
                className: "flex items-center gap-2",
              }}
            >
              {row.getIsExpanded() ? (
                <CiSquareMinus className="text-[20px]" />
              ) : (
                <CiSquarePlus className="text-[20px]" />
              )}
              {getValue()}
            </div>
          ) : null,
      }),
      columnHelper.accessor("description", {
        id: "description",
        header: "",
      }),
      columnHelper.accessor("countDescription", {
        id: "countDescription",
      }),
      columnHelper.accessor("lineItemCost", {
        id: "lineItemCost",
        cell: ({ row, getValue }) =>
          `$${
            row.getCanExpand()
              ? row.subRows
                  .reduce(
                    (acc, subRow) => acc + subRow.original.lineItemCost,
                    0
                  )
                  .toFixed(2)
              : getValue()
          }`,
        footer: ({ table }) =>
          `Total Inventory Value: $${table
            .getCoreRowModel()
            .rows.reduce(
              (acc, row) =>
                acc +
                row.subRows.reduce(
                  (acc, subRow) => acc + subRow.original.lineItemCost,
                  0
                ),
              0
            )
            .toFixed(2)}`,
      }),
    ],
    []
  );

  const fetchCountsheetDetails = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const getData = {
        url: "countsheetDetails",
        urlParams: {
          companyId: receivedData?.companyID,
          countsheetID: countsheet?.inventoryCountSheetID,
        },
      };

      const result = await getCall(getData);
      const newData = result.data.map((item) => ({
        groupName: item.groupName,
        subRows: item.countSheetDetailModels.map((subItem) => ({
          description: subItem.description,
          countDescription: subItem.countDescription,
          lineItemCost: subItem.lineItemCost,
          qsrInventoryItemID: subItem.qsrInventoryItemID,
        })),
      }));
      newData.forEach((element, index) => {
        element.id = index + 1 + "";
        element.total = element.subRows
          .reduce((acc, subRow) => acc + subRow.lineItemCost, 0)
          .toFixed(2);
        element.subRows.forEach((el, ind) => {
          el.id = index + 1 + "" + ind;
        });
      });

      setCountsheetDetails(newData);
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      console.error("Error fetching countsheet details: ", error);
    }
  };

  // Function to handle the PDF export
  const handlePrintClick = () => {
    if (!columns || columns.length === 0) {
      console.error("Columns are not defined or empty");
      return;
    }

    if (!countsheetDetails || countsheetDetails.length === 0) {
      console.error("Countsheet data is not defined or empty");
      return;
    }

    const pdfData = {
      title: "Countsheet",
      subHeaders: [`${countsheet?.dateTime} | ${countsheet?.name}`],
      exportType: "print",
      pageOrientation: "portrait",
      body: buildPDFBody(),
    };

    PdfBuilder(pdfData);
  };

  const buildPDFBody = () => {
    const body = countsheetDetails.map((row) => {
      const title = row.groupName;
      return {
        type: "table",
        title: title,
        widths: new Array(columns.length - 1).fill("auto"),
        dataTypes: columns.slice(1).map((column) => column.dataType),
        data: formatPDFData(row.subRows),
      };
    });

    return body;
  };

  const formatPDFData = (data) => {
    return {
      columnHeaders: ["Description", "Count Description", "Line Item Cost"],
      rows: data.map((row) =>
        columns.slice(1).map((column) => ({
          value: row[column.id],
          cellType: "",
          columnName: column.id,
        }))
      ),
    };
  };

  const handleExcelClick = () => {
    const data = countsheetDetails.map((row) => ({
      name: row.groupName,
      columns: columns
        .slice(1)
        .map((column) => ({ name: column.id, filterButton: true })),
      data: row.subRows.map((subRow) =>
        columns.slice(1).map((column) => subRow[column.id])
      ),
    }));

    const filename = "Countsheets";
    const spreadSheetTitle = "Countsheets";
    const date = countsheet?.dateTime;

    exportToExcel(data, filename, spreadSheetTitle, date, countsheet?.name);
  };

  const handleClickOutside = (event) => {
    if (
      moreOptionsDropdown.current &&
      !moreOptionsDropdown.current.contains(event.target)
    ) {
      setIsDropdownVisible(false);
    }
  };

  const getPriceInfo = async () => {
    try {
      const getData = {
        url: "Countsheet_PricingInfo",
        urlParams: {
          companyId: location.state.companyID,
          QSRInvoiceID: location.state.countsheet?.inventoryCountSheetID,
          QSRItemID: selectedRow?.id,
          QSRInventoryItemID: selectedRow?.qsrInventoryItemID,
        },
      };

      const result = await getCall(getData);

      setSelectedPriceInfoData(result.data);
      setPriceInfoModal(!priceInfoModal);
    } catch (error) {
      console.error("Error fetching price info: ", error);
    }
  };

  const getPossibleErrors = async () => {
    try {
      const getData = {
        url: "countsheetPossibleError",
        urlParams: {
          companyId: location.state.companyID,
          InventoryCountSheetID:
            location.state.countsheet?.inventoryCountSheetID,
        },
      };

      const result = await getCall(getData);

      setPossibleErrorsData(result.data);
      setPossibleErrorsModal(!possibleErrorsModal);
    } catch (error) {
      console.error("Error fetching possible errors: ", error);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedData = (item) => {
    setSelectedRow(item);
  };
  const Table = (
    <>
      <div className="rounded-2xl border-[1px] shadow-[0_5px_35px_-5px_rgba(0,0,0,0.3)] mt-3 p-3">
        <DndTable
          columns={columns}
          initialData={countsheetDetails}
          isHeader={false}
          isFooter={true}
          expandCollapseButtons={true}
          data={countsheetDetails}
          setData={setCountsheetDetails}
          selectedForPriceInfo={(id) => {
            selectedData(id);
          }}
        />
      </div>
    </>
  );

  return (
    <div className="w-[85%] mx-auto">
      <h2 className="my-4 text-2xl leading-tight text-left pageTitle">
        {`${countsheet?.name} --
				${countTypeMap[countsheet?.countType] || ""} Countsheet`}
      </h2>
      <header className="optionsBar flex justify-between items-center mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]">
        <div className="flex items-center gap-2">
          <DateSelector
            fromDate={selectedFromDate}
            isDateRange={false}
            onClick={() => setShowDateModal(true)}
          />

          <div
            className="flex items-center justify-between mt-8  px-6 py-3 text-center capitalize border-2 border-solid cursor-pointer text-nowrap rounded-3xl hover:border-[var(--tw-primary)] active:border-[var(--tw-primary)]"
            onClick={() => setShowCommentModal(true)}
          >
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
									<button className='w-[100%] bg-[#f9f9f9]' onClick={getPriceInfo}>
										Pricing Info
									</button>
								</div>
								<div className='mb-2 option '>
									<button className='w-[100%] bg-[#f9f9f9]' onClick={getPossibleErrors}>
										Possible Errors
									</button>
								</div>
								<div className='mb-2 option '>
									<button className='w-[100%] bg-[#f9f9f9]'>Countsheet History</button>
								</div>
								<div className='mb-2 option'>
									<button className='w-[100%] bg-[#f9f9f9]'>Copy Counts</button>
								</div>
								<div className='mb-2 option'>
									<button className='w-[100%] bg-[#f9f9f9]'>Clear Countsheet</button>
								</div>
								<div className='mb-2 option'>
									<button className='w-[100%] bg-[#f9f9f9]'>Delete Countsheet</button>
								</div>
								<div className='mb-2 option'>
									<button className='w-[100%] bg-[#f9f9f9]'>Lock Countsheet</button>
								</div>
							</div>
						)}
					</div>
				</div>
				<div>
					<ExportOptions
						includeExcel={true}
						handleExcelClick={handleExcelClick}
						includePrint={true}
						handlePrintClick={handlePrintClick}
						includeSave={true}
					/>
				</div>
			</header>
			<div className='flex gap-4'>
				<h3>{`Last saved by ${countsheet?.userName} - ${countsheet?.saveDateTime?.split('T')[0]} ${
					countsheet?.saveDateTime?.split('T')[1]
				}`}</h3>
				{!showCommentModal && comment !== undefined && comment.length > 0 ? (
					<p className='flex-1 truncate max-w-[800px]'>
						Comment:{' '}
						<span onClick={() => setShowCommentModal(true)} className='underline cursor-pointer '>
							{comment}
						</span>
					</p>
				) : (
					''
				)}
			</div>

      <div className="relative w-full min-h-56">
        <Loader loading={isLoading} />
        {!isLoading &&
          (countsheetDetails.length > 0 ? (
            <div className="paged-table">{Table}</div>
          ) : (
            <div className="mt-10 text-xl font-medium text-center">
              No data available
            </div>
          ))}
      </div>

      <CalendarModal
        handleClose={() => setShowDateModal(false)}
        modalOpen={showDateModal}
        isDateRange={false}
        handleDateSelection={(date) => setSelectedFromDate(date)}
        handleFromDateChange={(fromDate) => setSelectedFromDate(fromDate)}
        selectedFromDate={selectedFromDate}
      />

      <Modal
        isOpen={showCommentModal}
        title={"Insert Comment"}
        onClose={() => {
          setShowCommentModal(!showCommentModal);
        }}
      >
        <div className="h-32 m-4 w-96">
          <textarea
            className="w-full h-full block p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border-2 border-[var(--tw-primary)] focus:outline-[var(--tw-primary)] caret-[var(--tw-primary)] resize-none"
            name=""
            id=""
			
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your comment here..."
          ></textarea>
        </div>
      </Modal>

      <Modal
        isOpen={priceInfoModal}
        title={"Price info"}
        onClose={() => {
          setPriceInfoModal(!priceInfoModal);
        }}
      >
        <div className="p-4 bg-white border border-gray-200 rounded shadow-lg w-96">
          <div className="pb-2 mb-4 text-lg font-semibold text-center text-blue-900 border-b">
            {selectedRow?.qsrInventoryItemID + " - " + selectedRow?.description}
          </div>

          <table className="w-full mb-4 text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 font-semibold">Unit of Measure</th>
                <th className="py-2 font-semibold">Countsheet Price</th>
              </tr>
            </thead>
            <tbody>
              {selectedPriceInfoData?.map((item) => (
                <tr className="border-b" key={item.itemID}>
                  <td className="py-2">{item?.unitOfMeasure}</td>
                  <td className="py-2 text-green-600">${item?.unitPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pt-2 mb-2 border-t">
            <p className="text-sm font-semibold text-center underline">
              Latest Price From
            </p>
            <p className="text-sm">
              Vendor: <span className="font-medium">Sysco</span>
            </p>
            <p className="text-sm">
              Date: <span className="font-medium">7/23/2024</span> Invoice #:
              <a href="#" className="text-blue-600 underline">
                {selectedRow?.qsrInventoryItemID}
              </a>
            </p>
          </div>

          <div className="pt-2 text-center border-t">
            <p className="text-sm font-semibold">Mapping Details</p>
            <div className="flex items-center justify-center my-2">
              <div className="flex flex-col items-center">
                <p>1 x CA</p>
                <p className="text-sm font-medium">SAUCE CHILI HOT SRIRACHA</p>
                <p>@ $23.24/CA</p>
              </div>
              <div className="px-2">
                <p className="text-2xl font-semibold">=</p>
              </div>
              <div className="flex flex-col items-center">
                <p>4.2857 x BOTTLE (28 OZ)</p>
                <p className="text-sm font-medium">
                  SAUCE SRIRACHA 20 OZ BTL - I=A
                </p>
                <p className="text-green-600">$5.42/BOTTLE (28 OZ)</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={possibleErrorsModal}
        title={"Possible Errors"}
        onClose={() => {
          setPossibleErrorsModal(!possibleErrorsModal);
        }}
      >
        <div className="p-4">
          <div className="pr-2 overflow-auto bg-white max-h-96">
            <table className="sticky top-0 w-full mb-4 max-h-96">
              <thead className="sticky top-0 bg-white">
                <tr className="text-left shadow-[0_-1px_0_var(--tw-primary)_inset]">
                  <th className="py-2 font-semibold text-center">Item</th>
                  <th className="py-2 font-semibold text-center">
                    Possible Error
                  </th>
                </tr>
              </thead>
              <tbody>
                {possibleErrorsData?.map((item, index) => (
                  <tr className="text-sm border-b" key={index}>
                    <td className="py-2">{item?.description}</td>
                    <td className="py-2 text-right">{item?.problem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CountsheetDesigner;
