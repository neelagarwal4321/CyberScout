from fastapi import Request, HTTPException
from jose import jwt, JWTError
from app.config import settings

def get_public_key():
    with open(settings.JWT_PUBLIC_KEY_FILE) as f:
        return f.read()

async def auth_middleware(request: Request, call_next):
    if request.url.path == "/health":
        return await call_next(request)

    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail={"code": "AUTH_REQUIRED", "message": "Missing token"})

    token = auth[7:]
    try:
        payload = jwt.decode(token, get_public_key(), algorithms=["RS256"])
        request.state.user = type("User", (), {
            "id": payload["sub"],
            "email": payload["email"],
            "tier": payload.get("tier", "free"),
        })()
    except JWTError:
        raise HTTPException(status_code=401, detail={"code": "AUTH_INVALID", "message": "Invalid token"})

    return await call_next(request)
