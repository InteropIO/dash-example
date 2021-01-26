# Overview

This repository contains examples of how to use the Glue42 Dash library. For convenience, the setup is created with pure Python. Each example is individually separated in a folder and logically grouped under `/interop`, `/contexts` or `/notifications` folders.

# Documentation

For more information on how to use the Glue42 Dash library, see the [official documentation](https://docs.glue42.com/getting-started/how-to/glue42-enable-your-app/python-dash/index.html).

# Quick Start

1. Use the latest Python 3 (3.8.4 and later). On Windows 10 you can install it from the Microsoft Store.

2. Setup and activate the Python virtual environment in the root folder (more detailed instructions on how to setup Dash can be found [here](https://dash.plotly.com/installation)):

```sh
python -m virtualenv venv

# Unix
source venv/bin/activate
# Windows
.\venv\Scripts\activate.bat
```

3. Install required packages:

```sh
pip install -r requirements.txt
# local package - Glue42 Dash is not published yet
pip install dash_glue-0.0.3.tar.gz
```

# Run an Example Locally

1. Activate the virtual environment:

```sh
# Unix
source venv/bin/activate
# Windows
.\venv\Scripts\activate.bat
```

2. Start a Flask server to host the applications of an example. Each example contains one or more Dash or JavaScript applications. There is also an `index.html` to help preview the applications in [**Glue42 Core**](https://glue42.com/core/). Go to an example folder (e.g. `/interop/register-invoke-method`) and run the following:

```sh
# Unix
export FLASK_APP=run.py
# Windows
set FLASK_APP=run.py

python -m flask run
```

# Running the Applications

1. Install globally the `concurrently` package used by the startup script:

```
npm install -g concurrently
```

2. Start the Flask servers hosting the applications:

```
npm start
```

Or if running on Windows:

```
npm run start_win
```

## Glue42 Core 

Open [http://localhost:4242](http://localhost:4242) in your browser.

## Glue42 Enterprise

To run the two applications in a [**Glue42 Enterprise**](https://glue42.com/enterprise/) environment, make sure you have Glue42 3.9 (or later) installed and add the following entry to your [application configuration](https://docs.glue42.com/developers/configuration/application/index.html#application_configuration) files:

```json
[
    {
        "title": "Dash App 1",
        "type": "window",
        "name": "dash1",
        "hidden": false,
        "details": {
            "url": "http://0.0.0.0:8050/",
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
            "url": "http://0.0.0.0:8051/",
            "top": 25,
            "left": 0,
            "height": 400,
            "width": 400
        }
    }
]
```

Launch the applications from the Glue42 Toolbar.
