import dash
from dash.exceptions import PreventUpdate
from dash.dependencies import Input, Output
import dash_html_components as html
import dash_core_components as dcc
import time
import dash_glue42
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix="/app-b/")

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

    html.H3("Application B (Publish and Subscribe Channels)"),
    html.Hr(),

    html.Div(children=[
        html.Label("Select Channel: "),
        dcc.Dropdown(id="channels-list", clearable=False),
        html.Button(id="publish-data", children="Publish Data")
    ]),
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
    if channel_name != no_channel["value"]:
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
    Output("channels-list", "style"),
    Input("g42-channels", "my")
)
def channel_changed(channel):
    if channel is not None:
        color = channel["meta"]["color"]
        return {"backgroundColor": color}

@app.callback(
    Output("g42-channels", "publish"),
    Input("publish-data", "n_clicks"),
    prevent_initial_call=True
)
def publish_data(_):
    now = time.time()

    return {
        "data": {
            "time": now
        }
    }


if __name__ == "__main__":
    app.run_server(debug=True, host="0.0.0.0", port="8050")
