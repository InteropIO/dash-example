## Interoperability between Dash and JavaScript

Python Dash and JavaScript applications integrated with Glue42. The applications demonstrate interoperability between a Dash and JavaScript applications. The Dash application invokes an interop method registered in the JavaScript application.

On load, Application B (the JavaScript application) registers a method called "SendMessage" which accepts a parameter "message". Click the "Send" button in Application A (the Dash application) to invoke this method. The value in the input field labeled "Message" will be printed in Application B.

Checkout the source code in `app_a.py` and `app-b/index.js` for details.
