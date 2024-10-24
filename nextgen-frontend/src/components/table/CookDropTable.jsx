import React, { useState } from 'react';

const CookDropTableHeader = () => {

    const headers = [
        { label: 'Biscuits', subHeader: { type: 'Serving', safetyFactor: '10.0%', mix: '10.0%' } },
        { label: 'Regular Strips', subHeader: { type: 'Each', safetyFactor: '10.0%', mix: '10.0%' } },
        { label: 'Spicy Strips', subHeader: { type: 'Each', safetyFactor: '10.0%', mix: '10.0%' } },
        { label: 'Regular Chicken', subHeader: { type: 'Each', safetyFactor: '10.0%', mix: '100.0%' } },
        { label: 'Biscuits', subHeader: { type: 'Each', safetyFactor: '10.0%', mix: '100.0%' } },
        { label: 'Regular Strips', subHeader: { type: 'Each', safetyFactor: '10.0%', mix: '100.0%' } },
        { label: 'Spicy Strips', subHeader: { type: 'Each', safetyFactor: '10.0%', mix: '100.0%' } },
        { label: 'Spicy Strips', subHeader: { type: 'Each', safetyFactor: '10.0%', mix: '100.0%' } },
        { label: 'Spicy Strips', subHeader: { type: 'Each', safetyFactor: '10.0%', mix: '100.0%' } },
        { label: 'Spicy Strips', subHeader: { type: 'Each', safetyFactor: '10.0%', mix: '100.0%' } },
        { label: 'Spicy Strips', subHeader: { type: 'Each', safetyFactor: '10.0%', mix: '100.0%' } },
        { label: 'Spicy Strips', subHeader: { type: 'Each', safetyFactor: '10.0%', mix: '100.0%' } },
        { label: 'Spicy Strips', subHeader: { type: 'Each', safetyFactor: '10.0%', mix: '100.0%' } },
        { label: 'Spicy Strips', subHeader: { type: 'Each', safetyFactor: '10.0%', mix: '100.0%' } },
        { label: 'Spicy Strips', subHeader: { type: 'Each', safetyFactor: '10.0%', mix: '100.0%' } },
        { label: 'Spicy Strips', subHeader: { type: 'Each', safetyFactor: '10.0%', mix: '100.0%' } },
        { label: 'Spicy Strips', subHeader: { type: 'Each', safetyFactor: '10.0%', mix: '100.0%' } },
        { label: 'Spicy Strips', subHeader: { type: 'Each', safetyFactor: '10.0%', mix: '100.0%' } },
        // Add more headers as needed
    ];

    return (
        <thead className='bg-white sticky top-0 z-10'>
            <tr className='z-10'>

                {headers.map((header, index) => (
                    <>
                        {index === 0 && <th className="main-header first-header text-nowrap px-[20px] bg-gray-300 rounded-tl-[10px] sticky left-0 z-10 shadow-[0_-1px_0_var(--tw-primary)_inset]" rowspan="2">
                            <table>
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
                        <th key={index} className="p-2 font-semibold text-center text-nowrap shadow-[0_-1px_0_var(--tw-primary)_inset] ">{header.label}</th>
                    </>

                ))}
            </tr>
            <tr>
                {headers.map((header, index) => (
                    <th key={index} className="p-2 text-center  shadow-[0_-1px_0_var(--tw-primary)_inset] ">
                        <div className='text-[14px] font-medium h-[28px] leading-[21px] p-0 text-center indent-0  align-middle w-[170.111px]'>{header.subHeader.type}</div>
                        <div className='text-[14px] font-medium h-[28px] leading-[21px] p-0 text-center indent-0 text-[100%] align-middle w-[170.111px]'>{header.subHeader.safetyFactor}</div>
                        <div className='text-[14px] font-medium h-[28px] leading-[21px] p-0 text-center indent-0 text-[100%] align-middle w-[170.111px]'>{header.subHeader.mix}</div>
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

const EditableTable = () => {
    const [tableData, setTableData] = useState([
        { time: "9:00 AM", fields: [["2", "3", "5"], ["2", "3", "4"], ["2", "2", "2"], ["2", "2", "2"], ["2", "2", "2"],["2", "2", "5"], ["2", "2", "2"], ["2", "2", "3"]] },
        { time: "9:15 AM", fields: [["", "2", ""], ["2", "2", "2"], ["2", "2", "2"], ["2", "2", "2"], ["2", "2", "2"],["2", "2", "5"], ["2", "2", "2"], ["2", "2", "3"]] },
        { time: "9:30 AM", fields: [["", "3", ""], ["0", "2", "2"], ["2", "2", "2"], ["2", "2", "2"], ["2", "2", "2"],["2", "2", "5"], ["2", "2", "2"], ["2", "2", "3"]] },
        { time: "9:45 AM", fields: [["2", "2", ""], ["2", "2", "2"], ["2", "2", "2"], ["2", "2", "2"], ["2", "2", "2"],["2", "2", "5"], ["2", "2", "2"], ["2", "2", "3"]] },
        { time: "10:00 AM", fields: [["2", "2", "5"], ["2", "2", "2"], ["2", "2", "3"], ["2", "2", "2"], ["2", "2", "2"],["2", "2", "5"], ["2", "2", "2"], ["2", "2", "3"]] },
        { time: "10:15 AM", fields: [["2", "2", "5"], ["2", "2", "2"], ["2", "2", "3"], ["2", "2", "2"], ["2", "2", "2"],["2", "2", "5"], ["2", "2", "2"], ["2", "2", "3"]] },
        { time: "10:30 AM", fields: [["2", "2", "5"], ["2", "2", "2"], ["2", "2", "3"], ["2", "2", "2"], ["2", "2", "2"],["2", "2", "5"], ["2", "2", "2"], ["2", "2", "3"]] },
        { time: "10:45 AM", fields: [["2", "2", "5"], ["2", "2", "2"], ["2", "2", "3"], ["2", "2", "2"], ["2", "2", "2"],["2", "2", "5"], ["2", "2", "2"], ["2", "2", "3"]] },
        
        { time: "10:30 AM", fields: [["2", "2", "5"], ["2", "2", "2"], ["2", "2", "3"], ["2", "2", "2"], ["2", "2", "2"],["2", "2", "5"], ["2", "2", "2"], ["2", "2", "3"]] },
        { time: "10:45 AM", fields: [["2", "2", "5"], ["2", "2", "2"], ["2", "2", "3"], ["2", "2", "2"], ["2", "2", "2"],["2", "2", "5"], ["2", "2", "2"], ["2", "2", "3"]] },
    ]);

    const handleChange = (rowIndex, fieldIndex, subFieldIndex, value) => {
        const newData = [...tableData];
        newData[rowIndex].fields[fieldIndex][subFieldIndex] = value;
        setTableData(newData);
    };

    return (
        <tbody>
            {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                    <td className="border px-4 py-2 bg-gray-200 sticky left-0 text-center">{row.time}</td>
                    {row.fields.map((fieldGroup, fieldIndex) => (
                        <td key={fieldIndex} className="border px-4 py-2 text-center">
                            <div className="flex  space-y-1">
                                {fieldGroup.map((field, subFieldIndex) => (
                                    <>
                                        {subFieldIndex === 1   && <span key={subFieldIndex}>/</span>}

                                        <input
                                            key={subFieldIndex}
                                            type="text"
                                            value={field}
                                            onChange={(e) =>
                                                handleChange(rowIndex, fieldIndex, subFieldIndex, e.target.value)
                                            }
                                            className="w-full text-center"
                                        />
                                        {subFieldIndex === 1  && <span key={subFieldIndex}>/</span>}
                                    </>
                                ))}
                            </div>
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
};


const CookDropTable = () => {
   

    return (
        <table className='w-full border-collapse table-auto select-none'>
            <CookDropTableHeader />
            <EditableTable />
        </table>
    );
};


export default CookDropTable;
