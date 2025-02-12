import { createContext, useEffect, useState } from "react";

interface ISocketContext {
  socket?: WebSocket;
  createRoom: (username: string) => void;
  joinRoom: (username: string, roomId: string) => void;
  sendMessage: (message: string) => void;
  messages: { username: string; message: string }[];
  roomId: string;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  inputRoomId: string;
  setInputRoomId: React.Dispatch<React.SetStateAction<string>>;
  totalUsers: string[];
  onlineUsers: string[];
}

const SocketContext = createContext<ISocketContext | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | undefined>(undefined);
  const [messages, setMessages] = useState<
    { username: string; message: string }[]
  >([]);

  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");

  const [totalUsers, setTotalUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const ws = new WebSocket("wss://ws-demo-8oac.onrender.com");
    // const ws = new WebSocket("ws://10.0.2.2:7777");

    setSocket(ws);

    ws.onmessage = (event) => {
      console.log(event.data);
      const decoded = JSON.parse(event.data);

      if (decoded.event === "new-room-id") {
        const { newRoomId } = decoded;
        setRoomId(newRoomId);
      }

      if (decoded.event === "joined-room") {
        const { roomInfo, online } = decoded;
        setTotalUsers(roomInfo.users);
        setOnlineUsers(online.users);
        setMessages(roomInfo.messages);
      }

      if (decoded.event === "new-message") {
        const { roomInfo } = decoded;
        setMessages(roomInfo.messages);
      }

      if (decoded.event === "user-left") {
        const { roomInfo, online } = decoded;
        setOnlineUsers(online.users);
        setMessages(roomInfo.messages);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  function createRoom(username: string) {
    if (!username) {
      alert("Enter your username first");
      return;
    }

    socket?.send(
      JSON.stringify({
        event: "create-room",
        username,
      })
    );
  }

  function joinRoom(username: string, roomId: string) {
    if (!username) {
      alert("Enter your username first");
      return;
    }
    if (!roomId) return;

    socket?.send(
      JSON.stringify({
        event: "join-room",
        roomId,
        username,
      })
    );

    console.log("Joining room id:", roomId);
  }

  function sendMessage(message: string) {
    if (message && message.length < 1) return;

    const payload = JSON.stringify({
      event: "send-message",
      roomId: inputRoomId,
      username,
      message,
    });
    socket?.send(payload);
  }

  return (
    <SocketContext.Provider
      value={{
        socket,
        createRoom,
        joinRoom,
        sendMessage,
        messages,
        onlineUsers,
        totalUsers,
        inputRoomId,
        setInputRoomId,
        roomId,
        username,
        setUsername,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export default SocketContext;
