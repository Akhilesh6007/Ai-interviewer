import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useState } from "react";
import api from "../services/api";

function CodingEditor() {
  const location = useLocation();
  const navigate = useNavigate();

  const question = location.state?.question;

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(
`def solve():
    # Write your solution here
    pass`
  );

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!question) {
    return (
      <>
        <Navbar />
        <div className="editor-empty">
          <div className="card">
            <h2>No question selected</h2>
            <p>Please select a coding question from the generated contest.</p>
            <button onClick={() => navigate("/leetcode")}>
              Back to LeetCode Contest
            </button>
          </div>
        </div>
      </>
    );
  }

  const getStarterCode = (lang) => {
    if (lang === "python") {
      return `def solve():
    # Write your solution here
    pass`;
    }

    if (lang === "javascript") {
      return `function solve() {
  // Write your solution here
}`;
    }

    if (lang === "java") {
      return `class Solution {
    public void solve() {
        // Write your solution here
    }
}`;
    }

    return `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}`;
  };

  const handleLanguageChange = (e) => {
    const selected = e.target.value;
    setLanguage(selected);
    setCode(getStarterCode(selected));
  };

  const runCode = () => {
    setOutput(
`Sample Run Result:
Input:
nums = [2, 7, 11, 15], target = 9

Output:
[0, 1]

Note:
Real code execution judge will be connected in the next phase.`
    );
  };

  const submitCode = async () => {
    try {
      setLoading(true);
      setOutput("Submitting code...");

      const response = await api.post("/code/submit", {
        question_title: question.title,
        difficulty: question.difficulty,
        topic: question.topic,
        language: language,
        code: code,
      });

      setOutput(
`Submission Result:
Status: ${response.data.status}
Score: ${response.data.score}/100
Runtime: ${response.data.runtime}
Submitted At: ${new Date(response.data.submitted_at).toLocaleString()}`
      );
    } catch (error) {
      console.log(error.response?.data);
      setOutput("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coding-page">
      <Navbar />

      <div className="coding-container">
        <div className="problem-panel">
          <div className="problem-header">
            <h2>
              Q{question.question_number}. {question.title}
            </h2>
          </div>

          <div className="problem-body">
            <div className="question-meta-row">
              <span
                className={`difficulty-pill ${
                  question.difficulty === "hard"
                    ? "diff-hard"
                    : question.difficulty === "medium"
                    ? "diff-medium"
                    : "diff-easy"
                }`}
              >
                {question.difficulty.toUpperCase()}
              </span>

              <span className="topic-pill">{question.topic}</span>
            </div>

            <h3>Problem Statement</h3>
            <p className="problem-description">{question.description}</p>

            <h3>Example</h3>
            <div className="example-box">
{`Input:
nums = [2, 7, 11, 15], target = 9

Output:
[0, 1]

Explanation:
nums[0] + nums[1] = 9`}
            </div>

            <h3>Instructions</h3>
            <ul className="problem-description">
              <li>Write a clean and optimized solution.</li>
              <li>Think about time and space complexity.</li>
              <li>Submit your final solution to calculate score.</li>
            </ul>

            <button
              className="btn-muted"
              onClick={() => navigate("/leetcode")}
              style={{ marginTop: "16px" }}
            >
              Back to Contest
            </button>
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-topbar">
            <h2>Code Editor</h2>

            <select
              className="language-select"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <textarea
            className="code-editor-area"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <div className="editor-actions">
            <button className="secondary-btn" onClick={runCode}>
              Run Code
            </button>

            <button className="btn-primary" onClick={submitCode} disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>

            <button
              className="btn-dark"
              onClick={() => navigate("/leetcode/leaderboard")}
            >
              View Leaderboard
            </button>
          </div>

          {output && <div className="output-panel">{output}</div>}
        </div>
      </div>
    </div>
  );
}

export default CodingEditor;