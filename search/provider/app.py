import dash_glue42
from dash import dash, html
from flask_socketio import SocketIO, emit
from flask import request, render_template
import json
import time
from flask import Flask
import os

local_dir = os.path.dirname(os.path.realpath(__file__))

server = Flask(__name__, template_folder='') 
app = dash.Dash(__name__,
    server=server, 
    external_scripts=["https://cdn.socket.io/4.6.0/socket.io.js"],
    assets_ignore='search-rest.js' # Change with "search-ws.js" to load the rest api based example.
)
io = SocketIO(app.server)

app.layout = dash_glue42.Glue42(id="root", children=[
    html.H1("Search Provider"),
])

sid_queries_dict = dict()

def load_data(search):
    # Gather data - in real providers this will be an async action.
    with open('./data/clients.json') as clients_file:
        clients_data = json.loads(clients_file.read())

    with open('./data/instruments.json') as instruments_file:
        instruments_data = json.loads(instruments_file.read())

    search_lower = search.lower()

    clients_data_filtered = filter(lambda x: search_lower in x.get("displayName").lower(), clients_data)
    instruments_data_filtered = filter(
        lambda x: search_lower in x.get("displayName").lower() or search_lower in x.get("id"),
        instruments_data
    )

    return  list(clients_data_filtered) + list(instruments_data_filtered)


def io_send_query_result(sid, query_id, search):
    print(f'sending result for {query_id} to ${sid}')

    results = load_data(search)

    # Fake delay.
    time.sleep(3)
    
    if(sid not in sid_queries_dict):
        print(f'won\'t send result as sid "{sid}" socket client was disconnected')
        return

    queries_set = sid_queries_dict.get(sid)
    if(query_id not in queries_set):
        print(f'won\'t send result as query_id "{query_id}" not found in the query set of sid {sid}')
        return
    
    queries_set.remove(query_id)

    args = {
        "id": query_id,
        "results": results,
        "isLast": True # Indicate whether more results will be send back to the client. 
    }
    io.emit("query-results", args, to=sid)


@io.on("connect")
def handle_connect():
    print(f'handling "connect" event for sid {request.sid}')
    sid_queries_dict[request.sid] = set()
    print(f'io connections count is {len(sid_queries_dict)}')


@io.on("disconnect")
def handle_disconnect():
    print(f'handling "disconnect" event for sid {request.sid}')
    if(request.sid in sid_queries_dict):
        sid_queries_dict.pop(request.sid)
        print(f'io connections count is {len(sid_queries_dict)}')

    
@io.on("on-query")
def handle_on_query(args):
    sid = request.sid

    print(f'handling "on-query" event for sid {request.sid}, args {args}')

    query_id = args.get("id")
    # Store query id.
    sid_queries_dict[sid].add(query_id)

    # Ack
    emit(None)

    search_term = args.get("search")
    io_send_query_result(sid, query_id, search_term)


@io.on("on-query-cancel")
def handle_on_query_cancel(args):
    sid = request.sid

    print(f'handling "on-query-cancel" event for sid {sid}, args {args}')

    query_id = args.get("id")
    if((sid in sid_queries_dict) and (query_id in sid_queries_dict[sid])):
        sid_queries_dict[sid].remove(query_id)

    # Ack
    emit(None)


# Rest API.
@server.route('/api/query-results', methods=['GET'])
def get_query_result():
    # Fake delay.
    time.sleep(3)

    results =  load_data(request.args.get('search', ''))
    response = {
        "id": request.args.get('queryId'),
        "results": results
    }

    return response

@server.route('/client.html')
def client_page():
    return render_template('client.html')

if __name__ == '__main__':
    print('--- Search Provider Backend ---')
    io.run(app.server, port=8050, debug=True)
