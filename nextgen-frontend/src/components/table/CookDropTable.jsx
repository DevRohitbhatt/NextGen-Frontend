import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const CookDropTableHeader = ({ headerData }) => {
  const headers = headerData || [];

  return (
    <thead className="bg-white sticky top-0 z-10">
      <tr className="z-10">
        {headers.length > 0 &&
          headers.map((header, index) => (
            <div className="contents"  key={header + index + ""}>
              {index === 0 && (
                <th
                 
                  className="main-header first-header text-nowrap lg:px-[20px] px-2 bg-gray-300 rounded-tl-[10px] sticky left-0 z-10 shadow-[0_-1px_0_var(--tw-primary)_inset]"
                  rowSpan="2"
                >
                  <table className="ml-auto mr-auto">
                    <thead>
                      <tr>
                        <th
                          className="text-[11px]"
                          style={{ height: "45px", opacity: 0 }}
                        >
                          Unit
                        </th>
                      </tr>
                      <tr>
                        <th className="text-[11px] mt-[5px]">Unit</th>
                      </tr>
                      <tr>
                        <th className="text-[11px] mb-[5px] mt-[3px]">Safety Factor</th>
                      </tr>
                     
                    </thead>
                  </table>
                </th>

              )}
              <th
              key={index}
              className="p-2 font-semibold text-center text-nowrap shadow-[0_-1px_0_var(--tw-primary)_inset] text-[11px] "
            >
              {header.itemName}
            </th> 
              
            </div>
          ))}
      </tr>
      <tr>
        {headers.map((header, index) => (
          <th
            key={index}
            className="p-2 text-center  shadow-[0_-1px_0_var(--tw-primary)_inset] "
          >
            <div className="p-0 text-[11px] font-medium  font-semibold text-center text-nowrap indent-0  align-middle ">
              {header?.unitOfMeasure ? header?.unitOfMeasure : ""}
            </div>
            <div className="text-[11px] mt-[3px] font-medium  p-0  text-center text-nowrap indent-0  align-middle">
              {header?.safetyFactor ? header?.safetyFactor : ""}%
            </div>
     
          </th>
        ))}
      </tr>
      <tr>
        {headers.map((header, index) => (
          <div className="contents" key={index+"wrap"}>
            {index === 0 && (
              <th
                
                className="p-2 text-center   bg-gray-300 text-nowrap sticky left-0 shadow-[0_-1px_0_var(--tw-primary)_inset]"
              >
                {index === 0 && (
                  <div className="text-black inline font-roboto text-[11px] font-medium h-auto leading-[19.5px] mb-0 ml-0 mr-0 mt-0 text-center indent-0 w-auto sticky left-0 ">
                    Time
                  </div>
                )}
              </th>
            )}

            <th
              key={index}
              className="p-2 text-center   text-nowrap shadow-[0_-1px_0_var(--tw-primary)_inset]"
            >
              <div className="text-black inline font-roboto text-[11px] font-medium h-auto leading-[19.5px] mb-0 ml-0 mr-0 mt-0 text-center indent-0  w-auto ">
                Need / Have / Cook
              </div>
            </th>
          </div>
        ))}
      </tr>
    </thead>
  );
};

const EditableTable = ({ rows, setRows }) => {
  if (!rows || typeof rows !== "object") {
    return (
      <tbody>
        <tr>
          <td colSpan="100%" className="">
            No data available
          </td>
        </tr>
      </tbody>
    );
  }

  const handleInputChange = (time, fieldIndex, type, value) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setRows((prevRows) => ({
      ...prevRows,
      [time]: prevRows[time].map((fieldGroup, index) =>
        index === fieldIndex
          ? { ...fieldGroup, [type]: numericValue }
          : fieldGroup
      ),
    }));
  };

  return (
    <tbody>
      {Object.entries(rows).map(([time, fields], rowIndex) => (
        <tr key={time}>
          {/* Display time */}
          <td className="border lg:px-4 lg:py-2 bg-gray-200 sticky left-0 text-center text-[11px]">
            {time || "N/A"}
          </td>

          {/* Display fields for each item at this time */}
          {(fields || []).map((fieldGroup, fieldIndex) => (
            <td
              key={`${time}-${fieldIndex}`}
              className="border lg:px-4 lg:py-2 px-2 text-center"
            >
              <div className="flex justify-center space-x-1">
                <input
                  type="text"
                  value={fieldGroup?.needCount ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      time,
                      fieldIndex,
                      "needCount",
                      e.target.value
                    )
                  }
                  className="w-8 text-center text-[11px]"
                />
                <span>/</span>
                <input
                  type="text"
                  value={fieldGroup?.haveCount ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      time,
                      fieldIndex,
                      "haveCount",
                      e.target.value
                    )
                  }
                  className="w-8 text-center text-[11px]"
                />
                <span>/</span>
                <input
                  type="text"
                  value={fieldGroup?.cookCount ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      time,
                      fieldIndex,
                      "cookCount",
                      e.target.value
                    )
                  }
                  className="w-8 text-center text-[11px]"
                />
              </div>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

const CookDropTableFooter = ({ rows }) => {
  const calculateColumnTotals = () => {
    if (!rows || typeof rows !== "object") return [];

    // Calculate total for each column
    const totals = [];
    Object.values(rows).forEach((fields) => {
      fields.forEach((field, index) => {
        totals[index] =
          (totals[index] || 0) + (parseInt(field?.needCount || 0, 10) || 0);
      });
    });
    return totals;
  };

  const columnTotals = calculateColumnTotals();

  return (
    <tfoot>
      <tr className="shadow-[0_1px_0_var(--tw-primary)_inset]  bg-white sticky bottom-0">
        {/* Time column */}
        <td className=" sticky bg-white z-10  lg:px-4 lg:py-2 shadow-[0_-1px_0_var(--tw-primary)_inset]  left-0 text-center font-bold text-[11px]">
          Total
        </td>

        {/* Column totals */}

        {columnTotals.map((total, index) => (
          <td
            key={index}
            className=" lg:px-4 lg:py-2 shadow-[0_-1px_0_var(--tw-primary)_inset]  text-center font-bold text-[11px]"
          >
            <div className="flex justify-center space-x-1">
              <span className="w-8 text-center text-[11px]">{total}</span>{" "}
              <span className="w-[5px]"></span>
              <span className="w-8 text-center text-[11px]"> </span>
              <span className="w-[5px]"></span>
              <span className="w-8 text-center text-[11px]"></span>
            </div>
          </td>
        ))}
      </tr>
    </tfoot>
  );
};

const CookDropTable = forwardRef(({ initData }, ref) => {
  const { headers } = initData;
  const [editableRows, setEditableRows] = useState(initData.rows);
  const originalRows = useRef(initData.rows); // Reference to the original rows for comparison

  useImperativeHandle(ref, () => ({
    getChangedData: () => editableRows,
  }));

  return (
    <table className="lg:w-full  border-collapse table-auto select-none ">
      <CookDropTableHeader headerData={headers} />
      <EditableTable rows={editableRows} setRows={setEditableRows} />
      <CookDropTableFooter rows={editableRows} />
    </table>
  );
});

export default CookDropTable;
