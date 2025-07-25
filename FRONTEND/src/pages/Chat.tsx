import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip,
  ArrowLeft,
  GraduationCap,
  Bell
} from "lucide-react";

interface Message {
  id: number;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isOwnMessage: boolean;
}

interface Chat {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
}

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState<string>("dr-amelia-turner");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      senderId: "dr-amelia-turner",
      senderName: "Dr. Amelia Turner",
      content: "Hi Dr. Turner, I'm a bit confused about the recent material regarding segmentation vs clustering in machine learning. Could you explain this a bit more please?",
      timestamp: new Date("2024-01-20T10:30:00"),
      isOwnMessage: true
    },
    {
      id: 2,
      senderId: "dr-amelia-turner",
      senderName: "Dr. Amelia Turner",
      content: "Hi There, Dr. Turner. I'd be delighted to assist you in the simplest explanation. In machine learning, two fundamental techniques that are often confused are segmentation and clustering. Both aim to group data, but they serve different purposes.",
      timestamp: new Date("2024-01-20T10:35:00"),
      isOwnMessage: false
    },
    {
      id: 3,
      senderId: "dr-amelia-turner",
      senderName: "Dr. Amelia Turner",
      content: "Clustering groups data based on similarities without predefined categories. Popular techniques include K-means and hierarchical clustering. The algorithm discovers natural groupings in the data.",
      timestamp: new Date("2024-01-20T10:36:00"),
      isOwnMessage: false
    },
    {
      id: 4,
      senderId: "dr-amelia-turner",
      senderName: "Dr. Amelia Turner",
      content: "Segmentation, on the other hand, divides data into predefined categories based on specific criteria. It's more structured and rule-based approach compared to clustering.",
      timestamp: new Date("2024-01-20T10:38:00"),
      isOwnMessage: false
    },
    {
      id: 5,
      senderId: "student",
      senderName: "You",
      content: "Thank you so much Dr. Turner. That's a very helpful explanation!",
      timestamp: new Date("2024-01-20T10:42:00"),
      isOwnMessage: true
    },
    {
      id: 6,
      senderId: "dr-amelia-turner",
      senderName: "Dr. Amelia Turner",
      content: "You're welcome, Chloe. Don't hesitate to ask if you have any further questions.",
      timestamp: new Date("2024-01-20T10:43:00"),
      isOwnMessage: false
    }
  ]);

  const chats: Chat[] = [
    {
      id: "dr-amelia-turner",
      name: "Dr. Amelia Turner",
      role: "Machine Learning Lecturer",
      lastMessage: "You're welcome, Chloe. Don't hesitate to ask if you have any further questions.",
      timestamp: "10:43 AM",
      unreadCount: 0,
      avatar: ""
    },
    {
      id: "prof-michael-chen",
      name: "Prof. Michael Chen",
      role: "Database Systems",
      lastMessage: "Your project proposal looks good. Let's discuss the implementation details.",
      timestamp: "Yesterday",
      unreadCount: 2,
      avatar: ""
    },
    {
      id: "dr-sarah-wilson",
      name: "Dr. Sarah Wilson",
      role: "Software Engineering",
      lastMessage: "Don't forget about tomorrow's code review session.",
      timestamp: "Yesterday",
      unreadCount: 1,
      avatar: ""
    },
    {
      id: "cs-study-group",
      name: "CS Study Group",
      role: "Group Chat",
      lastMessage: "Anyone free for study session this evening?",
      timestamp: "2 days ago",
      unreadCount: 5,
      avatar: ""
    }
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: messages.length + 1,
      senderId: "student",
      senderName: "You",
      content: newMessage,
      timestamp: new Date(),
      isOwnMessage: true
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // Simulate lecturer response after a delay
    setTimeout(() => {
      const response: Message = {
        id: messages.length + 2,
        senderId: selectedChat,
        senderName: chats.find(chat => chat.id === selectedChat)?.name || "Lecturer",
        content: "Thank you for your message. I'll get back to you shortly with a detailed response.",
        timestamp: new Date(),
        isOwnMessage: false
      };
      setMessages(prev => [...prev, response]);
    }, 1500);
  };

  const selectedChatData = chats.find(chat => chat.id === selectedChat);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="md:hidden">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">UniConnect</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 ml-8">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
              <Link to="/chat" className="text-primary font-medium">Chat</Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">Support</Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">Analytics</Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">Settings</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">C</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Chat List */}
        <div className="w-80 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                className="pl-10 bg-background"
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`w-full p-3 rounded-lg text-left hover:bg-secondary/50 transition-colors ${
                    selectedChat === chat.id ? 'bg-secondary' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {chat.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {chat.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-xs text-primary-foreground font-medium">
                            {chat.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm truncate">{chat.name}</h3>
                        <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{chat.role}</p>
                      <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChatData && (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedChatData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-medium">{selectedChatData.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedChatData.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      {!message.isOwnMessage && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {message.senderName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[70%] ${message.isOwnMessage ? 'order-first' : ''}`}>
                        <div
                          className={`p-3 rounded-lg ${
                            message.isOwnMessage
                              ? 'bg-primary text-primary-foreground ml-auto'
                              : 'bg-secondary'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 px-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                      {message.isOwnMessage && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            C
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-card">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Button type="button" variant="ghost" size="icon">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button type="submit" variant="brand">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;