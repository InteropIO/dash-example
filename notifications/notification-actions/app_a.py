import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import dash_glue
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix='/app-a/')

app.layout = dash_glue.glue42(id='glue42', children=[
    html.H3('Application A (Notification Actions)'),
    html.Hr(),

    html.Div(
        [
            html.Label('Message: '),
            dcc.Input(id='message', type='text', value = "Check your portfolio!"),
            html.Button(id='raise-notification', n_clicks = 0, children = 'Raise Notification')
        ]
    )
])

@app.callback(Output('glue42', 'raiseNotification'), [Input('raise-notification', 'n_clicks')], [State("message", "value")])
def raise_notification(n_clicks, message):
    if n_clicks != 0:

        # To use the method "ReviewMessage" for handling the notification action button click, 
        # we need to define a settings object and assign it as a value to the interop property of the action object in the actions array.
        interop_settings = {
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
                    "interop": interop_settings
                }
            ]
        }

        return notification_options

if __name__ == '__main__':
    app.run_server(debug=True, host='localhost', port='8050')

