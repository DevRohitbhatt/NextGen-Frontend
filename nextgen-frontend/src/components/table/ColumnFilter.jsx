import { useState, useEffect } from 'react';

const ColumnFilter = ({ column }) => {
	const columnFilterValue = column.getFilterValue();

	return (
		<DebouncedInput
			className='box-border w-full p-1 font-normal border-2 border-gray-300 border-solid hover:border-primary focus:border-primary focus:outline-none'
			onChange={(value) => column.setFilterValue(value)}
			placeholder={`Search...`}
			type='text'
			value={columnFilterValue ?? ''}
		/>
		// See faceted column filters example for datalist search suggestions
	);
};

// A typical debounced input react component
function DebouncedInput({ value: initialValue, onChange, debounce = 500, ...props }) {
	const [value, setValue] = useState(initialValue);

	useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			onChange(value);
		}, debounce);

		return () => clearTimeout(timeout);
	}, [value]);

	return <input {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
}

export default ColumnFilter;
