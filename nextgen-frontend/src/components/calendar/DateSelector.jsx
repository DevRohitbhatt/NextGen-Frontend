import PropTypes from "prop-types";

export default function DateSelector({
  toDate,
  fromDate,
  onClick,
  isDateRange = false,
  isEditable = true,
  extraClass = ""
}) {
  return (
    <>
      {!fromDate || (isDateRange && !toDate) ? ( // Check if dates are undefined
        <div className={`flex flex-col justify-center m-1 rounded-3xl date-selector ${extraClass}`}>
          {isEditable ? (
            <h3 className="mb-1 ml-2 text-[18px] font-semibold text-nowrap">
              Select Date
            </h3>
          ) : (
            <h3 className="mb-1 ml-2 text-[18px] font-semibold text-nowrap">
              Date
            </h3>
          )}
          <div className="px-6 py-3 text-center capitalize border-2 border-solid cursor-pointer text-nowrap rounded-3xl bg-white">
            Loading...
          </div>
        </div>
      ) : !isDateRange ? (
        <div
          onClick={isEditable ? onClick : () => {}}
          className="flex flex-col justify-center m-1 rounded-3xl date-selector"
        >
          {isEditable ? (
            <h3 className="mb-1 ml-2 text-[18px] font-semibold text-nowrap">
              Select Date
            </h3>
          ) : (
            <h3 className="mb-1 ml-2 text-[18px] font-semibold text-nowrap">
              Date
            </h3>
          )}
          <div
            className={`px-6 py-3 text-center capitalize border-2 border-solid cursor-pointer text-nowrap rounded-3xl  ${
              isEditable
                ? " hover:border-[var(--tw-primary)]"
                : "border-[#D3D3D3] bg-gray-200 hover:border-[#d3d3d3]"
            }`}
          >
            {fromDate?.toLocaleDateString()}
          </div>
        </div>
      ) : (
        <div
          onClick={isEditable ? onClick : () => {}}
          className="flex flex-col justify-center m-1 rounded-3xl date-selector"
        >
          {isEditable ? (
            <h3 className="mb-1 ml-2 text-[18px] font-semibold text-nowrap">
              Select Date
            </h3>
          ) : (
            <h3 className="mb-1 ml-2 text-[18px] font-semibold text-nowrap">
              Date Range
            </h3>
          )}
          <div
            className={`px-6 py-3 text-center capitalize border-2 border-solid cursor-pointer text-nowrap rounded-3xl  ${
              isEditable
                ? " hover:border-[var(--tw-primary)]"
                : "border-[#D3D3D3] bg-gray-200 hover:border-[#d3d3d3]"
            }`}
          >
            {fromDate?.toLocaleDateString() +
              " - " +
              toDate?.toLocaleDateString()}
          </div>
        </div>
      )}
    </>
  );
}

DateSelector.propTypes = {
  ToDate: PropTypes.instanceOf(Date),
  FromDate: PropTypes.instanceOf(Date),
  isDateRange: PropTypes.bool,
  isEdtitable: PropTypes.bool,
  onClick: PropTypes.func,
};
