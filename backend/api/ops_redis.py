
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
