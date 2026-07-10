from fastapi import APIRouter, Depends, HTTPException

from app.services.clerk_auth_service import verify_clerk_token

from app.schemas.leetcode_schema import (
    LeetCodeConnectRequest,
    LeetCodeProfileResponse
)

from app.schemas.leetcode_contest_schema import (
    LeetCodeContestRequest,
    LeetCodeContestResponse
)

from app.services.leetcode_service import (
    fetch_leetcode_profile,
    generate_coding_questions
)


router = APIRouter(
    prefix="/leetcode",
    tags=["LeetCode"]
)


@router.post("/profile", response_model=LeetCodeProfileResponse)
def get_leetcode_profile(
    data: LeetCodeConnectRequest,
    clerk_user: dict = Depends(verify_clerk_token)
):
    clerk_user_id = clerk_user.get("sub")

    if not clerk_user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid Clerk user"
        )

    profile = fetch_leetcode_profile(data.username)

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="LeetCode user not found"
        )

    return profile


@router.post("/generate-contest", response_model=LeetCodeContestResponse)
def generate_leetcode_contest(
    data: LeetCodeContestRequest,
    clerk_user: dict = Depends(verify_clerk_token)
):
    clerk_user_id = clerk_user.get("sub")

    if not clerk_user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid Clerk user"
        )

    profile = fetch_leetcode_profile(data.username)

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="LeetCode user not found"
        )

    contest = generate_coding_questions(profile)

    return {
        "username": profile["username"],
        **contest
    }