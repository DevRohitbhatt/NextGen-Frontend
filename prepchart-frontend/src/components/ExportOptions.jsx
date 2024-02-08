import styled from "styled-components";
import  { FaFileExcel, FaFileCsv, FaFilePdf } from "react-icons/fa";
import { LuPrinter } from "react-icons/lu";
import PropTypes from "prop-types";

const ExportOptionsContainer = styled.div`
  display: flex;
  justify-content: end;
  margin: auto;
  width: 100%;
`;

const ExportOption = styled.div`
  margin-left: 10px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid ${(props) => props.theme.primary};
  position: relative;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.primary};
    
    svg {
      color: white;
    }
  }
`;

const OptionImage = styled.div`
  position: absolute;
  top: 15%;
  width: 100%;
  text-align: center;
`;

const ExcelIcon = styled(FaFileExcel)`
  color: ${(props) => props.theme.primary};
  width: 40px;
  height: 40px;
`;

const PDFIcon = styled(FaFilePdf)`
  color: ${(props) => props.theme.primary};
  width: 40px;
  height: 40px;
`;

const CSVIcon = styled(FaFileCsv)`
  color: ${(props) => props.theme.primary};
  width: 40px;
  height: 40px;
`;

const PrintIcon = styled(LuPrinter)`
  color: ${(props) => props.theme.primary};
  width: 40px;
  height: 40px;
`;

ExportOptions.propTypes = {
  includeExcel: PropTypes.bool,
  includePDF: PropTypes.bool,
  includeCSV: PropTypes.bool,
  includePrint: PropTypes.bool,
  handlePDFClick: PropTypes.func,
  handleExcelClick: PropTypes.func,
  handleCSVClick: PropTypes.func,
  handlePrintClick: PropTypes.func,
};

export default function ExportOptions({ includeExcel, includePDF, includeCSV, includePrint, handlePDFClick, handleExcelClick, handleCSVClick, handlePrintClick }) {

  return (
    <>
      <ExportOptionsContainer>
        {includeExcel ? (
          <ExportOption>
            <OptionImage >
              <ExcelIcon />
            </OptionImage>
          </ExportOption>
        ) : null}
        {includePDF ? (
          <ExportOption>
            <OptionImage onClick={handlePDFClick}>
              <PDFIcon />
            </OptionImage>
          </ExportOption>
        ) : null}
        {includeCSV ? (
          <ExportOption>
            <OptionImage>
              <CSVIcon />
            </OptionImage>
          </ExportOption>
        ) : null}
        {includePrint ? (
          <ExportOption>
            <OptionImage onClick={handlePrintClick}>
              <PrintIcon />
            </OptionImage>
          </ExportOption>
        ) : null}
      </ExportOptionsContainer>
    </>
  );
}
