import dash_glue42
import dash
import dash_bootstrap_components as dbc
from dash.dependencies import Input, Output
import dash_html_components as html
import dash_core_components as dcc
from dash.exceptions import PreventUpdate
import json
from run import server

# Loading clients data.
with open("data/clients.json", encoding="utf-8") as f:
    clients_data = json.load(f)

app = dash.Dash(__name__,
                server=server,
                routes_pathname_prefix="/clients/",
                external_stylesheets=[dbc.themes.BOOTSTRAP]
                )

# Uncomment to enable Dash dev tools.
# app.enable_dev_tools()

# Dropdown option that will be used to leave the current Channel.
no_channel = {"label": "No Channel", "value": ""}

CONTENT_STYLE = {
    "padding": "10px 15px",
}

SELECTED_CLIENT_CONTEXT = "SelectedClient"


def format_client_name(client):
    first_name = client.get("firstName")
    last_name = client.get("lastName")
    return f"{first_name} {last_name}"


def client_details_card():
    return dbc.Card(dbc.CardBody(
        [
            html.H4(id="client-name"),
            html.Div(id="client-portfolio-value"),
            html.Div(id="client-email"),
            html.Div(id="client-phone"),
            html.P(id="client-details")
        ]
    ))


glue_settings = {
    "desktop": {
        "config": {
            "channels": True
        }
    }
}

# To use the Channels API, we need to enable Channels in the config.
app.layout = dash_glue42.Glue42(id="glue42", settings=glue_settings, children=[

    dash_glue42.Context(id=SELECTED_CLIENT_CONTEXT),
    dash_glue42.Channels(id="g42-channels"),

    # UI
    html.Div(id="page-content", style=CONTENT_STYLE, children=[
        html.Div(className="d-flex justify-content-between", children=[
            html.H1("Clients"),

            html.Div(id="channels-selector", children=[
                html.Label("Select Channel: "),
                dcc.Dropdown(id="channels-list", clearable=False),
            ]),
        ],
            style={
            "marginBottom": "5px",
        }),

        # Client details card.
        dbc.Collapse(
            client_details_card(),
            id="client-collapse",
            style={
                "marginBottom": "5px"
            }
        ),

        # Clients List
        dbc.ListGroup(
            [dbc.ListGroupItem(id=client["id"], n_clicks=0, action=True, children=[
                html.Div(format_client_name(client)),
                html.Div("$ {}".format(client["portfolioValue"])),
            ]) for client in clients_data]
        )
    ])
])


def find_client(client_id):
    for client in clients_data:
        if client["id"] == client_id:
            return client
    return None


@app.callback(
    Output("channels-selector", "style"),
    Input("glue42", "isEnterprise")
)
def channels_selector_visibility(isEnterprise):
    show_selector = (isEnterprise is None) or not isEnterprise
    visibility = "visible" if show_selector else "hidden"

    return {
        "visibility": visibility
    }


def channels_to_dpd_options(channels):
    if channels is not None:
        options = map(lambda channel: {
                      "label": channel, "value": channel}, channels)
        return [no_channel] + list(options)

    return [no_channel]


@app.callback(
    Output("channels-list", "options"),
    Input("g42-channels", "all")
)
def update_channels_list(all_channels):
    """Discovering all Channels."""

    return channels_to_dpd_options(all_channels)


@app.callback(
    Output("g42-channels", "join"),
    Input("channels-list", "value"),
    prevent_initial_call=True
)
def join_channel(channel_name):
    if channel_name == no_channel["value"]:
        raise PreventUpdate

    return {
        "name": channel_name
    }


@app.callback(
    Output("g42-channels", "leave"),
    Input("channels-list", "value")
)
def leave_channel(channel_name):
    if channel_name == no_channel["value"]:
        return {}

    raise PreventUpdate


@app.callback(
    [
        Output(SELECTED_CLIENT_CONTEXT, "update"),
        Output("g42-channels", "publish")
    ],
    [Input(client["id"], "n_clicks") for client in clients_data]
)
def handle_client_clicked(*buttons):
    ctx = dash.callback_context
    if not ctx.triggered:
        raise PreventUpdate

    # Button ID is mapped to the client ID.
    client_id = ctx.triggered[0]["prop_id"].split(".")[0]
    client = find_client(client_id)
    if client is None:
        raise PreventUpdate

    return update_context(client_id) + publish_in_channel(client_id)


@app.callback(
    [
        Output("client-name", "children"),
        Output("client-portfolio-value", "children"),
        Output("client-email", "children"),
        Output("client-phone", "children"),
        Output("client-details", "children"),
        Output("client-collapse", "is_open")
    ],
    Input("g42-channels", "my")
)
def channel_data_changed(channel):
    if (channel is None) or (not ("data" in channel)) or (channel["data"] is None):
        return update_client_card(None)

    client_id = channel["data"].get("clientId")
    client = find_client(client_id)
    return update_client_card(client)


def update_client_card(client):
    open_card = True
    if client is None:
        client = {}
        open_card = False

    return [
        format_client_name(client),
        "PORTFOLIO VALUE: $ {}".format(client.get("portfolioValue")),
        client.get("email"),
        client.get("phone"),
        client.get("about"),

        # Open collapsable card.
        open_card
    ]


def publish_in_channel(client_id):
    return [{
        "data": {
            "clientId": client_id
        }
    }]


def update_context(client_id):
    return [{"clientId": client_id}]


if __name__ == "__main__":
    app.run_server(debug=True, host="localhost", port="8050")
