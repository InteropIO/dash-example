## Interoperability between Dash and Angular

Python Dash and Angular applications integrated with Glue42. The applications demonstrate interoperability between a Dash and Angular applications. The Dash application invokes an interop method registered in the Angular application.

On load, Application B (the Angular application) registers a method called "SendMessage" which accepts a parameter "message". Click the "Send" button in Application A (the Dash application) to invoke this method. The value in the input field labeled "Message" will be printed in Application B.

Checkout the source code in `app_a.py` and `/app-b/` for details.
