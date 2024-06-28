import PropTypes from "prop-types";
import Cell from './SimpleTableCell';
import styled from "styled-components";

const TableRow = styled.tr`
  border-bottom: 1px solid #ddd;
  &:last-child {
    border-bottom: none;
  }
`;

const ClickableRow = ({headers, item, onItemClick
}) => {
  const handleRowClick = () => {
    onItemClick(item); 
  };

  return (
    <TableRow onClick={handleRowClick} style={{ cursor: 'pointer' }}>
      {headers.map((header, cellIndex) => (
        <Cell
          key={cellIndex}
          value={item[header.key]}
          cellType={header.cellType}
        />
      ))}
    </TableRow>
  );
};

ClickableRow.propTypes = {
  headers: PropTypes.array, 
  item: PropTypes.object.isRequired,
  onItemClick: PropTypes.func
};

export default ClickableRow;