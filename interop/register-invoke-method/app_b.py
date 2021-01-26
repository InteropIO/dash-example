import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import dash_glue
from run import server

def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False

app = dash.Dash(__name__, server=server, routes_pathname_prefix='/app-b/')

app.layout = dash_glue.glue42(id='glue42', children = [
    # Registering a method that returns a result.
    dash_glue.methodRegister(id="sum-method", definition = { 'name': 'Sum' }, returns=True),

    # Registering a method that does not return a result. It is void.
    dash_glue.methodRegister(id="send-message-method", definition = { 'name': 'SendMessage' }, returns=False),

    html.H3('Application B (Registering and Invoking Methods)'),
    html.Hr(),
    
    html.H4("The text below is received from the \"SendMessage\" method invocation:"),
    html.Div(id='message')
])

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

            # When a method is not void, we MUST always return the assigned invocationId, otherwise the caller won't receive the result.
            return { "invocationId": invocationId, "invocationResult": { "sum": total } }
        else:
            return { "invocationId": invocationId, "error": { "message": "Arguments must be numbers!" } }

@app.callback(Output('message', 'children'), [Input('send-message-method', 'call')])
def sum_handler(call):
    if call is not None:
        message = call["args"]["message"]
        return message
    
if __name__ == '__main__':
    app.run_server(debug=True, host='localhost', port='8051')

