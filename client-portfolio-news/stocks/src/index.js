import React from 'react';
import ReactDOM from 'react-dom';
import GlueWeb from "@glue42/web";
import { GlueProvider } from '@glue42/react-hooks';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import Stocks from './Stocks';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
    <GlueProvider config={{ channels: true }} glueFactory={GlueWeb}>
        <Stocks />
    </GlueProvider>,
    document.getElementById('root')
);

serviceWorker.register();
