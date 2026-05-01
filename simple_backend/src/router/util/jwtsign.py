import secrets
from datetime import timedelta, datetime, timezone
from typing import Optional

import jwt
from fastapi import HTTPException

JWT_SECRET = secrets.token_hex(16)
JWT_ALGO = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


def sign(data:dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGO)
    return encoded_jwt

def decode(token):
    try:
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=JWT_ALGO)
        return decoded_token
    except:
        raise HTTPException(status_code=401, detail="Invalid Token")
