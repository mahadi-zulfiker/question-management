"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search, Loader2, ChevronDown, Heart, MessageCircle, Send } from "lucide-react";
import Head from "next/head";
import dynamic from "next/dynamic";

const EditableMathField = dynamic(() => import("react-mathquill").then((mod) => mod.EditableMathField), { ssr: false });
const StaticMathField = dynamic(() => import("react-mathquill").then((mod) => mod.StaticMathField), { ssr: false });

export default function SeeQuestions() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [newReply, setNewReply] = useState({});
  const [showComments, setShowComments] = useState({});
  const [likes, setLikes] = useState({});
  const [commentLikes, setCommentLikes] = useState({});

  // Load MathQuill styles
  useEffect(() => {
    (async () => {
      const { addStyles } = await import("react-mathquill");
      addStyles();
    })();
  }, []);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/seeQuestions?type=${type}&search=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (data.success) {
          setQuestions(data.data || []);
          const initialShowComments = {};
          data.data.forEach((q) => {
            initialShowComments[q._id] = false;
            fetchLikes(q._id);
            fetchComments(q._id);
          });
          setShowComments(initialShowComments);
        } else {
          setQuestions([]);
          toast.error("প্রশ্ন লোড করতে ব্যর্থ!");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setQuestions([]);
        toast.error("প্রশ্ন লোড করার সময় সার্ভার ত্রুটি!");
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [type, search]);

  // Fetch comments for a specific question
  const fetchComments = async (questionId) => {
    try {
      const res = await fetch(`/api/comments?questionId=${questionId}`);
      const data = await res.json();
      if (data.success) {
        setComments((prev) => ({ ...prev, [questionId]: data.data || [] }));
        data.data.forEach((comment) => fetchCommentLikes(comment._id));
      } else {
        toast.error("মন্তব্য লোড করতে ব্যর্থ!");
      }
    } catch (error) {
      console.error("Fetch comments error:", error);
      toast.error("মন্তব্য লোড করার সময় সার্ভার ত্রুটি!");
    }
  };

  // Fetch likes for a specific question
  const fetchLikes = async (questionId) => {
    try {
      const res = await fetch(`/api/likes?questionId=${questionId}`);
      const data = await res.json();
      if (data.success) {
        setLikes((prev) => ({ ...prev, [questionId]: data }));
      }
    } catch (error) {
      console.error("Fetch likes error:", error);
    }
  };

  // Fetch likes for a specific comment
  const fetchCommentLikes = async (commentId) => {
    try {
      const res = await fetch(`/api/comment-likes?commentId=${commentId}`);
      const data = await res.json();
      if (data.success) {
        setCommentLikes((prev) => ({ ...prev, [commentId]: data }));
      }
    } catch (error) {
      console.error("Fetch comment likes error:", error);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (questionId) => {
    if (!session) {
      toast.error("মন্তব্য করতে লগইন করুন!");
      return;
    }
    if (!newComment[questionId] || newComment[questionId].trim() === "") {
      toast.error("মন্তব্য খালি রাখা যাবে না!");
      return;
    }

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          comment: newComment[questionId],
          commenter: session.user.name || session.user.email,
          commenterId: session.user.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("মন্তব্য সফলভাবে যোগ করা হয়েছে!");
        setComments((prev) => ({
          ...prev,
          [questionId]: [...(prev[questionId] || []), data.data],
        }));
        setNewComment((prev) => ({ ...prev, [questionId]: "" }));
        fetchCommentLikes(data.data._id);
      } else {
        toast.error(`❌ ত্রুটি: ${data.error || "মন্তব্য যোগ করতে ব্যর্থ"}`);
      }
    } catch (error) {
      console.error("Add comment error:", error);
      toast.error("❌ সার্ভার ত্রুটি!");
    }
  };

  // Handle reply submission
  const handleReplySubmit = async (questionId, parentCommentId) => {
    if (!session) {
      toast.error("উত্তর দিতে লগইন করুন!");
      return;
    }
    if (!newReply[parentCommentId] || newReply[parentCommentId].trim() === "") {
      toast.error("উত্তর খালি রাখা যাবে না!");
      return;
    }

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          comment: newReply[parentCommentId],
          commenter: session.user.name || session.user.email,
          commenterId: session.user.id,
          parentCommentId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("উত্তর সফলভাবে যোগ করা হয়েছে!");
        setComments((prev) => ({
          ...prev,
          [questionId]: [...(prev[questionId] || []), data.data],
        }));
        setNewReply((prev) => ({ ...prev, [parentCommentId]: "" }));
        fetchCommentLikes(data.data._id);
      } else {
        toast.error(`❌ ত্রুটি: ${data.error || "উত্তর যোগ করতে ব্যর্থ"}`);
      }
    } catch (error) {
      console.error("Add reply error:", error);
      toast.error("❌ সার্ভার ত্রুটি!");
    }
  };

  // Handle question like/unlike
  const handleLike = async (questionId) => {
    if (!session) {
      toast.error("লাইক করতে লগইন করুন!");
      return;
    }

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          userId: session.user.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setLikes((prev) => ({ ...prev, [questionId]: data }));
        toast.success(data.liked ? "প্রশ্ন লাইক করা হয়েছে!" : "লাইক সরানো হয়েছে!");
      } else {
        toast.error(`❌ ত্রুটি: ${data.error || "লাইক করতে ব্যর্থ"}`);
      }
    } catch (error) {
      console.error("Like error:", error);
      toast.error("❌ সার্ভার ত্রুটি!");
    }
  };

  // Handle comment like/unlike
  const handleCommentLike = async (commentId) => {
    if (!session) {
      toast.error("লাইক করতে লগইন করুন!");
      return;
    }

    try {
      const res = await fetch("/api/comment-likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          userId: session.user.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCommentLikes((prev) => ({ ...prev, [commentId]: data }));
        toast.success(data.liked ? "মন্তব্য লাইক করা হয়েছে!" : "লাইক সরানো হয়েছে!");
      } else {
        toast.error(`❌ ত্রুটি: ${data.error || "লাইক করতে ব্যর্থ"}`);
      }
    } catch (error) {
      console.error("Comment like error:", error);
      toast.error("❌ সার্ভার ত্রুটি!");
    }
  };

  // Toggle comments visibility
  const toggleComments = (questionId) => {
    setShowComments((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap" rel="stylesheet" />
        <style>{`
          .bangla-text {
            font-family: 'Noto Sans Bengali', sans-serif;
          }
          input.bangla-text,
          textarea.bangla-text {
            font-family: 'Noto Sans Bengali', sans-serif;
          }
          .bangla-text::placeholder {
            font-family: 'Noto Sans Bengali', sans-serif;
          }
          .video-link {
            color: #1a73e8;
            text-decoration: underline;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem;
            border-radius: 0.375rem;
            transition: background-color 0.2s;
          }
          .video-link:hover {
            background-color: #e8f0fe;
          }
          .comment-section {
            transition: max-height 0.5s ease-in-out, opacity 0.5s ease-in-out;
            overflow: hidden;
          }
          .comment-section.collapsed {
            max-height: 0;
            opacity: 0;
          }
          .comment-section.expanded {
            max-height: 2000px;
            opacity: 1;
          }
          .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #e0e0e0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: #666;
          }
          .comment-container {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            transition: background-color 0.2s;
          }
          .comment-container:hover {
            background-color: #f1f5f9;
          }
          .reply-container {
            background-color: #f1f5f9;
            border-radius: 8px;
            padding: 8px;
            margin-top: 8px;
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

        {/* Banner Section */}
        <section className="relative py-20 bg-gradient-to-r from-blue-800 to-blue-600 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="currentColor" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,128C672,107,768,117,864,138.7C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold bangla-text">
              📚 প্রশ্ন দেখুন
            </h1>
            <p className="mt-4 text-lg md:text-xl bangla-text">
              আপনার শিক্ষার জন্য সেরা প্রশ্ন এবং উত্তর এখানে!
            </p>
          </div>
        </section>

        {/* Filters and Questions */}
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-10">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
              >
                <option value="">সব প্রশ্ন</option>
                <option value="mcq">এমসিকিউ</option>
                <option value="cq">সৃজনশীল প্রশ্ন</option>
                <option value="sq">সংক্ষিপ্ত প্রশ্ন</option>
              </select>
              <div className="w-full md:w-2/3 relative">
                <input
                  type="text"
                  placeholder="🔍 প্রশ্ন খুঁজুন..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              </div>
            </div>

            {/* Questions List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-6">
                {questions.length > 0 ? (
                  questions.map((q, index) => (
                    <div
                      key={q._id}
                      className="border border-gray-200 p-6 rounded-lg shadow-md bg-white hover:shadow-lg transition-all duration-300"
                      style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both` }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded bangla-text">
                          {q.type ? q.type.toUpperCase() : "Unknown"}
                        </span>
                        <button
                          onClick={() => handleLike(q._id)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full transition ${
                            likes[q._id]?.liked ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
                          } hover:scale-105`}
                        >
                          <Heart
                            className="w-5 h-5"
                            fill={likes[q._id]?.liked ? "currentColor" : "none"}
                            stroke="currentColor"
                          />
                          <span className="bangla-text">{likes[q._id]?.count || 0} লাইক</span>
                        </button>
                      </div>

                      {/* MCQ Display */}
                      {q.type === "mcq" && (
                        <div>
                          <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text">
                            <StaticMathField>{q.question || "কোনো প্রশ্ন দেওয়া হয়নি"}</StaticMathField>
                          </p>
                          {q.imageId && (
                            <div className={`mb-4 ${q.imageAlignment === "left" ? "text-left" : q.imageAlignment === "right" ? "text-right" : "text-center"}`}>
                              <img
                                src={`/api/image/${q.imageId}?type=mcq`}
                                alt="MCQ related visual"
                                className="rounded shadow-md max-h-48 inline-block"
                                onError={(e) => (e.target.style.display = "none")}
                              />
                            </div>
                          )}
                          {q.videoLink && (
                            <div className="mb-4">
                              <a
                                href={q.videoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="video-link bangla-text"
                              >
                                📹 ভিডিও দেখুন
                              </a>
                            </div>
                          )}
                          {(q.options || []).length === 4 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                              {(q.options || []).map((opt, i) => (
                                <p
                                  key={i}
                                  className={`text-gray-700 bangla-text ${q.correctAnswer === i ? "font-bold text-green-600" : ""}`}
                                >
                                  {String.fromCharCode(2453 + i)}. <StaticMathField>{opt || "N/A"}</StaticMathField>
                                </p>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <div className="mb-3 text-gray-700">
                                {(q.options || []).slice(0, 3).map((opt, i) => (
                                  <p key={i} className="bangla-text">
                                    {String.fromCharCode(2453 + i)}. <StaticMathField>{opt || "N/A"}</StaticMathField>
                                  </p>
                                ))}
                              </div>
                              <p className="font-bold mb-2 bangla-text">নিচের কোনটি সঠিক?</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                {(q.options || []).slice(3).map((opt, i) => (
                                  <p
                                    key={i + 3}
                                    className={`text-gray-700 bangla-text ${q.correctAnswer === i + 3 ? "font-bold text-green-600" : ""}`}
                                  >
                                    {String.fromCharCode(2453 + i)}. <StaticMathField>{opt || "N/A"}</StaticMathField>
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-sm text-gray-500 mt-4 bangla-text">
                            ক্লাস: {q.classNumber || "N/A"} | বিষয়: {q.subject || "N/A"} | অধ্যায়: {q.chapterName || "N/A"} | প্রশ্নের ধরণ: {q.questionType || "N/A"}
                          </p>
                        </div>
                      )}

                      {/* CQ Display */}
                      {q.type === "cq" && (
                        <div>
                          <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text">উদ্দীপক:</p>
                          <p className="text-gray-700 mb-4 bangla-text">
                            <StaticMathField>{q.passage || "কোনো উদ্দীপক দেওয়া হয়নি"}</StaticMathField>
                          </p>
                          {q.imageId && (
                            <div className={`mb-4 ${q.imageAlignment === "left" ? "text-left" : q.imageAlignment === "right" ? "text-right" : "text-center"}`}>
                              <img
                                src={`/api/image/${q.imageId}?type=cq`}
                                alt="CQ related visual"
                                className="rounded shadow-md max-h-64 inline-block"
                                onError={(e) => (e.target.style.display = "none")}
                              />
                            </div>
                          )}
                          {q.videoLink && (
                            <div className="mb-4">
                              <a
                                href={q.videoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="video-link bangla-text"
                              >
                                📹 ভিডিও দেখুন
                              </a>
                            </div>
                          )}
                          <div className="text-gray-900">
                            {(q.questions || []).map((ques, i) => (
                              <div key={i} className="mb-4">
                                <p className="mb-1 bangla-text">
                                  {String.fromCharCode(2453 + i)}) <StaticMathField>{ques || "N/A"}</StaticMathField> {q.marks && q.marks[i] ? `(${q.marks[i]} নম্বর)` : ""}
                                </p>
                                {q.answers && q.answers[i] && (
                                  <p className="text-gray-700 bangla-text">
                                    <span className="font-semibold">উত্তর:</span> <StaticMathField>{q.answers[i]}</StaticMathField>
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-gray-500 mt-4 bangla-text">
                            ক্লাস: {q.classNumber || "N/A"} | বিষয়: {q.subject || "N/A"} | অধ্যায়: {q.chapterName || "N/A"} | প্রশ্নের ধরণ: {q.cqType || "N/A"}
                          </p>
                        </div>
                      )}

                      {/* SQ Display */}
                      {q.type === "sq" && (
                        <div>
                          <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text">
                            {q.type ? `${q.type}: ` : ""} <StaticMathField>{q.question || "কোনো প্রশ্ন দেওয়া হয়নি"}</StaticMathField>
                          </p>
                          {q.imageId && (
                            <div className={`mb-4 ${q.imageAlignment === "left" ? "text-left" : q.imageAlignment === "right" ? "text-right" : "text-center"}`}>
                              <img
                                src={`/api/image/${q.imageId}?type=sq`}
                                alt="SQ related visual"
                                className="rounded shadow-md max-h-48 inline-block"
                                onError={(e) => (e.target.style.display = "none")}
                              />
                            </div>
                          )}
                          {q.videoLink && (
                            <div className="mb-4">
                              <a
                                href={q.videoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="video-link bangla-text"
                              >
                                📹 ভিডিও দেখুন
                              </a>
                            </div>
                          )}
                          {q.answer && (
                            <p className="text-gray-700 mb-4 bangla-text">
                              <span className="font-semibold">উত্তর:</span> <StaticMathField>{q.answer}</StaticMathField>
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-4 bangla-text">
                            ক্লাস: {q.classLevel || "N/A"} | বিষয়: {q.subjectName || "N/A"} | অধ্যায়: {q.chapterName || "N/A"}
                          </p>
                        </div>
                      )}

                      {/* Comment Section */}
                      <div className="mt-6">
                        <button
                          onClick={() => toggleComments(q._id)}
                          className="text-blue-600 hover:underline bangla-text flex items-center gap-2"
                        >
                          <MessageCircle className="w-5 h-5" />
                          {showComments[q._id] ? "মন্তব্য লুকান" : "মন্তব্য দেখুন"}
                          <ChevronDown
                            className={`w-5 h-5 transform transition-transform ${showComments[q._id] ? "rotate-180" : ""}`}
                          />
                        </button>
                        <div className={`comment-section ${showComments[q._id] ? "expanded" : "collapsed"}`}>
                          {showComments[q._id] && (
                            <>
                              <div className="mt-4 flex items-start gap-3">
                                <div className="avatar bangla-text">
                                  {(session?.user?.name || session?.user?.email || "S")[0].toUpperCase()}
                                </div>
                                <div className="flex-1 relative">
                                  <textarea
                                    value={newComment[q._id] || ""}
                                    onChange={(e) =>
                                      setNewComment((prev) => ({
                                        ...prev,
                                        [q._id]: e.target.value,
                                      }))
                                    }
                                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                                    placeholder="আপনার মন্তব্য লিখুন..."
                                    rows="2"
                                  />
                                  <button
                                    onClick={() => handleCommentSubmit(q._id)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                  >
                                    <Send className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                              <div className="mt-6">
                                {(comments[q._id] || []).filter((c) => !c.parentCommentId).length > 0 ? (
                                  (comments[q._id] || [])
                                    .filter((c) => !c.parentCommentId)
                                    .map((comment) => (
                                      <div key={comment._id} className="comment-container">
                                        <div className="flex items-start gap-3">
                                          <div className="avatar bangla-text">
                                            {(comment.commenter || "S")[0].toUpperCase()}
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <p className="text-sm font-semibold text-gray-800 bangla-text">
                                                {comment.commenter}
                                              </p>
                                              <p className="text-xs text-gray-500 bangla-text">
                                                {new Date(comment.createdAt).toLocaleString("bn-BD")}
                                              </p>
                                            </div>
                                            <p className="text-gray-700 bangla-text mt-1">{comment.comment}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                              <button
                                                onClick={() => handleCommentLike(comment._id)}
                                                className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition"
                                              >
                                                <Heart
                                                  className="w-4 h-4"
                                                  fill={commentLikes[comment._id]?.liked ? "currentColor" : "none"}
                                                  stroke="currentColor"
                                                />
                                                <span className="text-sm bangla-text">
                                                  {commentLikes[comment._id]?.count || 0} লাইক
                                                </span>
                                              </button>
                                              <button
                                                className="text-blue-600 hover:underline text-sm bangla-text"
                                                onClick={() =>
                                                  setNewReply((prev) => ({
                                                    ...prev,
                                                    [comment._id]: prev[comment._id] ? "" : " ",
                                                  }))
                                                }
                                              >
                                                উত্তর দিন
                                              </button>
                                            </div>
                                            {newReply[comment._id] && (
                                              <div className="mt-3 flex items-start gap-3">
                                                <div className="avatar bangla-text">
                                                  {(session?.user?.name || session?.user?.email || "S")[0].toUpperCase()}
                                                </div>
                                                <div className="flex-1 relative">
                                                  <textarea
                                                    value={newReply[comment._id] || ""}
                                                    onChange={(e) =>
                                                      setNewReply((prev) => ({
                                                        ...prev,
                                                        [comment._id]: e.target.value,
                                                      }))
                                                    }
                                                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                                                    placeholder="আপনার উত্তর লিখুন..."
                                                    rows="2"
                                                  />
                                                  <button
                                                    onClick={() => handleReplySubmit(q._id, comment._id)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                                  >
                                                    <Send className="w-5 h-5" />
                                                  </button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        {(comments[q._id] || [])
                                          .filter((c) => c.parentCommentId === comment._id)
                                          .map((reply) => (
                                            <div key={reply._id} className="ml-12 mt-3 reply-container">
                                              <div className="flex items-start gap-3">
                                                <div className="avatar bangla-text">
                                                  {(reply.commenter || "S")[0].toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-gray-800 bangla-text">
                                                      {reply.commenter}
                                                    </p>
                                                    <p className="text-xs text-gray-500 bangla-text">
                                                      {new Date(reply.createdAt).toLocaleString("bn-BD")}
                                                    </p>
                                                  </div>
                                                  <p className="text-gray-700 bangla-text mt-1">{reply.comment}</p>
                                                  <div className="flex items-center gap-2 mt-2">
                                                    <button
                                                      onClick={() => handleCommentLike(reply._id)}
                                                      className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition"
                                                    >
                                                      <Heart
                                                        className="w-4 h-4"
                                                        fill={commentLikes[reply._id]?.liked ? "currentColor" : "none"}
                                                        stroke="currentColor"
                                                      />
                                                      <span className="text-sm bangla-text">
                                                        {commentLikes[reply._id]?.count || 0} লাইক
                                                      </span>
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                      </div>
                                    ))
                                ) : (
                                  <p className="text-gray-500 italic bangla-text mt-4">কোনো মন্তব্য নেই। প্রথম মন্তব্য করুন!</p>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 text-lg p-10 bg-white rounded-lg shadow-md bangla-text">
                    কোনো প্রশ্ন পাওয়া যায়নি। অন্য ফিল্টার বা সার্চ ব্যবহার করুন।
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}