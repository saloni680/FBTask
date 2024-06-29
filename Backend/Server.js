
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const THIRD_PARTY_API_URL = 'https://s3.amazonaws.com/roxiler.com/product_transaction.json';

// Function to fetch data from third-party API
const fetchDataFromThirdParty = async () => {
    try {
        const response = await axios.get(THIRD_PARTY_API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching data from third-party API:', error);
        throw new Error('Failed to fetch data from third-party API');
    }
};

// Function to get transactions by month
const getTransactionsByMonth = async (month) => {
    try {
        let transactions = await fetchDataFromThirdParty();

        // Filter by month
        transactions = transactions.filter(transaction => {
            // Extract month from dateOfSale (assuming dateOfSale is in format MM/DD/YYYY)
            const saleMonth = new Date(transaction.dateOfSale).getMonth() + 1; // JavaScript months are zero-based
            return saleMonth === parseInt(month, 10);
        });
        return transactions;
    } catch (error) {
        console.error('Error filtering transactions by month:', error);
        throw new Error('Failed to filter transactions by month');
    }
};

// Endpoint to fetch products with optional month filter and search
app.get('/api/products', async (req, res) => {
    const { month, search } = req.query;

    try {
        let products = await fetchDataFromThirdParty();

        // Filter by month if provided
        if (month && month !== '00') {
            products = products.filter(product => {
                // Extract month from dateOfSale (assuming dateOfSale is in format MM/DD/YYYY)
                const saleMonth = new Date(product.dateOfSale).getMonth() + 1; // JavaScript months are zero-based
                return saleMonth === parseInt(month, 10);
            });
        }

        // Filter by search text if provided
        if (search) {
            const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
            products = products.filter(product => {
                // Match search text against title, description, and price
                return (
                    product.title.match(searchRegex) ||
                    product.price.toString().match(searchRegex)
                );
            });
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedProducts = products.slice(startIndex, endIndex);

        res.json({
            totalItems: products.length,
            currentPage: page,
            perPage,
            totalPages: Math.ceil(products.length / perPage),
            data: paginatedProducts,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products', error });
    }
});

// Endpoint to fetch statistics
app.get('/api/statistics', async (req, res) => {
    const month = req.query.month;

    if (!month) {
        return res.status(400).json({ error: 'Month is required' });
    }

    try {
        const transactions = await getTransactionsByMonth(month);

        const totalSaleAmount = transactions.reduce((sum, transaction) => sum + transaction.price, 0);
        const totalSoldItems = transactions.filter(transaction => transaction.sold).length;
        const totalNotSoldItems = transactions.filter(transaction => !transaction.sold).length;

        res.json({
            totalSaleAmount,
            totalSoldItems,
            totalNotSoldItems
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to fetch bar chart data
app.get('/api/bar-chart', async (req, res) => {
    const month = req.query.month;

    if (!month) {
        return res.status(400).json({ error: 'Month is required' });
    }

    try {
        const transactions = await getTransactionsByMonth(month);

        const priceRanges = {
            '0-100': 0,
            '101-200': 0,
            '201-300': 0,
            '301-400': 0,
            '401-500': 0,
            '501-600': 0,
            '601-700': 0,
            '701-800': 0,
            '801-900': 0,
            '901-above': 0,
        };

        transactions.forEach(transaction => {
            const price = transaction.price;
            if (price <= 100) {
                priceRanges['0-100']++;
            } else if (price <= 200) {
                priceRanges['101-200']++;
            } else if (price <= 300) {
                priceRanges['201-300']++;
            } else if (price <= 400) {
                priceRanges['301-400']++;
            } else if (price <= 500) {
                priceRanges['401-500']++;
            } else if (price <= 600) {
                priceRanges['501-600']++;
            } else if (price <= 700) {
                priceRanges['601-700']++;
            } else if (price <= 800) {
                priceRanges['701-800']++;
            } else if (price <= 900) {
                priceRanges['801-900']++;
            } else {
                priceRanges['901-above']++;
            }
        });

        res.json(priceRanges);
    } catch (error) {
        console.error('Error fetching bar chart data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint for pie chart data
app.get('/api/pie-chart', async (req, res) => {
    const { month } = req.query;

    try {
        // Fetch products data from third-party API
        let productsData = await fetchDataFromThirdParty();

        // Filter products by month if specified
        if (month && month !== '00') {
            productsData = productsData.filter(product => {
                const saleMonth = new Date(product.dateOfSale).getMonth() + 1; // JavaScript months are zero-based
                return saleMonth === parseInt(month, 10);
            });
        }

        // Logic to calculate pie chart data based on selected month
        const categoryCount = {};

        productsData.forEach(product => {
            if (!categoryCount[product.category]) {
                categoryCount[product.category] = 0;
            }
            categoryCount[product.category]++;
        });

        // Format data for response
        const pieChartData = {
            categories: Object.entries(categoryCount).map(([category, count]) => ({
                category,
                count
            }))
        };

        res.json(pieChartData);
    } catch (error) {
        console.error('Error fetching pie chart data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to fetch combined data from all endpoints
app.get('/api/combined-data', async (req, res) => {
    try {
        const month = req.query.month || '3'; // Assuming default month as June if not provided
        const productsResponse = await axios.get(`http://localhost:${PORT}/api/products?month=${month}`);
        const statisticsResponse = await axios.get(`http://localhost:${PORT}/api/statistics?month=${month}`);
        const barChartDataResponse = await axios.get(`http://localhost:${PORT}/api/bar-chart?month=${month}`);
        const pieChartDataResponse = await axios.get(`http://localhost:${PORT}/api/pie-chart?month=${month}`);

        const combinedData = {
            products: productsResponse.data,
            totalSaleAmount: statisticsResponse.data.totalSaleAmount,
            totalSoldItems: statisticsResponse.data.totalSoldItems,
            totalNotSoldItems: statisticsResponse.data.totalNotSoldItems,
            barChartData: barChartDataResponse.data,
            pieChartData: pieChartDataResponse.data
        };

        console.log("Combined Data from Server:", combinedData); // Debug statement
        res.json(combinedData);
    } catch (error) {
        console.error('Error fetching combined data:', error);
        res.status(500).json({ error: 'Failed to fetch combined data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
