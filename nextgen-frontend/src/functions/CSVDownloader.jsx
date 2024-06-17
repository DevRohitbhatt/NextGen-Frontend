import React from 'react';

const CSVDownloader = ({ csvContent }) => {
  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    if (navigator.msSaveBlob) {
      // For Internet Explorer 10+
      navigator.msSaveBlob(blob, "export.csv");
    } else {
      const link = document.createElement("a");
      if (link.download !== undefined) {
        // Create a link element
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "export.csv");

        // Append the link to the body, trigger the download, and remove the link
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Release the object URL
        URL.revokeObjectURL(url);
      } else {
        console.error("Anchor element with 'download' attribute not supported in this browser.");
      }
    }
  };

  return handleDownload;
};

export default CSVDownloader;
