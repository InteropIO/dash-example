from flask import Flask, render_template, send_from_directory
import os.path as path

server = Flask(__name__, template_folder = ".", static_url_path = "/")

import app_a
import app_b

@server.route("/")
@server.route("/notification-click")
def index():
    return render_template('index.html')

@server.route("/glue/<path:filename>")
def glue_configs(filename):
    d = path.abspath(path.join(__file__ ,"../../../"))
    glue_dir = path.join(d, 'static\glue')

    return send_from_directory(glue_dir, filename)
