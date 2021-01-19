(async function (window) {
    const applicationDefinitions = [
        {
            "title": "Application A (Notification Actions)",
            "type": "window",
            "name": "app-a",
            "hidden": false,
            "details": {
                "url": "http://127.0.0.1:5000/app-a",
                "top": 25,
                "left": 800,
                "height": 400,
                "width": 400
            }
        },
        {
            "title": "Application B (Notification Actions)",
            "type": "window",
            "name": "app-b",
            "hidden": false,
            "details": {
                "url": "http://127.0.0.1:5000/app-b",
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
        },
        serviceWorker: {
            url: "/scripts/service-worker.js"
        }
    };

    // Entry point.
    await window.createMainApp(config);

    window.displayApplicationsList(applicationDefinitions);
})(window || {});