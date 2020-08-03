from flask import Flask, render_template, send_from_directory, Blueprint
import os.path as path

server = Flask(__name__, template_folder = ".", static_url_path = "/")

import app_a

@server.route("/")
@server.route("/interop-with-js")
def index():
    return render_template('index.html')

@server.route("/glue/<path:filename>")
def glue_configs(filename):
    d = path.abspath(path.join(__file__ ,"../../../"))
    glue_dir = path.join(d, 'static\glue')

    return send_from_directory(glue_dir, filename)

# JS App 3
app_b_blueprint = Blueprint('app-b', __name__, template_folder='', static_folder='app-b/', static_url_path='/app-b/')

@app_b_blueprint.route("/app-b/")
def app_b():
    return render_template("app-b/index.html", flask_token="app-b")

server.register_blueprint(app_b_blueprint)
