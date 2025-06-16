"use client";
import { useState, useEffect, useRef } from "react";
import {
  Container,
  Header,
  SpaceBetween,
  Textarea,
  Button,
  Box,
  Spinner,
  Table,
} from "@cloudscape-design/components";
import ChatBubble from "@cloudscape-design/chat-components/chat-bubble";
import Avatar from "@cloudscape-design/chat-components/avatar";

interface Message {
  content: any;
  isUser: boolean;
  timestamp: Date;
  isJson?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Send request to API
      const response = await fetch(`${API}/natural-query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
        },
        body: JSON.stringify({ question: inputValue }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI response to chat
      const aiMessage: Message = {
        content: data.results || data,
        isUser: false,
        timestamp: new Date(),
        isJson: true
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message to chat
      const errorMessage: Message = {
        content: "Sorry, there was an error processing your request.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderJsonAsTable = (content: any) => {
    if (!content || typeof content !== 'object') {
      return String(content);
    }

    // If it's an array of objects
    if (Array.isArray(content) && content.length > 0 && typeof content[0] === 'object') {
      const columnDefinitions = Object.keys(content[0]).map(key => ({
        id: key,
        header: key,
        cell: (item: any) => item[key] !== null ? String(item[key]) : 'N/A'
      }));

      return (
        <Table
          columnDefinitions={columnDefinitions}
          items={content}
          variant="embedded"
          wrapLines
          stripedRows
        />
      );
    }
    
    // If it's a single object
    const items = Object.entries(content).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value)
    }));

    return (
      <Table
        columnDefinitions={[
          { id: "key", header: "Property", cell: item => item.key },
          { id: "value", header: "Value", cell: item => item.value }
        ]}
        items={items}
        variant="embedded"
        wrapLines
        stripedRows
      />
    );
  };

  return (
    <Container>
      <Header variant="h1">Chat Assistant</Header>
      <SpaceBetween size="l">
        <div style={{ height: "500px", overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.length === 0 ? (
            <Box textAlign="center" color="text-body-secondary" padding="l">
              Start a conversation by typing a message below.
            </Box>
          ) : (
            <>
              {messages.map((message, index) => (
                <ChatBubble
                  key={index}
                  type={message.isUser ? "outgoing" : "incoming"}
                  ariaLabel={`${message.isUser ? "You" : "AwSistant"} at ${formatTime(message.timestamp)}`}
                  avatar={
                    <Avatar
                      ariaLabel={message.isUser ? "You" : "AwSistant"}
                      tooltipText={message.isUser ? "You" : "AwSistant"}
                      initials={message.isUser ? "YO" : "AW"}
                    />
                  }
                >
                  {message.isJson && !message.isUser
                    ? renderJsonAsTable(message.content)
                    : String(message.content)}
                </ChatBubble>
              ))}
              {isLoading && (
                <ChatBubble
                  key="isTyping"
                  type="incoming"
                  ariaLabel="AwSistant typing"
                  showLoadingBar
                  avatar={
                    <Avatar
                      ariaLabel="AwSistant"
                      tooltipText="AwSistant"
                      initials="AW"
                    />
                  }
                >
                  AwSistant is Typing...
                </ChatBubble>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ flex: 1 }}>
            <Textarea
              value={inputValue}
              onChange={({ detail }) => setInputValue(detail.value)}
              placeholder="Type your message here..."
              rows={3}
              onKeyDown={(e: any) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          <Button
            variant="primary"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
          >
            Send
          </Button>
        </div>
      </SpaceBetween>
    </Container>
  );
}