import json
from uuid import uuid4

validate_show_grid_method_name = "ValidateShowGrid"

validation_alerts = {
    "stop": "Stop",
    "info": "Information",
    "warn": "Warning"
}

validation_types = {
    "date": "Date",
    "time": "Time",
    "decimal": "Decimal",
    "text_length": "TextLength",
    "whole_number": "WholeNumber",
    "list": "List"
}

# Declarative validation.
"""
    You can specify what type of data the user can enter in a cell.
    Possible "alert" values:
        - Information - Inform users that the data they entered is invalid, without preventing them from entering it. 
            This type of error alert is the most flexible. When an Information alert message appears, users can click OK to accept the invalid value or Cancel to reject it.
        - Stop - Prevent users from entering invalid data in a cell. A Stop alert message has two options: Retry or Cancel.
        - Warning - Warn users that the data they entered is invalid, without preventing them from entering it. 
            When a Warning alert message appears, users can click Yes to accept the invalid entry, No to edit the invalid entry, or Cancel to remove the invalid entry.

    Possible "type" values:
        - Date - Only dates are allowed.
        - Time - Only times are allowed.
        - Decimal - Only decimal numbers are allowed. Once the decimal number option is selected, other options become available to further limit the input.
        - TextLength - Validates the input based on a number of characters or digits.
        - WholeNumber - Only whole numbers are allowed. Once the whole number option is selected, other options become available to further limit input.
        - List - Only values from a predefined list are allowed. The values are presented to the user as a dropdown menu control.

    See an example the "Original Currency" column config.
"""
excel_columns_configs = [
    {
        # The field name in the object (dictionary).
        "name": "tradeId",

        # A string that forms the Column header text in Excel.
        "text": "Trade ID",

        # A color value for the text color of the cells in this column.
        "foregroundColor": "",

        # A color value for the background color of the cells in this column.
        "backgroundColor": "",

        # Width of the column in Excel units of 0 (zero) to 255.
        # This value represents the number of characters that can be displayed in a cell that is formatted with the standard font.
        "width": None,

        # The type and possible values for cells in the column.
        "validation": None
    },
    {
        "name": "customer",
        "text": "Customer",
        "foregroundColor": "",
        "backgroundColor": "",
        "width": 20,
        "validation": None

    },
    {
        "name": "trade",
        "text": "Trade",
        "foregroundColor": "",
        "backgroundColor": "",
        "width": None,
        "validation": None

    },
    {
        "name": "bbgSymbol",
        "text": "BBG Symbol",
        "foregroundColor": "",
        "backgroundColor": "",
        "width": None,
        "validation": None

    },
    {
        "name": "isin",
        "text": "ISIN",
        "foregroundColor": "",
        "backgroundColor": "",
        "width": None,
        "validation": None

    },
    {
        "name": "securityDescription",
        "text": "Description",
        "foregroundColor": "",
        "backgroundColor": "",
        "width": 30,
        "validation": None

    },
    {
        "name": "quantity",
        "text": "Quantity",
        "foregroundColor": "",
        "backgroundColor": "",
        "width": None,
        "validation": None

    },
    {
        "name": "unitPrice",
        "text": "Unit Price",
        "foregroundColor": "",
        "backgroundColor": "",
        "width": None,
        "validation": None

    },
    {
        "name": "originalCurrency",
        "text": "Original Currency",
        "foregroundColor": "",
        "backgroundColor": "",
        "width": 17,
        "validation": {
            "type": "xlValidate" + validation_types["list"],
            "alert": "xlValidAlert" + validation_alerts["stop"],
            "list": ["EUR", "USD", "GBP"]
        }
    }
]


def show_grid(columns_as_json, data_as_json, workbook, worksheet):
    return {
        "definition": {
            "name": "T42.ExcelPad.ShowGrid"
        },
        "argumentObj": {
            "columnsAsJSON": columns_as_json,
            "dataAsJSON": data_as_json,

            # This value is passed back to the application that called T42.ExcelPad.ShowGrid. It may be used as a correlation ID.
            "cookie": str(uuid4()),

            # Accepts - "delta" or "image". A "delta" response will return only the delta change and "image" will return the current data after the change.
            "response": "image",

            # Remove all existing rows before applying the new data.
            "clearGrid": True,

            # Name of the workbook to reuse. Otherwise, a new temporary workbook will be created.
            "workbook": workbook,

            # Name of the sheet to receive the data. Else, uses the first sheet in the workbook.
            "dataWorksheet": worksheet,

            # Name of the worksheet to display. Ignored if there is no template.
            "templateWorkbook": None,

            # Set to true to prevent the user from saving the temporary workbook.
            "inhibitLocalSave": None,

            # An Interop method that the Excel Connector will use to return data when a change is triggered.
            "glueMethod": validate_show_grid_method_name,

            # The trigger button is placed over a range of cells.
            "buttonRange": "A1",

            # The top-left address of the data in the dataWorksheet.
            "topLeft": "A1",

            # Trigger conditions control to tell ExcelPad when to invoke the validation method. Default is never to return data.
            "triggers": ["row"],

            # ExcelPad will create an Excel Named Range that defines the extent of the data written to the worksheet.
            "dataRangeName": None,

            # The maximum number of rows of changes to send in each invocation of the Validation method.
            "chunkSize": 1000,
            "autostart": None,
            "displayName": None,
            "timeoutMs": None
        }
    }


def get_data_as_json(columns, data):
    modified_data = []
    for item in data:
        data_list = []

        for col in columns:
            col_name = col["name"]
            value = item[col_name] if (col_name in item) else ""
            data_list.append(value)

        modified_data.append({
            "data": data_list
        })

    return json.dumps(modified_data)


def parse_image_response(dataAsJSON):
    """
    Convert the rows returned from Excel to Python objects (dictionaries).
    #When the response type is set to "image", then we will receive the entire data at once.
    """

    data = json.loads(dataAsJSON)
    result = []

    for item in data:
        rowAfterIndex = item["rowAfterIndex"]

        # Skip the column names row.
        if rowAfterIndex != 1:
            # E.g.: [1, "Sutton Edwards", "Buy", "BMW:GR" "GB00BH4HKS39", "Bayerische Motoren Werke AG", 100, 100.59, "EUR"]
            row = item["row"]

            resultItem = {}
            for columnIndex in range(len(excel_columns_configs)):
                value = row[columnIndex]
                fieldName = excel_columns_configs[columnIndex]["name"]
                resultItem[fieldName] = value

            result.append(resultItem)

    return result


def get_column_index(columnName):
    for index in range(len(excel_columns_configs)):
        columnConfig = excel_columns_configs[index]

        if columnName == columnConfig["name"]:
            return index + 1

    return 0
