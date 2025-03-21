'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, Plus, Loader2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CreateQuestionBank() {
  const [filters, setFilters] = useState({ classLevel: '', subject: '' });
  const [allClasses, setAllClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [questions, setQuestions] = useState({ mcqs: [], cqs: [], sqs: [] });
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    validity: '',
    description: '',
    price: '',
    classId: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAllClasses();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const fetchAllClasses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/createQuestionBank');
      const data = await res.json();
      setAllClasses(data.classes);
      setFilteredClasses(data.classes);
      setQuestions({ mcqs: data.mcqs, cqs: data.cqs, sqs: data.sqs });
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes');
    }
    setIsLoading(false);
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const query = [];
      if (filters.classLevel) query.push(`class=${filters.classLevel}`);
      if (filters.subject) query.push(`subject=${filters.subject}`);
      const url = `/api/createQuestionBank${query.length ? '?' + query.join('&') : ''}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      setFilteredClasses(data.classes);
      setQuestions({
        mcqs: data.mcqs,
        cqs: data.cqs,
        sqs: data.sqs
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to fetch questions');
    }
    setIsLoading(false);
  };

  const handleQuestionSelect = (questionId, type) => {
    setSelectedQuestions(prev => {
      const question = { id: questionId, type };
      if (prev.some(q => q.id === questionId && q.type === type)) {
        return prev.filter(q => !(q.id === questionId && q.type === type));
      }
      return [...prev, question];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('Submitting form data:', { ...formData, selectedQuestions }); // Debugging

    try {
      const res = await fetch('/api/createQuestionBank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, selectedQuestions })
      });
      
      const data = await res.json();
      if (res.ok) {
        setFormData({ name: '', validity: '', description: '', price: '', classId: '' });
        setSelectedQuestions([]);
        toast.success('Question Bank created successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error(`Failed to create Question Bank: ${data.error || 'Unknown error'}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error('Error creating question bank:', error);
      toast.error('An unexpected error occurred');
    }
    setIsLoading(false);
  };

  const classNumbers = [...new Set(allClasses.map(cls => cls.classNumber))].sort((a, b) => a - b);
  const subjects = [...new Set(allClasses.map(cls => cls.subject))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-indigo-800 mb-8 drop-shadow-lg">
          Create Question Bank Dashboard
        </h1>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <div className="flex gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Class
              </label>
              <select
                value={filters.classLevel}
                onChange={(e) => setFilters({ ...filters, classLevel: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-gray-700"
              >
                <option value="">All Classes</option>
                {classNumbers.map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Subject
              </label>
              <select
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-gray-700"
              >
                <option value="">All Subjects</option>
                {subjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Questions Selection */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Questions</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {filteredClasses.length > 0 && (
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-indigo-800">
                      Matching Classes:
                    </p>
                    {filteredClasses.map(cls => (
                      <p key={cls._id} className="text-xs text-indigo-600">
                        {cls.level ? `${cls.level} - ` : ''}Class {cls.classNumber} - {cls.subject} - Ch. {cls.chapterNumber}: {cls.chapterName}
                      </p>
                    ))}
                  </div>
                )}
                {questions.mcqs.map(q => (
                  <QuestionCard
                    key={q._id}
                    question={q}
                    type="mcq"
                    isSelected={selectedQuestions.some(sq => sq.id === q._id && sq.type === 'mcq')}
                    onSelect={handleQuestionSelect}
                  />
                ))}
                {questions.cqs.map(q => (
                  <QuestionCard
                    key={q._id}
                    question={q}
                    type="cq"
                    isSelected={selectedQuestions.some(sq => sq.id === q._id && sq.type === 'cq')}
                    onSelect={handleQuestionSelect}
                  />
                ))}
                {questions.sqs.map(q => (
                  <QuestionCard
                    key={q._id}
                    question={q}
                    type="sq"
                    isSelected={selectedQuestions.some(sq => sq.id === q._id && sq.type === 'sq')}
                    onSelect={handleQuestionSelect}
                  />
                ))}
                {questions.mcqs.length === 0 && questions.cqs.length === 0 && questions.sqs.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No questions available for the selected filters.</p>
                )}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Question Bank Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800">Validity</label>
                <input
                  type="date"
                  value={formData.validity}
                  onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800">Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800">Associated Class</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value="">Select a Class (Optional)</option>
                  {filteredClasses.map(cls => (
                    <option key={cls._id} value={cls._id}>
                      {cls.level ? `${cls.level} - ` : ''}Class {cls.classNumber} - {cls.subject} - {cls.chapterName}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={isLoading || selectedQuestions.length === 0}
                className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-all flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Plus className="w-5 h-5 mr-2" />
                )}
                {isLoading ? 'Creating...' : 'Create Question Bank'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

function QuestionCard({ question, type, isSelected, onSelect }) {
  // Fallback text if the expected property is missing
  const displayText = 
    type === 'mcq' ? (question.question || 'No question text available') :
    type === 'cq' ? (question.passage ? question.passage.slice(0, 30) + '...' : 'No passage available') :
    (question.question || 'No question text available');

  return (
    <div
      className={`p-4 border border-gray-200 rounded-lg cursor-pointer transition-all ${
        isSelected ? 'bg-indigo-50 border-indigo-500 shadow-md' : 'hover:bg-gray-50'
      }`}
      onClick={() => onSelect(question._id, type)}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-800">
            {displayText}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {type.toUpperCase()} • Chapter {question.chapterNumber || 'N/A'}
          </p>
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}