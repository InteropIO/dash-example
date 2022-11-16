from dash import dash, Input, Output, State, html, dcc
import dash_glue42
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix="/app-a/")

app.enable_dev_tools()

app.layout = dash_glue42.Glue42(id="glue42", children=[
    dash_glue42.Notifications(id="g42-notifications"),

    html.H3("Application A (Notification Actions)"),
    html.Hr(),

    html.Div(
        [
            html.Label("Message: "),
            dcc.Input(id="message", autoComplete="off", type="text",
                      value="Check your portfolio!"),
            html.Button(id="raise-notification", children="Raise Notification")
        ]
    )
])


@app.callback(
    Output("g42-notifications", "raise"),
    Input("raise-notification", "n_clicks"),
    State("message", "value"),
    prevent_initial_call=True
)
def raise_notification(_, message):
    # To use the method "ReviewMessage" for handling the notification action button click,
    # we need to define a settings object and assign it as a value to the interop property of the action object in the actions array.
    review_message_interop = {
        "method": "ReviewMessage",
        "arguments": {
            "message": message
        }
    }

    notification_options = {
        "title": "New Message",
        "body": "Click button to review",
        "actions": [
            {
                "action": "ReviewMessage",
                "title": "Review",
                "interop": review_message_interop
            }
        ]
    }

    return notification_options


if __name__ == "__main__":
    app.run_server(debug=True, host="localhost", port="8050")
