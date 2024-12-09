import Chart from 'react-apexcharts';
import PropTypes from 'prop-types';

const LineChart = ({ chartData }) => {
	const data = {
		series: chartData.series,
		options: {
			dataLabels: {
				enabled: false,
			},
			stroke: {
				curve: 'straight',
				width: 2,
			},
			xaxis: chartData.xAxis,
			yaxis: chartData.yAxis,
			legend: {
				show: true,
				position: 'top',
				horizontalAlign: 'right',
				floating: true,
				fontWeight: '600',
			},
			colors: chartData.colors,
			chart: {
				toolbar: {
					show: false,
				},
				animation: {
					enabled: false,
				},
			},
			markers: {
				size: 0,
			},
		},
	};

	return <Chart options={data.options} series={data.series} type='line' height={550} />;
};
LineChart.propTypes = {
	chartData: PropTypes.shape({
		xAxis: PropTypes.object.isRequired,
		yAxis: PropTypes.object.isRequired,
		colors: PropTypes.array.isRequired,
		series: PropTypes.array.isRequired,
	}).isRequired,
};

export default LineChart;
