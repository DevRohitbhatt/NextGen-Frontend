import React from "react";

const ForecastedSales = ({ value, onChange }) => {
    return (
        <div className='flex flex-col justify-center m-1 rounded-3xl '>
            <h3 className='mb-1 ml-2 lg:text-[14px] text-[10px] font-semibold text-nowrap'>Forecasted Sales</h3>
            <input
                onChange={onChange}
                value={`$${value ? value : ""}`}
                className='lg:px-6 lg:py23 px-2 py-2 text-left capitalize border-2 border-solid  text-nowrap rounded-3xl hover:border-[var(--tw-primary)] focus:border-[var(--tw-primary)] outline-none lg:max-w-[140px] max-w-[70px] lg:text-base text-[14px]' />
        </div>
    )
}

export default ForecastedSales;