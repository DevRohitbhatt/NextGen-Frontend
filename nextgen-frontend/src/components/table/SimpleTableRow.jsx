import PropTypes from 'prop-types';
import { SimpleTableCell as Cell } from '../index.js';
import styled from 'styled-components';

const TableRow = styled.tr`
	border-bottom: 1px solid #ddd;
	${(props) => props.$isActive && `background: ${props.theme.primary}; color: white;`}
	${(props) => props.$isDisabled && `background: ${props.theme.lightGrey}; color: black;`}
  &:last-child {
		border-bottom: none;
	}

	&:hover {
		background: ${(props) => (props.$isActive ? props.theme.secondary : props.theme.lightGrey)};
		color: ${(props) => (props.$isActive ? 'white' : 'black')};
	}
`;

const ClickableRow = ({ headers, item, onItemClick }) => {
	let display = true;
	if (item.display !== undefined) {
		display = item.display;
	}
	const handleRowClick = () => {
		onItemClick(item);
	};

	return (
		<>
			{display ? (
				<TableRow
					onClick={handleRowClick}
					style={{ cursor: 'pointer' }}
					$isActive={item?.isActive || false}
					$isDisabled={item.disabled || false}
				>
					{headers.map((header, cellIndex) => (
						<Cell key={cellIndex} value={item[header.key]} cellType={header.cellType} row={item} />
					))}
				</TableRow>
			) : null}
		</>
	);
};

ClickableRow.propTypes = {
	headers: PropTypes.array,
	item: PropTypes.object.isRequired,
	onItemClick: PropTypes.func,
};

export default ClickableRow;
