from flask import Flask

server = Flask(__name__, template_folder = ".", static_url_path = "/")

import oil_and_gas_app
import outlook_contacts_app
