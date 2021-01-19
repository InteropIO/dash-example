import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import dash_glue
from run import server
from flask import request
import time

def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False

width_default = 350
height_default = 350

app = dash.Dash(__name__, server=server, routes_pathname_prefix='/app/')

app.layout = dash_glue.glue42(id='glue42', children=[
    html.H3('Opening Windows'),
    html.Hr(),

    html.Div(
        [
            html.Label("Width: "),
            dcc.Input(id='width', type='text', value=width_default),
            html.Label("Height: "),
            dcc.Input(id='height', type='text', value=height_default),
            html.Button(id='open-window', n_clicks = 0, children = 'Open Window')
        ]
    )
])

@app.callback(
    Output('glue42', 'openWindow'), 
    [Input('open-window', 'n_clicks')], 
    [State("width", "value"), State("height", "value")]
)
def raise_notification(n_clicks, widthValue, heightValue):
    if n_clicks != 0:
        url = request.host_url + 'app'
        width = float(widthValue) if is_number(widthValue) else width_default
        height = float(heightValue) if is_number(heightValue) else height_default

        return { 
            "title": "win1",
            "name": str(time.time()),
            "url": url,
            "options": {
                "width": width, 
                "height": height,
            }
        }

if __name__ == '__main__':
    app.run_server(debug=True, host='0.0.0.0', port='8050')

