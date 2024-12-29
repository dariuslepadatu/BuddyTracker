import werkzeug


def get_safe(data, key):
    if isinstance(data, dict):
        if key in data:
            return data[key]
    elif isinstance(data, werkzeug.local.LocalProxy):
        data = data.get_json()
        if key in data:
            return data[key]
    return None