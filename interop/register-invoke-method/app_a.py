import dash
from dash.exceptions import PreventUpdate
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import dash_glue42
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix="/app-a/")

app.enable_dev_tools()

app.layout = dash_glue42.Glue42(id="glue42", children=[
    dash_glue42.MethodInvoke(id="g42-invoke-sum"),
    dash_glue42.MethodInvoke(id="g42-invoke-send-message"),

    html.H3("Application A (Registering and Invoking Methods)"),
    html.Hr(),

    html.Div([
        dcc.Input(id="number-a", type="text",
                  autoComplete="off", value=37),
        dcc.Input(id="number-b", type="text",
                  autoComplete="off", value=5),
        html.Button(id="sum-numbers-btn", children="Sum"),
    ]),
    html.P(id="sum-numbers-result"),

    html.Hr(),

    html.Div(
        [
            html.Label("Message: "),
            dcc.Input(id="message", type="text",  autoComplete="off",
                      value="Send your daily report!"),
            html.Button(id="send-message", children="Send")
        ]
    )
])


@app.callback(
    Output("g42-invoke-sum", "invoke"),
    Input("sum-numbers-btn", "n_clicks"),
    State("number-a", "value"),
    State("number-b", "value"),
    prevent_initial_call=True
)
def sum_numbers(_, a, b):
    """Triggers an invocation of the "Sum" interop method."""

    return {
        "definition": {
            "name": "Sum"
        },
        "argumentObj": {
            "a": a,
            "b": b
        }
    }


@app.callback(
    Output("sum-numbers-result", "children"),
    Input("g42-invoke-sum", "result")
)
def sum_numbers_result_handler(result):
    """Handles the returned results from a "Sum" interop method invocation."""

    if result is None:
        raise PreventUpdate

    error = result.get("error")
    hasError = error is not None
    if hasError:
        return error.get("message", '')
    else:
        invocationResult = result.get("invocationResult", {})
        sumValue = invocationResult.get("returned", {}).get("sum")
        return "Sum is {}".format(sumValue)


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
