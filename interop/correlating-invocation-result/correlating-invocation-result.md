## Correlating an Invocation with a Result

Python Dash applications integrated with Glue42. The applications demonstrate how to assign a unique invocation ID and make a correlation between a returned result and some data stored when the method is called (sharing data between the callback that triggers the invocation and the callback that handles the returned result).

On load, Application B registers a method called "Sum", which accepts two numbers, calculates their total and returns the result. Click the "Sum" button in Application A to invoke this method and print the result from invocation.

When invoking the method, Application A sets a unique invocation ID and uses dcc.Store component to share the start time of invocation with the callback that handles the returned result. When the "Sum" returns, along with the result the handler callback also receives the invocation ID. As a result, we get the start time of invocation from dcc.Store and calculate the elapsed time for execution.

Checkout the source code in `app_a.py` and `app_b.py` for details.
