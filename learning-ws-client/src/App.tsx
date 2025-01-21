import { useEffect, useRef, useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

export default function App() {
  const [socket, setSocket] = useState<WebSocket>();

  const [roomId, setRoomId] = useState("");
  const inputUsernameRef = useRef<HTMLInputElement>(null);
  const inputRoomIdRef = useRef<HTMLInputElement>(null);

  const [totalUsers, setTotalUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [roomMessages, setRoomMessages] = useState<
    { username: string; message: string }[]
  >([]);

  const inputMessageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:7777");

    setSocket(ws);

    ws.onmessage = (event) => {
      const decoded = JSON.parse(event.data);

      if (decoded.event === "new-room-id") {
        const { newRoomId } = decoded;
        setRoomId(newRoomId);
      }

      if (decoded.event === "joined-room") {
        const { roomInfo, online } = decoded;
        setTotalUsers(roomInfo.users);
        setOnlineUsers(online.users);
        setRoomMessages(roomInfo.messages);
      }

      if (decoded.event === "new-message") {
        const { roomInfo } = decoded;
        setRoomMessages(roomInfo.messages);
      }

      if (decoded.event === "user-left") {
        const { roomInfo, online } = decoded;
        setOnlineUsers(online.users);
        setRoomMessages(roomInfo.messages);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        localStorage.removeItem("user");

        ws.close();
      }
    };
  }, []);

  function createRoom() {
    const username = inputUsernameRef.current?.value;

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

  function joinRoom() {
    const roomId = inputRoomIdRef.current?.value;
    const username = inputUsernameRef.current?.value;

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

    localStorage.setItem("user", JSON.stringify({ username, roomId }));
  }

  function sendMessage() {
    const { username, roomId } = JSON.parse(
      localStorage.getItem("user") as string
    );
    const message = inputMessageRef.current?.value;

    if (message && message.length < 1) return;

    socket?.send(
      JSON.stringify({
        event: "send-message",
        roomId,
        username,
        message,
      })
    );

    if (inputMessageRef.current?.value) inputMessageRef.current.value = "";
  }

  return (
    <div className="h-dvh max-w-xl mx-auto w-full flex flex-col justify-center items-center">
      <Button onClick={createRoom} className="my-5">
        Create Room
      </Button>
      <div className="w-full">
        <Input
          className="w-full"
          ref={inputUsernameRef}
          placeholder="enter your username"
        />
        <div className="my-2 font-bold">{roomId && `Room id: ${roomId}`}</div>
      </div>

      <div className="w-full">
        <div className="flex gap-2">
          <Input
            className="w-full"
            ref={inputRoomIdRef}
            placeholder="enter room id"
          />
          <Button onClick={joinRoom}>Join Room</Button>
        </div>
      </div>

      <div className="w-full flex-1 my-10">
        {/* Chat box */}
        <div className="h-[70dvh] overflow-y-auto border mb-5 rounded-md p-5">
          <div>
            <h1>
              {onlineUsers.length} / {totalUsers.length}
            </h1>
          </div>

          {roomMessages.length > 0 &&
            roomMessages.map((item, idx) => {
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <p key={idx} className="border p-4 rounded-md my-2">
                  {item.username}: {item.message}
                </p>
              );
            })}
        </div>

        <div className="flex gap-2">
          <Input
            ref={inputMessageRef}
            placeholder="enter your message"
            className="w-full"
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
}
