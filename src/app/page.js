"use client";

import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const handleDetectAI = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to analyze");
      return;
    }

    if (inputText.trim().length < 10) {
      setError("Text is too short. Please enter at least 10 characters.");
      return;
    }

    setError("");
    setIsAnalyzing(true);
    setResults(null);

    try {
      const response = await fetch("/api/detect-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze text");
      }

      setResults(data);
    } catch (err) {
      if (err.message.includes("fetch") || err.name === "TypeError") {
        setError("Network error. Please check your connection and try again.");
      } else if (err.message.includes("unavailable")) {
        setError(
          "AI detection service is currently unavailable. Please make sure the Flask API is running."
        );
      } else {
        setError(
          err.message || "An error occurred during analysis. Please try again."
        );
      }
      console.error("Detection error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTextChange = (e) => {
    setInputText(e.target.value);
    if (error) setError("");
    if (results) setResults(null);
  };

  return (
    <>
      <nav className="w-full px-4 py-2">
        <h1 className="text-2xl font-bold font-bruno">TruText</h1>
      </nav>
      <main className="w-[90%] max-w-2xl mx-auto mt-24 lg:mt-32">
        <h1 className="text-xl text-center text-gray-800 font-bold mb-4">
          Detect AI-Generated Text
          <br />
          Instantly and Accurately
        </h1>

        <p className="text-gray-700 text-center">
          Paste, type, or upload a PDF to find out if the content was written by
          AI or a human
        </p>

        {/* Text Input Area */}
        <div className="mt-4 py-4 w-full border bg-neutral-100 border-gray-300 rounded-2xl focus-within:outline-2 focus-within:outline-blue-500">
          <form onSubmit={(e) => e.preventDefault()}>
            <textarea
              id="inputText"
              value={inputText}
              onChange={handleTextChange}
              className="px-4 h-24 w-full resize-none focus-visible:outline-none bg-transparent"
              placeholder="Paste or type your text here..."
              disabled={isAnalyzing}
            />
          </form>
          <div className="px-4 flex justify-between items-center">
            <div className="flex items-center cursor-pointer text-gray-500 hover:text-gray-800">
              <CiCirclePlus className="text-lg" />
              <span className="ml-2">Upload PDF</span>
            </div>
            <button
              onClick={handleDetectAI}
              disabled={isAnalyzing || !inputText.trim()}
              className={`px-4 py-1 rounded-full cursor-pointer transition-colors ${
                isAnalyzing || !inputText.trim()
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isAnalyzing ? "Analyzing..." : "Detect AI"}
            </button>
          </div>
        </div>

        {/* Character Count */}
        {inputText && (
          <div className="mt-2 text-right text-sm text-gray-500">
            {inputText.length} characters
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="mt-6 p-6 border border-gray-300 rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Analysis Results
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  results.isAI
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {results.isAI ? "🤖 AI Generated" : "👤 Human Written"}
              </span>
            </div>

            {/* Confidence Score */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Confidence Level</span>
                <span>{results.confidence}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    results.confidence > 70
                      ? results.isAI
                        ? "bg-red-500"
                        : "bg-green-500"
                      : results.confidence > 40
                      ? "bg-yellow-500"
                      : "bg-gray-400"
                  }`}
                  style={{ width: `${results.confidence}%` }}
                ></div>
              </div>
            </div>

            {/* Probability Breakdown */}
            {results.probabilities && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">
                  Probability Breakdown
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {results.probabilities.human}%
                    </div>
                    <div className="text-sm text-gray-600">Human Written</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">
                      {results.probabilities.ai}%
                    </div>
                    <div className="text-sm text-gray-600">AI Generated</div>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Details */}
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Analysis Summary
                </h4>
                <p className="text-sm text-gray-600">
                  {results.details.reason}
                </p>
                {results.details.source && (
                  <p className="text-xs text-gray-500 mt-1">
                    Source: {results.details.source}
                  </p>
                )}
              </div>

              {results.details.indicators &&
                results.details.indicators.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Key Indicators
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {results.details.indicators.map((indicator, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-800">
                    {results.details.textLength}
                  </div>
                  <div className="text-sm text-gray-600">Words</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-800">
                    {results.prediction === 1 ? "AI" : "Human"}
                  </div>
                  <div className="text-sm text-gray-600">Classification</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
