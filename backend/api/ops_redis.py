import json

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


@ops_redis.route('/set_sid', methods=['POST'])
def set_sid():
    # TODO: updates user sid (key: "sid:{user_id}" value: sid)
    # user_id = get_safe(request, 'user_id')
    # sid =  get_safe(request, 'sid')
    user_id = request.json.get('user_id')
    sid = request.json.get('sid')

    redis_key = f"sid:{user_id}"
    app.redis.set(redis_key, sid)

    return jsonify({"message": f"Session ID for user {user_id} set to {sid}"}), 200


@ops_redis.route('/get_sid', methods=['POST'])
def get_sid():
    # TODO: gets user sid (key: "sid:{user_id}" value: sid)
    user_id = request.json.get('user_id')

    redis_key = f"sid:{user_id}"
    sid = app.redis.get(redis_key)

    if not sid:
        # nu exista in baza de data
        return jsonify({"error": f"No session ID found for user {user_id}"}), 404

    return jsonify({"user_id": user_id, "sid": sid}), 200

@ops_redis.route('/delete_sid')
def delete_sid():
    # TODO: deletes user both key and value sid (key: "sid:{user_id}" value: sid)
    # TODO: nu merge idk de ce
    # user_id = request.json.get('user_id')
    # redis_key = f"sid:{user_id}"
    # sid = app.redis.get(redis_key)
    #
    # if not sid:
    #     # nu exista in baza de data
    #     return jsonify({"error": f"No session ID found for user {user_id}"}), 404
    #
    # app.redis.delete(redis_key)
    #
    # if app.redis.exists(redis_key):
    #     # nu s-a putut sterge
    #     return jsonify({"error": f"Failed to delete session ID for user {user_id}"}), 500
    # return jsonify({"message": f"Session ID for user {user_id} has been deleted."}), 200
    pass

@ops_redis.route('/set_location')
def set_location():
    # TODO: updates user location (key: "location:{user_id}" value: {"latitude": "", "longitude:""})
    # TODO: nu merge idk de ce
    # user_id = request.json.get('user_id')
    # latitude = request.json.get('latitude')
    # longitude = request.json.get('longitude')
    #
    # redis_key = f"location:{user_id}"
    # redis_value = f"latitude:{latitude}, longitude:{longitude}"
    #
    # app.redis.set(redis_key, redis_value)
    #
    # if app.redis.get(redis_key) != redis_value:
    #     return jsonify({"message": f"Error set_location for user {user_id}"}), 500
    # return jsonify({"message": f"Location updated for user {user_id}"}), 200
    pass


@ops_redis.route('/get_location')
def get_location():
    # TODO: gets user location (key: "location:{user_id}" value: {"latitude":"" , "longitude":""})
    pass

@ops_redis.route('/set_group', methods=['POST'])
def set_group():
    # TODO: creates group (key: "group:{group_id}" value: {"invited": [], "members": []})
    user_id = request.json.get('user_id')
    group_id = request.json.get('group_id')

    if not user_id or not group_id:
        return jsonify({'error': 'Missing parameters'}), 400

    # ============================ CODE TO BE REVISITED ==================================
        # USER sends a list of ivited people and memebers, remeber to add user as well
        # user_id  = request.json.get('user_id')
        # group_id = request.json.get('group_id')
        # invited  = request.json.get('invited')
        # members  = request.json.get('members')
        #
        # members.append(user_id)
        #
        # # Set group_id and the user_id of creator as key
        # redis_key   = f"{user_id}:{group_id}"
        # redis_value = f"{{\"invited\": {invited}, \"members\": {members}}}"
        #
        # app.redis.set(redis_key, redis_value)
        #
        # if app.redis.get(redis_key) != redis_value:
        #     return jsonify({"message": f"Error set_group for {user_id}"}), 500


    # Add group_id to user groups
    user_groups_key = f"user_groups:{user_id}"
    user_data = app.redis.get(user_groups_key)
    if user_data:
        user_data = json.loads(user_data)
    else:
        user_data = {"invitations": [], "groups": []}

    # Add group ID to user's groups if not already present
    if group_id not in user_data["groups"]:
        user_data["groups"].append(group_id)
        app.redis.set(user_groups_key, json.dumps(user_data))
    else:
        return jsonify({"error": "User is already a member of that group"}), 400

    return jsonify({"message": f"Group {group_id} updated for user {user_id}"}), 200


@ops_redis.route('/get_group', methods=['POST']) # TODO chage to GET
def get_group():
    # TODO: gets group invited list and members list (key: "group:{group_id}" value: {"invited": [], "members": []})
    group_id = get_safe(request, 'group_id')
    user_id  = get_safe(request, 'user_id')

    redis_key = f"{user_id}:{group_id}"
    result    = app.redis.get(redis_key)

    if not result:
        return jsonify({"error": f"No group for {group_id} and {user_id}"}), 404

    return jsonify({redis_key: result}), 200


@ops_redis.route('/get_groups', methods=['POST']) # TODO chage to GET
def get_groups():
    user_id  = get_safe(request, 'user_id')
    if not user_id:
        return jsonify({'error': 'Missing parameters'}), 400
    user_groups_key = f"user_groups:{user_id}"
    user_data = app.redis.get(user_groups_key)
    if user_data:
        user_data = json.loads(user_data)
        return jsonify({"groups": user_data["groups"]}), 200
    return jsonify({"groups": []}), 200



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


@ops_redis.route('/delete_member_from_group', methods=['POST']) # TODO chage to GET
def delete_member_from_group():
    # TODO: updates members list in group (key: "group:{group_id}" value: {"invited": [], "members": []})
    # TODO: updates groups in user groups (key: "user_groups:{user_id}" value: {"invitations": [], "groups": []})
    user_id   = get_safe(request, 'user_id')
    group_id  = get_safe(request, 'group_id')
    d_user_id = get_safe(request, 'd_user_id')

    redis_key = f"{user_id}:{group_id}"
    result    = app.redis.get(redis_key)

    if not result:
        return jsonify({"error": f"No data for {user_id} and {group_id}"}), 404

    import json

    data = json.loads(result)

    if d_user_id not in data['members']:
        return jsonify({"error": f"No {d_user_id} in the members of the group!"}), 404

    data['members'] = [member for member in data['members'] if member != d_user_id]

    app.redis.set(redis_key, json.dumps(data))

    return jsonify({redis_key: json.dumps(data)}), 200
    

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