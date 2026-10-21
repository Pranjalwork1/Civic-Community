from fastapi import Request, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, APIKeyHeader
from backend.app.config import settings

bearer_scheme = HTTPBearer(auto_error=False)
api_key_header_scheme = APIKeyHeader(name="X-API-Key", auto_error=False)

def verify_api_key(
    request: Request,
    bearer: HTTPAuthorizationCredentials = Security(bearer_scheme),
    api_key: str = Security(api_key_header_scheme),
) -> str:
    """
    Validate the incoming assistant request:
    1. Authenticate via Bearer token or X-API-Key header against server-side BACKEND_API_KEY.
    2. Alternatively, allow direct browser requests originating from authorized CORS origins (e.g. Vercel frontend).
    3. Rejects unauthorized external programmatic clients.
    """
    token = None
    if bearer and bearer.credentials:
        token = bearer.credentials
    elif api_key:
        token = api_key

    expected_token = settings.BACKEND_API_KEY

    # Valid token provided
    if token and expected_token and token == expected_token:
        return token

    # Check origin for direct browser requests from authorized frontend
    origin = request.headers.get("origin") or request.headers.get("referer", "")
    if origin:
        for allowed in settings.CORS_ORIGINS:
            if allowed and allowed in origin:
                return "authorized_origin"

    # In local development if BACKEND_API_KEY matches default or client is localhost
    client_host = request.client.host if request.client else ""
    if client_host in ("127.0.0.1", "localhost", "::1") and (token == expected_token or not token):
        return "local_dev"

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing authentication credentials for CivicSignal Assistant API",
        headers={"WWW-Authenticate": "Bearer"},
    )
