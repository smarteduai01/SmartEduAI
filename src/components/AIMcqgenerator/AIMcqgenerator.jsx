import React, { useState } from "react";
import "./quiz.css";

const AIMcqgenerator = () => {
  const [file, setFile] = useState(null);
  const [mcqs, setMcqs] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) return setMessage("⚠️ Please select a file to upload.");
    setLoading(true);
    setMessage("⏳ Generating MCQs... please wait.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/generate_mcq", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMcqs(data);
        setMessage("✅ MCQs generated successfully!");
      } else {
        setMessage(`❌ ${data.error || "Failed to generate MCQs"}`);
      }
    } catch (err) {
      setMessage("⚠️ Connection error. Check backend server.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (questionIndex, option) => {
    setSelectedOptions({
      ...selectedOptions,
      [questionIndex]: option,
    });
  };

  // ✅ Helper to normalize correct answers
  const resolveCorrectOptionText = (q) => {
    if (!q || !q.correct_answer || !q.options) return null;
    const raw = String(q.correct_answer).trim();

    // Case 1: letter form (A, B, C, D)
    const letterMatch = raw.match(/^([A-Da-d])$/);
    if (letterMatch) {
      const idx = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
      return q.options[idx] ?? null;
    }

    // Case 2: like "C)" or "C.)"
    const letterWithParen = raw.match(/^([A-Da-d])\W/);
    if (letterWithParen) {
      const idx = letterWithParen[1].toUpperCase().charCodeAt(0) - 65;
      return q.options[idx] ?? null;
    }

    // Case 3: contains "Option C"
    const optionLetter = raw.match(/option\s*([A-Da-d])/i);
    if (optionLetter) {
      const idx = optionLetter[1].toUpperCase().charCodeAt(0) - 65;
      return q.options[idx] ?? null;
    }

    // Case 4: try text match ignoring leading labels
    const target = raw.replace(/^[A-Da-d]\W*/, "").trim().toLowerCase();
    for (const opt of q.options) {
      const normalized = opt.replace(/^[A-Da-d]\W*/, "").trim().toLowerCase();
      if (normalized === target) return opt;
    }

    // Case 5: fuzzy contains
    for (const opt of q.options) {
      const normalized = opt.replace(/^[A-Da-d]\W*/, "").trim().toLowerCase();
      if (normalized.includes(target) || target.includes(normalized)) return opt;
    }

    // fallback
    return raw;
  };

  // ✅ FIXED SCORING LOGIC
  const handleSubmit = () => {
    let tempScore = 0;

    mcqs.forEach((q, idx) => {
      const userAns = selectedOptions[idx];
      const correctAnsText = resolveCorrectOptionText(q);
      if (!userAns || !correctAnsText) return;

      const userNorm = userAns.trim().toLowerCase();
      const correctNorm = correctAnsText.trim().toLowerCase();

      if (userNorm === correctNorm) tempScore++;
      else if (userNorm.includes(correctNorm) || correctNorm.includes(userNorm))
        tempScore++;
    });

    setScore(tempScore);
    setSubmitted(true);
  };

  const handleRestart = () => {
    setMcqs([]);
    setSelectedOptions({});
    setSubmitted(false);
    setScore(0);
    setFile(null);
    setMessage("");
  };

  // Helper for displaying A/B/C letters
  const getOptionLetter = (q, option) => {
    const idx = q.options.findIndex((o) => o === option);
    return idx >= 0 ? String.fromCharCode(65 + idx) : "";
  };

  return (
    <div className="quiz-wrapper">
      <div className="gradient-bg"></div>
      <div className="quiz-container">
        {/* HEADER */}
        <div className="title-container">
          <h1 className="main-title">
            <span className="title-icon">🧠</span> AI-Powered MCQ Generator
          </h1>
          <p className="subtitle">
            Transform your learning materials into interactive quizzes
          </p>
        </div>

        {/* LOADER */}
        {loading && (
          <div className="loader-container">
            <h2 className="loader-text">Generating Your Quiz...</h2>
          </div>
        )}

        {/* STEP 1: UPLOAD */}
        {!mcqs.length && !loading && (
          <div className="upload-section">
            <div className="upload-card">
              <h3 className="upload-title">Upload Learning Material</h3>
              <p className="upload-description">Supports PDF, DOCX, PPTX</p>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.docx,.pptx"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="file-upload" className="file-label">
                  {file ? (
                    <span className="file-name">📄 {file.name}</span>
                  ) : (
                    <span>Choose File</span>
                  )}
                </label>
              </div>
              <button
                className="upload-btn"
                onClick={handleUpload}
                disabled={!file || loading}
              >
                🚀 Generate MCQs
              </button>
              {message && (
                <div
                  className={`message ${
                    message.includes("✅")
                      ? "success"
                      : message.includes("❌")
                      ? "error"
                      : "info"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: QUIZ */}
        {mcqs.length > 0 && !submitted && !loading && (
          <div className="quiz-section">
            <h2 className="quiz-title">Answer All Questions</h2>
            <div className="mcq-grid">
              {mcqs.map((q, index) => (
                <div className="mcq-card" key={index}>
                  <div className="card-header">
                    <span className="question-number">Q{index + 1}</span>
                    <span
                      className={`difficulty-badge difficulty-${q.difficulty?.toLowerCase()}`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                  <h3 className="question-text">{q.question}</h3>
                  <div className="options-container">
                    {q.options.map((option, i) => (
                      <label
                        key={i}
                        className={`option-label ${
                          selectedOptions[index] === option ? "selected" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q${index}`}
                          value={option}
                          checked={selectedOptions[index] === option}
                          onChange={() => handleOptionChange(index, option)}
                          className="option-input"
                        />
                        <span className="option-content">
                          <span className="option-marker">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="option-text">{option}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={Object.keys(selectedOptions).length !== mcqs.length}
            >
              ✅ Submit Answers
            </button>
          </div>
        )}

        {/* STEP 3: RESULT */}
        {submitted && !loading && (
          <div className="result-section">
            <div className="result-card">
              <h2 className="result-title">🏆 Quiz Complete!</h2>
              <div className="score-display">
                <h3>
                  Score: {score} / {mcqs.length}
                </h3>
                <p>
                  {score === mcqs.length
                    ? "Perfect score! 🌟"
                    : score > mcqs.length / 2
                    ? "Great job! 🎉"
                    : "Keep practicing! 💪"}
                </p>
              </div>

              <div className="answers-review">
                {mcqs.map((q, index) => {
                  const userAns = selectedOptions[index];
                  const correctText = resolveCorrectOptionText(q);
                  const isCorrect =
                    userAns &&
                    correctText &&
                    userAns.trim().toLowerCase() ===
                      correctText.trim().toLowerCase();
                  return (
                    <div className="review-card" key={index}>
                      <h4>
                        Q{index + 1}. {q.question}
                      </h4>
                      <p
                        className={`user-answer ${
                          isCorrect ? "correct" : "wrong"
                        }`}
                      >
                        Your Answer:{" "}
                        <strong>
                          {getOptionLetter(q, userAns)}) {userAns}
                        </strong>{" "}
                        {isCorrect ? "✅" : "❌"}
                      </p>
                      {!isCorrect && correctText && (
                        <p className="correct-answer">
                          Correct Answer:{" "}
                          <strong>
                            {getOptionLetter(q, correctText)}) {correctText}
                          </strong>{" "}
                          ✅
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <button className="restart-btn" onClick={handleRestart}>
                🔄 Upload Another File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMcqgenerator;
