import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Get token from localStorage (or from AuthContext if exposed)
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect socket
      socketRef.current = io("http://localhost:3000", {
        auth: { token },
        autoConnect: true,
        transports: ["websocket"],
      });

      socketRef.current.on("connect", () => setIsConnected(true));
      socketRef.current.on("disconnect", () => setIsConnected(false));

      return () => {
        socketRef.current?.disconnect();
        setIsConnected(false);
      };
    } else {
      // If not authenticated, disconnect socket
      socketRef.current?.disconnect();
      setIsConnected(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext); 