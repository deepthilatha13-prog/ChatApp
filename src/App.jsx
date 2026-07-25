import { useState, useEffect, useRef } from "react";
import { getAIResponse } from "./api/groq";
import "./App.css";

function App() {
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem("chat-history");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: Date.now(),
            title: "New Chat",
            messages: [],
          },
        ];
  });

  const [currentChat, setCurrentChat] = useState(
    chatHistory[0]?.id || Date.now()
  );

  const [input, setInput] = useState("");
  const [theme, setTheme] = useState(() => {
  return localStorage.getItem("theme") || "light";
  });
  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("chat-history", JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  }, [theme]);
  const activeChat =
    chatHistory.find((chat) => chat.id === currentChat) || chatHistory[0];

    
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [activeChat]);
  
  const toggleTheme = () => {
  setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };
  const newChat = () => {
    const chat = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
    };

    setChatHistory([chat, ...chatHistory]);
    setCurrentChat(chat.id);
  };

  const deleteChat = (id) => {
    const updated = chatHistory.filter((chat) => chat.id !== id);

    if (updated.length === 0) {
      const first = {
        id: Date.now(),
        title: "New Chat",
        messages: [],
      };

      setChatHistory([first]);
      setCurrentChat(first.id);
    } else {
      setChatHistory(updated);

      if (currentChat === id) {
        setCurrentChat(updated[0].id);
      }
    }
  };

  const updateMessages = (messages) => {
    setChatHistory((prev) =>
      prev.map((chat) =>
        chat.id === currentChat
          ? {
              ...chat,
              title:
                chat.title === "New Chat" && messages.length
                  ? messages[0].text.substring(0, 20)
                  : chat.title,
              messages,
            }
          : chat
      )
    );
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
    };

    const typing = {
      id: Date.now() + 1,
      text: "Typing...",
      sender: "bot",
    };

    updateMessages([
      ...activeChat.messages,
      userMessage,
      typing,
    ]);

    const question = input;
    setInput("");

    try {
      const reply = await getAIResponse(question);

      const updated = [
        ...activeChat.messages,
        userMessage,
        {
          id: Date.now() + 2,
          text: reply,
          sender: "bot",
        },
      ];

      updateMessages(updated);
    } catch {
      const updated = [
        ...activeChat.messages,
        userMessage,
        {
          id: Date.now() + 2,
          text: "AI is not responding.",
          sender: "bot",
        },
      ];

      updateMessages(updated);
    }
  };

    const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>🤖 AI Chat</h2>
        <button className="theme-btn" onClick={toggleTheme}>
        {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>

        <button className="new-chat-btn" onClick={newChat}>
          + New Chat
        </button>

        <div className="history-list">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className={`history-item ${
                currentChat === chat.id ? "active" : ""
              }`}
              onClick={() => setCurrentChat(chat.id)}
            >
              <span>{chat.title}</span>

              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-container">
        <div className="chat-header">
          💬 Chatting With AI
        </div>

        <div className="chat-window">
          {activeChat.messages.length === 0 && (
            <div
              style={{
                textAlign: "center",
                marginTop: "120px",
                color: "#777",
                fontSize: "20px",
              }}
            >
              👋 Welcome!
              <br />
              Ask me anything...
            </div>
          )}

          {activeChat.messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${
                msg.sender === "user"
                  ? "user-msg"
                  : "bot-msg"
              }`}
            >
              {msg.text}
            </div>
          ))}

          <div ref={chatEndRef}></div>
        </div>

        <div className="input-box">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />

          <button onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;