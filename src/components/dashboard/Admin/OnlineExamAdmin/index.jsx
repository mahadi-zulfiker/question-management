"use client";
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OnlineExamAdmin = () => {
  const [questionClass, setQuestionClass] = useState("");
  const [department, setDepartment] = useState("");
  const [subject, setSubject] = useState("");
  const [testNumber, setTestNumber] = useState("");
  const [questions, setQuestions] = useState([]);
  const [questionType, setQuestionType] = useState("general");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [higherOptions, setHigherOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [higherCorrectAnswer, setHigherCorrectAnswer] = useState(null);
  const [showQuestionFields, setShowQuestionFields] = useState(true);
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch classes data on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/onlineExamAdmin");
        const data = await response.json();
        setClassesData(data.classes);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error("Failed to load class data!");
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // Reset department and subject when class changes
  useEffect(() => {
    setDepartment("");
    setSubject("");
  }, [questionClass]);

  const handleClassChange = (e) => {
    const classVal = e.target.value;
    setQuestionClass(classVal);
  };

  const handleOptionChange = (index, value, type = "general") => {
    if (type === "general") {
      const newOptions = [...options];
      newOptions[index] = value;
      setOptions(newOptions);
    } else {
      const newHigherOptions = [...higherOptions];
      newHigherOptions[index] = value;
      setHigherOptions(newHigherOptions);
    }
  };

  const handleAddQuestion = () => {
    if (!question) {
      toast.error("Question cannot be empty!");
      return;
    }

    if (questionType === "general" && options.some(opt => opt === "")) {
      toast.error("All options must be filled!");
      return;
    }

    if (questionType === "higher" && higherOptions.slice(0, 3).some(opt => opt === "")) {
      toast.error("All higher-level options must be filled!");
      return;
    }

    setQuestions(prevQuestions => [
      ...prevQuestions,
      {
        question,
        type: questionType,
        options: questionType === "general" ? options : higherOptions,
        correctAnswer: questionType === "general" ? correctAnswer : higherCorrectAnswer,
      },
    ]);
    setShowQuestionFields(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!questionClass || !subject || !testNumber || questions.length === 0) {
      toast.error("Please fill out all required fields!");
      return;
    }

    const formData = {
      questionClass,
      department: department || "N/A",
      subject,
      testNumber,
      questions,
    };

    try {
      const response = await fetch("/api/onlineExamAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Model test added successfully!", { position: "top-right" });
        // Reset form
        setQuestionClass("");
        setDepartment("");
        setSubject("");
        setTestNumber("");
        setQuestions([]);
        setShowQuestionFields(true);
        setQuestion("");
        setOptions(["", "", "", ""]);
        setHigherOptions(["", "", "", ""]);
        setCorrectAnswer(null);
        setHigherCorrectAnswer(null);
      } else {
        toast.error("Failed to add model test!", { position: "top-right" });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Submission error!", { position: "top-right" });
    }
  };

  // Get unique class numbers
  const uniqueClasses = [...new Set(classesData.map(item => item.classNumber))];
  // Get subjects for selected class
  const subjectsForClass = classesData
    .filter(item => item.classNumber === Number(questionClass))
    .map(item => item.subject);

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Admin Dashboard - Add Model Test
            </h1>
            
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={questionClass}
                    onChange={handleClassChange}
                  >
                    <option value="">Select Class</option>
                    {uniqueClasses.map(cls => (
                      <option key={cls} value={cls}>{`Class ${cls}`}</option>
                    ))}
                  </select>
                </div>

                {questionClass && Number(questionClass) >= 9 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option value="">Select Department</option>
                      <option value="science">Science</option>
                      <option value="bst">Business Studies</option>
                      <option value="arts">Arts</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={!questionClass}
                  >
                    <option value="">Select Subject</option>
                    {subjectsForClass.map((sub, index) => (
                      <option key={index} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model Test Number</label>
                  <input
                    type="number"
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Model Test Number"
                    value={testNumber}
                    onChange={e => setTestNumber(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Questions ({questions.length})
                  </label>
                  {questions.map((q, index) => (
                    <div key={index} className="border p-4 mb-3 rounded-lg bg-gray-50">
                      <strong className="text-gray-800">{index + 1}. {q.question}</strong>
                      <p className="text-sm text-gray-600">Type: {q.type}</p>
                    </div>
                  ))}

                  {showQuestionFields && (
                    <div className="mt-4 space-y-4">
                      <select
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value)}
                      >
                        <option value="general">General MCQ</option>
                        <option value="higher">Higher Skill MCQ</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Enter question"
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                      />

                      {questionType === "general" && (
                        <div className="space-y-2">
                          {options.map((option, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <input
                                type="text"
                                placeholder={`Option ${i + 1}`}
                                className="flex-1 p-2 border rounded-lg"
                                value={option}
                                onChange={(e) => handleOptionChange(i, e.target.value)}
                              />
                              <input
                                type="radio"
                                name="correct"
                                className="h-4 w-4 text-blue-600"
                                onChange={() => setCorrectAnswer(i)}
                                checked={correctAnswer === i}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {questionType === "higher" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            {higherOptions.slice(0, 3).map((option, i) => (
                              <input
                                key={i}
                                type="text"
                                placeholder={`Stem ${i + 1}`}
                                className="w-full p-2 border rounded-lg"
                                value={option}
                                onChange={(e) => handleOptionChange(i, e.target.value, "higher")}
                              />
                            ))}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-700">Options:</h3>
                          <div className="space-y-2">
                            {higherOptions.slice(3).map((option, i) => (
                              <div key={i + 3} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  placeholder={`Option ${i + 1}`}
                                  className="flex-1 p-2 border rounded-lg"
                                  value={option}
                                  onChange={(e) => handleOptionChange(i + 3, e.target.value, "higher")}
                                />
                                <input
                                  type="radio"
                                  name="higherCorrect"
                                  className="h-4 w-4 text-blue-600"
                                  onChange={() => setHigherCorrectAnswer(i + 3)}
                                  checked={higherCorrectAnswer === i + 3}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 space-x-2">
                    <button
                      type="button"
                      className="p-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      onClick={handleAddQuestion}
                    >
                      Add Question
                    </button>
                    <button
                      type="button"
                      className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      onClick={() => {
                        setShowQuestionFields(true);
                        setQuestion("");
                        setOptions(["", "", "", ""]);
                        setHigherOptions(["", "", "", "", "", "", ""]);
                        setCorrectAnswer(null);
                        setHigherCorrectAnswer(null);
                      }}
                    >
                      Add New Question
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full p-3 mt-6 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Complete Model Test
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OnlineExamAdmin;