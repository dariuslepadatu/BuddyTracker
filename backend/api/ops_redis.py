
import requests
from flask import Blueprint, jsonify, request, current_app as app

ops_db = Blueprint('ops_db', __name__)

@ops_db.route('/', methods=['GET'])
def index():
    return "HELLO"

@ops_db.route('/set_redis')
def set_redis():
    app.redis.set('my_key', 'my_value')
    return "Value set in Redis!"

@ops_db.route('/get_redis')
def get_redis():
    value = app.redis.get('my_key')
    return f"Value from Redis: {value}"


@ops_db.route('/set_sid')
def set_sid():
    # TODO: updates user sid (key: "sid:{user_id}" value: sid)
    user_id = request.data.user_id
    sid = request.data.sid
    pass

@ops_db.route('/get_sid')
def get_sid():
    # TODO: gets user sid (key: "sid:{user_id}" value: sid)
    user_id = request.data.user_id
    pass

@ops_db.route('/delete_sid')
def delete_sid():
    # TODO: deletes user both key and value sid (key: "sid:{user_id}" value: sid)
    user_id = request.data.user_id
    pass

@ops_db.route('/set_location')
def set_location():
    # TODO: updates user location (key: "location:{user_id}" value: {"latitude": "", "longitude:""})
    user_id = request.data.user_id
    user_id = request.data.latitude
    user_id = request.data.longitude
    pass


@ops_db.route('/get_location')
def get_location():
    # TODO: gets user location (key: "location:{user_id}" value: {"latitude":"" , "longitude":""})
    pass

@ops_db.route('/set_group')
def get_group():
    # TODO: creates group (key: "group:{group_id}" value: {"invited": [], "members": []})
    group_id = request.data.group_id
    user_id = request.data.user_id

@ops_db.route('/get_group')
def get_group():
    # TODO: gets group invited list and members list (key: "group:{group_id}" value: {"invited": [], "members": []})
    group_id = request.data.group_id
    user_id = request.data.user_id



@ops_db.route('/get_groups')
def get_groups():
    # TODO: gets user groups (key: "user_groups:{user_id}" value: {"invitations": [], "groups": []})
    user_id = request.data.user_id

@ops_db.route('/invite_to_group')
def invite_to_group():
    # TODO: updates invited list in group (key: "group:{group_id}" value: {"invited": [], "members": []})
    # TODO: updates invitations  in user groups (key: "user_groups:{user_id}" value: {"invitations": [], "groups": []})
    group_id = request.data.group_id
    user_id = request.data.user_id
    pass


@ops_db.route('/accept_invitation_to_group')
def accept_invitation_to_group():
    # TODO: updates invited list and members list in group (key: "group:{group_id}" value: {"invited": [], "members": []})
    # TODO: updates invitations and groups  in user groups (key: "user_groups:{user_id}" value: {"invitations": [], "groups": []})
    group_id = request.data.group_id
    user_id = request.data.user_id
    pass



@ops_db.route('/delete_invitation_from_group')
def delete_invitation_from_group():
    # TODO: updates invited list in group (key: "group:{group_id}" value: {"invited": [], "members": []})
    # TODO: updates invitations in user groups (key: "user_groups:{user_id}" value: {"invitations": [], "groups": []})
    group_id = request.data.group_id
    user_id = request.data.user_id
    pass


@ops_db.route('/delete_member_from_group')
def delete_member_from_group():
    # TODO: updates members list in group (key: "group:{group_id}" value: {"invited": [], "members": []})
    # TODO: updates groups in user groups (key: "user_groups:{user_id}" value: {"invitations": [], "groups": []})
    group_id = request.data.group_id
    user_id = request.data.user_id
    pass



