
from flask import Blueprint, jsonify, request, current_app as app

from api.utils import get_safe

ops_redis = Blueprint('ops_redis', __name__)

@ops_redis.route('/', methods=['GET'])
def index():
    return "HELLO"

@ops_redis.route('/set_redis')
def set_redis():
    app.redis.set('my_key', 'my_value')
    print(app.config['KEYCLOAK_URL'])
    return "Value set in Redis!"

@ops_redis.route('/get_redis')
def get_redis():
    value = app.redis.get('my_key')
    return f"Value from Redis: {value}"


@ops_redis.route('/set_sid')
def set_sid():
    # TODO: updates user sid (key: "sid:{user_id}" value: sid)
    user_id = get_safe(request, 'user_id')
    sid =  get_safe(request, 'sid')
    pass

@ops_redis.route('/get_sid')
def get_sid():
    # TODO: gets user sid (key: "sid:{user_id}" value: sid)
    user_id = get_safe(request, 'user_id')
    pass

@ops_redis.route('/delete_sid')
def delete_sid():
    # TODO: deletes user both key and value sid (key: "sid:{user_id}" value: sid)
    user_id = get_safe(request, 'user_id')
    pass

@ops_redis.route('/set_location')
def set_location():
    # TODO: updates user location (key: "location:{user_id}" value: {"latitude": "", "longitude:""})
    user_id = get_safe(request, 'user_id')
    latitude = get_safe(request, 'latitude')
    longitude = get_safe(request, 'longitude')
    pass


@ops_redis.route('/get_location')
def get_location():
    # TODO: gets user location (key: "location:{user_id}" value: {"latitude":"" , "longitude":""})
    pass

@ops_redis.route('/set_group')
def set_group():
    # TODO: creates group (key: "group:{group_id}" value: {"invited": [], "members": []})
    group_id = get_safe(request, 'group_id')
    user_id = get_safe(request, 'user_id')
    pass

@ops_redis.route('/get_group')
def get_group():
    # TODO: gets group invited list and members list (key: "group:{group_id}" value: {"invited": [], "members": []})
    group_id = get_safe(request, 'group_id')
    user_id = get_safe(request, 'user_id')
    pass



@ops_redis.route('/get_groups')
def get_groups():
    # TODO: gets user groups (key: "user_groups:{user_id}" value: {"invitations": [], "groups": []})
    user_id = get_safe(request, 'user_id')
    pass

@ops_redis.route('/invite_to_group')
def invite_to_group():
    # TODO: updates invited list in group (key: "group:{group_id}" value: {"invited": [], "members": []})
    # TODO: updates invitations  in user groups (key: "user_groups:{user_id}" value: {"invitations": [], "groups": []})
    group_id = get_safe(request, 'group_id')
    user_id = get_safe(request, 'user_id')
    pass


@ops_redis.route('/accept_invitation_to_group')
def accept_invitation_to_group():
    # TODO: updates invited list and members list in group (key: "group:{group_id}" value: {"invited": [], "members": []})
    # TODO: updates invitations and groups  in user groups (key: "user_groups:{user_id}" value: {"invitations": [], "groups": []})
    group_id = get_safe(request, 'group_id')
    user_id = get_safe(request, 'user_id')
    pass



@ops_redis.route('/delete_invitation_from_group')
def delete_invitation_from_group():
    # TODO: updates invited list in group (key: "group:{group_id}" value: {"invited": [], "members": []})
    # TODO: updates invitations in user groups (key: "user_groups:{user_id}" value: {"invitations": [], "groups": []})
    group_id = get_safe(request, 'group_id')
    user_id = get_safe(request, 'user_id')
    pass


@ops_redis.route('/delete_member_from_group')
def delete_member_from_group():
    # TODO: updates members list in group (key: "group:{group_id}" value: {"invited": [], "members": []})
    # TODO: updates groups in user groups (key: "user_groups:{user_id}" value: {"invitations": [], "groups": []})
    group_id = get_safe(request, 'group_id')
    user_id = get_safe(request, 'user_id')
    pass


@ops_redis.route('/send_message_to_group')
def send_message_to_group():
    # TODO updates list of messages in group_chat (key:"group_chat:{group_id}" value: ["{timestamp}: {user_id}: Mesaj 1", ....])
    group_id = get_safe(request, 'group_id')
    user_id = get_safe(request, 'user_id')
    message = get_safe(request, 'message')
    pass

@ops_redis.route('/get_messages_from_group')
def get_messages_from_group():
    # TODO gets list of messages in group_chat (key:"group_chat:{group_id}" value: ["{timestamp}: {user_id}: Mesaj 1", ....])
    group_id = get_safe(request, 'group_id')
    user_id = get_safe(request, 'user_id')
    pass