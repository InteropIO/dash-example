import dash_glue42
from dash.exceptions import PreventUpdate
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


app = dash.Dash(__name__, server=server, routes_pathname_prefix="/app-b/")

app.layout = dash_glue42.Glue42(id="glue42", children=[
    # Registering a method that returns a result.
    dash_glue42.MethodRegister(
        id="g42-sum-method", definition={"name": "Sum"}, returns=True),

    html.H3("Application B (Correlating an Invocation with a Returned Result)"),
    html.Hr(),

    html.P("Interop method \"Sum\" registered."),
])


@app.callback(
    Output("g42-sum-method", "result"),
    Input("g42-sum-method", "invoke")
)
def sum_invocation_handler(invoke):
    """Invocation handler for "Sum" interop method."""

    if invoke is None:
        raise PreventUpdate

    invocationId = invoke.get("invocationId")
    args = invoke.get("args", {})
    a = args.get("a")
    b = args.get("b")

    are_numbers = is_number(a) and is_number(b)
    if are_numbers:
        total = float(a) + float(b)

        # When a method is not void, we MUST always return the assigned invocationId,
        # otherwise the caller won't receive the result.
        return {
            "invocationId": invocationId,
            "invocationResult": {
                "sum": total
            }
        }
    else:
        return {
            "invocationId": invocationId,
            "error": {
                "message": "Arguments must be numbers!"
            }
        }


if __name__ == "__main__":
    app.run_server(debug=True, host="localhost", port="8051")
