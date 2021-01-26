import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import dash_glue
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix='/app-b/')

app.layout = dash_glue.glue42(id='glue42', children = [

    dash_glue.methodRegister(id="review-message-method", definition = { 'name': 'ReviewMessage' }, returns=False),

    html.H3('Application B (Notification Click)'),
    html.Hr(),
    
    html.H4("The text below is received when a notification is clicked:"),
    html.Div(id='message'),

])

@app.callback(Output('message', 'children'), [Input('review-message-method', 'call')])
def review_message_handler(call):
    if call is not None:
        # Get the new message from the method arguments.
        message = call["args"]["message"]

        return message
    
if __name__ == '__main__':
    app.run_server(debug=True, host='localhost', port='8051')

