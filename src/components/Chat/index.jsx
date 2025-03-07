"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Send, X, MessageCircle } from "lucide-react";

function Chat() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState([]); // Initialize as array to handle both cases
  const [input, setInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null); // For admin to select a conversation
  const [selectedRecipientEmail, setSelectedRecipientEmail] = useState(null); // Safeguard for recipient email

  // Debug session data
  useEffect(() => {
    console.log("Session data:", session);
  }, [session]);

  // Fetch messages every 5 seconds
  useEffect(() => {
    if (!isChatOpen || status !== "authenticated") return;

    const fetchMessages = async () => {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched messages (raw):", data);
        // Normalize data for Admin: convert array to grouped object if needed
        const normalizedMessages = Array.isArray(data) && session?.user?.userType === "Admin"
          ? data.reduce((acc, msg) => {
              const otherEmail = msg.senderEmail === "admin123@gmail.com" ? msg.recipientEmail : msg.senderEmail;
              if (otherEmail && otherEmail !== "admin123@gmail.com") {
                if (!acc[otherEmail]) acc[otherEmail] = [];
                acc[otherEmail].push(msg);
              }
              return acc;
            }, {})
          : data;
        setMessages(normalizedMessages);
      } else {
        console.error("Failed to fetch messages:", res.statusText);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [isChatOpen, status]);

  const sendMessage = async () => {
    if (!input.trim() || !session) {
      console.log("Input is empty or session is not available:", { input, session });
      return;
    }

    const userType = session?.user?.userType;
    let payload = { text: input };

    console.log("sendMessage - userType:", userType);
    console.log("sendMessage - selectedRecipientEmail:", selectedRecipientEmail);

    if (userType === "Admin") {
      if (!selectedRecipientEmail) {
        console.error("No recipient selected. Please select a conversation.");
        return;
      }

      if (selectedRecipientEmail === "admin123@gmail.com") {
        console.error("Cannot reply to self");
        return;
      }

      // Use the safeguarded recipient email
      payload = { ...payload, senderEmail: selectedRecipientEmail };
      console.log("Admin reply payload:", payload); // Debug log
    }

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setInput("");
      const updatedRes = await fetch("/api/chat");
      if (updatedRes.ok) {
        const updatedData = await updatedRes.json();
        console.log("Updated messages after send:", updatedData);
        const normalizedMessages = Array.isArray(updatedData) && userType === "Admin"
          ? updatedData.reduce((acc, msg) => {
              const otherEmail = msg.senderEmail === "admin123@gmail.com" ? msg.recipientEmail : msg.senderEmail;
              if (otherEmail && otherEmail !== "admin123@gmail.com") {
                if (!acc[otherEmail]) acc[otherEmail] = [];
                acc[otherEmail].push(msg);
              }
              return acc;
            }, {})
          : updatedData;
        setMessages(normalizedMessages);
      }
    } else {
      console.error("Failed to send message:", await res.json());
    }
  };

  if (status === "loading") return null;

  const userType = session?.user?.userType || "Guest";

  return (
    <div className="fixed bottom-6 right-6 md:right-10 md:bottom-10">
      {/* Chat Bubble */}
      <div
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="bg-blue-500 text-white rounded-full p-4 shadow-lg cursor-pointer hover:bg-blue-600 transition"
      >
        <MessageCircle className="h-8 w-8" />
      </div>

      {/* Chat Box */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-4 md:right-10 w-72 sm:w-80 md:w-96 bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col">
          <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h2 className="text-lg font-medium">Chat ({userType})</h2>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Admin View: Show Conversations */}
          {userType === "Admin" ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-2 h-64 sm:h-72 md:h-80">
              {/* Conversation List */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700">Conversations</h3>
                {Object.keys(messages).length > 0 ? (
                  Object.keys(messages).map((senderEmail, index) => {
                    const firstMessage = messages[senderEmail][0] || {};
                    console.log(`Conversation ${index}: ${senderEmail}, Sender: ${firstMessage.sender}`); // Debug log
                    return (
                      <button
                        key={senderEmail}
                        onClick={() => {
                          console.log(`Selecting conversation: ${senderEmail}`); // Debug log
                          setSelectedConversation(senderEmail);
                          setSelectedRecipientEmail(senderEmail); // Set the safeguarded recipient email
                          console.log(`After setting - selectedRecipientEmail: ${senderEmail}`); // Debug log
                        }}
                        className={`block w-full text-left p-2 rounded-lg ${
                          selectedConversation === senderEmail ? "bg-blue-100" : "bg-gray-100"
                        } hover:bg-blue-50`}
                      >
                        Conversation with {firstMessage.sender || "Unknown"} ({senderEmail})
                      </button>
                    );
                  })
                ) : (
                  <p className="text-gray-500">No conversations yet.</p>
                )}
              </div>

              {/* Selected Conversation Messages */}
              {selectedConversation && Array.isArray(messages[selectedConversation]) ? (
                messages[selectedConversation].length > 0 ? (
                  <div className="space-y-2">
                    {messages[selectedConversation].map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.sender === "Admin" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg shadow-sm max-w-xs ${
                            message.sender === "Admin"
                              ? "bg-blue-100"
                              : message.sender === "Bot"
                              ? "bg-green-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            {message.sender || "Unknown"} ({message.senderEmail || "Unknown"})
                          </p>
                          <p className="text-gray-800">{message.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No messages in this conversation.</p>
                )
              ) : null}
            </div>
          ) : (
            /* Student/Teacher View: Show Their Own Conversation */
            <div className="flex-1 overflow-y-auto p-4 space-y-2 h-64 sm:h-72 md:h-80">
              {Array.isArray(messages) && messages.length > 0 ? (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.sender === userType ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg shadow-sm max-w-xs ${
                        message.sender === userType
                          ? "bg-blue-100"
                          : message.sender === "Bot"
                          ? "bg-green-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {message.sender || "Unknown"} ({message.senderEmail || "Unknown"})
                      </p>
                      <p className="text-gray-800">{message.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No messages yet. Send a message to start a conversation!</p>
              )}
            </div>
          )}

          {/* Input Field */}
          <div className="p-4 bg-gray-50 border-t border-gray-300 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder={
                status === "authenticated"
                  ? userType === "Admin" && !selectedConversation
                    ? "Select a conversation to reply"
                    : "Type your message..."
                  : "Please sign in"
              }
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={status !== "authenticated" || (userType === "Admin" && !selectedConversation)}
            />
            <button
              onClick={sendMessage}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none disabled:bg-gray-400"
              disabled={status !== "authenticated" || (userType === "Admin" && !selectedConversation)}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;