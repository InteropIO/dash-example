# What is this

This repository contains examples of how to use the Glue42-Dash library. For convenience, the setup is created with pure python. 

## Quickstart

1. Make sure that you use the latest python 3 (3.8.4 as of this writing). On Windows 10, the installation from the Microsoft Store works. Setup the Python environment (more detailed instructions of how to setup Dash can be found here - https://dash.plotly.com/installation )

```sh
python -m virtualenv venv

# Unix
source venv/bin/activate
# Windows
.\venv\Scripts\activate.bat

pip install -r requirements.txt
# local package - dash glue is not published yet
pip install dash_glue-0.0.1.tar.gz
```

Start the Flask server containing two Dash and one JavaScript and the index for Glue42 Core:

```sh

# Unix
export FLASK_APP=run.py
# Windows
set FLASK_APP=run.py

python -m flask run
```

### Glue42 Core 

Open [http://localhost:5000](http://localhost:5000) in your browser.

### Glue42 Enterprise

To run the three applications in a Glue42 Enterprise environment, make sure to have Glue42 3.9 (or later) installed. Then, add the following entry to your application configuration ([read this document](https://docs.glue42.com/developers/configuration/application/index.html#application_configuration) if you have not done it before):

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
    },
    {
        "title": "JS App 3",
        "type": "window",
        "name": "JSApp3",
        "hidden": false,
        "details": {
            "url": "http://0.0.0.0:5000/app3/",
            "top": 25,
            "left": 0,
            "height": 400,
            "width": 400
        }
    }
]
```

Afterwards, you can launch the three applications (Dash App 1, Dash App 2 and JS App) from the Glue42 toolbar.

