import React from 'react';
import styled from 'styled-components';
import { FaRegWindowClose } from 'react-icons/fa';

const ModalContainer = styled.div`
	display: ${(props) => (props.isOpen ? 'block' : 'none')};
	position: fixed;
	z-index: 10;
	padding-top: 100px;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	overflow: auto;
	background-color: rgba(0, 0, 0, 0.4);
`;

const ModalContent = styled.div`
	background-color: #fefefe;
	margin: auto;
	border: 1px solid #888;
	width: max-content;
	max-width: 80%;
	border-radius: 15px;
`;

const ModalHeader = styled.div`
	padding: 10px;
	background-color: ${(props) => props.theme.primary};
	color: white;
	font-weight: 600;
	font-size: 20px;
	border-top-left-radius: 15px;
	border-top-right-radius: 15px;
`;

const CloseButton = styled(FaRegWindowClose)`
	color: white;
	float: right;
	font-size: 28px;
	font-weight: bold;

	&:hover {
		color: ${(props) => props.theme.secondary};
	}
`;

export default function Modal({ children, isOpen, setIsOpen, onClose, title }) {
	return isOpen ? (
		<ModalContainer isOpen={isOpen}>
			<ModalContent>
				<ModalHeader>
					{title}
					<CloseButton onClick={onClose} />
				</ModalHeader>
				{children}
			</ModalContent>
		</ModalContainer>
	) : null;
}
