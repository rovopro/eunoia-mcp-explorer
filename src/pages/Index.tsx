import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChatMessage } from "@/components/ChatMessage";
import { DataSourceSelector } from "@/components/DataSourceSelector";
import { GoldenQuestionsDropdown } from "@/components/GoldenQuestionsDropdown";
import { FileUploadButton } from "@/components/FileUploadButton";
import { NavLink } from "@/components/NavLink";
import { OnboardingNotification } from "@/components/OnboardingNotification";
import eunoiaLogo from "@/assets/eunoia-logo-dark.webp";
import mcpLogo from "@/assets/mcp-logo.png";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  chartData?: {
    type: "bar" | "line" | "pie";
    data: any[];
    title?: string;
  };
}

const Index = () => {
  const initialMessage: Message = {
    role: "assistant",
    content:
      "Hello! I'm MCP (My Cute Pony) Data Researcher. I can help you discover insights across multiple data sources including MySQL EPOS Database, Power BI models, and Cosmos NoSQL. Ask me anything or select a quick question to get started!",
    timestamp: new Date(),
  };
  
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [dataSource, setDataSource] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [notification, setNotification] = useState<string | null>("Start by selecting a data source");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (notification && trainingComplete) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, trainingComplete]);

  useEffect(() => {
    if (dataSource && !trainingComplete) {
      setNotification("Type your question or select one from the list");
    }
  }, [dataSource, trainingComplete]);

  const handleEndChat = () => {
    setMessages([initialMessage]);
    setInput("");
    setDataSource("all");
    setAttachedFile(null);
    setTrainingComplete(false);
    setNotification("Chat ended. Starting a new conversation");
  };

  const handleSend = async () => {
    if (!input.trim() && !attachedFile) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Mark training as complete after first message
    if (!trainingComplete) {
      setTrainingComplete(true);
      setNotification(null);
    }

    // Simulate MCP processing
    setTimeout(() => {
      const response = generateMockResponse(input, dataSource, attachedFile);
      const assistantMessage: Message = {
        role: "assistant",
        content: response.content,
        chartData: response.chartData,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
      setAttachedFile(null);
    }, 1500);
  };

  const generateMockResponse = (query: string, source: string, file: File | null): { content: string; chartData?: any } => {
    const sourceText = source === "all" ? "all data sources" : source.toUpperCase();
    let response = `I've analyzed your query across ${sourceText}.\n\n`;

    if (file) {
      response += `📎 File "${file.name}" has been processed.\n\n`;
    }

    response += `Based on the MCP integration layer:\n\n`;
    response += `🔍 **Data Discovery**: Found relevant schemas across ${source === "all" ? 3 : 1} data source(s)\n`;
    response += `📊 **Query Execution**: Retrieved and structured data from connected systems\n`;
    response += `💡 **Insights**: `;

    let chartData;

    if (query.toLowerCase().includes("sales")) {
      response += "Total sales for Q4 2024: $2.4M (15% increase YoY)\nTop category: Electronics with $890K in revenue\n\nHere's a breakdown by category:";
      chartData = {
        type: "bar" as const,
        title: "Sales by Category (Q4 2024)",
        data: [
          { name: "Electronics", value: 890000 },
          { name: "Furniture", value: 650000 },
          { name: "Clothing", value: 480000 },
          { name: "Food", value: 380000 },
        ],
      };
    } else if (query.toLowerCase().includes("inventory")) {
      response += "45 products require reordering\nAverage inventory turnover: 6.2 times per quarter\n\nInventory levels by category:";
      chartData = {
        type: "pie" as const,
        title: "Inventory Distribution",
        data: [
          { name: "In Stock", value: 65 },
          { name: "Low Stock", value: 25 },
          { name: "Out of Stock", value: 10 },
        ],
      };
    } else if (query.toLowerCase().includes("customer")) {
      response += "Active customers: 1,247\nAverage purchase frequency: 3.8 times per month\nTop segment: Premium tier (42% of revenue)\n\nCustomer growth trend:";
      chartData = {
        type: "line" as const,
        title: "Customer Growth (6 Months)",
        data: [
          { name: "Jul", value: 980 },
          { name: "Aug", value: 1050 },
          { name: "Sep", value: 1120 },
          { name: "Oct", value: 1180 },
          { name: "Nov", value: 1230 },
          { name: "Dec", value: 1247 },
        ],
      };
    } else if (query.toLowerCase().includes("supplier")) {
      response += "Top 3 suppliers by reliability: TechCorp (98%), FastShip Ltd (96%), GlobalParts (94%)";
    } else {
      response += `Successfully processed your query. The data shows interesting patterns across ${sourceText}.`;
    }

    return { content: response, chartData };
  };

  const handleQuestionSelect = (question: string) => {
    setInput(question);
  };

  const handleFileSelect = (file: File) => {
    setAttachedFile(file);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Notification */}
      {notification && (
        <OnboardingNotification
          message={notification}
          onDismiss={() => setNotification(null)}
        />
      )}
      
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={eunoiaLogo} alt="Eunoia" className="h-8" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">MCP Data Researcher</h1>
              <p className="text-xs text-muted-foreground">My Cute Pony - Powered by Model Context Protocol</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEndChat}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">End Chat</span>
              </Button>
            )}
            <NavLink to="/faq">FAQ</NavLink>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-3xl">
        {/* Welcome Section (shows when no messages) */}
        {messages.length === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 mb-6 animate-fade-in">
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full"></div>
              <img src={mcpLogo} alt="MCP Logo" className="h-24 w-24 relative animate-pulse" />
            </div>
            
            <div className="space-y-1 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Welcome to MCP Data Researcher
              </h2>
              <p className="text-muted-foreground text-sm max-w-lg">
                Ask questions across multiple data sources. I'll discover, query, and present insights from MySQL,
                Power BI, Cosmos DB, and more.
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} {...message} />
            ))}
            {isLoading && (
              <div className="flex gap-3 p-4 rounded-xl bg-card mr-8 animate-in fade-in">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-secondary">
                  <Sparkles className="h-4 w-4 text-secondary-foreground animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Thinking and Gathering Data for the best possible Answer...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="mt-6 space-y-3">
          {/* Controls Row */}
          <div className="flex flex-wrap gap-2 items-center">
            <DataSourceSelector value={dataSource} onChange={setDataSource} />
            <GoldenQuestionsDropdown onSelect={handleQuestionSelect} />
            {attachedFile && (
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm">
                <span className="text-muted-foreground">📎 {attachedFile.name}</span>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="text-destructive hover:text-destructive/80"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Input Row */}
          <div className="flex gap-2 items-end bg-card rounded-xl p-2 shadow-lg border border-border">
            <FileUploadButton onFileSelect={handleFileSelect} />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your data..."
              className="flex-1 border-0 focus-visible:ring-0 bg-transparent"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !attachedFile)}
              className="rounded-full h-10 w-10 p-0 bg-gradient-primary hover:opacity-90 transition-smooth shadow-glow"
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            MCP connects to MySQL EPOS, Power BI, and Cosmos NoSQL databases
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
