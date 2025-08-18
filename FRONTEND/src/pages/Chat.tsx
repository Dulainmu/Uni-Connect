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
  Bell
} from "lucide-react";
import Logo from "@/components/Logo";
import axios from "axios";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
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
  isGroupChat?: boolean;
  participants?: any[];
}

const API_BASE = "http://localhost:3000/api/chat";

const Chat = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { toast } = useToast();

  // Fetch conversations on mount
  useEffect(() => {
    const fetchChats = async () => {
      setLoadingChats(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(res.data.conversations);
        if (res.data.conversations.length > 0) {
          setSelectedChat(res.data.conversations[0].id);
        }
      } catch (err) {
        // handle error
      } finally {
        setLoadingChats(false);
      }
    };
    fetchChats();
  }, []);

  // Fetch messages when selectedChat changes
  useEffect(() => {
    if (!selectedChat) return;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/conversations/${selectedChat}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data.messages);
      } catch (err) {
        // handle error
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedChat]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket: receive new messages
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (msg: any) => {
      if (msg && msg.senderId && msg.content) {
        setMessages((prev) => [...prev, {
          ...msg,
          isOwnMessage: msg.senderId === user?._id,
        }]);
      }
    };
    socket.on("new_message", handleNewMessage);
    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, user]);

  // Socket: receive own message confirmation
  useEffect(() => {
    if (!socket) return;
    const handleMessageSent = (msg: any) => {
      setMessages((prev) => [...prev, {
        ...msg,
        isOwnMessage: true,
      }]);
    };
    socket.on("message_sent", handleMessageSent);
    return () => {
      socket.off("message_sent", handleMessageSent);
    };
  }, [socket]);

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selectedChat) return;
    // Find the other participant
    const chat = chats.find((c) => c.id === selectedChat);
    let receiverId = chat?.participants?.find((p: any) => p.id !== user?._id)?.id;
    if (!receiverId) return;
    socket.emit("send_message", {
      receiverId,
      content: newMessage,
      messageType: "text",
    });
    setNewMessage("");
  };

  // Search users for new chat
  const handleUserSearch = async (query: string) => {
    setUserSearch(query);
    if (!query.trim()) {
      setUserResults([]);
      return;
    }
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/users?search=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserResults(res.data.users);
    } catch (err) {
      setUserResults([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Start a new conversation
  const handleStartChat = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/conversations`,
        { participantId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh chats and select the new one
      const convId = res.data.conversation.id;
      await refreshChats(convId);
      setShowUserModal(false);
      setUserSearch("");
      setUserResults([]);
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to start chat", variant: "destructive" });
    }
  };

  // Helper to refresh chats and optionally select a conversation
  const refreshChats = async (selectId?: string) => {
    setLoadingChats(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(res.data.conversations);
      if (selectId) setSelectedChat(selectId);
    } catch {}
    setLoadingChats(false);
  };

  const selectedChatData = chats.find((chat) => chat.id === selectedChat);

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
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
              <Logo size={32} />
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
          <div className="p-4 border-b border-border flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                className="pl-10 bg-background"
                // Optionally implement conversation search here
              />
            </div>
            <Button size="icon" variant="brand" title="New Chat" onClick={() => setShowUserModal(true)}>
              +
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2">
              {loadingChats ? (
                <div className="text-center text-muted-foreground">Loading...</div>
              ) : (
                chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`w-full p-3 rounded-lg text-left hover:bg-secondary/50 transition-colors ${
                      selectedChat === chat.id ? "bg-secondary" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                                                 <Avatar>
                           <AvatarFallback className="bg-primary/10 text-primary">
                             {chat.name?.split(" ").map((n) => n[0]).join("") || "U"}
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
                          <h3 className="font-medium text-sm truncate">{chat.name || "Unknown User"}</h3>
                          <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{chat.role}</p>
                        <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
        {/* User Search Modal */}
        <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Start a New Chat</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Search users by name or email..."
              value={userSearch}
              onChange={e => handleUserSearch(e.target.value)}
              className="mb-2"
            />
            {loadingUsers ? (
              <div className="text-center text-muted-foreground">Searching...</div>
            ) : userResults.length === 0 && userSearch ? (
              <div className="text-center text-muted-foreground">No users found.</div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                                 {userResults.map(u => {
                   const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
                   const initials = fullName ? fullName.split(" ").map((n: string) => n[0]).join("") : "U";
                   return (
                     <div key={u._id} className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleStartChat(u._id)}>
                       <Avatar className="w-8 h-8">
                         <AvatarFallback className="bg-primary/10 text-primary text-xs">
                           {initials}
                         </AvatarFallback>
                       </Avatar>
                       <div className="flex-1 min-w-0">
                         <div className="font-medium text-sm truncate">{fullName || "Unknown User"}</div>
                         <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                         <div className="text-xs text-muted-foreground">{u.role}</div>
                       </div>
                     </div>
                   );
                 })}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChatData && (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                                         <AvatarFallback className="bg-primary/10 text-primary">
                       {selectedChatData.name?.split(" ").map((n) => n[0]).join("") || "U"}
                     </AvatarFallback>
                  </Avatar>
                  <div>
                                         <h2 className="font-medium">{selectedChatData.name || "Unknown User"}</h2>
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
                  {loadingMessages ? (
                    <div className="text-center text-muted-foreground">Loading...</div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        {!message.isOwnMessage && (
                          <Avatar className="w-8 h-8">
                                                         <AvatarFallback className="bg-primary/10 text-primary text-xs">
                               {message.senderName?.split(" ").map((n) => n[0]).join("") || "U"}
                             </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-[70%] ${message.isOwnMessage ? "order-first" : ""}`}>
                          <div
                            className={`p-3 rounded-lg ${
                              message.isOwnMessage
                                ? "bg-primary text-primary-foreground ml-auto"
                                : "bg-secondary"
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
                              {user?.firstName?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))
                  )}
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
                  <Button type="submit" variant="brand" disabled={!isConnected}>
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