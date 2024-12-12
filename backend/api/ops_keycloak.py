import requests
from flask import Blueprint, jsonify, request, current_app as app

from api.utils import get_safe

ops_keycloak = Blueprint('ops_keycloak', __name__)


def get_admin_token():

    # Data for getting the token
    payload = {
        'client_id': 'admin-cli',
        'username': app.config['KEYCLOAK_ADMIN_USERNAME'],
        'password': app.config['KEYCLOAK_ADMIN_PASSWORD'],
        'grant_type': 'password'
    }

    # Send request to get the admin token
    try:
        response = requests.post(app.config['ADMIN_TOKEN_URL'], data=payload)
        if response.status_code == 200:
            return response.json()['access_token']
        else:
            return None
    except Exception as e:
        print(f"Error getting admin token: {str(e)}")
        return None

# Endpoint to register a new user in Keycloak
@ops_keycloak.route('/register', methods=['POST'])
def register():
    username = get_safe(request, 'username')
    email = get_safe(request, 'email')
    password = get_safe(request, 'password')
    first_name = get_safe(request, 'first_name')
    last_name = get_safe(request, 'last_name')

    if not username or not email or not password or not first_name or not last_name:
        return jsonify({'error': 'Missing parameters'}), 400

    # Get admin token
    admin_token = get_admin_token()
    if not admin_token:
        return jsonify({'error': 'Failed to get admin token'}), 500

    # Headers for the user creation request
    headers = {
        'Authorization': f'Bearer {admin_token}',
        'Content-Type': 'application/json'
    }

    # User data payload
    user_data = {
        'username': username,
        'email': email,
        'enabled': True,
        'firstName': first_name,
        'lastName': last_name,
        'credentials': [{
            'type': 'password',
            'value': password,
            'temporary': False
        }]
    }


    # Send POST request to create user
    try:
        response = requests.post(app.config['USER_URL'], headers=headers, json=user_data)
        if response.status_code == 201:
            return jsonify({'message': 'User created successfully'}), 201
        elif response.status_code == 409:
            return jsonify({'error': 'User already exists'}), 409
        else:
            return jsonify({'error': 'Failed to create user', 'details': response.json()}), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ops_keycloak.route('/login', methods=['POST'])
def login():
    username = get_safe(request, 'username')
    password = get_safe(request, 'password')

    if not username  or not password:
        return jsonify({'error': 'Missing parameters'}), 400

    # Request payload
    payload = {
        'client_id': app.config['KEYCLOAK_CLIENT_ID'],
        'username': username,
        'password': password,
        'client_secret': app.config['KEYCLOAK_CLIENT_SECRET'],
        'grant_type': 'password'
    }

    try:
        response = requests.post(app.config['USER_TOKEN_URL'], data=payload)

        # If successful, return tokens
        if response.status_code == 200:
            tokens = response.json()
            return jsonify({
                'access_token': tokens['access_token'],
                'refresh_token': tokens['refresh_token'],
                'expires_in': tokens['expires_in'],
                'refresh_expires_in': tokens['refresh_expires_in']
            }), 200

        # If login fails
        else:
            return jsonify({'error': 'Invalid credentials or login failed'}), response.status_code

    except Exception as e:
        return jsonify({'error': str(e)}), 500
