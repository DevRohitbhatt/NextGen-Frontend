import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { FaTimes } from "react-icons/fa";
import { ModalHeader } from "react-bootstrap";

const ModalOverlay = styled.div`
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

const ModalContent = styled.div`
  // background-color: white;
  // padding: 20px;
  // border-radius: 8px;
  // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  background: #364790;
  color: #fff;
  padding: 10px 14px;
`;

const CloseButton = styled.button`
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
const ModalDialog = styled.div`
  position: fixed;
  background: #00000073;
  width: 100%;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 9;
`;
const FooterButton = styled.button`
  box-shadow: inset 0 0 0 2px #364790;
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
&:hover{
  border-color: transparent;
  color: #fff;
    background: #364790;
}

`;
const ModalFooter = styled.div`
  background: #efefef;
  display: flex;
  justify-content: center;
  gap: 11px;
  padding: 0.75rem;
`;
const ModalBody = styled.div`
  padding: 0px 14px;
`;

const Modal = ({ show, handleClose, children }) => {
  // Render nothing if the "show" prop is false
  if (!show) {
    return null;
  }

  return (
    <ModalDialog>
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <h4>Select a Unit or Area</h4>
            <CloseButton onClick={handleClose}>
              <FaTimes className="close" />
            </CloseButton>
          </ModalHeader>
        </ModalContent>
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <FooterButton onClick={handleClose}>Ok</FooterButton>
          <FooterButton onClick={handleClose}>Cancel</FooterButton>
        </ModalFooter>
      </ModalOverlay>
    </ModalDialog>
  );
};

Modal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default Modal;
