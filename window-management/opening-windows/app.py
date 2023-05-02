from dash import dash, Input, Output, State, html, dcc
import dash_glue42
from run import server
from flask import request
import time

def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False


width_default = 350
height_default = 350

app = dash.Dash(__name__, server=server, routes_pathname_prefix="/app/", external_stylesheets=['/assets/app-common.css'])

app.enable_dev_tools()

app.layout = dash_glue42.Glue42(id="glue42", children=[
    dash_glue42.Windows(id="g42-windows"),

    html.H3("Opening Windows"),
    html.Hr(),

    html.Div(
        [
            html.Label("Width: "),
            dcc.Input(id="width", type="text",
                      autoComplete="off", value=width_default),
            html.Label("Height: "),
            dcc.Input(id="height", type="text",
                      autoComplete="off", value=height_default),
            html.Button(id="open-window", children="Open Window")
        ]
    )
])


@app.callback(
    Output("g42-windows", "open"),
    Input("open-window", "n_clicks"),
    State("width", "value"),
    State("height", "value"),
    prevent_initial_call=True
)
def open_window(_, widthValue, heightValue):
    url = request.host_url + "app"
    width = float(widthValue) if is_number(widthValue) else width_default
    height = float(heightValue) if is_number(
        heightValue) else height_default

    return {
        "name": str(time.time()),
        "url": url,
        "options": {
            "width": width,
            "height": height,
        }
    }


if __name__ == "__main__":
    app.run_server(debug=True, host="0.0.0.0", port="8050")
