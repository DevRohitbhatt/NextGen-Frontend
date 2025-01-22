import { useEffect, useState } from 'react';
import { getCall } from '../../apis/network';
import {
  Dropdown,
  UnitSelector,
  ExportOptions,
  UnitModal,
  TableHOC,
  Loader,
  PdfBuilder,
  Modal,
  ExcelExport as exportToExcel,
  Run,
} from '../../components';
import { useSelector } from 'react-redux';
import { Steps } from 'intro.js-react';
import { createColumnHelper } from '@tanstack/react-table';
import laborAudit from '../../assets/introJSSteps/laborAudit';
import dateFormat from 'dateformat';
import { CiSquareMinus, CiSquarePlus } from 'react-icons/ci';

const columnHelper = createColumnHelper();

const LaborAudit = () => {
  const {
    companyID,
    alignmentID,
    unitsAndAreas: unitsAndAreasList,
    defaultUnitID,
    defaultUnitName,
  } = useSelector((state) => state.globalState);

  //IntroJS variables for the help steps
  const [introSteps, setIntroSteps] = useState({
    steps: laborAudit(),
    initialStep: 0,
    stepsEnabled: false,
  });

  // State variables for selected unit
  const [selectedUnit, setSelectedUnit] = useState();
  const [selectedUnitName, setSelectedUnitName] = useState('Loading');
  const [showUnitModal, setShowUnitModal] = useState(false);

  // loading and error state variables
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    'There was an error trying to load the Labor Audit Report, please try again later.'
  );

  // For comment Modal
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentValue, setCommentValue] = useState('');

  // Schedule DropDown Variable
  const [defaultSchedule, setDefaultSchedule] = useState();
  const [allScheduleIdAndWorkWeek, setAllScheduleIdAndWorkWeek] = useState([]);
  const scheduleOptions = allScheduleIdAndWorkWeek.map((option) => {
    return {
      name: option.workWeek,
    };
  });

  // fetched LaborAudit data
  const [laborAuditData, setLaborAuditData] = useState([]);

  // Version fetching from diff API state variable
  const [isVersionFetched, setIsVersionFetched] = useState(false);

  // useEffect is for default Unit Id
  useEffect(() => {
    if (defaultUnitID) {
      setSelectedUnit(defaultUnitID);
    }
    if (defaultUnitName) {
      setSelectedUnitName(defaultUnitName);
    }
  }, [defaultUnitID, defaultUnitName]);

  // columns for tableHOC of LaborAudit

  const columns = [
    columnHelper.accessor('employeeFirstName', {
      id: 'employeeFirstName',
      header: 'Employee First Name',
      cell: ({ getValue, row }) =>
        row.getCanExpand() ? (
          <div
            className={`flex items-center gap-2 font-bold absolute inset-0 w-96] `}
          >
            {row.getIsExpanded() ? <CiSquareMinus /> : <CiSquarePlus />}

            <div className='mr-20 w-20'>Version: {row.original.version}</div>
            <div className='mr-20'>
              Edit Date:{' '}
              {dateFormat(row.original.editDate, 'mm/dd/yyyy hh:MM TT')}
            </div>
            <div className='mr-20'>{row.original.editDescription}</div>
          </div>
        ) : (
          <div className='text-left'>{getValue()}</div>
        ),
      dataType: 'string',
      filterFn: 'arrIncludesSome',
    }),
    columnHelper.accessor('employeeLastName', {
      id: 'employeeLastName',
      header: 'Employee Last Name',
      cell: ({ getValue }) => <div className='text-left'>{getValue()}</div>,
      dataType: 'string',
      filterFn: 'arrIncludesSome',
    }),
    columnHelper.accessor('jobName', {
      id: 'jobName',
      header: 'Job Name',
      cell: ({ getValue }) => <div className='text-left'>{getValue()}</div>,
      dataType: 'string',
      filterFn: 'arrIncludesSome',
    }),
    columnHelper.accessor('businessDate', {
      id: 'businessDate',
      header: 'Business Date',
      dataType: 'string',
      filterFn: 'arrIncludesSome',
    }),
    columnHelper.accessor('startTime', {
      id: 'startTime',
      header: 'Start Time',
      dataType: 'string',
      filterFn: 'arrIncludesSome',
    }),
    columnHelper.accessor('endTime', {
      id: 'endTime',
      header: 'End Time',
      dataType: 'string',
      filterFn: 'arrIncludesSome',
    }),
    columnHelper.accessor('detailComments', {
      id: 'detailsComments',
      header: 'Shift Comments',
      cell: ({ getValue, row }) => {
        if (row.getCanExpand()) {
          return;
        } else {
          if (!getValue()) {
            return '';
          } else {
            return (
              <div
                className='underline cursor-pointer'
                onClick={() => {
                  setShowCommentModal(!showCommentModal);
                  setCommentValue(getValue());
                }}
              >
                View comment
              </div>
            );
          }
        }
      },
      dataType: 'string',
      filterFn: 'arrIncludesSome',
    }),
    columnHelper.accessor('editAction', {
      id: 'editAction',
      header: 'Edit Action',
      dataType: 'string',
      filterFn: 'arrIncludesSome',
    }),
  ];

  // This useEffect is for default date but later use date range
  const getDatesRange = async () => {
    try {
      const getData = {
        url: 'getLaborAuditDateRange',
        urlParams: {
          companyId: companyID,
          UnitID: selectedUnit,
        },
      };
      const result = await getCall(getData);
      if (result?.data) {
        setAllScheduleIdAndWorkWeek(result.data);
      }

      const currentDate = new Date();
      const dayOfWeek = currentDate.getDay();

      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const diffToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() + diffToMonday);

      const sunday = new Date(currentDate);
      sunday.setDate(currentDate.getDate() + diffToSunday);

      const formatDate = (date) => {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      };

      const currentDateRange = `${formatDate(monday)} - ${formatDate(sunday)}`;
      setDefaultSchedule(currentDateRange);

      setDefaultSchedule(currentDateRange);
    } catch (error) {
      console.error('Error getting default dates: ', error);
    }
  };

  useEffect(() => {
    if (selectedUnit) {
      getDatesRange();
    }
  }, [selectedUnit]);

  // Function to handle the unit selection
  const handleUnitSelection = (unitName, unitID) => {
    setSelectedUnitName(unitName);
    setSelectedUnit(unitID);
    setShowUnitModal(false);
  };

  // Function to handle the date selection
  const handleScheduleChange = (option) => {
    setDefaultSchedule(option);
  };

  const fetchVersionCheck = async () => {
    try {
      setIsVersionFetched(false);
      setIsError(false);
      const startSchedule = defaultSchedule.split('-');

      const scheduleDetails = allScheduleIdAndWorkWeek.find(
        (item) => item.workWeek === defaultSchedule
      );
      const getData = {
        url: 'versionOneCheck',
        urlParams: {
          companyId: companyID,
          ScheduleID: scheduleDetails.scheduleID,
          scheduleStart: startSchedule[0],
        },
      };

      const result = await getCall(getData);

      setIsVersionFetched(true);
      fetchLaborAudit(result.data);
    } catch {
      setIsError(true);
    }
  };

  // Structured the data for Table

  const ModifiedDataForTable = async (data, isVersion) => {
    const datawithId = await data?.map((row, index) => ({
      ...row,
      ApptID: index,
    }));

    let lstApptIDs = [];
    let filteredData = [];

    await datawithId?.forEach((drow) => {
      let ApptID = parseInt(drow.ApptID);
      let EditVersion = parseInt(drow.editVersion);
      let SSN = parseInt(drow.ssn);
      let EmployeeID = parseInt(drow.employeeID);
      let JobID = parseInt(drow.jobID);
      let BusinessDate = new Date(drow.businessDate);
      let StartTime = new Date(drow.startTime);
      let EndTime = new Date(drow.endTime);
      let strComments = drow.detailComments || '';

      if (strComments.includes("'")) {
        strComments = strComments.replace(/'/g, "''");
      }

      let filteredRows = datawithId?.filter((row) => {
        return (
          row.ssn === SSN &&
          row.employeeID === EmployeeID &&
          row.jobID === JobID &&
          row.editVersion === EditVersion &&
          new Date(row.businessDate).getTime() === BusinessDate.getTime() &&
          new Date(row.startTime).getTime() === StartTime.getTime() &&
          new Date(row.endTime).getTime() === EndTime.getTime() &&
          (strComments
            ? row.detailComments === strComments
            : !row.detailComments)
        );
      });

      if (filteredRows.length > 1 && !lstApptIDs.includes(ApptID)) {
        lstApptIDs.push(ApptID);
      }
    });

    if (lstApptIDs.length > 0) {
      filteredData = datawithId.filter(
        (row) => !lstApptIDs.includes(row.ApptID)
      );
    } else {
      filteredData = [...datawithId];
    }

    const newData = filteredData.reduce((acc, item) => {
      if (!acc[item.editVersion]) {
        acc[item.editVersion] = {
          version: item.editVersion,
          editDate: item.editDate,
          editDescription: item.label,
          subRows: [],
        };
      }

      acc[item.editVersion].subRows.push(item);
      return acc;
    }, {});

    let finalData = [];
    for (const key in newData) {
      finalData.push(newData[key]);
    }
    let finalData2 = finalData
      .map((item) => {
        return {
          ...item,
          subRows: item.subRows
            .map((item2) => {
              item2.businessDate = dateFormat(item2.businessDate, 'mm/dd/yyyy');
              item2.startTime = dateFormat(
                item2.startTime,
                'mm/dd/yyyy hh:MM TT'
              );
              item2.endTime = dateFormat(item2.endTime, 'mm/dd/yyyy hh:MM TT');

              return item2;
            })
            .sort((a, b) => a.startDate - b.startDate),
        };
      })
      .sort((a, b) => b.version - a.version);

    const version1Exist = finalData2.some((obj) => obj.version == 1);
    const regex = /(\w+)=(\S+)(?=,|$)/g;
    let match;
    const extractedValues = {};
    while ((match = regex.exec(isVersion[0]?.Parameters)) !== null) {
      const key = match[1];
      const value = match[2];
      extractedValues[key] = parseInt(value);
    }
    if (!version1Exist) {
      if (isVersion?.length === 1 && extractedValues.Version == 1) {
        finalData2.push({
          version: 1,
          editDate: isVersion[0].Date,
          user: isVersion[0].Name,
          editDescription: `Edit Type: ${isVersion[0].Name} Posted the Schedule`,
          subRows: [
            {
              editVersion: extractedValues.Version,
              employeeFirstName: isVersion[0].Name.split(' ')[0],
              employeeLastName: isVersion[0].Name.split(' ')[1],
              jobName: '',
              businessDate: dateFormat(isVersion[0].Date, 'mm/dd/yyyy'),
              startTime: dateFormat(isVersion[0].Date, 'mm/dd/yyyy hh:MM TT'),
              endTime: dateFormat(isVersion[0].Date, 'mm/dd/yyyy hh:MM TT'),
              detailsComments: '',
              editAction: 'Schedule Posted',
            },
          ],
        });
      } else if (isVersion?.length > 0) {
        finalData2.forEach((obj) => {
          if (obj.version == extractedValues.Version) {
            obj.subRows.push({
              editVersion: extractedValues.Version,
              employeeFirstName: isVersion[0].Name.split(' ')[0],
              employeeLastName: isVersion[0].Name.split(' ')[1],
              jobName: '',
              businessDate: dateFormat(isVersion[0].Date, 'mm/dd/yyyy'),
              startTime: dateFormat(isVersion[0].Date, 'mm/dd/yyyy hh:MM TT'),
              endTime: dateFormat(isVersion[0].Date, 'mm/dd/yyyy hh:MM TT'),
              detailsComments: '',
              editAction: 'Schedule Posted',
            });
          }
        });
      }
    } else if (isVersion?.length > 0) {
      finalData2.forEach((obj) => {
        if (obj.version == extractedValues.Version) {
          obj.subRows.push({
            editVersion: extractedValues.Version,
            employeeFirstName: isVersion[0].Name.split(' ')[0],
            employeeLastName: isVersion[0].Name.split(' ')[1],
            jobName: '',
            businessDate: dateFormat(isVersion[0].Date, 'mm/dd/yyyy'),
            startTime: dateFormat(isVersion[0].Date, 'mm/dd/yyyy hh:MM TT'),
            endTime: dateFormat(isVersion[0].Date, 'mm/dd/yyyy hh:MM TT'),
            detailsComments: '',
            editAction: 'Schedule Posted',
          });
        }
      });
    }
    return finalData2;
  };

  // Function to fetch laborAudit Report
  const fetchLaborAudit = async (isVersion) => {
    try {
      setIsLoading(true);
      setIsError(false);

      const scheduleID = allScheduleIdAndWorkWeek.filter(
        (item) => item.workWeek === defaultSchedule
      )[0].scheduleID;

      const getData = {
        url: 'laborAudit',
        urlParams: {
          companyId: companyID,
          alignmentId: alignmentID,
          UnitID: selectedUnit,
          ScheduleID: scheduleID,
        },
      };
      const result = await getCall(getData);
      const newData = await ModifiedDataForTable(result.data, isVersion);
      setLaborAuditData(newData);
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
      setErrorMessage(
        'There was an issue loading your data, please try again later.'
      );
      console.error('Error getting labor audit report data: ', error);
    }
  };

  // function to handle pdfClick
  const handlePDFClick = () => {
    const pdfData = {
      title: 'Labor Audit Report',
      subHeaders: [`${defaultSchedule}`, `${selectedUnitName}`],
      exportType: 'pdf',
      pageOrientation: 'landscape',
      body: buildPDFBody(),
    };

    PdfBuilder(pdfData);
  };

  const buildPDFBody = () => {
    const body = laborAuditData.map((row) => {
      const version = row.version;
      const title = `Version: ${version}`;
      return {
        type: 'table',
        title: title,
        widths: Array(9).fill('auto'),
        dataTypes: [
          'string',
          'string',
          'string',
          'string',
          'string',
          'string',
          'string',
          'string',
          'string',
        ],
        data: formatPDFData(row),
      };
    });
    return body;
  };

  // Build pdf format
  const formatPDFData = (row) => {
    return {
      columnHeaders: [
        'Edit Date',
        'Employee First Name',
        'Employee Last Name',
        'Job Name',
        'Business Date',
        'Start Time',
        'End Time',
        'Shift Comments',
        'Edit Action',
      ],

      rows: row.subRows.map((subRow) => [
        {
          value: dateFormat(subRow.editDate, 'mm/dd/yyyy hh:MM TT'),
          columnName: 'Edit Date',
        },
        {
          value: subRow.employeeFirstName,
          cellType: 'string',
          columnName: 'Employee First Name',
        },
        {
          value: subRow.employeeLastName,
          cellType: 'string',
          columnName: 'Employee Last Name',
        },
        {
          value: subRow.jobName,
          cellType: 'string',
          columnName: 'Job Name',
        },
        {
          value: subRow.businessDate,
          cellType: 'string',
          columnName: 'Business Date',
        },
        {
          value: subRow.startTime,
          cellType: 'string',
          columnName: 'Start Time',
        },
        {
          value: subRow.endTime,
          cellType: 'string',
          columnName: 'End Time',
        },
        {
          value: subRow.detailComments,
          cellType: 'string',
          columnName: 'Shift Comments',
        },
        {
          value: subRow.editAction,
          cellType: 'string',
          columnName: 'Edit Action',
        },
      ]),
    };
  };

  const handleExcelClick = () => {
    const data = [
      {
        name: 'Labor Audit',
        columns: [
          { name: 'Version', filterButton: true },
          { name: 'Edit Date', filterButton: true },
          { name: 'Employee First Name', filterButton: true },
          { name: 'Employee Last Name', filterButton: true },
          { name: 'Job Name', filterButton: true },
          { name: 'Business Date', filterButton: true },
          { name: 'Start Time', filterButton: true },
          { name: 'End Time', filterButton: true },
          { name: 'Shift Comments', filterButton: true },
          { name: 'Edit Action', filterButton: true },
        ],
        data: laborAuditData.flatMap((row) =>
          row.subRows.map((laborAuditRow) => {
            return {
              editVersion: laborAuditRow.editVersion,
              editDate: dateFormat(
                laborAuditRow.editDate,
                'mm/dd/yyyy hh:MM TT'
              ),
              employeeFirstName: laborAuditRow.employeeFirstName,
              employeeLastName: laborAuditRow.employeeLastName,
              jobName: laborAuditRow.jobName,
              businessDate: laborAuditRow.businessDate,
              startTime: laborAuditRow.startTime,
              endTime: laborAuditRow.endTime,
              detailComments: laborAuditRow.detailComments,
              editAction: laborAuditRow.editAction,
            };
          })
        ),
      },
    ];
    const filename = `${selectedUnitName} ${defaultSchedule}`;
    const spreadSheetTitle = 'Labor Audit';
    const date = `${defaultSchedule}`;
    exportToExcel(data, filename, spreadSheetTitle, date, selectedUnitName);
  };

  const Table = (
    <TableHOC
      columns={columns}
      data={laborAuditData}
      expandCollapseButtons={true}
      enableColumnFilters={true}
    />
  );
  return (
    <div className='w-[98%] mx-auto'>
      <Steps
        enabled={introSteps.stepsEnabled}
        steps={introSteps.steps}
        initialStep={introSteps.initialStep}
        onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
      />
      <h2 className='my-2 text-[18px] leading-tight text-left pageTitle'>
        Labor Audit Report
      </h2>
      <header className='optionBar flex justify-between items-center mb-2 rounded-2xl shadow-[0px_3px_20px_-10px_rgba(0,_0,_0,_0.5)] p-4'>
        <div className='flex flex-col'>
          <div className='flex items-center space-x-1'>
            <UnitSelector
              companyId={companyID}
              alignmentId={alignmentID}
              memberID={selectedUnit}
              memberName={selectedUnitName}
              includeAreas={true}
              setMemberName={setSelectedUnitName}
              onClick={() => setShowUnitModal(true)}
            />
            <div className='schedule-selector'>
              <Dropdown
                title='Schedule'
                options={scheduleOptions}
                selectedOption={defaultSchedule ? defaultSchedule : 'Loading'}
                onOptionChange={handleScheduleChange}
              />
            </div>
            <Run fetchData={fetchVersionCheck} />
          </div>
        </div>
        <div>
          <ExportOptions
            includePDF={true}
            handlePDFClick={handlePDFClick}
            includeExcel={true}
            handleExcelClick={handleExcelClick}
            includeHelp={true}
            handleHelpClick={() =>
              setIntroSteps({ ...introSteps, stepsEnabled: true })
            }
          />
        </div>
      </header>
      {/* Showing the table */}
      {isError ? (
        <div>{errorMessage}</div>
      ) : (
        <div className='relative w-full min-h-56'>
          <Loader loading={isLoading} />
          {!isLoading &&
            (laborAuditData.length > 0 ? (
              <div className='paged-w-full paged-table'>{Table}</div>
            ) : !selectedUnit ? (
              <div className='mt-10 text-xl font-medium text-center'>
                No Unit Selected
              </div>
            ) : (
              <div className='mt-10 text-xl font-medium text-center'>
                No data available
              </div>
            ))}
        </div>
      )}
      {/* Unit Modal */}
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
        <Modal
          isOpen={showCommentModal}
          title={'Comment'}
          onClose={() => {
            setShowCommentModal(!showCommentModal);
          }}
        >
          <div className='w-[300px] h-auto m-[15px]'>{commentValue}</div>
        </Modal>
      </div>
    </div>
  );
};

export default LaborAudit;
