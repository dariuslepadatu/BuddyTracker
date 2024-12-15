from flask import Blueprint, render_template_string, current_app

ops_endpoints = Blueprint('ops_endpoints', __name__)

@ops_endpoints.route("/")
def endpoints():
    # Define the HTML template for the response
    template = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>API Endpoints</title>
    </head>
    <body>
        <h1>Available Endpoints</h1>
        <h2>/db</h2>
        <ul>
            {% for rule in db_routes %}
            <li><span>{{ rule }}</span></li>
            {% endfor %}
        </ul>
        <h2>/identity</h2>
        <ul>
            {% for rule in identity_routes %}
            <li><span>{{ rule }}</span></li>
            {% endfor %}
        </ul>
    </body>
    </html>
    """


    db_routes = [str(rule) for rule in current_app.url_map.iter_rules() if rule.rule.startswith("/db")]
    identity_routes = [str(rule) for rule in current_app.url_map.iter_rules() if rule.rule.startswith("/identity")]

    return render_template_string(template, db_routes=db_routes, identity_routes=identity_routes)
