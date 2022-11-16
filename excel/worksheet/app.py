import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import dash_table
import dash_glue42
from run import server
import json
from excel_helpers import excel_columns_configs, show_grid, get_data_as_json, parse_image_response, validate_show_grid_method_name, get_column_index
from data import trades_data
from dash.exceptions import PreventUpdate

app = dash.Dash(__name__, server=server, routes_pathname_prefix="/app/")

app.enable_dev_tools()

# Use Excel column configs to generate columns for the data table component.
table_columns = [{"name": col["text"], "id": col["name"]}
                 for col in excel_columns_configs]

min_quantity_default = 0
max_quantity_default = 300

app.layout = dash_glue42.Glue42(id="glue42", children=[
    # Register a method with an arbitrary name to receive data changes from MS Excel.
    dash_glue42.MethodRegister(
        id="g42-register-ValidateShowGrid", definition=validate_show_grid_method_name, returns=True),

    # Invoke the "T42.ExcelPad.ShowGrid" interop method which is registered by the Glue42 Excel Connector to open a new worksheet.
    dash_glue42.MethodInvoke(id="g42-invoke-show-grid"),

    # UI
    html.Div(
        className="container",
        children=[
            html.Div(id="controls", children=[
                html.P(
                    "Select a range for Quantity validation:",
                    className="control_label",
                ),
                dcc.RangeSlider(
                    id="quantity-range",
                    min=0,
                    max=300,
                    value=[min_quantity_default, max_quantity_default],
                    className="dcc_control",
                    marks={
                        0: {"label": "0"},
                        50: {"label": "50"},
                        100: {"label": "100"},
                        150: {"label": "150"},
                        200: {"label": "200"},
                        250: {"label": "250"},
                        300: {"label": "300"},
                    }
                ),

                html.Button(id="open-excel", className="button",
                            n_clicks=0, children="Open Excel"),
            ]),

            dash_table.DataTable(
                id="trades-table",
                columns=table_columns,
                data=trades_data,
                editable=True,
                style_header={
                    "backgroundColor": "#1eaedb",
                    "color": "white",
                    "textAlign": "center",
                },
                style_cell={
                    "border": "white"
                },
                style_data_conditional=[
                    {
                        "if": {
                            "row_index": "even"
                        }, 
                        "backgroundColor": "#f9f9f9"
                    }
                ],
            )
        ]
    )
])


@app.callback(
    Output("g42-invoke-show-grid", "invoke"),
    Input("open-excel", "n_clicks"),

    # Will use data_previous as a trigger when a cell is edited.
    Input("trades-table", "data_previous"),
    State("trades-table", "data"),
    prevent_initial_call=True
)
def open_excel(_, on_change, data):
    # Column configs must be converted to a JSON string before being sent to Excel.
    columns_as_json = json.dumps(excel_columns_configs)

    # Data must be converted to a JSON string before being sent to Excel.
    data_as_json = get_data_as_json(excel_columns_configs, data)
    workbook = "TradesBook"
    worksheet = "Trades"

    return show_grid(columns_as_json, data_as_json, workbook, worksheet)


def validate_trades_data(data, min_quantity, max_quantity):
    errors = []
    for index in range(len(data)):
        quantity = data[index]["quantity"]

        error = {
            "row": index + 1,
            "column": get_column_index("quantity"),
            "backgroundColor": "#FFC7CE",
            "foregroundColor": "#9C0006",
        }

        if isinstance(quantity, float):
            if (quantity < min_quantity):
                errors.append({
                    **error,
                    **{"description": f"Validation failed for Quantity: Less Than {min_quantity}"}
                })

            if (quantity > max_quantity):
                errors.append({
                    **error,
                    **{"description": f"Validation failed for Quantity: Greater Than {max_quantity}"}
                })
        else:
            errors.append({
                **error,
                **{"description": "Validation failed for Quantity: Number"}
            })

    return errors


@app.callback(
    [
        Output("trades-table", "data"),
        Output("g42-register-ValidateShowGrid", "result")
    ],
    Input("g42-register-ValidateShowGrid", "invoke"),
    State("quantity-range", "value"),
    State("trades-table", "data")
)
def validate_show_grid(invoke, quantity_range, data):
    if invoke is None:
        raise PreventUpdate

    invocationId = invoke.get("invocationId")
    args = invoke.get("args", {})
    dataAsJSON = args["dataAsJSON"]
    data_from_excel = parse_image_response(dataAsJSON)

    min_quantity = quantity_range[0] if len(
        quantity_range) > 1 else min_quantity_default

    max_quantity = quantity_range[1] if len(
        quantity_range) > 1 else max_quantity_default

    errors = validate_trades_data(
        data_from_excel, min_quantity, max_quantity)

    has_errors = len(errors) > 0
    if has_errors:
        # Preserve the current table data due to validation failed. Return response to the Excel Connector that changes are not valid.
        return [
            data,
            {
                "invocationId": invocationId,
                "invocationResult": {
                    "isValid": False,
                    "errorsAsJSON": json.dumps(errors)
                }
            }
        ]
    else:
        # Update the table data. Return response to the Excel Connector that no errors were found.
        return [
            data_from_excel if (len(data_from_excel) > 0) else data,
            {
                "invocationId": invocationId,
                "invocationResult": {
                    "isValid": True
                }
            }
        ]


if __name__ == "__main__":
    app.run_server(debug=True, host="localhost", port="8050")
