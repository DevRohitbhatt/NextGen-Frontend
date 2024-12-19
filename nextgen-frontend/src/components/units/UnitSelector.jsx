import { useEffect } from 'react';
import { getCall } from '../../apis/network';

export default function UnitSelector({
	onClick,
	companyId,
	alignmentId,
	memberName,
	setMemberName,
	memberId,
	isEditable = true,
	includeAreas = false,
	formVersion = false,
	isInvalid = false,
}) {
	useEffect(() => {
		const fetchUnitList = async () => {
			try {
				const getData = {
					url: 'unitsAndArea',
					urlParams: {
						companyId: companyId,
						alignmentId: alignmentId,
						memberId: memberId,
					},
				};

				const result = await getCall(getData);
				if (result.data.areas.length > 0 && includeAreas) {
					const areaName = result.data.areas.find((area) => area.areaID === memberId).areaName;
					if (areaName) {
						setMemberName(areaName);

						return;
					}
				}
				if (result.data.units.length > 0) {
					const unitName = result.data.units.find((unit) => unit.unitID === memberId).unitName;
					if (unitName) {
						setMemberName(unitName);
						return;
					}
				}
			} catch (error) {
				setMemberName('No unit selected');
			}
		};
		if (companyId && alignmentId && memberId) fetchUnitList();
	}, [memberId]);

	return (
		<>
			{formVersion ? (
				<div className='w-full rounded-md cursor-pointer unit-selector' onClick={onClick}>
					<div
						className={`px-6 py-3 text-center rounded-md text-nowrap border-2 hover:border-[var(--tw-primary)] border-solid ${
							isInvalid ? 'border-[#e74c3c]' : ''
						}`}
					>
						{memberName}
					</div>
				</div>
			) : (
				<div
					onClick={isEditable ? onClick : () => {}}
					className='flex flex-col justify-center mx-1 rounded-3xl unit-selector'
				>
					{isEditable ? (
						<h3 className='mb-1 ml-2 lg:text-xl text-base font-semibold text-nowrap'>Select Unit(s)</h3>
					) : (
						<h3 className='mb-1 ml-2 lg:text-xl text-base font-semibold text-nowrap'>Units</h3>
					)}
					<div
						className={`lg:px-6 lg:py-3 px-2 py-2 lg:text-base text-sm text-center lg:capitalize lg:border-2 border-[1px]  border-solid  text-nowrap rounded-3xl ${
							isEditable
								? ' hover:border-[var(--tw-primary)] cursor-pointer'
								: 'border-[#D3D3D3] bg-gray-200 hover:border-[#d3d3d3]'
						}`}
					>
						{memberName}
					</div>
				</div>
			)}
		</>
	);
}
