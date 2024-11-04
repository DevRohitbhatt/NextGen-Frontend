import { useEffect, useMemo, useState } from 'react';
import { getCall } from '../../apis/network';
import { Steps } from 'intro.js-react';
import { useSelector } from 'react-redux';
import voidsReport from '../../assets/introJSSteps/voidsReport';
import {
    Dropdown,
    Loader,
    UnitSelector,
    CalendarModal,
    UnitModal,
    ExportOptions,
    ExcelExport as exportToExcel,
    ForcastedSales,
    DateSelector,
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import CookDropTable from '../../components/table/CookDropTable';
import { Link } from 'react-router-dom';
import HoverBorderButton from '../../components/buttons/HoverBorderButton';
import dateFormat from 'dateformat';

const columnHelper = createColumnHelper();

const CookChart = () => {
    const {
        companyID,
        alignmentID,
        unitsAndAreas: unitsAndAreasList,
        defaultUnitID,
        defaultUnitName,
    } = useSelector((state) => state.globalState);


    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(
        'There was an error trying to load the CookChart Report, please try again later.'
    );


    const [selectedUnit, setSelectedUnit] = useState();
    const [selectedUnitName, setSelectedUnitName] = useState('Loading...');
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [selectedFromDate, setSelectedFromDate] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 0)
    );
    const [selectedToDate, setSelectedToDate] = useState(new Date());
    const [showDateModal, setShowDateModal] = useState(false);

    const [introSteps, setIntroSteps] = useState({
        steps: voidsReport(),
        initialStep: 0,
        stepsEnabled: false,
    });
    const [cookChartData, setCookChartData] = useState({});
    const [forCastedSalesValue, setForcastedSalesValue] = useState('')

    useEffect(() => {
        if (defaultUnitID) {
            setSelectedUnit(defaultUnitID);
        }
        if (defaultUnitName) {
            setSelectedUnitName(defaultUnitName);
        }
    }, [defaultUnitID, defaultUnitName]);
    // TransformData
    const transformCookDropData = (data) => {
        const headers = data[0].items.map(item => ({
            itemName: item.itemName,
            unitOfMeasure: item.unitOfMeasure,
            safetyFactor: item.safetyFactor,
            mix: item.mix,
        }));

        const rows = {};

        // Iterate over each item and cook drop count to build rows based on cookDropTime
        data[0].items.forEach(item => {
            item.listCookDropItemCount.forEach(count => {
                const time = count.cookDropTime.slice(0, 5); // Format time to HH:MM

                if (!rows[time]) {
                    rows[time] = [];
                }

                rows[time].push({
                    needCount: count.needCount,
                    haveCount: count.haveCount,
                    cookCount: count.cookCount,
                });
            });
        });

        return { headers, rows };
    };



    useEffect(() => {
        getCookChartData();

    }, [selectedUnit,selectedFromDate])


    const getCookChartData = async () => {
        setIsLoading(true)
        console.log(dateFormat(selectedFromDate, 'dd-mm-yyyy'))
        try {
            const getData = {
                fullUrl: 'cookdrop',
                urlParams: {
                    companyId: 1083,
                    cookDropChartID: 0,
                    unitId: 1145,
                    date: dateFormat(selectedFromDate, 'dd/mm/yyyy'),
                },
            };

            const result = await getCall(getData);
            if (result?.data && result?.data.length) {
                setForcastedSalesValue(result.data[0].forecastedSales);
                const { headers, rows } = transformCookDropData(result.data);
                setCookChartData({ headers, rows })
            }
        } catch (error) {
            console.error(error)
        }

        setIsLoading(false)
    }

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
    return (
        <>
            <Loader loading={isLoading} />
            <div className='w-[85%] mx-auto'>
                {/* <Steps
                    enabled={introSteps.stepsEnabled}
                    steps={introSteps.steps}
                    initialStep={introSteps.initialStep}
                    onExit={() => setIntroSteps({ ...introSteps, stepsEnabled: false })}
                /> */}
                <h2 className='my-4 text-2xl leading-tight text-left pageTitle'>Cook Drop Chart</h2>
                <header className='xl:flex space-y-3 xl:space-y-0 py-3 px-4 rounded-[30px] shadow-[0_0px_35px_-10px_rgba(0,0,0,0.3)] justify-between items-center'>
                    <div className='flex items-center space-x-3 '>
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
                        <ForcastedSales
                            value={forCastedSalesValue}
                            onChange={(e) => { setForcastedSalesValue(e.value) }}
                        />
                    </div>
                    <div>
                        <ExportOptions
                            includePDF={true}
                            includeSave={true}
                            includeExcel={true}
                            includePrint={true}
                            includeHelp={true}
                        />
                    </div>
                </header>
                <div className='w-full flex justify-end'>
                    <Link to={'/CookChartTemplate'}>
                        <HoverBorderButton >Manage Templates</HoverBorderButton>
                    </Link>
                </div>
                {isError ? (
                    <div>{errorMessage}</div>
                ) : (
                    !isLoading &&
                    (true ? (
                        <div className='paged-table'>
                            <div className='rounded-2xl border-[1px] shadow-[0_5px_35px_-5px_rgba(0,0,0,0.3)] mt-3 p-3' >
                                <div className='tableHOC pr-1 max-h-[60vh] overflow-auto'>
                                    <Loader loading={isLoading} />
                                    <CookDropTable initData={cookChartData} />

                                </div>
                            </div>
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
