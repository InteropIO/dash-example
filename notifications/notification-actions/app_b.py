import dash
from dash.dependencies import Input, Output
import dash_html_components as html
import dash_glue42
from run import server

app = dash.Dash(__name__, server=server, routes_pathname_prefix="/app-b/")

# Uncomment to enable Dash dev tools.
# app.enable_dev_tools()

app.layout = dash_glue42.Glue42(id="glue42", children=[

    dash_glue42.MethodRegister(id="g42-register-review-message",
                             definition={"name": "ReviewMessage"}, returns=False),

    html.H3("Application B (Notification Actions)"),
    html.Hr(),

    html.H4("The text below is received when a notification action button is clicked:"),
    html.Div(id="message"),
])


@app.callback(
    Output("message", "children"),
    Input("g42-register-review-message", "invoke")
)
def review_message_invocation_handler(invoke):
    if invoke is not None:
        args = invoke.get("args", {})
        message = args.get("message", "")

        return message


if __name__ == "__main__":
    app.run_server(debug=True, host="localhost", port="8051")
