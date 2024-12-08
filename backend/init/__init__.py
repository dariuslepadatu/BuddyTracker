import os

import redis
from dotenv import load_dotenv
from flask import Flask

from init.instances import cors

# Load environment variables from .env file
load_dotenv()

def create_app():
    app = Flask(__name__)
    # Load configuration from environment variables or config file
    app.config['KEYCLOAK_URL'] = os.getenv('KEYCLOAK_URL')
    app.config['KEYCLOAK_REALM'] = os.getenv('KEYCLOAK_REALM')
    app.config['KEYCLOAK_CLIENT_ID'] = os.getenv('KEYCLOAK_CLIENT_ID')
    app.config['KEYCLOAK_CLIENT_SECRET'] = os.getenv('KEYCLOAK_CLIENT_SECRET')
    app.config['KEYCLOAK_ADMIN_USERNAME'] = os.getenv('KEYCLOAK_ADMIN_USERNAME')
    app.config['KEYCLOAK_ADMIN_PASSWORD'] = os.getenv('KEYCLOAK_ADMIN_PASSWORD')
    app.config['INTROSPECT_URL'] = f"{os.getenv('KEYCLOAK_URL')}/realms/{os.getenv('KEYCLOAK_REALM')}/protocol/openid-connect/token/introspect"
    app.config['TOKEN_URL'] = f"{os.getenv('KEYCLOAK_URL')}/realms/{os.getenv('KEYCLOAK_REALM')}/protocol/openid-connect/token"
    app.config['USER_URL'] = f"{ os.getenv('KEYCLOAK_URL')}/admin/realms/{ os.getenv('KEYCLOAK_REALM')}/users"
    # Import and register blueprints
    app.config['REDIS_HOST'] = os.getenv('REDIS_HOST', 'localhost')  # Default to localhost
    app.config['REDIS_PORT'] = os.getenv('REDIS_PORT', 6379)  # Default Redis port
    app.config['REDIS_PASSWORD'] = os.getenv('REDIS_PASSWORD', None)  # Default to None if no password is set

    # Setup Redis connection
    redis_client = redis.StrictRedis(
        host=app.config['REDIS_HOST'],
        port=app.config['REDIS_PORT'],
        password=app.config['REDIS_PASSWORD'],
        db=0,  # Select DB 0 by default
        decode_responses=True  # Automatically decode responses as strings
    )

    app.redis = redis_client
    cors.init_app(app)  # Allow all origins

    from api.ops_redis import ops_db
    app.register_blueprint(ops_db, url_prefix='/db')

    return app
