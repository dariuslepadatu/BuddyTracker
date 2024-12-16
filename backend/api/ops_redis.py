import json

from datetime import datetime as dt

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


@ops_redis.route('/get_sid', methods=['GET'])
def get_sid():
    # TODO: gets user sid (key: "sid:{user_id}" value: sid)
    user_id = request.json.get('user_id')

    redis_key = f"sid:{user_id}"
    sid = app.redis.get(redis_key)

    if not sid:
        # nu exista in baza de data
        return jsonify({"error": f"No session ID found for user {user_id}"}), 404

    return jsonify({"sid": sid}), 200

@ops_redis.route('/delete_sid', methods=['DELETE'])
def delete_sid():
    # TODO: deletes user both key and value sid (key: "sid:{user_id}" value: sid)
    # TODO: nu merge idk de ce
    user_id = request.json.get('user_id')
    redis_key = f"sid:{user_id}"
    sid = app.redis.get(redis_key)

    if not sid:
        # nu exista in baza de data
        return jsonify({"error": f"No session ID found for user {user_id}"}), 404

    app.redis.delete(redis_key)

    if app.redis.exists(redis_key):
        # nu s-a putut sterge
        return jsonify({"error": f"Failed to delete session ID for user {user_id}"}), 500
    return jsonify({"message": f"Session ID for user {user_id} has been deleted."}), 200


@ops_redis.route('/set_location', methods=['POST'])
def set_location():
    # TODO: updates user location (key: "location:{user_id}" value: {"latitude": "", "longitude:""})
    user_id = request.json.get('user_id')
    latitude = request.json.get('latitude')
    longitude = request.json.get('longitude')

    redis_key = f"location:{user_id}"
    redis_value = {"latitude": latitude, "longitude": longitude}

    app.redis.set(redis_key, json.dumps(redis_value))

    stored_value = json.loads(app.redis.get(redis_key))

    if stored_value != redis_value:
        return jsonify({"message": f"Error setting location for user {user_id}"}), 500

    return jsonify({"message": f"Location updated for user {user_id}"}), 200



@ops_redis.route('/get_location',  methods=['GET'])
def get_location():
    # TODO: gets user location (key: "location:{user_id}" value: {"latitude":"" , "longitude":""})
    user_id = request.json.get("user_id")

    if not user_id:
        return jsonify({"error": "Missing user_id parameter"}), 400

    redis_key = f"location:{user_id}"
    location_data = json.loads(app.redis.get(redis_key))

    if not location_data:
        return jsonify({"error": "Location not found for the given user_id"}), 404

    return jsonify({"latitude": location_data["latitude"], "longitude": location_data["longitude"]}), 200


@ops_redis.route('/set_group', methods=['POST'])
def set_group():
    # TODO: creates group (key: "group:{group_id}" value: {"invited": [], "members": []})
    user_id = request.json.get('user_id')
    group_id = request.json.get('group_id')

    if not user_id or not group_id:
        return jsonify({'error': 'Missing parameters'}), 400

    # USER has a list of ivited people and memebers, 
    # remeber to add user as well
    invited  = []
    members  = []
        
    members.append(user_id)


    # Set group_id and the user_id of creator as key
    redis_key   = f"group_id:{group_id}"
    redis_value = {"invited": invited, "members": members}
    if app.redis.get(redis_key):
        return jsonify({"message": f"Group with id {group_id} already exists"}), 404

    app.redis.set(redis_key, json.dumps(redis_value))
    
    if app.redis.get(redis_key) != json.dumps(redis_value):
        return jsonify({"message": f"Error set_group for {user_id}"}), 500

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

    return jsonify({"message": f"Group {group_id} created by user {user_id}"}), 200


@ops_redis.route('/get_group', methods=['GET'])
def get_group():
    # TODO: gets group invited list and members list (key: "group:{group_id}" value: {"invited": [], "members": []})
    group_id = get_safe(request, 'group_id')
    user_id  = get_safe(request, 'user_id')

    if not group_id:
        return jsonify({"error": "Not enough arguments!"}), 400

    redis_key = f"group_id:{group_id}"
    result = app.redis.get(redis_key)

    if not result:
        return jsonify({"error": f"No group for {group_id}!"}), 404

    result = json.loads(result)
    if not user_id in result['members']:
        return jsonify({"error": f"User {user_id} is not a member of {group_id}!"}), 404

    return jsonify({"group": result}), 200


