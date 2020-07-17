import dash_glue
import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
from server import server 

app = dash.Dash(__name__, server=server, 
    routes_pathname_prefix='/app2/'
)

app.layout = dash_glue.glue42(id='glue42', children = [
    dash_glue.context(id="my-context"),
    html.H2("The text below is received through the context:"),
    html.Div(id='glue-data')
])

@app.callback(Output('glue-data', 'children'), [Input('my-context', 'incoming')])
def display_context(value):
    if value is not None:
        return 'Received data {}'.format(value['data']['RIC'])
    else:
        return 'No data'

if __name__ == '__main__':
    app.run_server(debug=True, host='0.0.0.0', port='8051')

