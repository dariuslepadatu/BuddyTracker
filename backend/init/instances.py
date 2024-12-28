from flask_cors import CORS
from flask_socketio import SocketIO

cors = CORS(resources={r"/*": {"origins": "*"}})
socketio = SocketIO()