@ops_redis.route('/get_groups', methods=['GET']) # TODO chage to GET
def get_groups():
    # Gets list of groups the user is a member of
    user_id  = get_safe(request, 'user_id')

    if not user_id:
        return jsonify({'error': 'Missing parameters'}), 400

    user_groups_key = f"user_groups:{user_id}"
    user_data = app.redis.get(user_groups_key)
    
    if not user_data:
        return jsonify({"groups": []}), 200

    user_data = json.loads(user_data)
    return jsonify({"groups": user_data["groups"]}), 200



@ops_redis.route('/invite_to_group', methods=['POST'])
def invite_to_group():
    # TODO: updates invited list in group (key: "group:{group_id}" value: {"invited": [], "members": []})
    # TODO: updates invitations  in user groups (key: "user_groups:{user_id}" value: {"invitations": [], "groups": []})
    group_id = get_safe(request, 'group_id')
    user_id = get_safe(request, 'user_id')

    if not user_id or not group_id:
        return jsonify({"error": "Not enough arguments!"}), 500

    # First check whether the group exists or not
    group_key  = f"group_id:{group_id}"
    group_data = app.redis.get(group_key)

    if not group_data:
        return jsonify({"error": f"No group with id/name {group_id}!"}), 404

    group_data = json.loads(group_data)

    # Second set user
    user_groups_key = f"user_groups:{user_id}"
    user_data = app.redis.get(user_groups_key)

    # Check wether user_groups exists, if not create it 
    if user_data:
        user_data = json.loads(user_data)
    else:
        user_data = {"invitations": [], "groups": []}

    # Chek if the group_id is already present
    if group_id in user_data["invitations"]:
        return jsonify({"error": "User is already invited to that group"}), 400
        
    # Actual update of data
    group_data["invited"].append(user_id)
    app.redis.set(group_key, json.dumps(group_data))

    user_data["invitations"].append(group_id)
    app.redis.set(user_groups_key, json.dumps(user_data))

    return jsonify({"message": f"User {user_id} invited to group {group_id}"}), 200


@ops_redis.route('/accept_invitation_to_group', methods=['POST'])
def accept_invitation_to_group():
    # TODO: updates invited list and members list in group (key: "group:{group_id}" value: {"invited": [], "members": []})
    # TODO: updates invitations and groups  in user groups (key: "user_groups:{user_id}" value: {"invitations": [], "groups": []})
    group_id = get_safe(request, 'group_id')
    user_id = get_safe(request, 'user_id')

    if not user_id or not group_id:
        return jsonify({"error": "Not enough arguments!"}), 500

    # First check whether the group exists or not
    group_key  = f"group_id:{group_id}"
    group_data = app.redis.get(group_key)

    if not group_data:
        return jsonify({"error": f"No group with id/name {group_id}!"}), 404

    group_data = json.loads(group_data)

    # Second set user
    user_groups_key = f"user_groups:{user_id}"
    user_data = app.redis.get(user_groups_key)

    # Check wether user_groups exists, if not create it 
    if user_data:
        user_data = json.loads(user_data)
    else:
        user_data = {"invitations": [], "groups": []}

    # Chek if the group_id is already present
    if group_id not in user_data["invitations"]:
        return jsonify({"error": f"User is not invited to group {group_id}"}), 400
        
    # Actual update of data
    group_data["invited"].remove(user_id)
    group_data["members"].append(user_id)
    app.redis.set(group_key, json.dumps(group_data))

    user_data["invitations"].remove(group_id)
    user_data["groups"     ].append(group_id)
    app.redis.set(user_groups_key, json.dumps(user_data))
    
    return jsonify({"message": f"User {user_id} accepted in to group {group_id}"}), 200


@ops_redis.route('/delete_invitation_from_group', methods=['DELETE'])
def delete_invitation_from_group():
    # TODO: updates invited list in group (key: "group:{group_id}" value: {"invited": [], "members": []})
    # TODO: updates invitations in user groups (key: "user_groups:{user_id}" value: {"invitations": [], "groups": []})
    group_id = get_safe(request, 'group_id')
    user_id = get_safe(request, 'user_id')

    if not user_id or not group_id:
        return jsonify({"error": "Not enough arguments!"}), 500

    # First check whether the group exists or not
    group_key  = f"group_id:{group_id}"
    group_data = app.redis.get(group_key)

    if not group_data:
        return jsonify({"error": f"No group with id/name {group_id}!"}), 404

    group_data = json.loads(group_data)

    # Second set user
    user_groups_key = f"user_groups:{user_id}"
    user_data = app.redis.get(user_groups_key)

    # Check weather user_groups exists, if not create it
    if user_data:
        user_data = json.loads(user_data)
    else:
        user_data = {"invitations": [], "groups": []}

    # Check if the group_id is already present
    if group_id not in user_data["invitations"]:
        return jsonify({"error": "User is not invited to that group"}), 400
        
    # Actual update of data
    group_data["invited"].remove(user_id)
    app.redis.set(group_key, json.dumps(group_data))

    user_data["invitations"].remove(group_id)
    app.redis.set(user_groups_key, json.dumps(user_data))

    return jsonify({"message": f"User {user_id} invition to group {group_id} removed!"}), 200


