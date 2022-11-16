import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import dash_glue42
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix="/app-a/")

app.enable_dev_tools()

app.layout = dash_glue42.Glue42(id="glue42", children=[
    dash_glue42.MethodInvoke(id="g42-invoke-send-message"),

    html.H3("Application A (Interoperability between Dash and JavaScript)"),
    html.Hr(),

    html.Div(
        [
            html.Div("Message: "),
            dcc.Input(id="message", type="text", autoComplete="off",
                      value="Send you daily report!"),
            html.Button(id="send-message", children="Send")
        ]
    )
])


@app.callback(
    Output("g42-invoke-send-message", "invoke"),
    Input("send-message", "n_clicks"),
    State("message", "value"),
    prevent_initial_call=True
)
def send_message(_, message):
    """Triggers an invocation of the "SendMessage" interop method."""

    return {
        "definition": {
            "name": "SendMessage"
        },
        "argumentObj": {
            "message": message
        }
    }


if __name__ == "__main__":
    app.run_server(debug=True, host="localhost", port="8050")
