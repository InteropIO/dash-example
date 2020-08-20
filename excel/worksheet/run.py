from flask import Flask, render_template, send_from_directory

server = Flask(__name__, template_folder = ".", static_url_path = "/")

import app
