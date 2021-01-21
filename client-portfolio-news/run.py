from flask import render_template, send_from_directory, Blueprint
import os
import sys

sys.path.append(os.path.abspath('../server'))
from server_helpers import createServer

local_dir = os.path.dirname(os.path.realpath(__file__))

server = createServer({
    'template_folder': local_dir,
    'static_url_path': '/',
    'local_dir': local_dir
})

import clients

data_path = os.path.abspath(os.path.join('data'))

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
