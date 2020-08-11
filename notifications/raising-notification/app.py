import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import dash_glue
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix='/app/')

app.layout = dash_glue.glue42(id='glue42', children=[
    html.H3('Raising Notification'),
    html.Hr(),

    html.H4('Enter a notification details below:'),
    html.Div(
        [
            html.Label("Title: "),
            dcc.Input(id='notification-title', type='text', value="Alert")
        ]
    ),

    html.Div(
        [
            html.Label("Body: "),
            dcc.Input(id='notification-body', type='text', value="Send daily report"),

        ]
    ),
    
    html.Button(id='raise-notification', n_clicks = 0, children = 'Raise Notification')
])

@app.callback(
    Output('glue42', 'raiseNotification'), 
    [Input('raise-notification', 'n_clicks')], 
    [State("notification-title", "value"), State("notification-body", "value")]
)
def raise_notification(n_clicks, title, body):
    if n_clicks != 0:
        return { "title": title, "body": body }

if __name__ == '__main__':
    app.run_server(debug=True, host='0.0.0.0', port='8050')

