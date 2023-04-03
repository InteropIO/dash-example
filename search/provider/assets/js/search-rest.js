(async () => {
    console.log('--- Search Rest API ---');

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
        const abortControllersMap = new Map();

        const dataProvider = {
            getQueryResults: async (queryId, searchTerm) => {
                const controller = new AbortController();
                const url = `/api/query-results?queryId=${queryId}&search=${searchTerm}`;
                const options = {
                    method: 'GET',
                    signal: controller.signal,
                }

                abortControllersMap.set(queryId, controller);
                try {
                    const { results } = await (await fetch(url, options)).json();
                    return results;
                } catch (error) {
                    throw error;
                } finally {
                    abortControllersMap.delete(queryId);
                }
            },
            cancelQuery: async (queryId) => {
                if (!abortControllersMap.has(queryId)) {
                    return;
                }

                const controller = abortControllersMap.get(queryId);
                abortControllersMap.delete(queryId);
                controller.abort()
            }
        };

        return dataProvider;
    }

    const glue = await initGlueSearch()
    const dataSource = await initDataSource();
    const activeQueriesSet = new Set();
    const searchProvider = await glue.search.registerProvider({ name: 'dash-rest-search-provider' });

    const sendBackResults = (query, results) => {
        for (const result of results) {
            try {
                query.sendResult(result);
            } catch (error) {
                console.error('Received an error trying to send result back to client. Error: ', error);
            }
        }

        query.done();
    };

    searchProvider.onQuery(async (query) => {
        const queryId = query.id;
        activeQueriesSet.add(queryId);

        try {
            const results = await dataSource.getQueryResults(queryId, query.search);

            if (!activeQueriesSet.has(queryId)) {
                return;
            }

            activeQueriesSet.delete(queryId);
            sendBackResults(query, results);
        } catch (error) {
            if (!activeQueriesSet.has(queryId)) {
                return;
            }

            const errorMessage = typeof error === 'string'
                ? error
                : typeof error.message === 'string' ? error.message : 'Cannot send the query to the data source.';

            query.error(errorMessage);
        }
    });

    searchProvider.onQueryCancel(({ id: queryId }) => {
        activeQueriesSet.delete(queryId);
        dataSource.cancelQuery(queryId);
    });
})();