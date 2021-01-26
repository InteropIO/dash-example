## Excel Worksheets

**Note:** To view this example, run the application in a [**Glue42 Enterprise**](../README.md) environment.

Python Dash application integrated with Glue42. The application demonstrates opening Excel worksheet, sending updates to Excel, receiving updates from Excel, declarative data validation, programmatic data validation via the Glue42 Excel Connector.
    
On load, the application registers a method called "ValidateShowGrid". This method will be used by the Excel Connector to return data when a change is triggered. Click the "Open Excel" button to open a worksheet in Excel populated with the data displayed in the application. To send an update to Excel from the application, change the value of a cell in the table. To send an update to the application from Excel, change the value of a cell in Excel - the application will receive the latest data.

Checkout the source code in `app.py` for details.