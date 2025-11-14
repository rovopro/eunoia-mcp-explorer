import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, HelpCircle } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChartMessage } from "@/components/ChartMessage";
import { FileUploadButton } from "@/components/FileUploadButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HorseLoader } from "@/components/HorseLoader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface ChatInterfaceProps {
  chatId: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onUpdateMessages: (messages: Message[]) => void;
}

export function ChatInterface({ chatId, messages, onSendMessage, onUpdateMessages }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;

    let messageContent = input;
    if (attachedFile) {
      messageContent = `${input}\n[Attached file: ${attachedFile.name}]`;
    }

    const userMessage: Message = {
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    onUpdateMessages(newMessages);
    onSendMessage(messageContent);
    
    setInput("");
    setAttachedFile(null);
    setIsLoading(true);

    const startTime = Date.now();
    const minLoadingTime = 5000; // 5 seconds minimum

    // Simulate AI response - Replace this with actual Azure AI Foundry integration
    setTimeout(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      setTimeout(() => {
        const assistantMessage: Message = {
          role: "assistant",
          content: "This is a placeholder response. Azure AI Foundry integration will be added later.",
          timestamp: new Date(),
        };
        onUpdateMessages([...newMessages, assistantMessage]);
        setIsLoading(false);
      }, remainingTime);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFAQClick = (question: string, answerType: "sales" | "revenue" | "kpi") => {
    const userMessage: Message = {
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    onUpdateMessages(newMessages);
    setIsLoading(true);

    setTimeout(() => {
      let assistantMessage: Message;
      
      if (answerType === "sales") {
        assistantMessage = {
          role: "assistant",
          content: "Here's the sales trend analysis for the last 6 months. As you can see, there's been steady growth with a peak in May.",
          timestamp: new Date(),
          chartData: {
            type: "line",
            title: "Sales Trends - Last 6 Months",
            data: [
              { name: "Jan", value: 4200 },
              { name: "Feb", value: 3800 },
              { name: "Mar", value: 5200 },
              { name: "Apr", value: 4600 },
              { name: "May", value: 6100 },
              { name: "Jun", value: 5900 },
            ]
          }
        };
      } else if (answerType === "revenue") {
        assistantMessage = {
          role: "assistant",
          content: "Revenue breakdown by product category shows Product A leading with 35% market share, followed by Product B at 28%.",
          timestamp: new Date(),
          chartData: {
            type: "bar",
            title: "Revenue by Product Category",
            data: [
              { name: "Product A", value: 35000 },
              { name: "Product B", value: 28000 },
              { name: "Product C", value: 22000 },
              { name: "Product D", value: 15000 },
            ]
          }
        };
      } else {
        assistantMessage = {
          role: "assistant",
          content: `**Key Performance Indicators - Q4 2024**\n\n**Financial Metrics:**\n- Total revenue increased by 24% this quarter\n- Profit margin improved from 18% to 22%\n- Operating costs reduced by 12%\n\n**Customer Metrics:**\n- Customer satisfaction scores improved from 4.2 to 4.7\n- Net Promoter Score (NPS): 68\n- Customer retention rate: 94%\n\n**Operational Metrics:**\n- Processing time reduced by 35%\n- System uptime: 99.8%\n- Average response time: 1.2 seconds\n\n**Recommendations:**\n1. Continue current growth strategies\n2. Focus on customer retention programs\n3. Optimize operational efficiency further\n\nWould you like me to dive deeper into any specific metric?`,
          timestamp: new Date(),
        };
      }

      onUpdateMessages([...newMessages, assistantMessage]);
      setIsLoading(false);
    }, 5000);
  };

  return (
    <div className="flex flex-col h-[400px] border rounded-xl bg-card">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Chat</h2>
        <p className="text-sm text-muted-foreground">Ask questions about your data</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index}>
              <ChatMessage
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
              {message.chartData && (
                <ChartMessage
                  type={message.chartData.type}
                  data={message.chartData.data}
                  title={message.chartData.title}
                />
              )}
            </div>
          ))}
          {isLoading && <HorseLoader />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex gap-2 items-end">
          <div className="flex items-end gap-2 flex-1">
            <FileUploadButton onFileSelect={setAttachedFile} />
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question about your data..."
              className="min-h-[80px] resize-none flex-1"
            />
          </div>
          <div className="flex flex-col gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  disabled={isLoading}
                >
                  <HelpCircle className="h-4 w-4" />
                  FAQ
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-background border-border z-50">
                <DropdownMenuItem 
                  onClick={() => handleFAQClick("What are the sales trends over the last 6 months?", "sales")}
                  className="cursor-pointer"
                >
                  What are the sales trends?
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleFAQClick("Show me the revenue breakdown by product category", "revenue")}
                  className="cursor-pointer"
                >
                  Revenue breakdown by category
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleFAQClick("What are the key performance indicators for this quarter?", "kpi")}
                  className="cursor-pointer"
                >
                  Key performance indicators
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              onClick={handleSend} 
              disabled={(!input.trim() && !attachedFile) || isLoading}
              className="gap-2 bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
        {attachedFile && (
          <div className="text-sm text-muted-foreground mt-2">
            Attached: {attachedFile.name}
          </div>
        )}
      </div>
    </div>
  );
}
