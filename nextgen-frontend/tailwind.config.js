/** @type {import('tailwindcss').Config} */
import tailwindScrollbar from 'tailwind-scrollbar';

export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				inter: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
			},
			colors: {
				primary: '#36479D',
				secondary: '#508cff',
			},
		},
	},

	plugins: [tailwindScrollbar({ nocompatible: true })],
};
