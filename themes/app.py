from dash import dash, Input, Output, html, dcc
import dash_glue42
from dash.exceptions import PreventUpdate

app = dash.Dash(__name__, title="Themes Example")
app.enable_dev_tools()

t42_themes_context = dash_glue42.Context(id='themes-context', contextName="T42.Themes")

themes_dropdown = dcc.Dropdown(id="themes-list", clearable=False)

app.layout = dash_glue42.Glue42(
        id="glue42", 
        fallback='Glue42 Loading...',
        children=[
            t42_themes_context,

            html.H3(id="welcome-text"),

            html.Div(id="themes-switch-panel", children=[
                html.Label("Switch Theme"),
                themes_dropdown,
            ], style={ "display": "none" }),
        ],
    )

@app.callback(
    Output("welcome-text", "children"),
    Input("glue42", "isEnterprise"),
)
def set_welcome_text(is_enterprise):
    return "Hello Glue42 Enterprise!" if is_enterprise else "Hello Browser!"

@app.callback(
    Output("themes-switch-panel", "style"),
    Input("glue42", "isEnterprise"),
)
def display_themes_switch_panel(is_enterprise):
    return { "display": "block" } if is_enterprise else { "display": "none" }

@app.callback(
    Output(themes_dropdown, "options"),
    Input(t42_themes_context, "context"),
)
def update_themes_dropdown(context):
    if context is None:
        return []

    all = context.get("data", {}).get("all", [])
    options = map(lambda item: {
                    "label": item.get("displayName"), "value": item.get("name")}, all)
    
    return list(options)

@app.callback(
    Output(t42_themes_context, "update"),
    Input(themes_dropdown, "value")
)
def switch_theme(value):
    if value is None:
        raise PreventUpdate

    return {
        "selected": value
    }

if __name__ == "__main__":
    app.run_server(debug=True, host="localhost", port="8050")
