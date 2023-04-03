(async () => {
    console.log('--- Search WS ---');

    /**
     * Awaits until "glue42dash" is attached to the global window object.
     * @returns Returns GlueJS instance.
     */
    async function initGlueSearch() {
        console.log('Waiting for glue42dash...');

        await new Promise((resolve) => {
            const intervalId = setInterval(() => {
                if (window.glue42dash) {
                    clearInterval(intervalId);
                    resolve();
                }
            }, 50);
        })

        console.log(`glue42dash v${window.glue42dash.version} available.`);

        /**
         * Initialize Glue42 Search API.
         */
        await window.GlueSearch(window.glue42dash.glueInstance);
        console.log('Glue42 Search API initialized.');

        return window.glue42dash.glueInstance;
    }

    async function initDataSource() {
        const socketIO = io({ autoConnect: false });

        const dataProvider = {
            socketIO,
            connect: () => socketIO.connect(),
            onConnected: () => { }, // Attach a callback.
            onDisconnected: () => { }, // Attach a callback.
            onQueryResults: (queryId, result, isLast) => { }, // Attach a callback.
            onQueryError: (queryId, error) => { }, // Attach a callback.
            newQuery: async (queryId, searchTerm) => {
                if (socketIO.disconnected) {
                    return Promise.reject(new Error('Data source is disconnected.'));
                }

                const args = {
                    id: queryId,
                    search: searchTerm
                };
                const ackTimeout = 5 * 1000;
                await socketIO.timeout(ackTimeout).emitWithAck("on-query", args);
            },
            cancelQuery: async (queryId) => {
                const args = {
                    id: queryId
                };
                await socketIO.emit("on-query-cancel", args);
            }
        };
        socketIO.on("connect", () => {
            if (typeof dataProvider.onConnected === 'function') {
                dataProvider.onConnected();
            }
        });
        socketIO.on("disconnect", () => {
            if (typeof dataProvider.onDisconnected === 'function') {
                dataProvider.onDisconnected();
            }
        });
        socketIO.on("query-error", ({ id, error }) => {
            if (typeof dataProvider.onQueryError === 'function') {
                dataProvider.onQueryError(id, error);
            }
        });
        socketIO.on("query-results", ({ id, results, isLast }) => {
            if (typeof dataProvider.onQueryResults === 'function') {
                dataProvider.onQueryResults(id, results, isLast);
            }
        });

        return dataProvider;
    }

    const glue = await initGlueSearch();
    const dataSource = await initDataSource();
    const activeQueriesMap = new Map();
    const searchProvider = await glue.search.registerProvider({ name: 'dash-ws-search-provider' });

    searchProvider.onQuery(async (query) => {
        const queryId = query.id;
        activeQueriesMap.set(queryId, query);

        try {
            await dataSource.newQuery(queryId, query.search);
        } catch (error) {
            if (!activeQueriesMap.has(queryId)) {
                return;
            }

            const errorMessage = typeof error === 'string'
                ? error
                : typeof error.message === 'string' ? error.message : 'Cannot send the query to the data source.';

            activeQueriesMap.delete(queryId);
            query.error(errorMessage);
        }
    });

    searchProvider.onQueryCancel(({ id: queryId }) => {
        if (!activeQueriesMap.has(queryId)) {
            return;
        }

        activeQueriesMap.delete(queryId);
        dataSource.cancelQuery(queryId)
            .catch((error) => {
                console.error('Failed to cancel query in the data source. Error: ', error);
            });
    });

    dataSource.onQueryResults = async (queryId, results, isLast) => {
        if (!activeQueriesMap.has(queryId)) {
            return;
        }

        const query = activeQueriesMap.get(queryId);

        for (const result of results) {
            try {
                query.sendResult(result)
            } catch (error) {
                console.error('Received an error trying to send result back to client. Error: ', error);
            }
        }

        // No more results are expected from the data source.
        if (isLast) {
            activeQueriesMap.delete(queryId);
            query.done();
        }
    }

    dataSource.onQueryError = async (queryId, error) => {
        if (!activeQueriesMap.has(queryId)) {
            return;
        }

        const query = activeQueriesMap.get(queryId);
        activeQueriesMap.delete(queryId);
        query.error(error);
    }

    dataSource.onDisconnected = () => {
        // Complete all queries.
        Array.from(activeQueriesMap.keys())
            .forEach(function errorQuery(queryId) {
                const query = activeQueriesMap.get(queryId);
                activeQueriesMap.delete(queryId);

                query?.error('Data source disconnected.'); // Instead of error, the query can be completed - query?.done()
            });
    };

    // Explicitly connect the data source.
    dataSource.connect();
})();