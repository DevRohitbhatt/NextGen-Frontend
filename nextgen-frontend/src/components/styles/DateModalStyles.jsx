import styled from 'styled-components';

export const ModalOverlay = styled.div`
  position: fixed;
  width: 500px;
  height: auto;
  background-color: #fff;
  display: block;
  z-index: 9;
  border-radius: 8px;
  box-shadow: 0px 0px 10px #00000047;
  overflow: hidden;
  left: 38%;
  top: 6%;
  width: ${(props) => props.$isDateRange ? '' : '380px !important'};

  ${props => props.$isDateRange && `
    .ciFebe {
      padding: 0px;
    }
    .react-calendar__navigation {
      background: #efefef;
      margin-bottom: 10px;
    }
  `}

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
    max-height: 50vh;
  }
  .react-calendar__navigation {
    display: flex;
    height: 44px;
    margin-bottom: 1em;
    background-color: ${(props) => props.theme.primary};;
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
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    margin-top: 20px;
  }

  .CalendarTable::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.primary};;
    border-radius: 30px;
    padding: 18px !important;
    border: 2px solid #fff;
    cursor: pointer;
  }
  .CalendarTable::-webkit-scrollbar-button:start:decrement {
    height: 60px;
    width: 0;
    background: rgb(255, 255, 255);
  }  

  button.react-calendar__navigation__arrow.react-calendar__navigation__prev2-button, button.react-calendar__navigation__arrow.react-calendar__navigation__next2-button {
    font-size: 35px;
    padding: 0px;
    height: 10px;
    color: ${(props) => props.theme.white};;
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
    color: ${(props) => props.theme.white};;
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
    background: ${(props) => props.theme.primary};;
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
    background: ${(props) => props.theme.primary};
    color: white;
    border-radius: 50px;
  }
  .react-calendar__tile--hasActive:enabled:hover, .react-calendar__tile--hasActive:enabled:focus {
    background: ${(props) => props.theme.primary}; 
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

export const ModalContent = styled.div`
  background: ${(props) => props.theme.primary};
  color: #fff;
  padding: 10px 14px;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 6px;
  right: 12px;
  background-color: transparent;
  cursor: pointer;
  color: #fff;
  border: 0.25px solid #fff;
  padding: 3px;
  border-radius: 0px;
  padding-bottom: 0;
`;
export const ModalDialog = styled.div`
  position: fixed;
  background: #00000073;
  width: 100%;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 9;
`;
export const FooterButton = styled.button`
  box-shadow: inset 0 0 0 2px ${(props) => props.theme.primary};
  transition: color 0.25s 0.0833333333s;
  position: relative;
  border-radius: 0px;
  width: 110px;

  &::after {
    border: 0 solid transparent;
    box-sizing: border-box;
    content: "";
    pointer-events: none;
    position: absolute;
    width: 0;
    height: 0;
    bottom: 0;
    right: 0;
    border-top-width: 2px;
    border-right-width: 2px;
  }
  &::before {
    border: 0 solid transparent;
    box-sizing: border-box;
    content: "";
    pointer-events: none;
    position: absolute;
    width: 0;
    height: 0;
    bottom: 0;
    right: 0;
    border-bottom-width: 2px;
    border-left-width: 2px;
  }
  &:hover::after {
    border-color: #fff;
    transition: border-color 0s, width 0.25s, height 0.25s;
    width: 100%;
    height: 100%;
    transition-delay: 0s, 0.25s, 0s;
  }
  &:hover::before {
    border-color: #fff;
    transition: border-color 0s, width 0.25s, height 0.25s;
    width: 100%;
    height: 100%;
    transition-delay: 0s, 0s, 0.25s;
  }
  &:hover {
    border-color: transparent;
    color: #fff;
    background: ${(props) => props.theme.primary};
  }
`;
export const ModalFooter = styled.div`
  background: #efefef;
  display: flex;
  justify-content: center;
  gap: 11px;
  padding: 0.75rem;
`;
export const ModalBody = styled.div`
  // padding: 0px 14px;
`;
export const InputBox = styled.input`
  width: 130px;
  height: 27px;
  background: #e6e7e8;
  border: none;
  padding-left: 7px;
  color: #000;
  font-weight: 500;
`;
export const Label = styled.label`
  font-weight: bold;
  font-size: 12px;
`;
export const CalendarTop = styled.div`
  display: grid;
  grid-template-columns: 33.3fr 33.3fr 33.3fr;
`;