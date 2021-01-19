from flask import Flask, render_template, send_from_directory, Blueprint
import os.path as path

server = Flask(__name__, template_folder = ".", static_url_path = "/")

import app_a

@server.route("/")
def index():
    return render_template('index.html')

@server.route("/local/<path:filename>")
def local_scripts(filename):
    local_dir = path.dirname(path.realpath(__file__))

    return send_from_directory(local_dir, filename)

@server.route("/scripts/<path:filename>")
def shared_scripts(filename):
    shared_dir = path.join(
        path.abspath(path.join(__file__ ,"../../../")),
        'static/scripts'
    )

    return send_from_directory(shared_dir, filename)

@server.route("/glue/<path:filename>")
def static_glue(filename):
    glue_dir = path.join(
        path.abspath(path.join(__file__ ,"../../../")),
        'static/glue'
    )

    return send_from_directory(glue_dir, filename)

@server.route("/assets/<path:filename>")
def static_assets(filename):
    assets_dir = path.join(
        path.abspath(path.join(__file__ ,"../../../")),
        'static/assets'
    )

    return send_from_directory(assets_dir, filename)

# Serving the JavaScript Application
app_b_blueprint = Blueprint('app-b', __name__, template_folder='', static_folder='app-b/', static_url_path='/app-b/')

@app_b_blueprint.route("/app-b/")
def app_b():
    return render_template("app-b/index.html", flask_token="app-b")

server.register_blueprint(app_b_blueprint)
