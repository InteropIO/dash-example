import React, { useEffect, useState, useMemo } from 'react';
import { useGlue } from '@glue42/react-hooks';

import { REQUEST_OPTIONS, CLIENTS_DATA_URL, STOCKS_DATA_URL } from './constants';
import { getChannelNamesAndColors, joinChannel, subscribeForChannels } from './glue';
import ClientDetails from './ClientDetails';
import StocksTable from './StocksTable';
import ChannelSelectorWidget from "./ChannelSelectorWidget"

function Stocks() {
    const [stocks, setStocks] = useState([]);
    const [{ clientId, client }, setClient] = useState({});
    const setDefaultClient = () => setClient({ clientId: "" });

    const selectClientHandler = ({ clientId }) => {
        setClient((state) => ({ ...state, clientId }));
    }
    useGlue(subscribeForChannels(selectClientHandler));

    // Fetch clients.
    useEffect(() => {
        const fetchClient = async () => {
            const response = await fetch(CLIENTS_DATA_URL, REQUEST_OPTIONS);
            const clients = await response.json();

            const selectedClient = clients.find(({ id }) => id === clientId);
            setClient((state) => ({
                ...state,
                client: selectedClient
            }))
        }
        fetchClient()
    }, [clientId]);

    // Fetch stocks.
    useEffect(() => {
        const fetchStocks = async () => {
            const response = await fetch(STOCKS_DATA_URL, REQUEST_OPTIONS);
            const portfolio = await response.json();
            setStocks(portfolio);
        };
        fetchStocks();
    }, []);

    const portfolio = useMemo(() => {
        if (!client) {
            return stocks
        }

        const clientPortfolio = client?.portfolio || [];
        return stocks.filter(({ id }) => {
            return clientPortfolio.some(({ stockId }) => stockId === id)
        });
    }, [client, stocks])

    // Get the channel names and colors and pass them as props to the ChannelSelectorWidget component.
    const channelNamesAndColors = useGlue(getChannelNamesAndColors);
    // The callback that will join the newly selected channel. Pass it as props to the ChannelSelectorWidget component to be called whenever a channel is selected.
    const onChannelSelected = useGlue(joinChannel);

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between">
                <h1 id="title" className="text-center">Portfolio</h1>
                <ChannelSelectorWidget
                    key={true}
                    channelNamesAndColors={channelNamesAndColors}
                    onChannelSelected={onChannelSelected}
                    onDefaultChannelSelected={setDefaultClient}
                />
            </div>
            <div className="row">
                <div className="col-md-12">
                    {client ? <ClientDetails client={client} /> : null}
                </div>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <StocksTable stocks={portfolio} />
                </div>
            </div>
        </div>
    );
}

export default Stocks;
