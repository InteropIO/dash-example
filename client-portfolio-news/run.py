from flask import Flask, render_template, send_from_directory, Blueprint
import os.path as path

server = Flask(__name__, template_folder = ".", static_url_path = "/")

import clients

data_path = path.abspath(path.join('data'))

@server.route("/")
def index():
    return render_template('index.html')

# Glue42 Core assets
@server.route("/glue/<path:filename>")
def glue_configs(filename):

    d = path.abspath(path.join(__file__ ,"../../"))
    glue_dir = path.join(d, 'static\glue')

    return send_from_directory(glue_dir, filename)

@server.route("/api/clients/")
def clients_data():
    return send_from_directory(data_path, 'clients.json')

@server.route("/api/stocks/")
def portfolio_data():
    return send_from_directory(data_path, 'stocks.json')

@server.route("/api/news/")
def news_data():
    return send_from_directory(data_path, 'news.json')

# Serving the React Application
stocks_blueprint = Blueprint('stocks', __name__, template_folder='', static_folder='stocks/build/', static_url_path='/stocks/')

@stocks_blueprint.route("/stocks/")
def stocks_app():
    return render_template("stocks/build/index.html", flask_token="stocks")

# Serving the Angular Application
news_blueprint = Blueprint('news', __name__, template_folder='', static_folder='news/dist/', static_url_path='/news/dist/')

@news_blueprint.route("/news/")
def news_app():
    return render_template("news/dist/index.html", flask_token="news")

server.register_blueprint(stocks_blueprint)
server.register_blueprint(news_blueprint)
