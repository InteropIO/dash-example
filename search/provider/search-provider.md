# Overview
Example Search Provider with Dash.

Provides mock *clients* and *instruments* search results through the Glue42 Search API.

# How to run and test

1. [Setup](../../README.md#setup)
2. [Activate the virtual environment](../../README.md#virtual-environment-activation)
3. Run `python app.py`
4. Paste the *apps-config.json* to your local store (usually *%LocalAppData%\Tick42\GlueDesktop\config\apps*)
5. Restart Glue42 Enterprise
6. Search in the Glue42 Toolbar for *"Dash Search Client*. Test with the client application, e.g. by typing VOD

*Note:* The search provider is configured as [Service Window](https://docs.glue42.com/glue42-concepts/glue42-platform-features/index.html#service_windows), so it will start automatically and share the Glue42 Enterprise lifetime.

# Details

For the simplicity of the example data is fetched from local JSON files.

The example showcases bridging the JavaScript Glue42 Search API to a Python Dash backend either using a websocket or a rest api.
