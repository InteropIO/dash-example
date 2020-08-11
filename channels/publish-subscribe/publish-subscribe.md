## Publish and Subscribe Channels

Python Dash applications integrated with Glue42. Once multiple applications are on the same channel, they can communicate by publishing and subscribing data to the channel. This is achieved through the shared context data object that the applications monitor.
    
When the two applications are on the same channel, Application B can publish data that is received and logged by Application A if it has subscribed for updates of the current channel. Note that if the applications are not on the same channel the applications will not exchange any data.

Checkout the source code in `app_a.py` and `app_b.py` for details.