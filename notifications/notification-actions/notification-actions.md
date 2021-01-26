## Notification Actions

**Note:** To view this example, run the two applications in **Glue42 Enterprise** environment, make sure to have Glue42 3.9 (or later) installed. Add the content of `apps-config.json` to your [application configuration](https://docs.glue42.com/developers/configuration/application/index.html#application_configuration).

Python Dash applications integrated with Glue42. The applications demonstrate how to specify an Interop method that will be invoked when the user clicks an action button in the notification.

On load, Application B registers an Interop method called "ReviewMessage". Use the input field in Application A to enter a message that will be set as an argument of the "ReviewMessage" method. 
Click the "Raise Notification" button. When the notification appears, click the "Review" button in the notification. The message entered in the input field will be displayed in Application B.

Checkout the source code in `app_a.py` and `app_b.py` for details.
