import dash_glue
import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
from server import server

app = dash.Dash(__name__, server=server, 
    routes_pathname_prefix='/app2/'
)

def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False

app.layout = dash_glue.glue42(id='glue42', children = [
    html.H2("Dash App 2"),
    
    dash_glue.context(id="my-context"),
    html.H4("The text below is received through the context:"),
    html.Div(id='glue-data'),

    html.H4("The text below is received from a method invocation (call):"),
    html.Div(id='glue-send-message'),

    # Interop methods example.
    dash_glue.methodRegister(id="sum-method", definition = { 'name': 'Sum' }, returns=True),
    dash_glue.methodRegister(id="send-message-method", definition = { 'name': 'Send.Message' }, returns=False),
])

# Interop methods example. "Sum" method invocation handler.
@app.callback(Output('sum-method', 'result'), [Input('sum-method', 'call')])
def sum_handler(call):
    if call is not None:
        invocationId = call["invocationId"]
        args = call["args"]
        a = args["a"]
        b = args["b"]

        validArgs = is_number(a) and is_number(b)
        if validArgs == True:
            total = float(a) + float(b)

            # When method is not void, we need to return the assigned invocationId.
            return { "invocationId": invocationId, "invocationResult": { "sum": total } }
        else:
            return { "invocationId": invocationId, "error": { "message": "Arguments must be numbers" } }
    
@app.callback(Output('glue-send-message', 'children'), [Input('send-message-method', 'call')])
def send_message_handler(call):
    if call is not None:
        args = call["args"]
        message = args["message"]
        
        return 'Received message: {}'.format(message)
    else:
        return 'No data'

@app.callback(Output('glue-data', 'children'), [Input('my-context', 'incoming')])
def display_context(value):
    if value is not None:
        return 'Received data: {}'.format(value['data']['RIC'])
    else:
        return 'No data'

if __name__ == '__main__':
    app.run_server(debug=True, host='0.0.0.0', port='8051')

