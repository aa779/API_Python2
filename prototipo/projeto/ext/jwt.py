from flask_jwt import JWT
from passlib.hash import sha256_crypt

from projeto.ext.auth.models import UserAuth


def authenticate(email, password):
    user = UserAuth.query.filter_by(email=email).first()
    if user and sha256_crypt.verify(password, user.password):
        return user


def identity(payload):
    user_id = payload["identity"]
    return UserAuth.query.get(user_id)


def init_app(app):
    jwt = JWT(app, authenticate, identity)
