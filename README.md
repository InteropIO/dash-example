# What is this

This repository contains examples of how to use the Glue42-Dash library. For convenience, the setup is created with pure python.

Each example is individually separated in a folder and logically grouped under `/interop`, `/contexts` or `/notifications` folders.

## Quickstart

1. Make sure that you use the latest python 3 (3.8.4 as of this writing). On Windows 10, the installation from the Microsoft Store works.

2. Setup and activate Python virtual environment in the root folder (more detailed instructions of how to setup Dash can be found here - https://dash.plotly.com/installation).

```sh
python -m virtualenv venv

# Unix
source venv/bin/activate
# Windows
.\venv\Scripts\activate.bat
```

3. Install required packages.
```sh
pip install -r requirements.txt
# local package - dash glue is not published yet
pip install dash_glue-0.0.2.tar.gz
```

## Run an example locally
1. Activate the virtual environment (if not yet).
```sh
# Unix
source venv/bin/activate
# Windows
.\venv\Scripts\activate.bat
```

2. Start a Flask server to host the applications of an example. Each example contains one or more Dash or JavaScript applications. There is also an index.html to help preview the applications in Glue42 Core. Go to an example folder (e.g. `/interop/register-invoke-method`) and run the following:

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

To run the applications of an example in a Glue42 Enterprise environment, make sure to have Glue42 3.9 (or later) installed. Then, add the content of `apps-config.json` (each example folder contains one) to your application configuration ([read this document](https://docs.glue42.com/developers/configuration/application/index.html#application_configuration) if you have not done it before). Afterwards, you can launch the applications from the Glue42 toolbar. See the applications title to know what to search for (e.g. in `/interop/register-invoke-method` there is an application with a title *Application A (Register/Invoke Methods)*).
