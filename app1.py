import dash_glue
import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
from server import server

app = dash.Dash(__name__, server=server, 
    routes_pathname_prefix='/app1/'
)

app.layout = dash_glue.glue42(id='glue42', children = [
    html.H2("Type anything in the text below:"),
    html.Div(dcc.Input(id='RIC', type='text', value="RIC")),
    dash_glue.context(id="my-context"),
    html.Hr(),
    html.Button(id='open-window', n_clicks = 0, children =  'Open Window' ),
    html.Button(id='raise-notification', n_clicks = 0, children =  'Raise Notification' )
])

@app.callback(Output('my-context', 'outgoing'), [Input('RIC', 'value')])
def update_context(value):
    return {"data": {"RIC": value}}

@app.callback(Output('glue42', 'openWindow'), [Input('open-window', 'n_clicks')])
def open_window(n_clicks):
    if n_clicks != 0:
        return { "name": "win1", "url": "https://google.com", }

@app.callback(Output('glue42', 'raiseNotification'), [Input('raise-notification', 'n_clicks')])
def raise_notification(n_clicks):
    if n_clicks != 0:
        return { "title": "Critical Alert", "severity": "High", "description": "Your computer will be restarted in 30 seconds" }

if __name__ == '__main__':
    app.run_server(debug=True, host='0.0.0.0', port='8050')

