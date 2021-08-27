## Notification Click

Python Dash applications integrated with Glue42. The applications demonstrate how to specify an Interop method that will be invoked when the user clicks on the notification.

On load, Application B registers an Interop method called "ReviewMessage". Use the input field in Application A to enter a message that will be set as an argument of the "ReviewMessage" method. 
Click the "Raise Notification" button. When the notification appears, click on it. The message entered in the input field will be displayed in Application B.

Checkout the source code in `app_a.py` and `app_b.py` for details.