from flask import Flask
from init.config import Config
import redis
from init.instances import cors


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

    from api.ops_redis import ops_db
    app.register_blueprint(ops_db, url_prefix='/db')

    return app
