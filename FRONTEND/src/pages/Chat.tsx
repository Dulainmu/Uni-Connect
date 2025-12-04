import { useState, useRef, useEffect } from "react";
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
  MessageSquare,
  UserPlus
} from "lucide-react";
import axios from "axios";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    const fetchChats = async () => {
      setLoadingChats(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(res.data.conversations);
        if (res.data.conversations.length > 0 && !selectedChat) {
          setSelectedChat(res.data.conversations[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingChats(false);
      }
    };
    fetchChats();
  }, []);

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
        console.error(err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selectedChat) return;
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

  const handleStartChat = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/conversations`,
        { participantId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const convId = res.data.conversation.id;
      await refreshChats(convId);
      setShowUserModal(false);
      setUserSearch("");
      setUserResults([]);
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to start chat", variant: "destructive" });
    }
  };

  const refreshChats = async (selectId?: string) => {
    setLoadingChats(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(res.data.conversations);
      if (selectId) setSelectedChat(selectId);
    } catch { }
    setLoadingChats(false);
  };

  const selectedChatData = chats.find((chat) => chat.id === selectedChat);

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-6 overflow-hidden">
        {/* Sidebar - Chat List */}
        <div className={cn(
          "w-full md:w-80 glass-panel flex flex-col rounded-3xl overflow-hidden transition-all duration-300",
          selectedChat ? "hidden md:flex" : "flex"
        )}>
          <div className="p-4 border-b border-white/10 flex items-center justify-between gap-2 bg-white/5">
            <h2 className="font-bold text-lg">Messages</h2>
            <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/20 hover:text-primary" onClick={() => setShowUserModal(true)}>
              <UserPlus className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search chats..."
                className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 p-3">
            {loadingChats ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : chats.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 flex flex-col items-center gap-2">
                <MessageSquare className="w-8 h-8 opacity-50" />
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={cn(
                      "w-full p-3 rounded-xl text-left transition-all duration-200 flex items-center gap-3 group relative overflow-hidden",
                      selectedChat === chat.id
                        ? "bg-primary/10 border border-primary/20 shadow-sm"
                        : "hover:bg-white/5 border border-transparent hover:border-white/10"
                    )}
                  >
                    {selectedChat === chat.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>
                    )}
                    <div className="relative">
                      <Avatar className="border-2 border-white/10">
                        <AvatarFallback className={cn(
                          "text-sm font-medium",
                          selectedChat === chat.id ? "bg-primary text-white" : "bg-secondary/50 text-secondary-foreground"
                        )}>
                          {chat.name?.split(" ").map((n) => n[0]).join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {chat.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background flex items-center justify-center text-[10px] text-white font-bold">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className={cn("font-medium text-sm truncate", selectedChat === chat.id && "text-primary")}>
                          {chat.name || "Unknown User"}
                        </h3>
                        <span className="text-[10px] text-muted-foreground">{chat.timestamp}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate opacity-80">{chat.lastMessage}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className={cn(
          "flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col transition-all duration-300",
          !selectedChat ? "hidden md:flex" : "flex"
        )}>
          {selectedChatData ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => setSelectedChat("")}>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <Avatar className="border-2 border-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                      {selectedChatData.name?.split(" ").map((n) => n[0]).join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-bold text-sm md:text-base">{selectedChatData.name || "Unknown User"}</h2>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <p className="text-xs text-muted-foreground capitalize">{selectedChatData.role}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-transparent to-black/5">
                <div className="space-y-6 max-w-3xl mx-auto">
                  {loadingMessages ? (
                    <div className="text-center text-muted-foreground py-8">Loading messages...</div>
                  ) : (
                    messages.map((message, index) => {
                      const isFirstInGroup = index === 0 || messages[index - 1].senderId !== message.senderId;
                      return (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-3",
                            message.isOwnMessage ? "justify-end" : "justify-start",
                            isFirstInGroup ? "mt-4" : "mt-1"
                          )}
                        >
                          {!message.isOwnMessage && isFirstInGroup && (
                            <Avatar className="w-8 h-8 mt-1 border border-white/10">
                              <AvatarFallback className="bg-secondary/20 text-xs">
                                {message.senderName?.split(" ").map((n) => n[0]).join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {!message.isOwnMessage && !isFirstInGroup && <div className="w-8" />}

                          <div className={cn("max-w-[75%] md:max-w-[60%]", message.isOwnMessage ? "order-first" : "")}>
                            <div
                              className={cn(
                                "p-3.5 text-sm shadow-sm relative group",
                                message.isOwnMessage
                                  ? "bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl rounded-tr-sm"
                                  : "bg-white/10 backdrop-blur-sm text-foreground rounded-2xl rounded-tl-sm border border-white/5"
                              )}
                            >
                              <p className="leading-relaxed">{message.content}</p>
                              <span className={cn(
                                "text-[10px] absolute bottom-1 right-3 opacity-0 group-hover:opacity-70 transition-opacity",
                                message.isOwnMessage ? "text-white/80" : "text-muted-foreground"
                              )}>
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
                <form onSubmit={handleSendMessage} className="flex gap-3 max-w-3xl mx-auto items-end">
                  <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="bg-white/5 border-white/10 focus:border-primary/50 rounded-2xl py-6 pr-12"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className={cn(
                        "absolute right-1 top-1 bottom-1 rounded-xl transition-all duration-200",
                        newMessage.trim() ? "bg-primary text-white shadow-lg shadow-primary/25" : "bg-transparent text-muted-foreground hover:bg-white/10"
                      )}
                      disabled={!isConnected || !newMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse-glow">
                <MessageSquare className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Select a conversation</h3>
              <p className="text-center max-w-xs opacity-70">Choose a contact from the sidebar to start chatting or start a new conversation.</p>
            </div>
          )}
        </div>
      </div>

      {/* User Search Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-md glass-card border-primary/20">
          <DialogHeader>
            <DialogTitle>Start a New Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={userSearch}
                onChange={e => handleUserSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
            <ScrollArea className="h-[300px] pr-4">
              {loadingUsers ? (
                <div className="text-center text-muted-foreground py-8">Searching...</div>
              ) : userResults.length === 0 && userSearch ? (
                <div className="text-center text-muted-foreground py-8">No users found.</div>
              ) : (
                <div className="space-y-2">
                  {userResults.map(u => {
                    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
                    const initials = fullName ? fullName.split(" ").map((n: string) => n[0]).join("") : "U";
                    return (
                      <div key={u._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 cursor-pointer transition-colors" onClick={() => handleStartChat(u._id)}>
                        <Avatar className="w-10 h-10 border border-white/10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{fullName || "Unknown User"}</div>
                          <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                        </div>
                        <Badge variant="outline" className="text-[10px] capitalize bg-white/5">{u.role}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Chat;