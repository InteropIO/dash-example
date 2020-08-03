import dash_glue
import dash
from dash.dependencies import Input, Output
import dash_html_components as html
from run import server

def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False

app = dash.Dash(__name__, server=server, routes_pathname_prefix='/correlating-invocation-result/app-b/')

app.layout = dash_glue.glue42(id='glue42', children = [
    # Registering a method that returns a result.
    dash_glue.methodRegister(id="sum-method", definition = { 'name': 'Sum' }, returns=True),

    html.H2("Application B"),
    html.P("Method \"Sum\" registered."),
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

            # When a method is not void, we MUST always to return the assigned invocationId.
            return { "invocationId": invocationId, "invocationResult": { "sum": total } }
        else:
            return { "invocationId": invocationId, "error": { "message": "Arguments must be numbers!" } }

if __name__ == '__main__':
    app.run_server(debug=True, host='localhost', port='8051')

