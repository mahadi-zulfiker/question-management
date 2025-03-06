"use client";
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000/");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasAutomatedResponse, setHasAutomatedResponse] = useState(false);

  useEffect(() => {
    // Listen for incoming messages
    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      const newMessage = { text: input, sender: "You" };
      socket.emit("message", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInput("");

      // Automated vendor response (only once per session)
      if (!hasAutomatedResponse) {
        setTimeout(() => {
          const automatedResponse = {
            text: "Hello! How can I assist you today?",
            sender: "Vendor",
          };
          setMessages((prevMessages) => [...prevMessages, automatedResponse]);
          setHasAutomatedResponse(true);
        }, 1000);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 md:right-10 md:bottom-10">
      {/* Chat Bubble */}
      <div
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="bg-blue-500 text-white rounded-full p-4 shadow-lg cursor-pointer hover:bg-blue-600 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 8h10M7 12h6m-6 4h10M21 12c0 5.523-4.477 10-10 10a9.956 9.956 0 01-6.362-2.288L3 21l1.288-1.638A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10z"
          />
        </svg>
      </div>

      {/* Chat Box */}
      {isChatOpen && (
        <div className="fixed bottom-16 right-4 md:right-10 w-72 sm:w-80 md:w-96 bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col">
          <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h2 className="text-lg font-medium">Chat</h2>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 h-64 sm:h-72 md:h-80">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === "You" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded-lg shadow-sm max-w-xs ${
                    message.sender === "You" ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-700 mb-1">{message.sender}</p>
                  <p className="text-gray-800">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-300 flex items-center space-x-2 px-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;