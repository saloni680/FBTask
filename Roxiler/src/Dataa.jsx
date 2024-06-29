
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import Statistics from './Statistics'; 
import './Dataa.css'; 
import CustomPieChart from './CusomPieChart';
import CustomBarChart from './CustomBarChart';

const Dataa = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); 
    const [selectedMonth, setSelectedMonth] = useState('03'); 
    const [searchText, setSearchText] = useState('');
    const [statistics, setStatistics] = useState({
        totalSaleAmount: 0,
        totalSoldItems: 0,
        totalNotSoldItems: 0,
    });
    const [barChartData, setBarChartData] = useState([]);
    const [pieChartData, setPieChartData] = useState([]);
    const [combinedData, setCombinedData] = useState(null); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        const fetchCombinedData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/combined-data');
                setCombinedData(response.data); // Set combined data from API response
                setLoading(false); 
            } catch (error) {
                setError(error.message); // Set error message if request fails
                setLoading(false); // Set loading to false in case of error
            }
        };
        fetchCombinedData(); // Fetch combined data when component mounts
    }, []);

    useEffect(() => {
        fetchData();
        fetchStatistics();
        fetchBarChartData();
        fetchPieChartData();
    }, [selectedMonth, searchText, currentPage]); // Fetch data when selected month, search text, or page changes

    const fetchData = () => {
        let apiUrl = `http://localhost:5000/api/products?page=${currentPage}&perPage=${itemsPerPage}`;
        // Append selected month to API URL if selected
        if (selectedMonth) {
            apiUrl += `&month=${selectedMonth}`;
        }
        // Append search text to API URL if provided
        if (searchText) {
            apiUrl += `&search=${searchText}`;
        }

        fetch(apiUrl)
            .then(res => res.json())
            .then(data => {
                setProducts(data.data);
                console.log(data); // Set products array from response
            })
            .catch(error => console.error('Error fetching data:', error));
    };

    const fetchStatistics = () => {
        fetch(`http://localhost:5000/api/statistics?month=${selectedMonth}`)
            .then(res => res.json())
            .then(data => {
                setStatistics(data); // Set statistics from API response
            })
            .catch(error => console.error('Error fetching statistics:', error));
    };

    const fetchBarChartData = () => {
        fetch(`http://localhost:5000/api/bar-chart?month=${selectedMonth}`)
            .then(res => res.json())
            .then(data => {
                const formattedData = Object.entries(data).map(([range, count]) => ({
                    priceRange: range,
                    itemCount: count,
                }));
                setBarChartData(formattedData); // Set bar chart data from API response
            })
            .catch(error => console.error('Error fetching bar chart data:', error));
    };

    const fetchPieChartData = () => {
        fetch(`http://localhost:5000/api/pie-chart?month=${selectedMonth}`)
            .then(res => res.json())
            .then(data => {
                setPieChartData(data.categories); // Set pie chart data from API response
            })
            .catch(error => console.error('Error fetching pie chart data:', error));
    };

    const handleChangePage = (event, value) => {
        setCurrentPage(value);
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    if (loading) {
        return <p>Loading...</p>; // Display loading message while fetching data
    }

    if (error) {
        return <p>Error: {error}</p>; // Display error message if fetch fails
    }

    if (!combinedData) {
        return null; // Or display a message that data is not available
    }

    return (
        <span className='Start'>
            <section className='sect'>
                <input
                    type="search"
                    name="search"
                    id="s"
                    placeholder='Search Transaction...'
                    value={searchText}
                    onChange={handleSearchChange}
                />
                <select
                    name="months"
                    id="month"
                    value={selectedMonth}
                    onChange={handleMonthChange}>
                    {monthNames.map((month, index) => (
                        <option key={index} value={index + 1 < 10 ? `0${index + 1}` : `${index + 1}`}>{month}</option>
                    ))}
                </select>
            </section>

            <div className="maintable">
                <h1>Transactions</h1>
                <br />
                <center>
                    <Table className="table table-bordered table-striped" border={2} >
                        <TableHead style={{ height: "10px" }}>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Sold</TableCell>
                                <TableCell>Image</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map(product => (
                                <TableRow key={product._id}>
                                    <TableCell>{product.id}</TableCell>
                                    <TableCell>{product.title}</TableCell>
                                    <TableCell className="description-cell">{product.description}</TableCell>
                                    <TableCell>${product.price}</TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell>{product.sold ? "Sold" : "Not sold"}</TableCell>
                                    <TableCell><img src={product.image} alt={product.title} style={{ width: '100px' }} /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Stack spacing={2}>
                        <Pagination
                            count={Math.ceil(products.length / itemsPerPage)}
                            page={currentPage}
                            onChange={handleChangePage}
                            variant="outlined"
                            shape="rounded"
                        />
                    </Stack>
                </center>
                <br/><br />
            </div>
<br /><br /><br /><br />
            <Statistics 
                totalSaleAmount={statistics.totalSaleAmount}
                totalSoldItems={statistics.totalSoldItems}
                totalNotSoldItems={statistics.totalNotSoldItems}
                selectedMonth={selectedMonth}
                monthNames={monthNames}
            />

            <CustomBarChart 
                data={barChartData}
                selectedMonth={selectedMonth}
                monthNames={monthNames}
            />
            

            <CustomPieChart 
                data={pieChartData}
                selectedMonth={selectedMonth}
                monthNames={monthNames}
            />
        </span>
    );
};

export default Dataa;
