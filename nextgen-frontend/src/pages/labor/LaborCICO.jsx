import { useEffect, useMemo, useState } from "react";
import { getCall } from "../../apis/network";
import { Steps } from "intro.js-react";
import { useSelector } from "react-redux";
import { CiSquareMinus, CiSquarePlus } from "react-icons/ci";
import {
  Loader,
  UnitSelector,
  CalendarModal,
  UnitModal,
  ExportOptions,
  DateSelector,
  PdfBuilder,
  ExcelExport as exportToExcel,
  TableHOC,
  Dropdown,
} from "../../components";
import { createColumnHelper } from "@tanstack/react-table";
import dateFormat from "dateformat";
import laborCICO from "../../assets/introJSSteps/laborCICO";

const columnHelper = createColumnHelper();

const LaborCICO = () => {
  const {
    companyID,
    alignmentID,
    unitsAndAreas: unitsAndAreasList,
    defaultUnitID,
    defaultUnitName,
  } = useSelector((state) => state.globalState);

  const [laborCICOData, setLaborCICOData] = useState([]);
  const [isTableRendered, setIsTableRendered] = useState(false);

  //loading and error state variables
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "There was an error trying to load the Labor Clock In - Clock Out Report, please try again later."
  );

  //selected unit state variables
  const [selectedUnit, setSelectedUnit] = useState();
  const [selectedUnitName, setSelectedUnitName] = useState("Loading...");
  const [showModal, setUnitShowModal] = useState(false); // State to manage modal visibility

  //calendar state variables
  const [selectedFromDate, setSelectedFromDate] = useState();
  const [selectedToDate, setSelectedToDate] = useState();
  const [showDateModal, setShowDateModal] = useState(false);

  const [groupBy, setGroupBy] = useState("Employee");
  const groupOptions = [{ name: "Employee" }, { name: "Job Description" }];
  const [viewby, setViewBy] = useState("Employees");
  const viewOptions = useMemo(() => {
    if (groupBy === "Job Description") {
      return [
        { name: "Unit", row: 0 },
        { name: "Job Description", row: 1 },
        { name: "Employees", row: 2 },
        { name: "Employee Details", row: 3 },
      ];
    }
    return [
      { name: "Unit", row: 0 },
      { name: "Employees", row: 1 },
      { name: "Employee Details", row: 2 },
    ];
  }, [groupBy]);

  //IntroJS variables for the help steps
  const [introSteps, setIntroSteps] = useState({
    steps: laborCICO(),
    initialStep: 0,
    stepsEnabled: false,
  });

  //Default date get
  const getDefaultDates = async () => {
    try {
      const getData = {
        url: "getCurrentPeriodDates",
        urlParams: {
          companyId: companyID,
        },
      };

      const result = await getCall(getData, false);
      if (result?.data?.weekMaxDate) {
        const maxDate = new Date(result?.data?.weekMaxDate);
        const minDate = new Date(result?.data?.weekMinDate);
        setSelectedFromDate(minDate);
        setSelectedToDate(maxDate);
      }
    } catch (error) {
      console.error("Error getting default dates: ", error);
    }
  };

  useEffect(() => {
    getDefaultDates();
  }, []);

  // columns for tableHOC
  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.display({
        id: "actions",
        cell: ({ row }) =>
          row.getCanExpand() ? (
            <div
              {...{
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
        size: 80,
      }),
      columnHelper.accessor("unitName", {
        id: "unitName",
        header: "Unit Name",
        dataType: "string",
        size: 250,
      }),
    ];

    const employeeColumns = [
      columnHelper.accessor("employeeID", {
        id: "employeeID",
        header: "Employee ID",
        dataType: "number",
      }),
      columnHelper.accessor("name", {
        id: "name",
        header: "Name",
        dataType: "string",
      }),
      columnHelper.accessor("jobDescription", {
        id: "jobDescription",
        header: "Job Description",
        dataType: "string",
      }),
    ];

    const jobDescriptionColumns = [
      columnHelper.accessor("jobDescription", {
        id: "jobDescription",
        header: "Job Description",
        dataType: "string",
      }),
      columnHelper.accessor("employeeID", {
        id: "employeeID",
        header: "Employee ID",
        dataType: "number",
      }),
      columnHelper.accessor("name", {
        id: "name",
        header: "Name",
        dataType: "string",
      }),
    ];

    const commonColumns = [
      columnHelper.accessor("totalMinutes", {
        id: "totalMinutes",
        header: "Total Minutes",
        cell: ({ row, getValue }) =>
          calculateSum(row, "totalMinutes", getValue),
        dataType: "number",
      }),
      columnHelper.accessor("totalHours", {
        id: "totalHours",
        header: "Total Hours",
        cell: ({ row, getValue }) =>
          calculateSum(row, "totalHours", getValue, true),
        dataType: "number",
      }),
      columnHelper.accessor("date", {
        id: "date",
        header: "Date",
        dataType: "date",
      }),
      columnHelper.accessor("timeIn", {
        id: "timeIn",
        header: "Time In",
        dataType: "string",
      }),
      columnHelper.accessor("timeOut", {
        id: "timeOut",
        header: "Time Out",
        dataType: "string",
      }),
      columnHelper.accessor("invalid", {
        id: "invalid",
        header: "Invalid",
        dataType: "boolean",
      }),
    ];

    return baseColumns.concat(
      groupBy === "Employee" ? employeeColumns : jobDescriptionColumns,
      commonColumns
    );
  }, [groupBy]);

  // calculate the sum of the subrows
  const calculateSum = (row, field, getValue, isDecimal = false) => {
    if (row.getCanExpand()) {
      const sum = row.subRows.reduce((acc, subrow) => {
        if (subrow.getCanExpand()) {
          return (
            acc +
            subrow.subRows.reduce((subAcc, subSubrow) => {
              if (subSubrow.getCanExpand()) {
                return (
                  subAcc +
                  subSubrow.subRows.reduce(
                    (subsubAcc, subsubsubrow) => {
                      if (subsubsubrow.original.invalid && subsubsubrow.original.invalid === 'N')
                        subsubAcc + Number(subsubsubrow.original[field])
                      else
                        return subsubAcc;
                    }
                  )
                );
              } else {
                if (subSubrow.original.invalid && subSubrow.original.invalid === 'N')
                  return subAcc + Number(subSubrow.original[field]);
                else
                  return subAcc;
              }
            }, 0)
          );
        } else {
          if (subrow.original.invalid && subrow.original.invalid === 'N')
            return acc + Number(subrow.original[field]);
          else
            return acc;
        }
      }, 0);
      if (row.original.name == 'Adam  Miller')
        console.log(sum, row);
      return isDecimal ? sum.toFixed(2) : sum;
    } else {
      return getValue();
    }
  };

  useEffect(() => {
    if (defaultUnitID) {
      setSelectedUnit(defaultUnitID);
    }
    if (defaultUnitName) {
      setSelectedUnitName(defaultUnitName);
    }
  }, [defaultUnitID, defaultUnitName]);

  const handleRunClick = () => {
    fetchLaborCICOData(groupBy);
  };

  const fetchLaborCICOData = async (groupByOption) => {
    try {
      setIsLoading(true);
      setIsError(false);
      const getData = {
        url: "laborCICO",
        urlParams: {
          companyId: companyID,
          alignmentId: alignmentID,
          memberId: selectedUnit,
          fromDate: dateFormat(selectedFromDate, "yyyy-mm-dd"),
          toDate: dateFormat(selectedToDate, "yyyy-mm-dd"),
          groupBy: groupByOption === "Employee" ? "Employee" : "JobDescription",
        },
      };

      const result = await getCall(getData);

      const newData = result.data.map((unit) => ({
        unitName: unit.unitName,
        subRows: unit.employees.map((employee) => ({
          ...(groupByOption === "Employee"
            ? {
                employeeID: employee.employeeID,
                name: `${employee.firstName} ${employee.lastName}`,
              }
            : { jobDescription: employee.jobDesc }),

          // Conditional subRows logic
          subRows:
            groupByOption === "Employee"
              ? employee.employees.map((data) => ({
                  jobDescription: data.jobDesc,
                  totalMinutes: data.minutesTotal,
                  totalHours: data.hoursTotal?.toFixed(2),
                  date: dateFormat(data.businessDateIn, "mm-dd-yyyy"),
                  timeIn: dateFormat(data.businessDateIn, "hh:MM TT"),
                  timeOut: dateFormat(data.businessDateOut, "hh:MM TT"),
                  invalid: data.invalid,
                }))
              : employee.employees
                  .map((item) => ({
                    employeeID: item.employeeID,
                    name: `${item.firstName} ${item.lastName}`,
                    subRows: employee.employees
                      .filter(
                        (data) =>
                          `${item.firstName} ${item.lastName}` ===
                          `${data.firstName} ${data.lastName}`
                      )
                      .map((data) => ({
                        totalMinutes: data.minutesTotal,
                        totalHours: data.hoursTotal?.toFixed(2),
                        date: dateFormat(data.businessDateIn, "mm-dd-yyyy"),
                        timeIn: dateFormat(data.businessDateIn, "hh:MM TT"),
                        timeOut: dateFormat(data.businessDateOut, "hh:MM TT"),
                        invalid: data.invalid,
                      })),
                  }))
                  .filter(
                    (data, index, self) =>
                      self.findIndex(
                        (t) =>
                          t.employeeID === data.employeeID &&
                          t.name === data.name
                      ) === index
                  ),
        })),
      }));

      setLaborCICOData(newData);
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
      setErrorMessage(
        "There was an issue loading your data, please try again later."
      );
      console.error("Error getting Labor Clock In - Clock Out data: ", error);
    }
  };

  const handleUnitSelection = (unitName, unitID) => {
    setSelectedUnitName(unitName);
    setSelectedUnit(unitID);
    setUnitShowModal(false);
  };

  const handleDateSelection = (from, to) => {
    setSelectedFromDate(from);
    setSelectedToDate(to);
    setShowDateModal(false);
  };

  const handleGroupByChange = (option) => {
    setGroupBy(option);
    setViewBy("Unit");
    fetchLaborCICOData(option);
  };

  // Function to handle the PDF export
  const handlePDFClick = () => {
    if (!columns || columns.length === 0) {
      console.error("Columns are not defined or empty");
      return;
    }

    if (!laborCICOData || laborCICOData.length === 0) {
      console.error("Labor Clock In - Clock Out data is not defined or empty");
      return;
    }

    const pdfData = {
      title: "Labor Clock In - Clock Out",
      subHeaders: [
        `${dateFormat(selectedFromDate, "mm-dd-yyyy")} to ${dateFormat(
          selectedToDate,
          "mm-dd-yyyy"
        )} | ${selectedUnitName}`,
      ],
      exportType: "pdf",
      pageOrientation: "landscape",
      body: buildPDFBody(),
    };

    PdfBuilder(pdfData);
  };

  const buildPDFBody = () => {
    const body = laborCICOData.map((row) => {
      const unit = unitsAndAreasList?.units?.find(
        (unit) => unit.unitName === row.unitName
      );
      const title = unit ? unit.unitName : "";
      return {
        type: "table",
        title: title,
        widths: columns.slice(2).map((column) => column.size || "*"),
        dataTypes: columns.slice(2).map((column) => column.dataType),
        data: formatPDFData(row.subRows),
      };
    });

    return body;
  };

  const formatPDFData = (data) => {
    const createRow = (employeeID, name, jobDescription, subRow) => [
      {
        value: employeeID,
        cellType: "number",
        columnName: "Employee ID",
      },
      { value: name, cellType: "string", columnName: "Name" },
      {
        value: jobDescription,
        cellType: "string",
        columnName: "Job Description",
      },
      {
        value: subRow.totalMinutes,
        cellType: "number",
        columnName: "Total Minutes",
      },
      {
        value: subRow.totalHours,
        cellType: "number",
        columnName: "Total Hours",
      },
      { value: subRow.date, cellType: "date", columnName: "Date" },
      { value: subRow.timeIn, cellType: "string", columnName: "Time In" },
      { value: subRow.timeOut, cellType: "string", columnName: "Time Out" },
      { value: subRow.invalid, cellType: "boolean", columnName: "Invalid" },
    ];
    return {
      columnHeaders: [
        "Employee ID",
        "Name",
        "Job Description",
        "Total Minutes",
        "Total Hours",
        "Date",
        "Time In",
        "Time Out",
        "Invalid",
      ],
      rows: data.flatMap((row) => {
        if (groupBy === "Employee") {
          return row.subRows.map((subRow) =>
            createRow(row.employeeID, row.name, subRow.jobDescription, subRow)
          );
        } else {
          return row.subRows.flatMap((subRow) =>
            subRow.subRows.map((subSubRow) =>
              createRow(
                subRow.employeeID,
                subRow.name,
                row.jobDescription,
                subSubRow
              )
            )
          );
        }
      }),
    };
  };

  // Function to handle the CSV export
  const handleCSVClick = () => {
    const csvHeaders = [
      "Unit Name",
      "Employee ID",
      "Name",
      "Job Description",
      "Total Minutes",
      "Total Hours",
      "Date",
      "Time In",
      "Time Out",
      "Invalid",
    ];
    const createCsvRow = (unitName, employeeID, name, jobDesc, period) =>
      [
        unitName,
        employeeID,
        name,
        jobDesc,
        period.totalMinutes,
        period.totalHours,
        period.date,
        period.timeIn,
        period.timeOut,
        period.invalid,
      ].join(",");

    const csvData = laborCICOData.flatMap((unit) =>
      unit.subRows.flatMap((employee) =>
        employee.subRows.flatMap((period) => {
          const employeeID =
            groupBy === "Employee" ? employee.employeeID : period.employeeID;
          const name = groupBy === "Employee" ? employee.name : period.name;
          const jobDesc =
            groupBy === "Employee" ? period.jobDesc : employee.jobDescription;

          if (groupBy === "Employee") {
            // Case when grouping by Employee
            return createCsvRow(
              unit.unitName,
              employeeID,
              name,
              jobDesc,
              period
            );
          } else {
            // Case when not grouping by Employee, iterate through subRows of period
            return period.subRows.map((data) =>
              createCsvRow(unit.unitName, employeeID, name, jobDesc, data)
            );
          }
        })
      )
    );

    const csvString = [csvHeaders.join(","), ...csvData].join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const tempLink = document.createElement("a");
    tempLink.href = url;
    tempLink.setAttribute("download", "laborCICO.csv");
    tempLink.click();
  };

  // // Function to handle the Excel export
  const handleExcelClick = () => {
    const data = [
      {
        name: "",
        columns: columns
          .slice(1)
          .map((column) => ({ name: column.header, filter: column.dataType })),
        data: laborCICOData.flatMap((unit) =>
          unit.subRows.flatMap((employee) =>
            groupBy === "Employee"
              ? employee.subRows.map((period) => ({
                  "Unit Name": unit.unitName,
                  "Employee ID":
                    groupBy === "Employee"
                      ? employee.employeeID
                      : period.employeeID,
                  Name: groupBy === "Employee" ? employee.name : period.name,
                  "Job Description":
                    groupBy === "Employee"
                      ? period.jobDescription
                      : employee.jobDescription,
                  "Total Minutes": period.totalMinutes,
                  "Total Hours": period.totalHours,
                  Date: period.date,
                  "Time In": period.timeIn,
                  "Time Out": period.timeOut,
                  Invalid: period.invalid,
                }))
              : employee.subRows.flatMap((period) =>
                  period.subRows.flatMap((data) => ({
                    "Unit Name": unit.unitName,
                    "Job Description": employee.jobDescription,
                    "Employee ID": period.employeeID,
                    Name: period.name,
                    "Total Minutes": data.totalMinutes,
                    "Total Hours": data.totalHours,
                    Date: data.date,
                    "Time In": data.timeIn,
                    "Time Out": data.timeOut,
                    Invalid: data.invalid,
                  }))
                )
          )
        ),
      },
    ];

    const filename = `laborCICO_${selectedUnitName}_${dateFormat(
      selectedFromDate,
      "mm-dd-yyyy"
    )}_to_${dateFormat(selectedToDate, "mm-dd-yyyy")}`;
    const spreadSheetTitle = "Labor Clock In - Clock Out";
    const date = `${dateFormat(selectedFromDate, "mm-dd-yyyy")} to ${dateFormat(
      selectedToDate,
      "mm-dd-yyyy"
    )}`;

    exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
  };

  // Detail on top of the table
  const detailOnTop = (
    <div className="flex items-center space-x-2 text-base font-normal">
      {/* Add any additional details or components you want to display on top */}
      <div className="text-xl font-bold">Expand To:</div>
      <div className="w-52">
        <Dropdown
          options={viewOptions}
          selectedOption={viewby}
          onOptionChange={(option) => setViewBy(option)}
        />
      </div>
      <div className="text-xl font-bold">Group By:</div>
      <div className="w-48 group-by">
        <Dropdown
          options={groupOptions}
          selectedOption={groupBy}
          onOptionChange={handleGroupByChange}
        />
      </div>
    </div>
  );

  const Table = (
    <TableHOC
      columns={columns}
      data={laborCICOData}
      view={viewOptions.find((option) => option.name === viewby)?.row}
      isTableRendered={isTableRendered}
      setIsTableRendered={setIsTableRendered}
      expandCollapseButtons={true}
      detailOnTop={detailOnTop}
      headerPosition="left"
      dataPosition="left"
    />
  );

  return (
    <>
      <div className="w-[85%] mx-auto">
        <Steps
          enabled={introSteps.stepsEnabled}
          steps={introSteps.steps}
          initialStep={introSteps.initialStep}
          onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
        />
        <h2 className="my-4 text-2xl leading-tight text-left pageTitle">
          Clock In - Clock Out
        </h2>
        <header className="optionsBar flex justify-between items-center mb-2 rounded-2xl p-4 shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)]">
          <div className="flex items-center space-x-1">
            <UnitSelector
              companyId={companyID}
              alignmentId={alignmentID}
              memberID={selectedUnit}
              memberName={selectedUnitName}
              includeAreas={true}
              setMemberName={setSelectedUnitName}
              onClick={() => setUnitShowModal(true)}
            />
            <DateSelector
              toDate={selectedToDate}
              fromDate={selectedFromDate}
              isDateRange={true}
              onClick={() => setShowDateModal(true)}
              extraClass={"w-[219px]"}
            />
            <div className="run-button" onClick={handleRunClick}>
              <div className="py-3 ml-1 text-lg font-bold text-center capitalize border-2 border-solid cursor-pointer px-14 hover:border-[var(--tw-primary)] hover:text-white hover:bg-[var(--tw-primary)] text-nowrap rounded-3xl mt-7">
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
              handleHelpClick={() =>
                setIntroSteps({ ...introSteps, stepsEnabled: true })
              }
            />
          </div>
        </header>

        {/* Display the table if there is no error and the data is not loading */}
        {isError ? (
          <div>{errorMessage}</div>
        ) : (
          <div className="relative w-full min-h-56">
            <Loader loading={isLoading} />
            {!isLoading &&
              (laborCICOData.length > 0 ? (
                <div className="paged-table">{Table}</div>
              ) : !selectedUnit ? (
                <div className="mt-10 text-xl font-medium text-center">
                  No Unit Selected
                </div>
              ) : (
                <div className="mt-10 text-xl font-medium text-center">
                  No data available
                </div>
              ))}
          </div>
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
            periodDatesEndpoint="getAllPayPeriodDates"
          />
        </div>
      </div>
    </>
  );
};

export default LaborCICO;
