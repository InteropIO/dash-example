import React from 'react';
import ReactDOM from 'react-dom';
import GlueWeb from "@glue42/web";
import GlueDesktop from "@glue42/desktop";
import { GlueProvider } from '@glue42/react-hooks';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import Stocks from './Stocks';
import * as serviceWorker from './serviceWorker';

const glueSettings = {
    web: {
        factory: GlueWeb,
        config: {
            channels: 'full'
        }
    },
    desktop: {
        factory: GlueDesktop,
        config: {
            channels: 'full'
        }
    }
}

ReactDOM.render(
    <GlueProvider settings={glueSettings} glueFactory={GlueWeb}>
        <Stocks />
    </GlueProvider>,
    document.getElementById('root')
);

serviceWorker.register();
