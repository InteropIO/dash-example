import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import dash_glue42
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix="/app/")

# Uncomment to enable Dash dev tools.
# app.enable_dev_tools()

app.layout = dash_glue42.Glue42(id="glue42", children=[
    dash_glue42.Notifications(id="g42-notifications"),

    html.H3("Raising Notification"),
    html.Hr(),

    html.H4("Enter a notification details:"),
    html.Div(
        [
            html.Label("Title: "),
            dcc.Input(id="notification-title", autoComplete="off",
                      type="text", value="Alert")
        ]
    ),

    html.Div(
        [
            html.Label("Body: "),
            dcc.Input(id="notification-body", autoComplete="off",
                      type="text", value="Send daily report")

        ]
    ),

    html.Button(id="raise-notification", children="Raise Notification")
])


@app.callback(
    Output("g42-notifications", "raise"),
    Input("raise-notification", "n_clicks"),
    State("notification-title", "value"),
    State("notification-body", "value"),
    prevent_initial_call=True
)
def raise_notification(_, title, body):
    return {
        "title": title,
        "body": body
    }


if __name__ == "__main__":
    app.run_server(debug=True, host="0.0.0.0", port="8050")
