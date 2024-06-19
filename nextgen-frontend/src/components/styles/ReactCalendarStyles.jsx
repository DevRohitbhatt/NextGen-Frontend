import styled from "styled-components";

export const CalendarContainer = styled.div`
    .react-calendar {
    width: 350px;
    max-width: 100%;
    background: white;
    border: 1px solid #a0a096;
    font-family: Arial, Helvetica, sans-serif;
    line-height: 1.125em;
    position: fixed !important;
    z-index: 9 !important;
    }
    .CalendarTable {
    border: none !important;
    border-radius: 4px !important;
    margin-top: 14px;
    margin-bottom: 1rem;
    color: #212529;
    vertical-align: top;
    border: 0.25px solid;
    padding: 0 !important;
    width: 100% !important;
    overflow: hidden;
    border-color: #808285;
    box-shadow: none;
    overflow-y: scroll;
    height: 298px !important;
    }
    .react-calendar__navigation {
    display: flex;
    height: 44px;
    margin-bottom: 1em;
    background-color: #364790;
    color: #fff;
    }
    .react-calendar__navigation button {
    min-width: 44px;
    background: none;
    color: #fff;
    }
    .react-calendar__navigation button:enabled:hover {
    background-color: transparent;
    }
    .CalendarTable [columnwidths="1.5fr 2fr 2fr"]:nth-child(1) {
    text-align: left;
    border-color: #808285;
    border-bottom: 0.25px solid #808285 !important;
    padding-bottom: 0;
    font-size: 12px;
    padding-top: 0;
    margin-bottom: 0px;
    position: sticky;
    top: 0;
    background: #fff;
    }
    .CalendarTable [columnwidths="1.5fr 2fr 2fr"] div:first-child {
    border: none;
    }
    .CalendarTable [columnwidths="1.5fr 2fr 2fr"] div {
    padding: 5px 4px;
    border-left: 0.25px solid #808285;
    border-bottom: 0px;
    font-size: 14px;
    }
    .CalendarTable [columnwidths="1.5fr 2fr 2fr"] {
    padding: 0px;
    border-bottom: 0px !important;
    }
    .CalendarTable [columnwidths="1.5fr 2fr 2fr"]:nth-child(even) {
    background-color: #efefef;
    border-bottom: 0px;
    }
    .CalendarTable::-webkit-scrollbar {
    background: #ffffff;
    width: 15px;
    height: 15px;
    cursor: pointer;
    border: 14px solid #fff;
    outline: 0.25px solid #808285;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    }

    .CalendarTable::-webkit-scrollbar-thumb {
    background: #364790;
    border-radius: 30px;
    padding: 18px !important;
    border: 2px solid #fff;
    cursor: pointer;
    }
    .CalendarTable::-webkit-scrollbar-button:vertical:decrement {
    height: 32px;
    width: 0;
    background: rgb(255, 255, 255);
    border-bottom: 0.25px solid #808285;
    }
    button.react-calendar__navigation__arrow.react-calendar__navigation__prev2-button, button.react-calendar__navigation__arrow.react-calendar__navigation__next2-button {
    font-size: 35px;
    padding: 0px;
    height: 10px;
    color: #dce159;
    }
    button.react-calendar__navigation__arrow.react-calendar__navigation__prev2-button:focus-visible, button.react-calendar__navigation__arrow.react-calendar__navigation__next2-button:focus-visible {
    outline: none !important;
    background:none !important;
    }
    button.react-calendar__navigation__arrow.react-calendar__navigation__prev2-button:focus, button.react-calendar__navigation__arrow.react-calendar__navigation__next2-button:focus {
    outline: none !important;
    background:none !important;
    }
    button.react-calendar__navigation__arrow.react-calendar__navigation__prev-button:focus-visible, button.react-calendar__navigation__arrow.react-calendar__navigation__next-button:focus-visible {
    outline: none !important;
    background:none !important;
    }
    button.react-calendar__navigation__arrow.react-calendar__navigation__prev-button:focus, button.react-calendar__navigation__arrow.react-calendar__navigation__next-button:focus {
    outline: none !important;
    background:none !important;
    }
    button.react-calendar__navigation__arrow.react-calendar__navigation__prev-button, button.react-calendar__navigation__arrow.react-calendar__navigation__next-button {
    font-size: 35px;
    padding: 1px;
    height: 0;
    color: #dce159;
    position: relative;

    }
    .react-calendar__tile--now:enabled:hover, .react-calendar__tile--now:enabled:focus {
    background: transparent;
    }
    button.react-calendar__navigation__label {
    outline: none;
    background: transparent !important;
    }
    button.react-calendar__tile.react-calendar__year-view__months__month {
    border-radius: 0;
    padding: 8px 0px;
    }
    .react-calendar__tile--hasActive {
    background: #364790;
    color: #fff;
    }
    .react-calendar__decade-view__years button {
    padding: 8px !important;
    border-radius: 0;
    }
    .react-calendar__century-view__decades button {
    padding: 8px !important;
    border-radius: 0;
    }
    .react-calendar__tile--now {
    background: #efefef;
    border-radius: 50px;
    color:#000;
    }
    .react-calendar__tile--active {
    background: #364790 ! IMPORTANT;
    color: white;
    border-radius: 50px;
    }
    .react-calendar__tile--hasActive:enabled:hover, .react-calendar__tile--hasActive:enabled:focus {
    background: #364790 !important;
    color: #fff;
    }
    .SingleCalendar .react-calendar {
    width: 100%;
    max-width: 100%;
    background: white;
    border: 0px !important;
    line-height: 1.125em;
    position: relative !important;
    z-index: 9 !important;
    }
    .SingleModal {
    width: 380px !important;
    }
    .SingleModal .ciFebe {
    padding: 0px;
    }
    .SingleModal .react-calendar__navigation {
    background: #efefef;
    margin-bottom: 10px;
    }
    .SingleModal button.react-calendar__navigation__arrow.react-calendar__navigation__prev2-button, button.react-calendar__navigation__arrow.react-calendar__navigation__next2-button {
    color: #000  !important;
    }
    .SingleModal button.react-calendar__navigation__arrow.react-calendar__navigation__prev-button, button.react-calendar__navigation__arrow.react-calendar__navigation__next-button {
    color: #000  !important;
    }
    .SingleModal .react-calendar__navigation button {
    color: #000  !important;
    }
    .react-calendar__viewContainer {
    width: 95%;
    margin: 0 auto;
    margin-bottom: 10px;
    }
    .react-calendar button {
    padding: 5px 0px;
    border-radius: 0px !important;
    }
    .react-calendar button:focus-visible, :focus {
    outline: 0px !important;
    }
`;