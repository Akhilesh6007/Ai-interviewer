import os
from pathlib import Path

import jwt
import requests
from jwt.algorithms import RSAAlgorithm
from dotenv import load_dotenv

from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)

security = HTTPBearer()


def get_clerk_jwks_url():
    clerk_jwks_url = os.getenv("CLERK_JWKS_URL")

    print("ENV PATH:", ENV_PATH)
    print("CLERK_JWKS_URL:", clerk_jwks_url)

    if not clerk_jwks_url:
        raise HTTPException(
            status_code=500,
            detail="CLERK_JWKS_URL is missing in backend .env"
        )

    return clerk_jwks_url


def get_clerk_public_key(token: str):
    clerk_jwks_url = get_clerk_jwks_url()

    jwks = requests.get(clerk_jwks_url, timeout=10).json()

    unverified_header = jwt.get_unverified_header(token)
    kid = unverified_header.get("kid")

    print("TOKEN HEADER:", unverified_header)

    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return RSAAlgorithm.from_jwk(key)

    raise HTTPException(
        status_code=401,
        detail="Invalid Clerk token key"
    )


def verify_clerk_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    print("RECEIVED TOKEN START:", token[:20] if token else None)

    try:
        public_key = get_clerk_public_key(token)

        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={
                "verify_aud": False,
                "verify_iat": False
            },
            leeway=120
        )

        print("CLERK USER ID:", payload.get("sub"))

        return payload

    except HTTPException:
        raise

    except Exception as e:
        print("CLERK TOKEN VERIFY ERROR:", str(e))

        raise HTTPException(
            status_code=401,
            detail=f"Invalid Clerk token: {str(e)}"
        )