@ops_redis.route('/delete_member_from_group', methods=['DELETE'])
def delete_member_from_group():
    # TODO: updates members list in group (key: "group:{group_id}" value: {"invited": [], "members": []})
    # TODO: updates groups in user groups (key: "user_groups:{user_id}" value: {"invitations": [], "groups": []})
    group_id = get_safe(request, 'group_id')
    user_id = get_safe(request, 'user_id')

    if not user_id or not group_id:
        return jsonify({"error": "Not enough arrguments!"}), 500

    # First check whether the group exists or not
    group_key  = f"group_id:{group_id}"
    group_data = app.redis.get(group_key)

    if not group_data:
        return jsonify({"error": f"No group with id/name {group_id}!"}), 404

    group_data = json.loads(group_data)

    # Second set user
    user_groups_key = f"user_groups:{user_id}"
    user_data = app.redis.get(user_groups_key)

    # Check wether user_groups exists, if not create it 
    if user_data:
        user_data = json.loads(user_data)
    else:
        user_data = {"invitations": [], "groups": []}

    # Chek if the group_id is already present
    if group_id not in user_data["groups"]:
        return jsonify({"error": f"User is not in group {group_id}!"}), 400
        
    # Actual update of data
    group_data['members'] = [member for member in group_data['members'] if member != user_id]
    app.redis.set(group_key, json.dumps(group_data))

    user_data["groups"] = [group for group in user_data['groups'] if group != group_id]
    app.redis.set(user_groups_key, json.dumps(user_data))

    return jsonify({"message": f"User {user_id} removed from group {group_id}!"}), 200
    

@ops_redis.route('/send_message_to_group', methods=['POST'])
def send_message_to_group():
    # Updates list of messages in group_chat (key: "group_chat:{group_id}" value: [{"timestamp": ..., "user_id": ..., "message": ...}, ...])
    group_id = get_safe(request, 'group_id')
    user_id = get_safe(request, 'user_id')
    message = get_safe(request, 'message')

    if not user_id or not group_id or not message:
        return jsonify({"error": "Not enough arguments!"}), 500

    # Check if the group exists
    group_key = f"group_id:{group_id}"
    group_data = app.redis.get(group_key)

    if not group_data:
        return jsonify({"error": f"No group with id/name {group_id}!"}), 404

    # Check if the user is in the group
    group_data = json.loads(group_data)

    if user_id not in group_data["members"]:
        return jsonify({"error": f"No user with id {user_id} in group {group_id}!"}), 400

    # Update the chat messages
    chat_key = f"group_chat:{group_id}"
    chat_data = app.redis.get(chat_key)

    if chat_data:
        chat_data = json.loads(chat_data)
    else:
        chat_data = []

    # Append the new message as a JSON object
    chat_data.append({
        "timestamp": dt.now().isoformat(),
        "user_id": user_id,
        "message": message
    })

    app.redis.set(chat_key, json.dumps(chat_data))

    return jsonify({"message": "Message sent successfully!"}), 200


@ops_redis.route('/get_messages_from_group', methods=['GET'])
def get_messages_from_group():
    # Gets list of messages in group_chat (key: "group_chat:{group_id}" value: [{"timestamp": ..., "user_id": ..., "message": ...}, ...])
    group_id = get_safe(request, 'group_id')
    user_id = get_safe(request, 'user_id')

    if not user_id or not group_id:
        return jsonify({"error": "Not enough arguments!"}), 500

    # Check if the group exists
    group_key = f"group_id:{group_id}"
    group_data = app.redis.get(group_key)

    if not group_data:
        return jsonify({"error": f"No group with id/name {group_id}!"}), 404

    # Check if the user is in the group
    group_data = json.loads(group_data)

    if user_id not in group_data["members"]:
        return jsonify({"error": f"No user with id {user_id} in group {group_id}!"}), 400

    # Retrieve chat messages
    chat_key = f"group_chat:{group_id}"
    chat_data = app.redis.get(chat_key)

    if not chat_data:
        return jsonify({"messages": []}), 200

    chat_data = json.loads(chat_data)

    return jsonify({"messages": chat_data}), 200
