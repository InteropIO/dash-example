import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import dash_glue
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix='/context-subscription/app-a/')

app.layout = dash_glue.glue42(id='glue42', children=[
    html.H2("Application A"),

    html.H4("Type anything in the text below:"),
    html.Div(dcc.Input(id='RIC', type='text', value="RIC", autoComplete="")),

    dash_glue.context(id="G42Core"),
])


@app.callback(Output('G42Core', 'outgoing'), [Input('RIC', 'value')])
def update_context(value):
    return { "data": { "RIC": value } }

if __name__ == '__main__':
    app.run_server(debug=True, host='localhost', port='8050')

