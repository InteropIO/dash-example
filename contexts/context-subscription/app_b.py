import dash
from dash.dependencies import Input, Output
import dash_html_components as html
import dash_glue42
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix="/app-b/")

app.layout = dash_glue42.Glue42(id="glue42", children=[
    # Subscribe for a specific context "app-styling".
    dash_glue42.Context(id="app-styling"),

    html.Div(id="app-wrapper", children=[
        html.H3("Application B (Context Subscription)"),
        html.Hr(),

        html.H4(
            "The background color and the font color are changed through the \"app-styling\" shared context.")
    ])
])


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
    app.run_server(debug=True, host="localhost", port="8051")
