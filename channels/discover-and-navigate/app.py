import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import json
import dash_glue
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix='/app/')

# Dropdown option that will be used to leave the current Channel.
no_channel = { "label": "No Channel", "value": "" }

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

# To use the Channels API, we need to enable Channels in the config.
app.layout = dash_glue.glue42(id='glue42', settings=glue_settings, children = [
    # Instantiating the Channels component.
    dash_glue.channels(id="glue42-channels"),

    html.H3('Discovering and Navigating Channels'),
    html.Hr(),

    html.Div(children=[
        html.Label('Select Channel: '),
        dcc.Dropdown(id='channels-list'),
    ]),

    html.Div(id='channel-data', style={ "paddingTop": "10px" })
])

def channels_to_dpd_options(channels_info):
    if channels_info is not None:
        options = map(lambda channel: { "label": channel["name"], "value": channel["name"] }, channels_info)
        return [no_channel] + list(options)

    return [no_channel]

# Discovering the list of all Channels.
@app.callback(Output('channels-list', 'options'), [Input('glue42-channels', 'channelsInfo')])
def update_channels_list(channels_info):
    return channels_to_dpd_options(channels_info)

# Logic whether to join a Channel or leave the current one.
@app.callback(Output('glue42-channels', 'change'), [Input('channels-list', 'value')])
def change_channel(channel_name):
    if channel_name is not None:
        if channel_name == no_channel["value"]:
            return { 'action': 'leave' }
        else:
            return { 'action': 'join', 'channelName': channel_name }

@app.callback(
    [Output('channels-list', 'style'), Output('channel-data', 'children')],
    [Input('glue42-channels', 'channel')]
)
def channel_changed(channel):
    if channel is not None:
        channel_name = channel["name"]
        color = channel["meta"]["color"]
        data = channel["data"]

        dataAsJsonString = json.dumps(data)

        return [
            { "backgroundColor": color },
            "Current channel ({}). Data: {}".format(channel_name, dataAsJsonString)
        ]

    return [None, ""]

if __name__ == '__main__':
    app.run_server(debug=True, host='0.0.0.0', port='8050')