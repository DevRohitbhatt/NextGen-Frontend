import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Modal, SimpleTable } from '../index';
import * as suggestedOrderFunctions from '../../functions/suggestedOrderFunctions';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { postCall } from '../../apis/network';

const FormRow = styled.div`
	display: flex;
	justify-content: space-between;
	margin: 20px;
	align-items: center;

	${(props) => props.$isDisabled && `display: none;`}
`;

const SubmitModalText = styled.div``;

const SubmitModalButtonContainer = styled.div`
	display: flex;
	justify-content: center;
`;

const LeftButton = styled.div`
	all: unset;
	margin-left: 10px;
	padding: 5px 10px;
	border-radius: 20px 0 0 20px;
	border: 2px solid ${(props) => props.theme.primary};
	color: ${(props) => props.theme.primary};
	position: relative;
	cursor: pointer;
	transition: all 0.25s ease;

	${(props) =>
		props.$isSelected &&
		`
    background-color: ${props.theme.primary};
    color: white;
  `}
`;

const RightButton = styled.div`
	all: unset;
	padding: 5px 10px;
	border-radius: 0 20px 20px 0;
	border: 2px solid ${(props) => props.theme.primary};
	color: ${(props) => props.theme.primary};
	position: relative;
	cursor: pointer;
	transition: all 0.25s ease;

	${(props) =>
		props.$isDisabled &&
		`
    background-color: ${props.theme.grayColor};
    color: ${props.theme.grey};
    cursor: not-allowed;
  `}

	${(props) =>
		props.$isSelected &&
		`
    background-color: ${props.theme.primary};
    color: white;
  `}
`;

const SubmitButton = styled.button`
	all: unset;
	padding: 10px 20px;
	border-radius: 15px;
	border: 2px solid ${(props) => props.theme.primary};
	color: ${(props) => props.theme.primary};
	position: relative;
	cursor: pointer;
	transition: all 0.25s ease;

	&:hover {
		background-color: ${(props) => props.theme.primary};
		border: 2px solid ${(props) => props.theme.primary};
		color: white;
	}
`;

