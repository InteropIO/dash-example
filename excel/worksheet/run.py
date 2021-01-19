from flask import Flask

server = Flask(__name__, template_folder=".", static_url_path="/")

import app
