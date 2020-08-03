import dash_glue
import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix='/notification-actions/app-b/')

app.layout = dash_glue.glue42(id='glue42', children = [
    html.H2("Application B"),
    
    html.H4("The text below is received when a notification action is clicked:"),
    html.Div(id='notification-message'),

    dash_glue.methodRegister(id="handle-notification-click", definition = { 'name': 'HandleNotificationClick' }, returns=False)
])

@app.callback(Output('notification-message', 'children'), [Input('handle-notification-click', 'call')])
def sum_handler(call):
    if call is not None:
        invocationId = call["invocationId"]
        args = call["args"]
        message = args["message"]

        return message
    
if __name__ == '__main__':
    app.run_server(debug=True, host='localhost', port='8051')

