import os
from dotenv import load_dotenv

load_dotenv('alexia.env')

class Config:
    KEYCLOAK_URL = os.getenv('KEYCLOAK_URL')
    KEYCLOAK_REALM = os.getenv('KEYCLOAK_REALM')
    KEYCLOAK_CLIENT_ID = os.getenv('KEYCLOAK_CLIENT_ID')
    KEYCLOAK_CLIENT_SECRET = os.getenv('KEYCLOAK_CLIENT_SECRET')
    KEYCLOAK_ADMIN_USERNAME = os.getenv('KEYCLOAK_ADMIN_USERNAME')
    KEYCLOAK_ADMIN_PASSWORD = os.getenv('KEYCLOAK_ADMIN_PASSWORD')
    INTROSPECT_URL = f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/token/introspect"
    ADMIN_TOKEN_URL = f"{KEYCLOAK_URL}/realms/master/protocol/openid-connect/token"
    USER_TOKEN_URL = f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/token"
    USER_URL = f"{KEYCLOAK_URL}/admin/realms/{KEYCLOAK_REALM}/users"
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = os.getenv('REDIS_PORT', 6379)
    REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', None)
