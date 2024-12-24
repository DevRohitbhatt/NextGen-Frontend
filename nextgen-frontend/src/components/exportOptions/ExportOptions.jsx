import { FaFileExcel, FaFileCsv, FaFilePdf, FaRegSave } from "react-icons/fa";
import { MdQuestionMark, MdLibraryAdd } from "react-icons/md";
import { BsBoxArrowInRight } from "react-icons/bs";
import { LuPrinter } from "react-icons/lu";
import PropTypes from "prop-types";

const ExportButton = ({ isInclude, handleClick, iconName, title, className }) => {
  return (
    <div
      className={`
				${className}
				p-2 border-2 flex justify-center items-center border-solid w-[40px] h-[40px] border-[var(--tw-primary)] text-4xl rounded-full hover:bg-[var(--tw-primary)] text-[var(--tw-primary)] hover:text-white cursor-pointer ${
					isInclude ? "block" : "hidden"
				}`
			}
      title={title}
      onClick={handleClick}
    >
      {iconName}
    </div>
  );
};

ExportButton.propTypes = {
  isInclude: PropTypes.bool,
  handleClick: PropTypes.func,
  iconName: PropTypes.node,
  title: PropTypes.string,
};

export default function ExportOptions(props) {
  const buttonsConfig = [
    {
      include: props.includeHelp,
      onClick: props.handleHelpClick,
      icon: <MdQuestionMark />,
      title: "Help",
			className: "help-option",
    },
    {
      include: props.includeExcel,
      onClick: props.handleExcelClick,
      icon: <FaFileExcel />,
      title: "Export to Excel",
      className: "excel-option",
    },
    {
      include: props.includeCSV,
      onClick: props.handleCSVClick,
      icon: <FaFileCsv />,
      title: "Export to CSV",
			className: "csv-option",
    },
    {
      include: props.includePDF,
      onClick: props.handlePDFClick,
      icon: <FaFilePdf />,
      title: "Export to PDF",
			className: "pdf-option",
    },
    {
      include: props.includePrint,
      onClick: props.handlePrintClick,
      icon: <LuPrinter />,
      title: "Print",
			className: "print-option",
    },
    {
      include: props.includeSave,
      onClick: props.handleSaveClick,
      icon: <FaRegSave />,
      title: "Save",
			className: "save-option",
    },
    {
      include: props.includeSubmit,
      onClick: props.handleSubmitClick,
      icon: <BsBoxArrowInRight />,
      title: "Submit",
			className: "submit-option",
    },
    {
      include: props.includeAdd,
      onClick: props.handleAddClick,
      icon: <MdLibraryAdd />,
      title: "Create New",
			className: "add-option",
    },
  ];

  return (
    <div className="flex items-center justify-end w-full space-x-3 export-options">
      {buttonsConfig.map((btn, index) => (
        <ExportButton
          key={index}
          isInclude={btn.include}
          handleClick={btn.onClick}
          iconName={btn.icon}
          title={btn.title}
					className={btn.className}
        />
      ))}
    </div>
  );
}

ExportOptions.propTypes = {
  includeExcel: PropTypes.bool,
  includePDF: PropTypes.bool,
  includeCSV: PropTypes.bool,
  includePrint: PropTypes.bool,
  includeSave: PropTypes.bool,
  includeHelp: PropTypes.bool,
  includeSubmit: PropTypes.bool,
  includeAdd: PropTypes.bool,
  handlePDFClick: PropTypes.func,
  handleExcelClick: PropTypes.func,
  handleCSVClick: PropTypes.func,
  handlePrintClick: PropTypes.func,
  handleSaveClick: PropTypes.func,
  handleHelpClick: PropTypes.func,
  handleSubmitClick: PropTypes.func,
  handleAddClick: PropTypes.func,
};
