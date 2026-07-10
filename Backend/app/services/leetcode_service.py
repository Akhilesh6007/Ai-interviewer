import requests
from app.models.hiring_drive_model import HiringDrive

LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"


def fetch_leetcode_profile(username: str):
    query = """
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          realName
          ranking
          reputation
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
      }
    }
    """

    payload = {
        "query": query,
        "variables": {
            "username": username
        }
    }

    headers = {
        "Content-Type": "application/json",
        "Referer": f"https://leetcode.com/{username}/",
        "User-Agent": "Mozilla/5.0"
    }

    response = requests.post(
        LEETCODE_GRAPHQL_URL,
        json=payload,
        headers=headers,
        timeout=15
    )

    response.raise_for_status()

    data = response.json()["data"]

    matched_user = data.get("matchedUser")

    if not matched_user:
        return None

    stats = matched_user.get("submitStats", {}).get("acSubmissionNum", [])

    solved_map = {
        item["difficulty"]: item["count"]
        for item in stats
    }

    profile = matched_user.get("profile") or {}
    contest = data.get("userContestRanking") or {}

    return {
        "username": matched_user.get("username"),
        "real_name": profile.get("realName"),
        "ranking": profile.get("ranking"),
        "reputation": profile.get("reputation"),

        "total_solved": solved_map.get("All", 0),
        "easy_solved": solved_map.get("Easy", 0),
        "medium_solved": solved_map.get("Medium", 0),
        "hard_solved": solved_map.get("Hard", 0),

        "contest_rating": contest.get("rating"),
        "global_ranking": contest.get("globalRanking"),
        "attended_contests": contest.get("attendedContestsCount"),
    }

def analyze_user_level(profile: dict):

    total = profile.get("total_solved", 0)
    medium = profile.get("medium_solved", 0)
    hard = profile.get("hard_solved", 0)
    rating = profile.get("contest_rating") or 0

    if total < 50:
        return {
            "level": "Beginner",
            "easy": 2,
            "medium": 1,
            "hard": 0,
            "recommendation": "Focus on basic arrays, strings, hashing, and simple logic building."
        }

    if total < 200 or medium < 100:
        return {
            "level": "Intermediate",
            "easy": 1,
            "medium": 2,
            "hard": 1,
            "recommendation": "Focus on medium-level DSA, recursion, sliding window, stack, and binary search."
        }

    if rating >= 1700 or hard >= 50:
        return {
            "level": "Advanced",
            "easy": 0,
            "medium": 2,
            "hard": 2,
            "recommendation": "Focus on advanced DP, graphs, greedy, trees, and contest-level problem solving."
        }

    return {
        "level": "Intermediate",
        "easy": 1,
        "medium": 2,
        "hard": 1,
        "recommendation": "Focus on improving contest consistency and solving more medium problems."
    }


def generate_coding_questions(profile: dict):

    analysis = analyze_user_level(profile)

    questions = []

    question_number = 1

    easy_templates = [
        {
            "title": "Two Sum Variant",
            "topic": "Array / HashMap",
            "description": "Given an array of integers and a target, return indices of two numbers whose sum equals the target."
        },
        {
            "title": "Valid Parentheses",
            "topic": "Stack",
            "description": "Given a string containing brackets, determine whether the brackets are valid and properly closed."
        }
    ]

    medium_templates = [
        {
            "title": "Longest Substring Without Repeating Characters",
            "topic": "Sliding Window",
            "description": "Given a string, find the length of the longest substring without repeating characters."
        },
        {
            "title": "Search in Rotated Sorted Array",
            "topic": "Binary Search",
            "description": "Given a rotated sorted array, search for a target value in O(log n) time."
        },
        {
            "title": "Top K Frequent Elements",
            "topic": "Heap / HashMap",
            "description": "Given an integer array, return the k most frequent elements."
        }
    ]

    hard_templates = [
        {
            "title": "Minimum Window Substring",
            "topic": "Sliding Window / HashMap",
            "description": "Given two strings s and t, return the minimum window in s which contains all characters of t."
        },
        {
            "title": "Word Ladder",
            "topic": "Graph / BFS",
            "description": "Given beginWord, endWord, and a dictionary, find the shortest transformation sequence length."
        }
    ]

    for i in range(analysis["easy"]):
        item = easy_templates[i % len(easy_templates)]
        questions.append({
            "question_number": question_number,
            "title": item["title"],
            "difficulty": "easy",
            "topic": item["topic"],
            "description": item["description"]
        })
        question_number += 1

    for i in range(analysis["medium"]):
        item = medium_templates[i % len(medium_templates)]
        questions.append({
            "question_number": question_number,
            "title": item["title"],
            "difficulty": "medium",
            "topic": item["topic"],
            "description": item["description"]
        })
        question_number += 1

    for i in range(analysis["hard"]):
        item = hard_templates[i % len(hard_templates)]
        questions.append({
            "question_number": question_number,
            "title": item["title"],
            "difficulty": "hard",
            "topic": item["topic"],
            "description": item["description"]
        })
        question_number += 1

    return {
        "contest_title": f"{analysis['level']} LeetCode Practice Contest",
        "user_level": analysis["level"],
        "recommendation": analysis["recommendation"],
        "easy_count": analysis["easy"],
        "medium_count": analysis["medium"],
        "hard_count": analysis["hard"],
        "questions": questions
    }