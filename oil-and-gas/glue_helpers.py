from datetime import date, timedelta

# Returns an object with an Interop method definition and arguments for creating an item of any type(email, meeting) in Outlook.
def create_outlook_item(item):
    return {
        "definition": {
            "name": "T42.Outlook.CreateItem"
        },
        "argumentObj": item
    }

# Returns an object with an Interop method definition and arguments for showing/sending an item of any type(email, meeting) in Outlook.
def show_outlook_item(item_id, send_automatically):
    '''
        Use the "action" property in displaySettings to control:
        - Default - Outlook pops up a window
        - Send - The item(meeting/appointment/email) is automatically sent.
        - ShowAndSend (only for email)- Outlook pops up a window, waits for actionDelayMSecs amount ot time and sends automatically.
        - ShowAndDiscard (only for email)- Outlook pops up a window, waits for actionDelayMSecs amount ot time and discards the email automatically.

        When appling an action type either "ShowAndSend" or "ShowAndDiscard" use actionDelayMSecs to control how much time Outlook should keep the window opened.
        Default actionDelayMSecs is 1000 ms.
    '''

    args = {
        "ItemID": item_id,
        "displaySettings": {
            "action": "Send" if send_automatically else "Default",
            # "actionDelayMSecs": 3000
        }
    }

    return {
        "definition": {
            "name": "T42.Outlook.ShowItem"
        },
        "argumentObj": args
    }

# Returns an object with an Interop method definition and arguments for creating a new meeting in Outlook. 
def create_outlook_meeting(subject = "", body = "", recipients=None):
    if recipients is None:
        recipients = []

    startTime = date.today() + timedelta(days=1)

    meeting = {
        "subject": subject,
        "body": body,
        "recipients": recipients,
        "startTime": startTime
    }

    item = {
        "ItemType": "meeting",
        "t42value": meeting
    }

    return create_outlook_item(item)

# Returns an object with an Interop method definition and arguments for creating a new email in Outlook. 
def create_outlook_email(subject = "", body = "", recipients=None):
    if recipients is None:
        recipients = []

    email = {
        "subject": subject,
        "body": body,
        "to": recipients
    }

    item = {
        "ItemType": "email",
        "t42value": email
    }

    return create_outlook_item(item)
