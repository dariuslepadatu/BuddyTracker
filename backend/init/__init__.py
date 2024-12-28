from flask import Flask
from init.config import Config
import redis
from init.instances import cors, socketio


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    redis_client = redis.StrictRedis(
        host=Config.REDIS_HOST,
        port=Config.REDIS_PORT,
        password=Config.REDIS_PASSWORD,
        db=0,
        decode_responses=True
    )

    app.redis = redis_client
    cors.init_app(app)
    socketio.init_app(app)
    app.socketio = socketio
    from api.ops_redis import ops_redis
    app.register_blueprint(ops_redis, url_prefix='/db')
    from api.ops_keycloak import ops_keycloak
    app.register_blueprint(ops_keycloak, url_prefix='/identity')
    from api.ops_endpoints import ops_endpoints
    app.register_blueprint(ops_endpoints)
    return app
