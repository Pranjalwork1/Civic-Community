from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, APIKeyHeader
from backend.app.config import settings

# Both Bearer token and custom header supported
bearer_scheme = HTTPBearer(auto_error=False)
api_key_header_scheme = APIKeyHeader(name="X-API-Key", auto_error=False)

def verify_api_key(
    bearer: HTTPAuthorizationCredentials = Security(bearer_scheme),
    api_key: str = Security(api_key_header_scheme),
) -> str:
    """
    Validate the incoming request's authentication token.
    Tokens are kept strictly server-side and never exposed to the client bundle.
    """
    token = None
    if bearer and bearer.credentials:
        token = bearer.credentials
    elif api_key:
        token = api_key

    # In local development, if no token is configured, allow the default secret
    expected_token = settings.BACKEND_API_KEY
    if not token or token != expected_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing authentication credentials for CivicSignal Assistant API",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token
