(async function (window) {
    const applicationDefinitions = [
        {
            "title": "Application (Opening Windows)",
            "type": "window",
            "name": "app-a",
            "hidden": false,
            "details": {
                "url": "http://127.0.0.1:5000/app",
                "top": 25,
                "left": 800,
                "height": 400,
                "width": 400
            }
        }
    ];

    // Glue42 Web Platform initialization configuration object.
    const config = {
        applications: {
            local: applicationDefinitions
        }
    };

    // Entry point.
    await window.createMainApp(config);

    window.displayApplicationsList(applicationDefinitions);
})(window || {});