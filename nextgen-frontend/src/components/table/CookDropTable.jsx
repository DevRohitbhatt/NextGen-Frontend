import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const CookDropTableHeader = ({ headerData }) => {
    const headers = headerData && headerData.length > 0 ? headerData : [];

    return (
        <thead className='bg-white sticky top-0 z-10'>
            <tr className='z-10'>

                {headers.length > 0 && headers.map((header, index) => (
                    <>
                        {index === 0 && <th key={header+index+""} className="main-header first-header text-nowrap px-[20px] bg-gray-300 rounded-tl-[10px] sticky left-0 z-10 shadow-[0_-1px_0_var(--tw-primary)_inset]" rowSpan="2">
                            <table className='ml-auto mr-auto'>
                                <thead>
                                    <tr>
                                        <th style={{ height: "45px", opacity: 0 }}>Unit</th>
                                    </tr>
                                    <tr>
                                        <th>Unit</th>
                                    </tr>
                                    <tr>
                                        <th>Safety Factor</th>
                                    </tr>
                                    <tr>
                                        <th>Mix</th>
                                    </tr>
                                </thead>
                            </table>
                        </th>}
                        <th key={index} className="p-2 font-semibold text-center text-nowrap shadow-[0_-1px_0_var(--tw-primary)_inset] ">{header.itemName}</th>
                    </>

                ))}
            </tr>
            <tr>
                {headers.map((header, index) => (
                    <th key={index} className="p-2 text-center  shadow-[0_-1px_0_var(--tw-primary)_inset] ">
                        <div className='p-0 text-[14px] font-medium  font-semibold text-center text-nowrap indent-0  align-middle '>{header?.unitOfMeasure ? header?.unitOfMeasure : ""}</div>
                        <div className='text-[14px] text-[14px] font-medium  p-0  text-center text-nowrap indent-0  align-middle'>{header?.safetyFactor ? header?.safetyFactor : ""}%</div>
                        <div className='text-[14px] font-medium p-0  text-center text-nowrap indent-0  align-middle'>{header?.mix ? header?.mix : ""}%</div>
                    </th>
                ))}
            </tr>
            <tr>
                {headers.map((header, index) => (
                    <>
                        {index === 0 && <th key={index} className="p-2 text-center   bg-gray-300 text-nowrap sticky left-0 shadow-[0_-1px_0_var(--tw-primary)_inset]">
                            {index === 0 && <div className='text-black inline font-roboto text-[13px] font-medium h-auto leading-[19.5px] mb-0 ml-0 mr-0 mt-0 text-center indent-0 text-[100%] w-auto sticky left-0 '>Time</div>}

                        </th>}

                        <th key={index} className="p-2 text-center   text-nowrap shadow-[0_-1px_0_var(--tw-primary)_inset]">

                            <div className='text-black inline font-roboto text-[13px] font-medium h-auto leading-[19.5px] mb-0 ml-0 mr-0 mt-0 text-center indent-0 text-[100%] w-auto '>Need / Have / Cook</div>
                        </th>
                    </>
                ))}
            </tr>


        </thead>
    );
};

const EditableTable = ({ rows ,setRows }) => {
    if (!rows || typeof rows !== 'object') {
        return <tbody><tr><td colSpan="100%">No data available</td></tr></tbody>;
    }

    const handleInputChange = (time, fieldIndex, type, value) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        setRows(prevRows => ({
            ...prevRows,
            [time]: prevRows[time].map((fieldGroup, index) => (
                index === fieldIndex ? { ...fieldGroup, [type]: numericValue } : fieldGroup
            ))
        }));
    };

    return (
        <tbody>
            {Object.entries(rows).map(([time, fields], rowIndex) => (
                <tr key={time}>
                    {/* Display time */}
                    <td className="border px-4 py-2 bg-gray-200 sticky left-0 text-center">{time || "N/A"}</td>

                    {/* Display fields for each item at this time */}
                    {(fields || []).map((fieldGroup, fieldIndex) => (
                        <td key={`${time}-${fieldIndex}`} className="border px-4 py-2 text-center">
                            <div className="flex justify-center space-x-1">
                                <input
                                    type="text"
                                    value={fieldGroup?.needCount ?? ""}
                                    onChange={(e) => handleInputChange(time, fieldIndex, "needCount", e.target.value)}
                                    className="w-8 text-center"
                                />
                                <span>/</span>
                                <input
                                    type="text"
                                    value={fieldGroup?.haveCount ?? ""}
                                    onChange={(e) => handleInputChange(time, fieldIndex, "haveCount", e.target.value)}
                                    className="w-8 text-center"
                                />
                                <span>/</span>
                                <input
                                    type="text"
                                    value={fieldGroup?.cookCount ?? ""}
                                    onChange={(e) => handleInputChange(time, fieldIndex, "cookCount", e.target.value)}
                                    className="w-8 text-center"
                                />
                            </div>
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
};

const CookDropTable = forwardRef(({ initData }, ref) => {
    const { headers } = initData;
    const [editableRows, setEditableRows] = useState(initData.rows);
    const originalRows = useRef(initData.rows);  // Reference to the original rows for comparison

    useImperativeHandle(ref, () => ({
        getChangedData: () => editableRows,
    }));

    return (
        <table className='w-full border-collapse table-auto select-none'>
            <CookDropTableHeader headerData={headers} />
            <EditableTable rows={editableRows} setRows={setEditableRows} />
        </table>
    );
});


export default CookDropTable;
