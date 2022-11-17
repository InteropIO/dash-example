from dash import dash, Input, Output, State, html, dcc
import dash_glue42
import time
from run import server

app = dash.Dash(__name__, server=server,
                routes_pathname_prefix="/outlook-contacts/")

app.enable_dev_tools()

app.layout = dash_glue42.Glue42(id="glue42", children=[

    # A shared context that will be updated with a list of contacts retrieved from Outlook.
    dash_glue42.Context(id="contacts"),

    # A memory store to keep the list of contacts retrieved from Outlook. The store wil keep only the contacts from the latest retrieval.
    dcc.Store(id="contacts-store"),

    # The Outlook Connector will return contacts on chunks by calling the "OnContactsList" method (a callback method).
    dash_glue42.MethodRegister(id="g42-register-OnContactsList",
                             definition={"name": "OnContactsList"}, returns=False),

    dash_glue42.MethodInvoke(id="g42-invoke-t42-outlook-list-items"),

    html.Button(id="get-contacts-button", n_clicks=0, children="Get Contacts"),
    dcc.Dropdown(id="contacts-select", options=[], multi=True)
])


def get_outlook_id(contact):
    """Outlook assigns an ID to the contacts."""

    for id in contact["ids"]:
        if id["systemName"] == "Outlook":
            return id["nativeId"]

    return None


def contact_to_dpd_option(contact):
    """Transforms a T42Contact object to Dash dropdown option."""

    name = contact.get("name", {})
    full_name = name.get("firstName") + name.get("lastName")

    # In this implementation we will use the Outlook ID as an unique dropdown option value.
    outlook_id = get_outlook_id(contact)
    option = {
        "label": full_name,
        "value": outlook_id
    }

    return option if outlook_id is not None else None


def contacts_to_dpd_options(contacts):
    options = list(
        map(contact_to_dpd_option, contacts)
    )

    return list(filter(None, options))


def get_contacts_by_outlook_id(ids, contacts):
    result = []
    for id in ids:
        for contact in contacts:
            outlook_id = get_outlook_id(contact)
            if(id == outlook_id):
                result.append(contact)

    return result


@app.callback(
    Output("contacts", "update"),
    Input("contacts-select", "value"),
    State("contacts-store", "data")
)
def update_contacts_context(value, data):
    """The callback will update the "contacts" shared context when the dropdown selected values change."""

    if (value is not None) and (data is not None):
        contacts = get_contacts_by_outlook_id(value, data["items"])

        return {
            "contacts": contacts
        }


@app.callback(
    [
        Output("contacts-store", "data"),
        Output("contacts-select", "options")
    ],
    Input("g42-register-OnContactsList", "invoke"),
    State("contacts-store", "data")
)
def on_contacts(invoke, data):
    """Callback to handle the chunks of contacts."""

    if data is None:
        data = {
            "list_items_id": None,
            "items": []
        }

    if invoke is not None:
        args = invoke["args"]

        failed = args["failed"]
        job_done = args["jobDone"]
        list_items_id = args["ListItemsId"]

        # Contacts from store.
        items_in_store = data["items"]

        # An error occurred. No more chunks will be received.
        if failed:
            return [data, contacts_to_dpd_options(items_in_store)]

        # All contacts were returned. No more chunks will be sent.
        if job_done:
            return [data, contacts_to_dpd_options(items_in_store)]

        new_items = args["items"]

        list_items_id_in_store = data["list_items_id"]

        # A new invocation to Outlook was made.
        if list_items_id != list_items_id_in_store:
            return [
                {
                    "list_items_id": list_items_id,
                    "items": new_items
                }, []]
        else:
            return [
                {
                    "list_items_id": list_items_id_in_store,
                    "items": items_in_store + new_items
                }, []]

    return [data, []]


@app.callback(
    [
        Output("g42-invoke-t42-outlook-list-items", "invoke"),
        Output("contacts-select", "value")
    ],
    Input("get-contacts-button", "n_clicks")
)
def get_contacts(n_clicks):
    if n_clicks != 0:

        invoke = {
            # The "T42.Outlook.ListItems" method is registered by the Glue42 Outlook Add-in.
            "definition": {"name": "T42.Outlook.ListItems"},
            "argumentObj": {
                "ListItemsId": time.time(),  # Specify a correlation ID.
                # Specify an already registered Interop method which will receive the results.
                "CallbackMethod": "OnContactsList",
                "ItemsPerChunk": 2,  # How many items will contain each chunk.
                # "0" traverse only the root folder. "-1" traverse the entire folder tree. Any other positive number specifies the depth of search.
                "TraversalDepth": 0,
                "FolderPath": ""  # Specifies the entry point of traversing. E.g. \\stoyan.uzunov@tick42.com\Contacts\MyPrivateContactsFolder
            }
        }

        # Make an invocation call to Outlook and reset selected values in the dropdown.
        return [invoke, []]

    return [None, []]


if __name__ == "__main__":
    app.run_server(debug=True, host="localhost", port="8051")
