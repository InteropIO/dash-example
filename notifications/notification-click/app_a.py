import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import dash_glue
from run import server

app = dash.Dash(__name__, server=server, 
    routes_pathname_prefix='/notification-click/app-a/'
)

app.layout = dash_glue.glue42(id='glue42', children=[
    html.H2("Application A"),

    html.Div('Enter a message:'),
    html.Div(
        [
            dcc.Input(id='message', type='text'),
            html.Button(id='raise-new-trade', n_clicks = 0, children = 'Raise Notification')
        ]
    )
])

@app.callback(Output('glue42', 'raiseNotification'), [Input('raise-new-trade', 'n_clicks')], [State("message", "value")])
def raise_notification(n_clicks, message):
    if n_clicks != 0:

        interop_settings = {
            "method": "HandleNotificationClick",
            "arguments": {
                "message": message
            }
        }

        notification_options = { 
            "title": "Alert", 
            # "body": "VOD.L: 23 shares sold @ $212.03",
            "clickInterop": interop_settings
        }

        return notification_options

if __name__ == '__main__':
    app.run_server(debug=True, host='localhost', port='8050')

