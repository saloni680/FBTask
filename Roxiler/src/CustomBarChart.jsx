
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CustomBarChart = ({ data, selectedMonth, monthNames }) => {
    return (
        <div className="barchart">
            <h2>Bar Chart Stats for {monthNames[parseInt(selectedMonth, 10) - 1]}</h2>
            <ResponsiveContainer height={300}>
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <XAxis dataKey="priceRange" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="itemCount" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CustomBarChart;
