export default function VendorSelector({
  onClick,
  vendorName,
  setVendorName,
  vendorID,
  formVersion,
  isEditable = true,
  isInvalid = false,
}) {
  return (
    <>
      {formVersion ? (
        <div
          onClick={onClick}
          className="w-full rounded-md cursor-pointer"
        >
          <div
            className={`whitespace-nowrap rounded-md border-2 px-8 py-2 text-center ${
              isInvalid
                ? 'border-red-500'
                : 'border-gray-200'
            } hover:border-[var(--tw-primary)]`}
          >
            {vendorName}
          </div>
        </div>
      ) : (
        <div
          onClick={isEditable ? onClick : () => {}}
          className="flex flex-col justify-center rounded-3xl mx-1 vendor-selector"
        >
          <div className="mb-1 ml-2 text-xl font-semibold text-nowrap">
            {isEditable ? 'Select Vendor(s)' : 'Vendor'}
          </div>
          <div
						className={`px-6 py-3 text-center capitalize border-2 border-solid  text-nowrap rounded-3xl ${
							isEditable ? ' hover:border-[var(--tw-primary)] cursor-pointer' : 'border-[#D3D3D3] bg-gray-200 hover:border-[#d3d3d3]'
						}`}
          >
            {vendorName}
          </div>
        </div>
      )}
    </>
  );
}
