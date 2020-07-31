from flask import Flask, render_template, Blueprint

server = Flask(__name__, template_folder = ".", static_url_path = "/")

@server.route("/")
def index():
    return render_template('index.html')
    
# JS App 3
app3_blueprint = Blueprint('app3', __name__, template_folder='', static_folder='app3/', static_url_path='/app3/')

@app3_blueprint.route("/app3/")
def app3():
    return render_template("app3/index.html", flask_token="app3")

server.register_blueprint(app3_blueprint)
