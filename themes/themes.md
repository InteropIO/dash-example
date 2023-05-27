# Overview
Themes Example.

Glue42 Enterprise has two built-in themes - Day and Night. You can control the themes programmatically by updating the "T42.Themes" context.

This example demonstrates:
* Switching Glue42 theme programmatically from a Dash backend.
* Providing library settings which instruct the Glue42 component to render children without a real Glue42 JS initialization.
# How to run and test

1. [Setup](../../README.md#setup)
2. [Activate the virtual environment](../../README.md#virtual-environment-activation)
3. Run `python app.py`
4. Paste the *apps-config.json* to your local store (usually *%LocalAppData%\Tick42\GlueDesktop\config\apps*)
6. Search in the Glue42 Toolbar for *Application (Themes Example)*.

The demo application detects at runtime whether it is opened in Glue42 Enterprise or a browser. If latter the UI to switch themes is hidden.
