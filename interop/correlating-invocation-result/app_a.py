from dash import dash, Input, Output, State, html, dcc
from dash.exceptions import PreventUpdate
import uuid
import time
import dash_glue42
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix="/app-a/")

app.enable_dev_tools()

app.layout = dash_glue42.Glue42(id="glue42", children=[
    dash_glue42.MethodInvoke(id="g42-invoke-sum"),

    # We will use the Store component to share data between the callback that triggers the "Sum" method invocation
    # and the callback handling the "Sum" results.
    dcc.Store("invocation-time-store", data={}),

    html.H3("Application A (Correlating an Invocation with a Returned Result)"),
    html.Hr(),

    html.Div([
        dcc.Input(id="number-a", type="text", autoComplete="off", value=37),
        dcc.Input(id="number-b", type="text", autoComplete="off", value=5),
        html.Button(id="sum-numbers-btn", children="Sum")
    ]),
    html.P(id="sum-numbers-result"),
    html.P(id="elapsed-time"),
])


@app.callback(
    [
        Output("invocation-time-store", "data"),
        Output("g42-invoke-sum", "invoke")
    ],
    Input("sum-numbers-btn", "n_clicks"),
    State("number-a", "value"),
    State("number-b", "value"),
    State("invocation-time-store", "data"),
    prevent_initial_call=True
)
def sum_numbers(_, a, b, invocations_dict):
    """Triggers an invocation of the "Sum" interop method."""

    invocationId = str(uuid.uuid4())
    invocationTime = time.time()
    invocations_dict[invocationId] = invocationTime

    return invocations_dict, {
        "invocationId": invocationId,
        "definition": {
            "name": "Sum"
        },
        "argumentObj": {"a": a, "b": b}
    }

@app.callback(
    [
        Output("sum-numbers-result", "children"),
        Output("elapsed-time", "children")
    ],
    Input("g42-invoke-sum", "result"),
    State("invocation-time-store", "data")
)
def sum_result_handler(result, invocations_dict):
    """Handles the returned results from a "Sum" interop method invocation."""

    if result is None:
        raise PreventUpdate

    # An error is assigned when method invocation fails.
    hasError = result.get("error") is not None
    if hasError:
        error = result.get("error", {})
        return [error.get("message", ""), '']
    else:
        invocationId = result["invocationId"]
        invocationTime = invocations_dict[invocationId]

        result = result["invocationResult"]["returned"]["sum"]

        elapsed_time = time.time() - invocationTime

        return ["Sum is {}.".format(result), "Response elapsed time {} seconds.".format(elapsed_time)]


if __name__ == "__main__":
    app.run_server(debug=True, host="localhost", port="8050")
