import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import dash_glue
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix='/app-a/')

app.layout = dash_glue.glue42(id='glue42', children=[
    # A component which is responsible to invoke the "Sum" interop method.
    dash_glue.methodInvoke(id="invoke-sum"),

    # A component which is responsible to invoke the "SendMessage" interop method.
    dash_glue.methodInvoke(id="invoke-send-message"),

    html.H3('Application A (Registering and Invoking Methods)'),
    html.Hr(),

    html.Div([
        dcc.Input(id='number-a', type='text', value=37), 
        dcc.Input(id='number-b', type='text', value=5),
        html.Button(id='sum-numbers', n_clicks = 0, children = 'Sum' )
    ]),
    html.Span(id='sum-numbers-result'),

    html.Hr(),

    html.Div(
        [
            html.Label('Message: '),
            dcc.Input(id='message', type='text', value="Send you daily report!"),
            html.Button(id='send-message', n_clicks = 0, children = 'Send')
        ]
    )
])

# Callback that triggers "Sum" invocation.
@app.callback(
    Output('invoke-sum', 'call'), 
    [Input('sum-numbers', 'n_clicks')], 
    [State('number-a', 'value'), State('number-b', 'value')]
)
def sum_numbers(n_clicks, a, b):
    if n_clicks != 0:
        return { "definition": { "name": "Sum" }, "argumentObj": { "a": a, "b": b } }

# Callback that handles "Sum" result.
@app.callback(
    Output('sum-numbers-result', 'children'), 
    [Input('invoke-sum', 'result')]
)
def sum_numbers_result_handler(result):
    if result is not None:
        hasError = result["error"] is not None
        if hasError == True:
            return result["error"]["message"]        
        else:
            result = result["invocationResult"]["returned"]["sum"]
            return 'Sum is {}'.format(result)

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

