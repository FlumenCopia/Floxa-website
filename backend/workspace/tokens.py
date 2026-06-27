import hashlib
import secrets


def generate_portal_token():
    return secrets.token_urlsafe(32)


def hash_portal_token(value):
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def generate_hashed_portal_token():
    return hash_portal_token(generate_portal_token())
