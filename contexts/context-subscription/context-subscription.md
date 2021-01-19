## Context Subscription

Python Dash applications integrated with Glue42. The applications demonstrate how to set and update a shared context object and how to subscribe for updates of a context.

On load, both Application A and Application B subscribe for updates of the "app-styling" context. Use the input fields in Application A to enter a background color and a font color to change the applications styles. Every time the inputs change, the "app-styling" context will be updated.

Checkout the source code in `app_a.py` and `app_b.py` for details.