import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import dash_glue
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix='/app-a/')

app.layout = dash_glue.glue42(id='glue42', children=[
    # A component which is responsible to invoke the "SendMessage" interop method.
    dash_glue.methodInvoke(id="invoke-send-message"),

    html.Div('Enter a message:'),
    html.Div(
        [
            dcc.Input(id='message', type='text', value="Hello from Application A!"),
            html.Button(id='send-message', n_clicks = 0, children = 'Send')
        ]
    )
])

# Callback that triggers "SendMessage" invocation. "SendMessage" is a void method, so we do not expect to receive a result.
@app.callback(
    Output('invoke-send-message', 'call'), 
    [Input('send-message', 'n_clicks')],
    [State('message', 'value')]
)
def send_message(n_clicks, message):
    if n_clicks != 0:
        return { "definition": { "name": "SendMessage" }, "argumentObj": { "message": message } }

if __name__ == '__main__':
    app.run_server(debug=True, host='localhost', port='8050')

