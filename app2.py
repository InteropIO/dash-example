import dash_glue
import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
from server import server 
from dash.exceptions import PreventUpdate

app = dash.Dash(__name__, server=server, 
    routes_pathname_prefix='/app2/'
)

app.layout = dash_glue.glue42(id='glue42', children = [
    dash_glue.context(id="my-context"),
    html.H2("The text below is received through the context:"),
    html.Div(id='glue-data'),

    # Interop methods example.
    dash_glue.methodRegister(id="sum-method", methodDefinition = { 'name': 'Sum' }),
])

# Interop methods example.
# "Sum" method invocation handler.
@app.callback(Output('sum-method', 'outgoing'), [Input('sum-method', 'incoming')])
def sum_handler(value):
    if value is not None:
        invocationId = value["invocationId"]
        args = value["args"]
        a = args["a"]
        b = args["b"]
        result = int(a) + int(b)
        
        return { "invocationId": invocationId, "invocationResult": { "sum": result } }
    else:
        raise PreventUpdate

@app.callback(Output('glue-data', 'children'), [Input('my-context', 'incoming')])
def display_context(value):
    if value is not None:
        return 'Received data {}'.format(value['data']['RIC'])
    else:
        return 'No data'

if __name__ == '__main__':
    app.run_server(debug=True, host='0.0.0.0', port='8051')