export default function SubmitPurchaseOrderModal({ isOpen, onClose, orderData, vendorIsIntegrated, vendorName }) {
	const [isPDFSelected, setIsPDFSelected] = useState(true);
	const [isCSVSelected, setIsCSVSelected] = useState(false);
	const [isVendorItemRefSelected, setIsVendorItemRefSelected] = useState(true);
	const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);
	const [orderDetails, setOrderDetails] = useState([]);
	const [submitOrderToVendor, setSubmitOrderToVendor] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		if (orderData.suggestedOrderDetails.length === 0) return;
		const data = formatPreviewData(orderData.suggestedOrderDetails);
		setOrderDetails(data);
	}, [orderData, isOpen]);

	useEffect(() => {
		if (orderDetails.length > 0) {
			console.log('orderDetails', orderDetails);

			setIsPreviewLoaded(true);
		} else {
			setIsPreviewLoaded(false);
		}
	}, [orderDetails]);

	useEffect(() => {
		if (vendorIsIntegrated) {
			setSubmitOrderToVendor(true);
		} else {
			setSubmitOrderToVendor(false);
		}
	}, [vendorIsIntegrated]);

	const tableHeaders = [
		{
			key: 'vendorItemDescription',
			label: 'Item Description',
			cellType: 'string',
		},
		{ key: 'vendorItemReference', label: 'Item Ref', cellType: 'string' },
		{ key: 'vendorItemUOM', label: 'Order Unit', cellType: 'string' },
		{ key: 'vendorItemPackSize', label: 'Pack Size', cellType: 'string' },
		{ key: 'quantity', label: 'Order Amount', cellType: 'string' },
	];

	const formatPreviewData = (data) => {
		return data
			.flatMap((detail) =>
				detail.suggestedOrderItem.flatMap((inventoryItem) => {
					const selectedVendorItem = inventoryItem.vendorItems.find((vendorItem) => vendorItem?.isSelected);
					return {
						vendorItemDescription: selectedVendorItem.description,
						vendorItemReference: selectedVendorItem.vendorItemReference,
						vendorItemUOM: selectedVendorItem.unitOfMeasure,
						vendorItemPackSize: selectedVendorItem.packSize,
						quantity: selectedVendorItem.orderQty,
					};
				})
			)
			.sort((a, b) => a.vendorItemReference.localeCompare(b.vendorItemReference));
	};

	const updateExportType = () => {
		setIsPDFSelected(!isPDFSelected);
		setIsCSVSelected(!isCSVSelected);
	};

	const formatFileName = () => {
		const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
		const [month, day, year] = orderData.orderFromDate.toLocaleDateString('en-US', dateOptions).split('/');

		return `Order_${vendorName}_${month}_${day}_${year}`;
	};

	const handleSubmit = async () => {
		toast.info('Submitting Suggested Order...', {
			autoClose: false,
			toastId: 'submit-toast',
		});

		if (orderData.suggestedOrderDetails.length === 0) {
			toast.update('submit-toast', {
				render: 'No items to submit',
				type: 'error',
				autoClose: 3000,
			});
			return;
		}

		try {
			const newOrderData = {
				...orderData,
				submitOrderToVendor,
			};

			console.log('newOrderData', newOrderData);

			const postData = {
				url: 'submitSuggestedOrder',
				urlParams: {
					companyID: orderData.companyID,
				},
				bodyData: newOrderData,
			};

			await postCall(postData);
			toast.update('submit-toast', {
				render: 'Suggested Order Submitted',
				type: 'success',
				autoClose: 3000,
			});
			onClose();
			if (isPDFSelected) {
				suggestedOrderFunctions.submitSuggestedOrderPDF(orderDetails);
			} else {
				suggestedOrderFunctions.submitSuggestedOrderCSV(orderDetails, formatFileName());
			}

			navigate('/SuggestedOrderList');
		} catch (error) {
			toast.update('submit-toast', {
				render: 'Error submitting Suggested Order',
				type: 'error',
				autoClose: 3000,
			});
			console.error('Error submitting Suggested Order', error);
			onClose();
		}
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={onClose} onClose={onClose} title='Submit Suggested Order'>
			<div className='flex w-full '>
				<div className='px-4 '>
					<div className='flex items-center justify-between m-5 ' onClick={updateExportType}>
						<div>How would you like to submit the Suggested Order?</div>
						<div className='flex justify-center '>
							<div
								className={` my-auto ml-2 px-3 py-1 rounded-s-full border-2 border-[var(--tw-primary)] text-[var(--tw-primary)] relative cursor-pointer transition-all  ${
									isPDFSelected && `bg-[var(--tw-primary)] text-white`
								}`}
							>
								PDF
							</div>
							<div
								className={` my-auto px-3 py-1 rounded-e-full border-2 border-[var(--tw-primary)] text-[var(--tw-primary)] relative cursor-pointer transition-all  ${
									isCSVSelected && `bg-[var(--tw-primary)] text-white`
								}`}
							>
								CSV
							</div>
						</div>
					</div>
					{vendorIsIntegrated && (
						<div className='ml-7'>
							<label className='inline-flex items-center cursor-pointer'>
								<input
									type='checkbox'
									value=''
									checked={submitOrderToVendor}
									onChange={() => setSubmitOrderToVendor(!submitOrderToVendor)}
									className='sr-only peer'
								/>
								<div className="relative w-7 h-4 bg-gray-200 peer-focus:outline-none    rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all  peer-checked:bg-[var(--tw-primary)] "></div>
								<span className='ml-2 font-medium'>Submit Order to Vendor</span>
							</label>
						</div>
					)}
					<FormRow $isDisabled={true}>
						<SubmitModalText>How would you like to sort the order?</SubmitModalText>
						<SubmitModalButtonContainer>
							<LeftButton $isSelected={isVendorItemRefSelected}>Vendor Item Ref #</LeftButton>
							<RightButton $isDisabled={true}>Countsheet</RightButton>
						</SubmitModalButtonContainer>
					</FormRow>
					{!isPreviewLoaded ? (
						<div className='w-full m-auto text-xl text-center '>Loading Preview</div>
					) : (
						<div className=''>
							<SimpleTable headers={tableHeaders} data={orderDetails} />
						</div>
					)}
					<div className='flex items-center justify-between m-5 '>
						<div></div>
						<SubmitButton onClick={handleSubmit}>Submit</SubmitButton>
					</div>
				</div>
			</div>
		</Modal>
	);
}
