import React from "react";

const ForcastedSales = ({ value, onChange }) => {
    return (
        <div className='flex flex-col justify-center m-1 rounded-3xl '>
            <h3 className='mb-1 ml-2 text-xl font-semibold text-nowrap'>Forcasted Sales</h3>
            <input
                onChange={onChange}
                value={value ? value : ""}
                className='px-6 py-3 text-left capitalize border-2 border-solid  text-nowrap rounded-3xl hover:border-[var(--tw-primary)] focus:border-[var(--tw-primary)] outline-none' />
        </div>
    )
}

export default ForcastedSales;