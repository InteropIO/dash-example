from flask import render_template, Blueprint
import os
import sys

sys.path.append(os.path.abspath('../../server'))
from server_helpers import createServer

local_dir = os.path.dirname(os.path.realpath(__file__))

server = createServer({
    'template_folder': local_dir,
    'static_url_path': '/',
    'local_dir': local_dir
})

import app_a

# Serving the Angular application
app_b_blueprint = Blueprint('app-b', __name__, template_folder='', static_folder='app-b/dist/', static_url_path='/app-b/dist/')

@app_b_blueprint.route("/app-b/")
def app_b():
    return render_template("app-b/dist/index.html", flask_token="app-b")

server.register_blueprint(app_b_blueprint)
