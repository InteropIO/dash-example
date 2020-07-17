# What is this

This repository contains examples of how to use the Glue42-Dash library. For convenience, the setup is created with pure python. 

## Quickstart

1. Setup the Python environment (more detailed instructions of how to setup Dash can be found here - https://dash.plotly.com/installation )

```sh
python -m virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
pip install dash_glue-0.0.1.tar.gz
```

Start the Flask server containing two Dash apps and the index for Glue42 Core:

```sh
uwsgi --http 0.0.0.0:5000 --processes 4 --wsgi-file run.py
```

### Glue42 Core 

Open [http://localhost:5000](http://localhost:5000) in your browser.

### Glue42 Enterprise

To run the two applications in a Glue42 Enterprise environment, make sure to have Glue42 3.9 (or later) installed. Then, add the following entry to your application configuration ([read this document](https://docs.glue42.com/developers/configuration/application/index.html#application_configuration) if you have not done it before):

```json
[
    {
        "title": "Dash App 1",
        "type": "window",
        "name": "dash1",
        "hidden": false,
        "details": {
            "url": "http://0.0.0.0:5000/app1/",
            "top": 25,
            "left": 800,
            "height": 400,
            "width": 400
        }
    },
    {
        "title": "Dash App 2",
        "type": "window",
        "name": "dash2",
        "hidden": false,
        "details": {
            "url": "http://0.0.0.0:5000/app2/",
            "top": 25,
            "left": 0,
            "height": 400,
            "width": 400
        }
    }
]
```

Afterwards, you can launch the two applications (Dash App 1 and Dash App 2) from the Glue42 toolbar.

