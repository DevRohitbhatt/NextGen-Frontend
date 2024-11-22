import React from "react";

const HoverBorderButton = (props) => {

    return (
        <button
            className={`relative rounded-none border border-[var(--tw-primary)] shadow-[inset_0_0_0_1px_var(--tw-primary)] xl:m-w-[110px] transition-colors duration-[0.25s] delay-[0.0833s] hover:bg-[var(--tw-primary)] hover:text-white tailwind-button mr-[20px] my-[20px] justify-end xl:text-nowrap ${props.extraClass ? props.extraClass : ""}`}
            onClick={(e) => { props.onClick(e) }}
        >
            {props.children}
        </button>
    )
}

export default HoverBorderButton;