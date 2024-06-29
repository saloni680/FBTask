import React from 'react';

const Statistics = ({ totalSaleAmount, totalSoldItems, totalNotSoldItems, selectedMonth, monthNames }) => {
    return (
        <div className="">
            <h1>Total sale in {monthNames[parseInt(selectedMonth, 10) - 1]}</h1>
            <div className="mainStat">
                <p>Total sale amount: ${totalSaleAmount}</p>
                <p>Total sold items: {totalSoldItems}</p>
                <p>Total not sold items: {totalNotSoldItems}</p>
            </div>
            <br /><br /><br /><br /><br /><hr />
        </div>
    );
    
};

export default Statistics;
