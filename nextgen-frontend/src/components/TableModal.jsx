import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Table from "./SimpleTable";
import styled from "styled-components"; 

const ModalContent = styled.div`
  padding: 20px;
  max-height: 75vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    background: #ffffff;
    width: 15px;
    height: 15px;
    cursor: pointer;
    border: 14px solid #fff;
    outline: 0.25px solid #808285;
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

export default function TableModal({ show, setShow, handleClose, data, tableHeaders, title, onRowClick }) {


  return (
    <Modal isOpen={show} setIsOpen={setShow} onClose={handleClose} title={title}>
      <ModalContent>
        <Table
          headers={tableHeaders}
          data={data}
          onRowClick={onRowClick}
        />
      </ModalContent>
    </Modal>
  );
};
