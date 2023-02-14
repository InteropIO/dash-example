from dash import dash, Input, Output, html, dcc
import json
import dash_glue42
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix="/app/")

app.enable_dev_tools()

# Dropdown option that will be used to leave the current Channel.
no_channel = {"label": "No Channel", "value": ""}

glue_settings = {
    "desktop": {
        "config": {
            "channels": True
        }
    }
}

# To use the Channels API, we need to enable Channels in the config.
app.layout = dash_glue42.Glue42(id="glue42", settings=glue_settings, children=[
    dash_glue42.Channels(id="g42-channels"),

    html.H3("Discovering and Navigating Channels"),
    html.Hr(),

    html.Div(children=[
        html.Label("Select Channel: "),
        dcc.Dropdown(id="channels-list", clearable=False),
    ]),

    html.Div(id="channel-data", style={"paddingTop": "10px"})
])


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
    if channel_name != None and channel_name != no_channel["value"]:
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

@app.callback(
    [
        Output("channels-list", "style"),
        Output("channel-data", "children")
    ],
    Input("g42-channels", "my")
)
def channel_changed(channel):
    if channel is None:
        return [None, ""]

    channel_name = channel["name"]
    color = channel.get("meta", { "color": '' })["color"]
    data = channel.get("data")

    dataAsJsonString = json.dumps(data)

    return [
        {"backgroundColor": color},
        "Current channel ({}). Data: {}".format(
            channel_name, dataAsJsonString)
    ]


if __name__ == "__main__":
    app.run_server(debug=True, host="0.0.0.0", port="8050")
