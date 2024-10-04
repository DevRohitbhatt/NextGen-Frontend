import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getCall } from '../../apis/network.js';
import { Modal, SimpleTable as Table } from '../index.js';

const PurchaseOrderModalContent = styled.div`
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

export default function PurchaseOrderModal({ show, setShow, handleClose, companyID, purchaseOrderID }) {
	const [purchaseOrder, setPurchaseOrder] = useState(null);
	const [loading, setLoading] = useState(true);
	const tableHeaders = [
		{ key: 'vendorItemDescription', label: 'Item Description', cellType: 'string' },
		{ key: 'vendorItemReference', label: 'Item Ref', cellType: 'string' },
		{ key: 'vendorItemUOM', label: 'Order Unit', cellType: 'string' },
		{ key: 'vendorItemPackSize', label: 'Pack Size', cellType: 'string' },
		{ key: 'quantity', label: 'Order Amount', cellType: 'string' },
	];

	useEffect(() => {
		(async () => {
			if (show && purchaseOrderID && companyID) {
				setLoading(true);
				try {
					const getData = {
						url: 'getPurchaseOrderDetails',
						urlParams: {
							companyID: companyID,
							purchaseOrderID: purchaseOrderID,
						},
					};

					const result = await getCall(getData);
					const data = result.data.map((item) => {
						return {
							...item,
							vendorItemPackSize: `${item.vendorItemPack}/${item.vendorItemSize}`,
						};
					});
					setPurchaseOrder(data);
				} catch (error) {
					console.error('Error getting purchase order details', error);
				}
				setLoading(false);
			}
		})();
	}, [show]);

	return (
		<Modal isOpen={show} setIsOpen={setShow} onClose={handleClose} title='Purchase Order'>
			<PurchaseOrderModalContent>
				{loading ? 
					<div>Loading...</div> :
					<Table headers={tableHeaders} data={purchaseOrder} />
				}
			</PurchaseOrderModalContent>
		</Modal>
	);
}
