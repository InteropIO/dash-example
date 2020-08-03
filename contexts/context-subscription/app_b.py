import dash_glue
import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix='/context-subscription/app-b/')

app.layout = dash_glue.glue42(id='glue42', children = [
    dash_glue.context(id="G42Core"),
    
    html.H2("Application B"),
        
    html.H4("The text below is received through \"G42Core\" context"),
    html.Div(id='G42Core-data'),
])

@app.callback(Output('G42Core-data', 'children'), [Input('G42Core', 'incoming')])
def display_context(value):
    if value is not None:
        return 'Received data: {}'.format(value['data']['RIC'])
    else:
        return 'No data'
    
if __name__ == '__main__':
    app.run_server(debug=True, host='localhost', port='8051')

