from dash import dash, Input, Output, html, dcc
import dash_glue42
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix="/app-a/")

app.enable_dev_tools()

app.layout = dash_glue42.Glue42(id="glue42", children=[
    # Using the general API to set/update contexts.
    dash_glue42.Contexts(id="g42-shared-contexts"),

    # Subscribe for a specific context "app-styling".
    dash_glue42.Context(id="app-styling"),

    html.Div(id="app-wrapper", children=[
        html.H3("Application A (Context Subscription)"),
        html.Hr(),

        html.H4(
            "The background color and the font color are changed through the \"app-styling\" shared context."),

        html.Button(id="default-styling-btn", children="Set Default Styles"),
        html.Div(children=[
            html.Label("Background Color: "),
            dcc.Input(id="background-color", type="text",
                      value="white", autoComplete="off"),
        ]),
        html.Div(children=[
            html.Label("Font Color: "),
            dcc.Input(id="font-color", type="text",
                      value="black", autoComplete="off")
        ])
    ])
])


@app.callback(
    [
        Output("g42-shared-contexts", "set"),
        Output("background-color", "value"),
        Output("font-color", "value")
    ],
    Input("default-styling-btn", "n_clicks"),
    prevent_initial_call=True
)
def set_default_app_styling(_):
    bgColorInputValue = "white"
    fortColorInputValue = "black"
    context = {
        "name": "app-styling",
        "data": {
            "backgroundColor": bgColorInputValue,
            "color": fortColorInputValue
        }
    }


    return [context, bgColorInputValue, fortColorInputValue]


@app.callback(
    Output("g42-shared-contexts", "update"),
    Input("background-color", "value"),
    Input("font-color", "value"),
    prevent_initial_call=True
)
def update_app_styling_context(background_color, font_color):
    return {
        "name": "app-styling",
        "data": {
            "backgroundColor": background_color,
            "color": font_color
        }
    }


@app.callback(
    Output("app-wrapper", "style"),
    Input("app-styling", "context")
)
def app_styling_context_changed_handler(context):
    if context is not None:
        data = context.get("data", {})
        background_color = data.get("backgroundColor")
        font_color = data.get("color")

        return {
            "backgroundColor": background_color,
            "color": font_color
        }


if __name__ == "__main__":
    app.run_server(debug=True, host="localhost", port="8050")
