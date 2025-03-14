"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Send, X, MessageCircle } from "lucide-react";

function Chat() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedRecipientEmail, setSelectedRecipientEmail] = useState(null);

  // useEffect(() => {
  //   console.log("Session data:", session);
  // }, [session]);

  useEffect(() => {
    if (!isChatOpen || status !== "authenticated") return;

    const fetchMessages = async () => {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        // console.log("Fetched messages (raw):", data);
        const normalizedMessages =
          Array.isArray(data) && session?.user?.userType === "Admin"
            ? data.reduce((acc, msg) => {
                const otherEmail =
                  msg.senderEmail === "admin123@gmail.com" ? msg.recipientEmail : msg.senderEmail;
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
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [isChatOpen, status]);

  const sendMessage = async () => {
    if (!input.trim() || !session) {
      console.log("Input is empty or session is not available:", { input, session });
      return;
    }

    const userType = session?.user?.userType;
    let payload = { text: input };

    // console.log("sendMessage - userType:", userType);
    // console.log("sendMessage - selectedRecipientEmail:", selectedRecipientEmail);

    if (userType === "Admin") {
      if (!selectedRecipientEmail) {
        console.error("No recipient selected. Please select a conversation.");
        return;
      }

      if (selectedRecipientEmail === "admin123@gmail.com") {
        console.error("Cannot reply to self");
        return;
      }

      payload = { text: input, recipientEmail: selectedRecipientEmail };
      // console.log("Admin reply payload (before sending):", payload);
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
        const normalizedMessages =
          Array.isArray(updatedData) && userType === "Admin"
            ? data.reduce((acc, msg) => {
                const otherEmail =
                  msg.senderEmail === "admin123@gmail.com" ? msg.recipientEmail : msg.senderEmail;
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
      <div
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="bg-blue-500 text-white rounded-full p-4 shadow-lg cursor-pointer hover:bg-blue-600 transition"
      >
        <MessageCircle className="h-12 w-12" />
      </div>

      {isChatOpen && (
        <div className="fixed bottom-20 right-4 md:right-10 w-72 sm:w-80 md:w-96 bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col max-h-[70vh]">
          <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h2 className="text-lg font-medium">Chat ({userType})</h2>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {userType === "Admin" ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-2 h-64 sm:h-72 md:h-80">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700">Conversations</h3>
                {Object.keys(messages).length > 0 ? (
                  Object.keys(messages).map((senderEmail, index) => {
                    const firstMessage = messages[senderEmail][0] || {};
                    console.log(`Conversation ${index}: ${senderEmail}, Sender: ${firstMessage.sender}`);
                    return (
                      <button
                        key={senderEmail}
                        onClick={() => {
                          // console.log(`Selecting conversation with: ${senderEmail}`);
                          setSelectedConversation(senderEmail);
                          setSelectedRecipientEmail(senderEmail);
                          // console.log(`Selected recipient email set to: ${senderEmail}`);
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

              {selectedConversation && Array.isArray(messages[selectedConversation]) ? (
                messages[selectedConversation].length > 0 ? (
                  <div className="space-y-4 overflow-y-auto max-h-[calc(70vh-200px)]">
                    {[...messages[selectedConversation]]
                      .reverse() // Reverse the array to show latest messages at the bottom
                      .map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${
                            message.sender === "Admin" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`p-3 rounded-lg shadow-md max-w-xs ${
                              message.sender === "Admin"
                                ? "bg-blue-100 text-blue-800"
                                : message.sender === "Bot"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            <p className="text-xs font-medium mb-1">
                              {message.sender || "Unknown"} ({message.senderEmail || "Unknown"})
                            </p>
                            <p className="text-sm break-words">{message.text}</p>
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(70vh-150px)]">
              {Array.isArray(messages) && messages.length > 0 ? (
                [...messages]
                  .reverse()
                  .map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.sender === userType ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-lg shadow-md max-w-xs ${
                          message.sender === userType
                            ? "bg-blue-100 text-blue-800"
                            : message.sender === "Bot"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        <p className="text-xs font-medium mb-1">
                          {message.sender || "Unknown"} ({message.senderEmail || "Unknown"})
                        </p>
                        <p className="text-sm break-words">{message.text}</p>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500">No messages yet. Send a message to start a conversation!</p>
              )}
            </div>
          )}

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