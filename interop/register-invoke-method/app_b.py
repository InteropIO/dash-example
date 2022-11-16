import dash
from dash.exceptions import PreventUpdate
from dash.dependencies import Input, Output
import dash_html_components as html
import dash_glue42
from run import server


def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False


app = dash.Dash(__name__, server=server, routes_pathname_prefix="/app-b/")

app.enable_dev_tools()

app.layout = dash_glue42.Glue42(id="glue42", children=[
    # Register an interop method that returns a result.
    dash_glue42.MethodRegister(
        id="g42-register-sum", definition={"name": "Sum"}, returns=True),

    # Register an interop method that doesn"t return. It is void.
    dash_glue42.MethodRegister(id="g42-register-send-message",
                             definition={"name": "SendMessage"}, returns=False),

    html.H3("Application B (Registering and Invoking Methods)"),
    html.Hr(),

    html.H4("The text below is received as an argument of the \"SendMessage\" Interop method:"),
    html.Div(id="message")
])


@app.callback(
    Output("g42-register-sum", "result"),
    Input("g42-register-sum", "invoke")
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
        # otherwise the caller won"t receive the result.
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


@app.callback(
    Output("message", "children"),
    Input("g42-register-send-message", "invoke")
)
def send_message_invocation_handler(invoke):
    """Invocation handler for the "Sum" interop method."""

    if invoke is not None:
        args = invoke.get("args", {})
        message = args.get("message", "")
        return message


if __name__ == "__main__":
    app.run_server(debug=True, host="localhost", port="8051")
