import dash_glue
import dash
import dash_bootstrap_components as dbc
from dash.dependencies import Input, Output, State
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
    routes_pathname_prefix='/clients/',
    external_stylesheets=[dbc.themes.BOOTSTRAP]
)

# Dropdown option, that will be used to leave the current channel.
no_channel = { "label": "No Channel", "value": "" }

CONTENT_STYLE = {
    "padding": "10px 15px",
}

SELECTED_CLIENT_CONTEXT = 'SelectedClient'

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

# To use Channels API, we need to enable channels in the config.
glue_settings = {
    'web': {
        'config': {
            'channels': True
        }
    },
    'desktop': {
        'config': {
            'channels': True
        }
    }
}

app.layout = dash_glue.glue42(id='glue42', settings=glue_settings, children=[

    dash_glue.context(id=SELECTED_CLIENT_CONTEXT),
    dash_glue.channels(id="glue42-channels"),

    # UI
    html.Div(id="page-content", style=CONTENT_STYLE, children=[
        html.Div(className="d-flex justify-content-between", children=[
            html.H1("Clients"),

            html.Div(children=[
                html.Label('Select Channel: '),
                dcc.Dropdown(id='channels-list'),
            ]),
        ],
        style={
            "margin-bottom": "5px",
        }),

        # Client details card.
        dbc.Collapse(
            client_details_card(),
            id="client-collapse",
            style={
                "margin-bottom": "5px"
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

def channels_to_dpd_options(channels_info):
    if channels_info is not None:
        options = map(lambda channel: { "label": channel["name"], "value": channel["name"] }, channels_info)
        return [no_channel] + list(options)

    return [no_channel]

# Discovering the list of all channels.
@app.callback(Output('channels-list', 'options'), [Input('glue42-channels', 'channelsInfo')])
def update_channels_list(channels_info):
    return channels_to_dpd_options(channels_info)

# Logic whether to join a channel or leave the current one.
@app.callback(Output('glue42-channels', 'change'), [Input('channels-list', 'value')])
def change_channel(channel_name):
    if channel_name is not None:
        if channel_name == no_channel["value"]:
            return { 'action': 'leave' }
        else:
            return { 'action': 'join', 'channelName': channel_name }

@app.callback(
    [
        Output(SELECTED_CLIENT_CONTEXT, 'outgoing'),
        Output('glue42-channels', 'outgoing')
    ], 
    [Input(client["id"], 'n_clicks') for client in clients_data]
)
def handle_client_clicked(*buttons):
    ctx = dash.callback_context
    if not ctx.triggered:
        raise PreventUpdate

    # Button id is mapped to client's id.
    client_id = ctx.triggered[0]['prop_id'].split('.')[0]
    client = find_client(client_id)
    if client is None:
        raise PreventUpdate

    return update_context(client_id) + publish_in_channel(client_id)

@app.callback(
    [
        Output('client-name', 'children'),
        Output('client-portfolio-value', 'children'),
        Output('client-email', 'children'),
        Output('client-phone', 'children'),
        Output('client-details', 'children'), 
        Output('client-collapse', 'is_open')
    ], 
    [Input('glue42-channels', 'incoming')]
)
def channel_data_changed(value):
    if (value is None) or (not ("data" in value)) or (value["data"] is None):
        return update_client_card(None)

    client_id = value["data"].get("clientId")
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
    return [{ "clientId": client_id }]

if __name__ == '__main__':
    app.run_server(debug=True, host='localhost', port='8050')

