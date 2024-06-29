import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CustomPieChart = ({ data, selectedMonth, monthNames }) => {
    const getSliceColor = (index) => {
        const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919', '#19FFA3', '#FF1919', '#1924FF'];
        return colors[index % colors.length];
    };

    return (
        <div className="piechart">
            <h2>Pie Chart Stats for {monthNames[parseInt(selectedMonth, 10) - 1]}</h2>
            <ResponsiveContainer height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="count"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getSliceColor(index)} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CustomPieChart;
