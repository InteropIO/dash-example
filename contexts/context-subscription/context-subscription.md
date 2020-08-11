## Context Subscription

Python Dash applications integrated with Glue42. The applications demonstrate how to update a shared context object and how to subscribe for updates of a context.

On load, both Application A and Application B subscribe for updates of the "app-styling" context. Use the input field in Application A to enter a color and change the applications' background color. Every time the input changes a new value will be set to "app-styling" context.

Checkout the source code in `app_a.py` and `app_b.py` for details.