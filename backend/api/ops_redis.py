import json

from datetime import datetime as dt

from flask import Blueprint, jsonify, request, current_app as app

from api.ops_keycloak import token_required
from api.utils import get_safe


ops_redis = Blueprint('ops_redis', __name__)

# TODO Darius: change endpoint into socket event
# TODO Darius: check if user_id is valid using token_required decorator
@ops_redis.route('/set_sid', methods=['POST'])
def set_sid():
    # updates user sid (key: "sid:{user_id}" value: sid)
    user_id = get_safe(request, 'user_id')
    sid = get_safe(request, 'sid')

    redis_key = f"sid:{user_id}"
    app.redis.set(redis_key, sid)

    return jsonify({"message": f"Session ID for user {user_id} set to {sid}"}), 200

# TODO Darius: check if user_id is valid using token_required decorator
@ops_redis.route('/get_sid', methods=['GET'])
def get_sid():
    # gets user sid (key: "sid:{user_id}" value: sid)
    user_id = get_safe(request, 'user_id')

    redis_key = f"sid:{user_id}"
    sid = app.redis.get(redis_key)

    if not sid:
        # nu exista in baza de data
        return jsonify({"error": f"No session ID found for user {user_id}"}), 404

    return jsonify({"sid": sid}), 200

# TODO Darius: check if user_id is valid using token_required decorator
@ops_redis.route('/delete_sid', methods=['DELETE'])
def delete_sid():
    # deletes user both key and value sid (key: "sid:{user_id}" value: sid)
    user_id = get_safe(request, 'user_id')
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

# TODO Darius: change endpoint into socket event
# TODO Darius: check if user_id is valid using token_required decorator
@ops_redis.route('/set_location', methods=['POST'])
def set_location():
    # updates user location (key: "location:{user_id}" value: {"latitude": "", "longitude:""})
    user_id = get_safe(request, 'user_id')
    latitude = get_safe(request, 'latitude')
    longitude = get_safe(request, 'longitude')

    redis_key = f"location:{user_id}"
    redis_value = {"latitude": latitude, "longitude": longitude}

    app.redis.set(redis_key, json.dumps(redis_value))

    stored_value = json.loads(app.redis.get(redis_key))

    if stored_value != redis_value:
        return jsonify({"error": f"Error setting location for user {user_id}"}), 500
    # TODO Oli: broadcast the update of the location to all users
    #  that are connected to the server and are in the same group as the user_id
    # ========================= TODO =========================
    # for group_id in get_groups(user_id):
    #     for obj in get_group_sids(user_id, group_id):
    #         sid = obj["sid"]
    #         if sid != get_sid(user_id):
    #             emit('user_location_in_group_update',
    #                  { 'group_id': group_id,
    #                          'user_id': user_id,
    #                          "latitude": latitude,
    #                          "longitude": longitude}, to=sid)
    return jsonify({"message": f"Location updated for user {user_id}"}), 200


# TODO Darius: check if user_id is valid using token_required decorator
@ops_redis.route('/get_location',  methods=['GET'])
def get_location():
    # gets user location (key: "location:{user_id}" value: {"latitude":"" , "longitude":""})
    user_id = get_safe(request, 'user_id')

    if not user_id:
        return jsonify({"error": "Missing user_id parameter"}), 400

    redis_key = f"location:{user_id}"
    location_data = json.loads(app.redis.get(redis_key))

    if not location_data:
        return jsonify({"error": "Location not found for the given user_id"}), 404

    return jsonify({"latitude": location_data["latitude"], "longitude": location_data["longitude"]}), 200

@ops_redis.route('/get_group_locations', methods=['GET'])
def get_group_locations():
    # TODO Oli: return a list of locations for all members from the group (except the location of the user)
    # return value is [{'user_id': 'olivian', 'latitude' : 4324423, 'longitude' : 312312}, .... ]
    user_id = get_safe(request, 'user_id')
    group_id = get_safe(request, 'group_id')
    pass


@ops_redis.route('/set_group', methods=['POST'])
@token_required
def set_group():
    # creates group (key: "group:{group_id}" value: {"invited": [], "members": []})
    user_id = request.user_id
    group_id = get_safe(request, 'group_id')

    if not user_id or not group_id:
        return jsonify({'error': 'Missing parameters'}), 400

    # USER has a list of ivited people and memebers, 
    # remeber to add user as well
    invited = []
    members = []
        
    members.append(user_id)

    # Set group_id and the user_id of creator as key
    redis_key   = f"group_id:{group_id}"
    redis_value = {"invited": invited, "members": members}
    if app.redis.get(redis_key):
        return jsonify({"error": f"Group with id {group_id} already exists"}), 404

    app.redis.set(redis_key, json.dumps(redis_value))
    
    if app.redis.get(redis_key) != json.dumps(redis_value):
        return jsonify({"error": f"Error set_group for {user_id}"}), 500

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

# TODO Darius: check if user_id is valid using token_required decorator
@ops_redis.route('/get_group', methods=['GET'])
def get_group():
    # gets group invited list and members list (key: "group:{group_id}" value: {"invited": [], "members": []})
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


@ops_redis.route('/get_groups', methods=['POST'])
@token_required
def get_groups():
    # Gets list of groups the user is a member of
    user_id = request.user_id
    search_query = get_safe(request, 'search_query')
    print(user_id, search_query)
    if not user_id:
        return jsonify({'error': 'Missing parameters'}), 400

    user_groups_key = f"user_groups:{user_id}"
    user_data = app.redis.get(user_groups_key)

    if not user_data:
        return jsonify({"groups": []}), 200

    user_data = json.loads(user_data)
    groups = user_data.get("groups", [])

    if search_query and search_query != '':
        search_query = search_query.lower()
        groups = [group for group in groups if group.lower().startswith(search_query)]

    return jsonify({"groups": groups}), 200


