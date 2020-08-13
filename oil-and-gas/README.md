# Dash Natural Gas Well Production (Outlook integration via Glue42 Outlook Add-in)

The [New York Oil and Gas](https://dash-gallery.plotly.host/dash-oil-and-gas/) demo extended to integrate with Outlook via Glue42 Outlook Add-in.

Two Python Dash applications that demonstrates how to create a meeting, send an email and get Outlook local contacts.

The Oil and Gas application has been extended to create meetings and sends email. Click "Create Meeting" to invoke a dedicated Interop methods (registered by Outlook Add-in) to create a meeting item in Outlook and open the Outlook's "Meeting" window. Click "Send Email" to also invoke a dedicated Interop method that creates an email item in Outlook and opens the Outlook's "Message" window.

The Outlook Contacts application can retrieve the list of local contacts in Outlook. Click "Get Contacts" button to invoke a dedicated Interop method and consume the results. The list of contacts will be populated in the dropdown menu. If you select any contacts from the menu, those will set in a shared context named "contacts". The Oil and Gas application gets to data of the "contacts" context and uses it as recipients for the meetings/emails.

See [screenshots](#Screenshots).

Checkout the source code in `app_a.py` and `app_b.py` for details.

## Getting Started

1. If you have not setup the environment, follow the instructions in [Quickstart](../README.md). 

2. Also, install the required packages for this example.

```sh
cd oil-and-gas

pip install -r requirements.txt
```

3. Follow the instructions in [Run an example locally](../README.md) to start the applications.

4. To see the Outlook integration, you need to run the applications in Glue42 Desktop. See more details in [Glue42 Enterprise](../README.md).

## About the app 

This Dash app displays oil production in western New York. There are filters at the top of the app to update the graphs below. By selecting or hovering over data in one plot will update the other plots ('cross-filtering').

## Built With

- [Glue42](https://glue42.com/) - Desktop Integration platform
- Glue Dash - Glue42 Python support for Dash framework
- [Dash](https://dash.plot.ly/) - Main server and interactive components
- [Plotly Python](https://plot.ly/python/) - Used to create the interactive plots

## Screenshots

![screenshot](screenshots/screenshot-1.png)

![screenshot](screenshots/screenshot-2.png)
 
![screenshot](screenshots/screenshot-3.png)
