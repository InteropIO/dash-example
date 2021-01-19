(function (window) {
    async function createMainApp(config) {
        try {
            const { glue, platform } = await window.GlueWebPlatform(config);
            window.glue = glue;
            window.platform = platform;

            console.log(`Glue42 version ${glue.info.version} initialized.`);
            console.log(`Glue42 Platform version ${platform.version} initialized.`);

            window.toggleGlueAvailable();

            return { glue, platform };
        } catch (error) {
            console.error("Failed to initialize Glue42 Main Application. Error: ", JSON.stringify(error));
            throw error;
        }
    };

    function startApplication(appName) {
        const application = glue.appManager.application(appName);

        if (application == null) {
            throw new Error(`Application ${appName} not found.`)
        }

        application.start();
    }

    window.createMainApp = createMainApp;
    window.startApplication = startApplication;
})(window || {});