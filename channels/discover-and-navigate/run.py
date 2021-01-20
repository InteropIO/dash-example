from flask import render_template, Blueprint
import os
import sys

sys.path.append(os.path.abspath('../../server'))
from server_helpers import createServer

local_dir = os.path.dirname(os.path.realpath(__file__))

server = createServer({
    'template_folder': local_dir,
    'static_url_path': '/',
    'local_dir': local_dir
})

import app