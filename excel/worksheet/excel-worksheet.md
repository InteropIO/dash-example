## Excel Worksheets

**Note:** To view this example, run the application in [Glue42 Enterprise](../README.md) environment.

Python Dash application integrated with Glue42. The application demonstrates opening Excel worksheet, sending updates to Excel, receiving updates from Excel, declarative data validation, programmatic data validation via Glue42 Excel Add-in.
    
On load, the application registers a method called "ValidateShowGrid". This method will be used by the Excel Add-in to return data when change is triggered. Click "Open Excel" button to open a worksheet in Excel populated with the data displayed in the application. To send update to Excel from the application, change the value of a cell in the table. To send update to the application from Excel, change the value of a cell in Excel - the application will receive the latest data.

Checkout the source code in `app.py` for details.