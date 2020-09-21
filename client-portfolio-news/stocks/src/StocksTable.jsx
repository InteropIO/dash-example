import React from 'react';
import { PRICE_RISING, PRICE_FALLING } from './constants';

export const currentPrice = (lastPrices) => lastPrices[lastPrices.length - 1];

export const isPriceRising = ({ lastPrices, lastClosePrice }) => currentPrice(lastPrices) >= lastClosePrice;

export const percentageChange = ({ lastPrices, lastClosePrice }) => ((currentPrice(lastPrices) - lastClosePrice) / lastClosePrice * 100).toFixed(2)

function StocksTable({ stocks }) {
    return <table id="portfolioTable" className="table table-hover">
        <thead>
            <tr>
                <th></th>
                <th>Symbol</th>
                <th>Name</th>
                <th className="text-right">Percentage Change</th>
                <th className="text-right">Current Price</th>
            </tr>
        </thead>
        <tbody>
            {stocks.map(({ id, name, symbol, lastClosePrice, lastPrices }) => (
                <tr key={id}>
                    <td>{
                        isPriceRising({ lastClosePrice, lastPrices }) ? PRICE_RISING : PRICE_FALLING
                    }</td>
                    <td>{symbol && symbol.toUpperCase()}</td>
                    <td>{name && name.toUpperCase()}</td>
                    <td className="text-right">{percentageChange({ lastPrices, lastClosePrice })} %</td>
                    <td className="text-right">$ {currentPrice(lastPrices)}</td>
                </tr>
            ))}
        </tbody>
    </table>
}

export default StocksTable;