# TODO Darius: check if user_id is valid using token_required decorator
@ops_redis.route('/invite_to_group', methods=['POST'])
def invite_to_group():
    # updates invited list in group (key: "group:{group_id}" value: {"invited": [], "members": []})
    # updates invitations  in user groups (key: "user_groups:{invited_user_id}" value: {"invitations": [], "groups": []})
    group_id = get_safe(request, 'group_id')
    user_id = get_safe(request, 'user_id')
    # TODO Darius: check if invited_user_id exists in Keycloak's database
    invited_user_id = get_safe(request, 'invited_user_id')

    if not user_id or not group_id or not invited_user_id:
        return jsonify({"error": "Not enough arguments!"}), 500

    if user_id == invited_user_id:
        return jsonify({"error": "The user cannot invited himself!"}), 400

    # First check whether the group exists or not
    group_key  = f"group_id:{group_id}"
    group_data = app.redis.get(group_key)

    if not group_data:
        return jsonify({"error": f"No group with id/name {group_id}!"}), 404

    group_data = json.loads(group_data)

    # Second set user
    user_groups_key = f"user_groups:{invited_user_id}"
    user_data = app.redis.get(user_groups_key)

    # Check wether user_groups exists, if not create it 
    if user_data:
        user_data = json.loads(user_data)
    else:
        user_data = {"invitations": [], "groups": []}

    # Chek if the group_id is already present in invitations
    if group_id in user_data["invitations"]:
        return jsonify({"error": "User is already invited to that group!"}), 400

    # Check if the user is member of the group
    if group_id in user_data["groups"]:
        return jsonify({"error": "User is already a member of the group!"}), 400
        
    # Actual update of data
    group_data["invited"].append(invited_user_id)
    app.redis.set(group_key, json.dumps(group_data))

    user_data["invitations"].append(group_id)
    app.redis.set(user_groups_key, json.dumps(user_data))

    return jsonify({"message": f"User {invited_user_id} invited to group {group_id}"}), 200

# TODO Darius: check if user_id is valid using token_required decorator
@ops_redis.route('/accept_invitation_to_group', methods=['POST'])
def accept_invitation_to_group():
    # updates invited list and members list in group (key: "group:{group_id}" value: {"invited": [], "members": []})
    # updates invitations and groups  in user groups (key: "user_groups:{user_id}" value: {"invitations": [], "groups": []})
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
    user_data["groups"].append(group_id)
    app.redis.set(user_groups_key, json.dumps(user_data))
    
    return jsonify({"message": f"User {user_id} accepted in to group {group_id}"}), 200

# TODO Darius: check if user_id is valid using token_required decorator
@ops_redis.route('/delete_invitation_from_group', methods=['DELETE'])
def delete_invitation_from_group():
    # updates invited list in group (key: "group:{group_id}" value: {"invited": [], "members": []})
    # updates invitations in user groups (key: "user_groups:{user_id}" value: {"invitations": [], "groups": []})
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

# TODO Darius: check if user_id is valid using token_required decorator
@ops_redis.route('/delete_member_from_group', methods=['DELETE'])
def delete_member_from_group():
    # updates members list in group (key: "group:{group_id}" value: {"invited": [], "members": []})
    # updates groups in user groups (key: "user_groups:{user_id}" value: {"invitations": [], "groups": []})
    group_id = get_safe(request, 'group_id')
    user_id = get_safe(request, 'user_id')

    if not user_id or not group_id:
        return jsonify({"error": "Not enough arrguments!"}), 500

    # First check whether the group exists or not
    group_key      = f"group_id:{group_id}"
    group_chat_key = f"group_chat:{group_id}"
    group_data     = app.redis.get(group_key)

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
        
    # Delete group records (group_id, group_chat) from redis if no member remains
    # It is meaningless to remove the user from the group data 
    # if the group is going to be deleted anyway
    if len(group_data['members']) == 1:
        # Remove invitations from all the users
        for ui_user in group_data['invited']:
            uninvited_key  = f"user_groups:{ui_user}"
            uninvited_data = app.redis.get(uninvited_key)
            uninvited_data = json.loads(uninvited_data)

            uninvited_data["invitations"].remove(group_id)

            app.redis.set(uninvited_key, json.dumps(uninvited_data))
            
        # Delete the group_data and group_chat_data
        app.redis.delete(group_key)
        app.redis.delete(group_chat_key)
 
    # Actual update of data if more the one user remains
    else:
        group_data['members'] = [member for member in group_data['members'] if member != user_id]
        app.redis.set(group_key, json.dumps(group_data))
        
    # Remove the group from user data
    user_data["groups"] = [group for group in user_data['groups'] if group != group_id]
    app.redis.set(user_groups_key, json.dumps(user_data))

    return jsonify({"message": f"User {user_id} removed from group {group_id}!"}), 200
    
# TODO Darius: check if user_id is valid using token_required decorator
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

    # TODO Oli: broadcast the message to all users
    #  that are connected to the server and are in the same group as the user_id
    # ========================= TODO =========================
    # for group_id in get_groups(user_id):
    #     for obj in get_group_sids(user_id, group_id):
    #         sid = obj["sid"]
    #             emit('user_message_in_group_update',
    #                  { 'group_id': group_id,
    #                          "timestamp": dt.now().isoformat(),
    #                          "user_id": user_id,
    #                          "message": message}, to=sid)

    return jsonify({"message": "Message sent successfully!"}), 200

# TODO Darius: check if user_id is valid using token_required decorator
@ops_redis.route('/get_messages_from_group', methods=['POST'])
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
