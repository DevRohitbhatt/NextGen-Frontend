import logo from '../../assets/images/CustomLoad.gif';

export const Loader = ({ loading }) => {
	if (loading) {
		return (
			<>
				<div className='absolute top-0 left-0 z-[8] right-0 bottom-0 bg-transparent bg-secondary loader-container'>
					<div className='absolute z-40 opacity-100 left-1/2 top-1/2 spinner'>
						<img src={logo} className='w-10' alt='Loading...' />
					</div>
				</div>
			</>
		);
	}
	return null;
};
export default Loader;
