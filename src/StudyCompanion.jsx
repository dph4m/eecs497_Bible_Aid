import { useState, useRef, useEffect } from "react";

const API_BASE = "http://localhost:5001/api";

function AssistantMessage({ content, isStreaming }) {
  return (
    <div className="message message-assistant">
      <div className="message-text">
        {content}
        {isStreaming && <span className="cursor-blink" />}
      </div>
    </div>
  );
}

function StudyCompanion({ passageText, reference }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (!passageText || !reference) return;
    setMessages([]);
    prevMessagesLengthRef.current = 0;
  }, [reference, passageText]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: newMessages,
          passage_text: passageText,
          reference: reference,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.response },
        ]);
      } else {
        const errorData = await res.json();
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: `Error: ${errorData.error || "Failed to get response"}. Make sure the server is running and OPENAI_API_KEY is set.`,
          },
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Connection failed. Make sure the Python server is running on port 5000.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const canInteract = !isLoading;

  return (
    <div className="study-companion">
      <div className="companion-header">
        <h3>Study Companion</h3>
        <span className="status-badge ready">AI Ready</span>
      </div>

      <div className="companion-messages">
        {messages.length === 0 && !isLoading && (
          <div className="welcome-message">
            <p>Ask me anything about this passage!</p>
            <p className="hint">
              Try questions like "What is the main theme?" or "How can I apply
              this?"
            </p>
          </div>
        )}

        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="message message-user">
              <div className="message-text">{msg.content}</div>
            </div>
          ) : (
            <AssistantMessage
              key={i}
              content={msg.content}
              isStreaming={false}
            />
          )
        )}

        {isLoading && (
          <div className="message message-assistant">
            <span className="thinking-indicator">
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              thinking
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="companion-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={canInteract ? "Ask a question..." : "Waiting..."}
          disabled={!canInteract}
        />
        <button type="submit" disabled={!canInteract || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default StudyCompanion;
