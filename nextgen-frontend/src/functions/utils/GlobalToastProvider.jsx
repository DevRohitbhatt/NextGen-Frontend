// src/GlobalToastProvider.js
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const notify = (message, options = {}) => {
  toast(message, { ...options });
};

const GlobalToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
};

export { GlobalToastProvider, notify };
