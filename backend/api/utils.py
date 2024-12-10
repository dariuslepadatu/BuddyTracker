def get_safe(request, key):
    data = request.get_json()
    if key in data:
        return data[key]
    return None