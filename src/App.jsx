import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Cpu } from 'lucide-react';
import { processQueryStream } from './api/ragService';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I am **BlockMind AI**, your Blockchain Domain Expert.\n\nAsk me anything regarding my internal blockchain knowledge base.",
      sender: "bot"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: "user" }]);
    setInput('');
    setIsLoading(true);

    // Create empty bot message container
    setMessages(prev => [...prev, { text: "", sender: "bot" }]);

    try {
      const stream = processQueryStream(userMessage);
      let fullResponse = "";

      for await (const chunk of stream) {
        setIsLoading(false); // Stop loading dots on first token receipt
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = { ...newMessages[lastIndex], text: fullResponse };
          return newMessages;
        });
      }
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        newMessages[lastIndex] = { ...newMessages[lastIndex], text: "Failed to connect to AI server. Check console." };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const parseMessage = (text) => {
    // Simple parser to make bold text strong
    let parsedText = text;

    // Split text by lines
    return parsedText.split('\\n').map((line, i) => {
      // Split line by ** to handle inline bolding
      const blocks = line.split('**');

      const elements = blocks.map((block, index) => {
        if (index % 2 === 1) { // It's between **
          return <strong key={index}>{block}</strong>;
        }
        return <span key={index}>{block}</span>;
      });

      // Special styling if it matches our 4-point structure
      if (line.startsWith('Definition:') || line.startsWith('Technical Explanation:') ||
        line.startsWith('Example:') || line.startsWith('Security / Limitations:') || line.startsWith('Security / Limitation:')) {
        return (
          <div key={i} className="response-title">
            <Sparkles size={12} style={{ display: 'inline', marginRight: '6px' }} />
            {line}
          </div>
        );
      }

      return (
        <span key={i} style={{ display: 'block', minHeight: '8px' }}>
          {elements}
        </span>
      );
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="chat-container">
        <header className="chat-header">
          <div className="header-icon">
            <Cpu size={24} />
          </div>
          <div className="header-content">
            <h1>BlockMind AI</h1>
            <p><span className="status-dot"></span> Secure Enterprise RAG</p>
          </div>
        </header>

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.sender === 'user' ? 'user' : 'bot'}`}>

              {msg.sender === 'bot' && (
                <div className="bot-avatar">
                  <Bot size={20} />
                </div>
              )}

              <div className={`message-bubble ${msg.sender}`}>
                {parseMessage(msg.text)}
              </div>

            </div>
          ))}

          {isLoading && (
            <div className="message-wrapper bot">
              <div className="bot-avatar">
                <Bot size={20} />
              </div>
              <div className="message-bubble bot loading">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        <div className="chat-input-container">
          <form className="chat-input-wrapper" onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a blockchain question..."
              rows={1}
              autoFocus
            />
            <button
              type="submit"
              className="send-button"
              disabled={isLoading || !input.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
