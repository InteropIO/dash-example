# Clients Portfolio News

The example demonstrates Dash App, React App and Angular App sharing data through Glue42 Channels and Contexts. 
The example consists of three applications:
- **Clients** - Dash application which displays a list of clients.
- **Stocks** - React application which displays a list of stocks. When **Stocks** and **Clients** are on the same channel and a client is clicked in **Clients** then **Stocks** displays the portfolio of the selected client.
- **News** - Angular application which displays a list of news. On load the application subscribes to a shared context `SelectedClient`. The context is updated when a client is clicked in **Clients**. When the context changes then the application displays the list of news related to the selected client.

Checkout the source code in `clients.py` `/stocks` and `/news` for details.
