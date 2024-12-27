import { useEffect, useRef, useState } from "react";
import { getCall, postCall } from "../../apis/network";
import { Steps } from "intro.js-react";
import { useSelector } from "react-redux";
import {
  Loader,
  UnitSelector,
  CalendarModal,
  UnitModal,
  ExportOptions,
  ExcelExport as exportToExcel,
  DateSelector,
  PdfBuilder,
} from "../../components";
import { createColumnHelper } from "@tanstack/react-table";
import CookDropTable from "../../components/table/CookDropTable";
import { Link } from "react-router-dom";
import HoverBorderButton from "../../components/buttons/HoverBorderButton";
import dateFormat from "dateformat";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import cookChart from "../../assets/introJSSteps/cookChart";
import ForecastedSales from "../../components/forcastedSales/ForecastedSales";
const columnHelper = createColumnHelper();

const CookChart = () => {
  const {
    companyID,
    alignmentID,
    unitsAndAreas: unitsAndAreasList,
    defaultUnitID,
    defaultUnitName,
    userID,
  } = useSelector((state) => state.globalState);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "There was an error trying to load the CookChart Report, please try again later."
  );

  const [selectedUnit, setSelectedUnit] = useState();
  const [selectedUnitName, setSelectedUnitName] = useState("Loading...");
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [selectedFromDate, setSelectedFromDate] = useState(new Date());
  const [selectedToDate, setSelectedToDate] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  const [introSteps, setIntroSteps] = useState({
    steps: cookChart(),
    initialStep: 0,
    stepsEnabled: false,
  });
  const [cookChartData, setCookChartData] = useState({});
  const [forecastedSalesValue, setForecastedSalesValue] = useState("");
  const cookDropTableRef = useRef(); // ref for getting CookDropTable
  const [isForecastAltered, setIsForecastAltered] = useState(false);
  const [companyStateId, setCompanyStateId] = useState("");
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  // Function to update width
  const updateWidth = () => {
    setViewportWidth(window.innerWidth);
  };

  useEffect(() => {
    // Add event listener on mount
    window.addEventListener("resize", updateWidth);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  useEffect(() => {
    if (defaultUnitID) {
      setSelectedUnit(defaultUnitID);
    }
    if (defaultUnitName) {
      setSelectedUnitName(defaultUnitName);
    }
    if (companyID) {
      setCompanyStateId(() => companyID);
    }
  }, [defaultUnitID, defaultUnitName, companyID]);
  // TransformData
  const transformCookDropData = (data) => {
    const headers = data[0].cookItems.map((item) => ({
      itemName: item.itemName,
      unitOfMeasure: item.unitOfMeasure,
      safetyFactor: item.safetyFactor,
      mix: item.mix,
    }));

    const rows = {};

    // Iterate over each item and cook drop count to build rows based on cookDropTime
    data[0].cookItems.forEach((item) => {
      item.cookItemCounts.forEach((count) => {
        const time = count.cookDropTime.slice(0, 5); // Format time to HH:MM

        if (!rows[time]) {
          rows[time] = [];
        }

        rows[time].push({
          cookDropChartItemID: item.cookDropChartItemID,
          needCount: count.needCount,
          haveCount: count.haveCount,
          cookCount: count.cookCount,
        });
      });
    });

    return { headers, rows };
  };

  useEffect(() => {
    if (selectedUnit) {
      getCookChartData();
    }
  }, [selectedUnit, selectedFromDate]);

  const getCookChartData = async () => {
    setIsLoading(true);

    try {
      const getData = {
        fullUrl: "api/cookdrop/getcookdropchart",
        urlParams: {
          companyId: companyStateId,
          templateName: "Default",
          unitId: selectedUnit,
          userID: userID,
          date: dateFormat(selectedFromDate, "mm/dd/yyyy"),
        },
      };

      const result = await getCall(getData, false);
      if (result?.data && result?.data.length) {
        setForecastedSalesValue(result.data[0].forecastedSales);
        setIsForecastAltered(
          result.data[0].forecastedSales !==
            result.data[0].originalForecastedSales
        );
        setOriginalData(result.data[0]);
        const { headers, rows } = transformCookDropData(result.data);
        setCookChartData({ headers, rows });
      } else {
        setCookChartData({});
        setOriginalData([]);
      }
    } catch (error) {
      setCookChartData({});
      console.error(error);
    }

    setIsLoading(false);
  };

  const applyChangesToOriginalData = async (originalData, changedData) => {
    const updatedData = JSON.parse(JSON.stringify(originalData));

    for (const [time, fields] of Object.entries(changedData)) {
      fields.forEach((field) => {
        const matchingItem = updatedData.cookItems.find(
          (item) => item.cookDropChartItemID === field.cookDropChartItemID
        );

        if (matchingItem) {
          const matchingCount = matchingItem.cookItemCounts.find(
            (count) => count.cookDropTime.slice(0, 5) === time
          );

          if (matchingCount) {
            if (
              field.needCount !== undefined &&
              field.needCount !== matchingCount.needCount
            ) {
              matchingCount.needCount = field.needCount;
            }
            if (
              field.haveCount !== undefined &&
              field.haveCount !== matchingCount.haveCount
            ) {
              matchingCount.haveCount = field.haveCount;
            }
            if (
              field.cookCount !== undefined &&
              field.cookCount !== matchingCount.cookCount
            ) {
              matchingCount.cookCount = field.cookCount;
            }
          }
        }
      });
    }

    return updatedData;
  };

  const prepareDynamicPdfData = (data, mode) => {
    // Extract headers
    const headers = data.cookItems.map((item) => ({
      text: item.itemName,
      unit: item.unitOfMeasure,
      safetyFactor: `${item.safetyFactor}%`,
    }));

    // Extract rows based on `cookDropTime`
    const rows = {};
    let totalNeed = 0;
    let totalHave = 0;
    let totalCook = 0;
    data.cookItems.forEach((item) => {
      item.cookItemCounts.forEach((count) => {
        const time = count.cookDropTime.slice(0, 5); // Extract HH:MM from time
        if (!rows[time]) {
          rows[time] = [];
        }
        rows[time].push({
          value: `${count.needCount} / ${count.haveCount} / ${count.cookCount}`,
        });
        totalNeed += count.needCount;
      totalHave += count.haveCount;
      totalCook += count.cookCount;
      });
    });

    // Prepare rows in the format expected by PdfBuilder
    const tableRows = Object.entries(rows).map(([time, counts]) => [
      { value: time }, // Add time as the first column
      ...counts, // Add dynamic data for each column
    ]);

    tableRows.push([
      { value: "Total" },
      { value: `${totalNeed} / ${totalHave} / ${totalCook}` },
    ]);
    // Create PdfBuilder-compatible data
    return {
      title: "Cook Drop Chart",
      subHeaders: [
        `Unit: ${data.unitID}`,
        `Date: ${data.date.split("T")[0]}`,
        `Forecasted Sales: ${data.forecastedSales}`,
      ],
      body: [
        {
          type: "table",
          title: "",

          widths: [100, ...Array(headers.length).fill("*")], // Dynamic column widths
          data: {
            columnHeaders: [
              "Time",
              ...headers.map(
                (header) =>
                  `${header.text} (Unit: ${header.unit}, Safety Factor: ${header.safetyFactor})`
              ),
            ],
            rows: tableRows,
          },
        },
      ],
      exportType: mode,
      pageOrientation: "landscape",
    };
  };
  const handleDynamicPdfExport = async (mode) => {
    const changedData = cookDropTableRef.current?.getChangedData();
    const transformedData = await applyChangesToOriginalData(
      originalData,
      changedData
    );
    const pdfData = prepareDynamicPdfData({ ...transformedData }, mode);
    if (pdfData) {
      PdfBuilder(pdfData);
    }
  };

  const handlePdfExport = (mode) => {
    const pdfData = handleDynamicPdfExport(mode);
    
  };

  const handleSaveClick = async () => {
    toast.info("Saving data...", { autoClose: 1000 });
    try {
      const changedData = cookDropTableRef.current?.getChangedData();
      const transformedData = await applyChangesToOriginalData(
        originalData,
        changedData
      );
      setIsForecastAltered(
        transformedData.forecastedSales !== forecastedSalesValue
      );
      transformedData.forecastedSales = forecastedSalesValue;
      const postData = {
        fullUrl: "api/cookdrop/savecookdropchart",
        urlParams: {},
        bodyData: transformedData,
      };

      let result = await postCall(postData);
      if (result.errors === null) {
        toast.success("Saved...", { autoClose: 1500 });
      } else {
        toast.error("Failed to save", { autoClose: 1500 });
      }
    } catch (error) {
      toast.error("Failed to save", { autoClose: 1500 });
    }
  };

  const handleUnitSelection = (unitName, unitID) => {
    setSelectedUnitName(unitName);
    setSelectedUnit(unitID);
    setShowUnitModal(false);
  };

  const handleDateSelection = (from, to) => {
    setSelectedFromDate(from);
    setSelectedToDate(to);
    setShowDateModal(false);
  };

  const handleDateSelectorClick = () => {
    setShowDateModal(true);
  };
  const handleDateCloseModal = () => {
    setShowDateModal(false);
  };

  const prepareExcelData = async (cookDropChartData) => {
    const headers = cookDropChartData.cookItems.map((item) => ({
      name: `${item.itemName} (${item.unitOfMeasure}, ${item.safetyFactor}%)`,
    }));

    const rows = {};
    let totalNeed = 0;
    let totalHave = 0;
    let totalCook = 0;
    // Group rows by cookDropTime
    cookDropChartData.cookItems.forEach((item) => {
      item.cookItemCounts.forEach((count) => {
        const time = count.cookDropTime.slice(0, 5); // Format time to HH:MM
        if (!rows[time]) {
          rows[time] = [];
        }
        rows[time].push(
          `${count.needCount} / ${count.haveCount} / ${count.cookCount}`
        );
        totalNeed += count.needCount;
        totalHave += count.haveCount;
        totalCook += count.cookCount;
      });
    });

    // Convert grouped rows to an array
    const excelRows = Object.entries(rows).map(([time, counts]) => [
      time,
      ...counts,
    ]);

    excelRows.push([
      "total",
      `${totalNeed} / ${totalHave} / ${totalCook}`,
    ]);
    return {
      columns: [{ name: "Time" }, ...headers], // Include "Time" as the first column
      data: excelRows.map((row) =>
        row.reduce((acc, value) => {
          acc.push(value);
          return acc;
        }, [])
      ),
    };
  };

  const handleExcelExport = async () => {
    const changedData = cookDropTableRef.current?.getChangedData();
    const cookDropChartData = await applyChangesToOriginalData(
      originalData,
      changedData
    );
    const excelData = await prepareExcelData(cookDropChartData);
    exportToExcel(
      [
        {
          name: "Cook Drop Data",
          columns: excelData.columns,
          data: excelData.data,
          hasTableHeader: true,
        },
      ],
      "CookDropChart",
      "Cook Drop Chart",
      cookDropChartData.date.split("T")[0], // Date from data
      `Unit ${cookDropChartData.unitID}`
    );
  };

  return (
    <>
      <Loader loading={isLoading} />
      <ToastContainer />
      <div className="w-[100%] lg:w-[85%] mx-auto">
        <Steps
          enabled={introSteps.stepsEnabled}
          steps={introSteps.steps}
          initialStep={introSteps.initialStep}
          onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
        />
        <h2 className="lg:my-4 lg:text-2xl lg:leading-tight lg:text-left pageTitle hidden">
          Cook Drop Chart
        </h2>
        {viewportWidth < 1023 && (
          <div className="lg:hidden bg-[#EFEFEF] h-[28px] justify-between align-middle flex mb-5">
            <h2 className="lg:hidden my-auto text-[12px] leading-tight text-left pageTitle font-bold ml-[5px] ">
              Cook Drop Chart
            </h2>
            <div className="block lg:hidden my-auto mr-2">
              <ExportOptions
                includePDF={true}
                includeSave={true}
                includeExcel={true}
                includePrint={true}
                includeHelp={true}
                handleHelpClick={() =>
                  setIntroSteps({ ...introSteps, stepsEnabled: true })
                }
                handleSaveClick={() => {
                  handleSaveClick();
                }}
                handlePDFClick={() => handlePdfExport("pdf")}
                handlePrintClick={() => {
                  handlePdfExport("print");
                }}
                handleExcelClick={() => handleExcelExport()}
              />
            </div>
          </div>
        )}
        <header className="xl:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center lg:mx-0 mx-2">
          <div className="flex items-center space-x-3 ">
            <UnitSelector
              companyId={companyID}
              alignmentId={alignmentID}
              memberID={selectedUnit}
              memberName={selectedUnitName}
              includeAreas={true}
              setMemberName={setSelectedUnitName}
              onClick={() => setShowUnitModal(true)}
            />
            <DateSelector
              toDate={selectedToDate}
              fromDate={selectedFromDate}
              onClick={handleDateSelectorClick}
              isDateRange={false}
            />
            <ForecastedSales
              value={forecastedSalesValue}
              onChange={(e) => {
                  setForecastedSalesValue(e.target.value.split("$")[1]);
              }}
            />
            {isForecastAltered ? (
              <p className="relative text-xs xl:text-sm py-2 overflow-hidden flex flex-row justify-start mt-6 !ml-[6px]">
                *Changed
              </p>
            ) : (
              ""
            )}
          </div>
          <div className="lg:block hidden">
            <ExportOptions
              includePDF={true}
              includeSave={true}
              includeExcel={true}
              includePrint={true}
              includeHelp={true}
              handleHelpClick={() =>
                setIntroSteps({ ...introSteps, stepsEnabled: true })
              }
              handleSaveClick={() => {
                handleSaveClick();
              }}
              handlePDFClick={() => handlePdfExport("pdf")}
              handlePrintClick={() => {
                handlePdfExport("print");
              }}
              handleExcelClick={() => handleExcelExport()}
            />
          </div>
        </header>
        <div className="w-full flex justify-end">
          <Link to={"/CookChartTemplate"} className="text-[#213547]">
            <HoverBorderButton>Manage Templates</HoverBorderButton>
          </Link>
        </div>
        {isError ? (
          <div>{errorMessage}</div>
        ) : (
          !isLoading &&
          (true ? (
            <div className="paged-table lg:m-0 m-2">
              <div className="rounded-2xl border-[1px] shadow-[0_5px_35px_-5px_rgba(0,0,0,0.3)] mt-3 p-3">
                <div className="tableHOC pr-1 max-h-[60vh] overflow-auto">
                  <Loader loading={isLoading} />
                  <CookDropTable
                    ref={cookDropTableRef}
                    initData={cookChartData}
                  />
                </div>
              </div>
            </div>
          ) : !selectedUnit ? (
            <div className="mt-10 text-xl font-medium text-center">
              No Unit Selected
            </div>
          ) : (
            <div className="mt-10 text-xl font-medium text-center">
              No data available
            </div>
          ))
        )}

        <div>
          <UnitModal
            unitData={unitsAndAreasList}
            memberID={selectedUnit}
            memberName={selectedUnitName}
            show={showUnitModal}
            includeAreas={false}
            handleClose={() => {
              setShowUnitModal(false);
            }}
            handleUnitSelection={handleUnitSelection}
          />
          <CalendarModal
            handleClose={handleDateCloseModal}
            modalOpen={showDateModal}
            isDateRang={false}
            handleDateSelection={handleDateSelection}
          />
        </div>
      </div>
    </>
  );
};

export default CookChart;
