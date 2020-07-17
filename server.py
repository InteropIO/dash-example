from flask import Flask, render_template

server = Flask(__name__, template_folder = ".", static_url_path = "/")

@server.route("/")
def index():
    return render_template('index.html') 
