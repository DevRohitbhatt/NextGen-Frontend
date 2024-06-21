import styled from "styled-components";
import  { FaFileExcel, FaFileCsv, FaFilePdf, FaRegSave, FaArrowUp } from "react-icons/fa";
import { MdQuestionMark, MdLibraryAdd } from "react-icons/md";
import { BsBoxArrowInRight } from "react-icons/bs";
import { LuPrinter, LuSaveAll } from "react-icons/lu";
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

const OptionButton = styled.button`
  all: unset;
  margin-left: 10px;
  padding: 10px 20px;
  border-radius: 15px;
  border: 2px solid ${(props) => props.theme.primary};
  color: ${(props) => props.theme.primary};
  position: relative;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.primary};
    border: 2px solid ${(props) => props.theme.primary};
    color: white;
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

const SaveIcon = styled(FaRegSave)`
  color: ${(props) => props.theme.primary};
  width: 40px;
  height: 40px;
`;
const SubmitIcon = styled(BsBoxArrowInRight)`
  color: ${(props) => props.theme.primary};
  width: 40px;
  height: 40px;
`;

const HelpIcon = styled(MdQuestionMark)`
  color: ${(props) => props.theme.primary};
  width: 40px;
  height: 40px;
`;

const AddIcon = styled(MdLibraryAdd)`
  color: ${(props) => props.theme.primary};
  width: 40px;
  height: 40px;
`

ExportOptions.propTypes = {
  includeExcel: PropTypes.bool,
  includePDF: PropTypes.bool,
  includeCSV: PropTypes.bool,
  includePrint: PropTypes.bool,
  includeSave: PropTypes.bool,
  includeSubmit: PropTypes.bool,
  handlePDFClick: PropTypes.func,
  handleExcelClick: PropTypes.func,
  handleCSVClick: PropTypes.func,
  handlePrintClick: PropTypes.func,
  handleSaveClick: PropTypes.func,
  handleSubmitClick: PropTypes.func,
};

export default function ExportOptions({ 
  includeExcel,
  includePDF, 
  includeCSV, 
  includePrint, 
  includeSave, 
  includeHelp,
  includeSubmit,
  includeAdd, 
  handlePDFClick, 
  handleExcelClick, 
  handleCSVClick, 
  handlePrintClick, 
  handleSaveClick, 
  handleHelpClick, 
  handleSubmitClick,
  handleAddClick
  }) {

  return (
    <>
      <ExportOptionsContainer className="export-options">
        {includeExcel ? (
          <ExportOption title="Export to Excel">
            <OptionImage onClick={handleExcelClick}>
              <ExcelIcon />
            </OptionImage>
          </ExportOption>
        ) : null}
        {includePDF ? (
          <ExportOption title="Export to PDF">
            <OptionImage onClick={handlePDFClick}>
              <PDFIcon />
            </OptionImage>
          </ExportOption>
        ) : null}
        {includeCSV ? (
          <ExportOption title="Export to CSV">
            <OptionImage onClick={handleCSVClick}>
              <CSVIcon />
            </OptionImage>
          </ExportOption>
        ) : null}
        {includePrint ? (
          <ExportOption title="Print">
            <OptionImage onClick={handlePrintClick}>
              <PrintIcon />
            </OptionImage>
          </ExportOption>
        ) : null}
        {includeSave ? (
          <ExportOption className="save-option" title="Save">
            <OptionImage onClick={handleSaveClick}>
              <SaveIcon />
            </OptionImage>
          </ExportOption>
        ) : null}
        {includeSubmit ? (
          <ExportOption className="submit-option" title="Submit">
            <OptionImage onClick={handleSubmitClick}>
              <SubmitIcon />
            </OptionImage>
          </ExportOption>
        ) : null}
        {includeHelp ? (
          <ExportOption className="help-option" title="Help">
            <OptionImage onClick={handleHelpClick}>
              <HelpIcon />
            </OptionImage>
          </ExportOption>
        ) : null}
        {includeAdd ? (
          <ExportOption className="add-option" title="Add New">
            <OptionImage onClick={handleAddClick}>
              <AddIcon />
            </OptionImage>
          </ExportOption>
        ) : null}
      </ExportOptionsContainer>
    </>
  );
}
