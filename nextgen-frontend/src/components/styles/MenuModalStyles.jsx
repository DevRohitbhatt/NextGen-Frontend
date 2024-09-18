import styled from "styled-components";

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
  padding: 0px 14px;
`;
export const PopupContainer = styled.div`
  grid-column-gap: 20px;
  display: grid;
  grid-template-columns: 50fr;
  margin-top: 10px;
`;
export const LeftUnitList = styled.div`
  color: #000;
  font-weight: 400;
  font-size: 12px;
`;
export const InputGroup = styled.div`
  position: relative;
`;
export const RightUnitList = styled.div`
  display: block;
  color: #000;
  font-weight: 400;
  font-size: 12px;
  padding: 10px 0px;
  border-radius: 4px;
  margin-top: 13px;
  padding: 10px;
  min-height: 24px;
`;
export const Span = styled.span`
  background: ${(props) => props.theme.primary};
  display: block;
  text-align: center;
  color: #fff;
  border-radius: 4px;
  margin-top: -9px;
  padding: 10px;
  min-height: 18px;
`;
export const UnitContainer = styled.div`
  border: 0.25px solid #808285;
  border-radius: 8px;
  margin: 10px 0px;
  overflow-y: scroll;
  height: 233px;

  &::-webkit-scrollbar {
    background: #ffffff;
    width: 15px;
    height: 15px;
    cursor: pointer;
    border: 14px solid #fff;
    outline: 0.25px solid #808285;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.primary};
    border-radius: 30px;
    padding: 18px !important;
    border: 2px solid #fff;
    cursor: pointer;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${(props) => props.theme.secondary};
  }
`;

export const UnitList = styled.ul`
  list-style: none;
  padding: 0px;
  margin: 0px;
`;

export const UnitListItem = styled.li`
  padding: 4px 10px 4px 10px;
  cursor: pointer;
  border-bottom: 0.25px solid
    ${(props) => (props.$isArea ? "#fff" : props.theme.lightGrey)};
  background: ${(props) =>
    props.$isActive
      ? props.theme.primary
      : props.$isArea
      ? props.theme.lightGrey
      : "#fff"};
  color: ${(props) => (props.$isActive ? "#fff" : "#000")};
`;

export const MenuHeader = styled.div`
    position: sticky;
    top: 0px;
    background-color: rgb(255, 255, 255);
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr 2fr 3fr 1fr;
    font-weight: bold;
    // padding-bottom: 10px;
    padding-top: 15px;
`;
