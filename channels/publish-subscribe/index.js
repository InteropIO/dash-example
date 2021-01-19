(async function (window) {
    const applicationDefinitions = [
        {
            "title": "Application A (Publish and Subscribe Channels)",
            "type": "window",
            "name": "app-a",
            "hidden": false,
            "details": {
                "url": "http://127.0.0.1:5000/app-a",
                "top": 25,
                "left": 800,
                "height": 400,
                "width": 400,
                "allowChannels": true
            }
        },
        {
            "title": "Application B (Publish and Subscribe Channels)",
            "type": "window",
            "name": "app-b",
            "hidden": false,
            "details": {
                "url": "http://127.0.0.1:5000/app-b",
                "top": 25,
                "left": 800,
                "height": 400,
                "width": 400,
                "allowChannels": true
            }
        }
    ];

    const channelDefinitions = [
        {
            "name": "Red",
            "meta": {
                "color": "red"
            },
            "data": {
                "clientId": "VVDvc6i99J",
                "clientName": "Vernon Mullen"
            }
        },
        {
            "name": "Green",
            "meta": {
                "color": "green"
            },
            "data": {
                "clientId": "SGvc6a87J",
                "clientName": "Sutton Edwards"
            }
        },
        {
            "name": "Blue",
            "meta": {
                "color": "#66ABFF"
            },
            "data": {
                "clientId": "xZvXP2i93P",
                "clientName": "Alan Muller"
            }
        }
    ];

    // Glue42 Web Platform initialization configuration object.
    const config = {
        applications: {
            local: applicationDefinitions
        },
        channels: {
            definitions: channelDefinitions
        }
    };

    // Entry point.
    await window.createMainApp(config);

    window.displayApplicationsList(applicationDefinitions);
})(window || {});