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
} from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import CookDropTable from '../../components/table/CookDropTable';
import { Link } from 'react-router-dom';

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
    const [forCastedSalesValue, setForcastedSalesValue] = useState('$3000')

    useEffect(() => {
        if (defaultUnitID) {
            setSelectedUnit(defaultUnitID);
        }
        if (defaultUnitName) {
            setSelectedUnitName(defaultUnitName);
        }
    }, [defaultUnitID, defaultUnitName]);



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
                        <Dropdown
                            options={[{ name: '08/09/2024' }, { name: '08/09/2024' }, { name: '08/09/2024' }, { name: '08/09/2024' }]}
                            title='Select Date'
                            selectedOption={'08/09/2024'}
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
                        <button className="relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] m-w-[110px] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button mr-[20px] my-[20px] justify-end text-nowrap" onClick={() => { }}>Manage Templates</button>
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

                                    <CookDropTable />

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
        </>
    );
};

export default CookChart;
