import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import uuid
import time
import dash_glue
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix='/app-a/')

app.layout = dash_glue.glue42(id='glue42', children=[
    # A component which is responsible for invoking the "Sum" Interop method.
    dash_glue.methodInvoke(id="invoke-sum"),

    # We will use the Store to share data between the callback that triggers the "Sum" invocation and the callback handling the "Sum" results.
    dcc.Store('invocation-time-store', data={}),

    html.H3('Application A (Correlating an Invocation with a Returned Result)'),
    html.Hr(),

    html.Div([
        dcc.Input(id='number-a', type='text', value=37),
        dcc.Input(id='number-b', type='text', value=5),
        html.Button(id='sum-numbers', n_clicks = 0, children = 'Sum' )
    ]),
    html.Span(id='sum-numbers-result')
])

# Callback that triggers "Sum" invocation.
@app.callback(
    [Output('invocation-time-store', 'data'), Output('invoke-sum', 'call')], 
    [Input('sum-numbers', 'n_clicks')], 
    [State('number-a', 'value'), State('number-b', 'value'), State('invocation-time-store', 'data')]
)
def sum_numbers(n_clicks, a, b, invocationsDict):
    if n_clicks != 0:
        invocationId = str(uuid.uuid4())
        
        invocationTime = time.time()
        invocationsDict[invocationId] = invocationTime

        return [
            invocationsDict,
            { "invocationId": invocationId, "definition": { "name": "Sum" }, "argumentObj": { "a": a, "b": b } }
        ]

    return [invocationsDict, None]

# Callback that handles "Sum" result.
@app.callback(
    Output('sum-numbers-result', 'children'), 
    [Input('invoke-sum', 'result')],
    [State('invocation-time-store', 'data')]
)
def sum_numbers_result_handler(result, invocationsDict):
    if result is not None:
        # An error is assigned when method invocation fails.
        hasError = result["error"] is not None
        if hasError == True:
            return result["error"]["message"]        
        else:
            invocationId = result["invocationId"]
            invocationTime = invocationsDict[invocationId]

            result = result["invocationResult"]["returned"]["sum"]

            elapsed_time = time.time() - invocationTime

            return 'Sum is {}. Invocation time {}'.format(result, elapsed_time)

if __name__ == '__main__':
    app.run_server(debug=True, host='localhost', port='8050')

