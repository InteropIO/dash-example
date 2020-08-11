## Registering and Invoking Methods

Python Dash applications integrated with Glue42. The applications demonstrate how to register and invoke Interop methods.
    
On load, Application B registers a method called "Sum", which accepts parameters (two numbers), calculates their total and returns the result. Click the "Sum" button in Application A to invoke this method and print the result from invocation.

Also, Application B registers a method called "SendMessage", which is a **void** method and does not return a result. It accepts one parameter "message". Click the "Send" button in Application A to invoke this method. The value in the input field labeled "Message" will be printed in Application B.

Checkout the source code in `app_a.py` and `app_b.py` for details.