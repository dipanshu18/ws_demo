import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const [socket, setSocket] = useState<WebSocket>();

  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");

  const [totalUsers, setTotalUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [roomMessages, setRoomMessages] = useState<
    { username: string; message: string }[]
  >([]);

  const [msg, setMsg] = useState("");

  useEffect(() => {
    const ws = new WebSocket("wss://ws-demo-8oac.onrender.com");

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
        // localStorage.removeItem("user");

        ws.close();
      }
    };
  }, []);

  function createRoom() {
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

    // localStorage.setItem("user", JSON.stringify({ username, roomId }));
  }

  function sendMessage() {
    // const { username, roomId } = JSON.parse(
    //   localStorage.getItem("user") as string
    // );

    if (msg && msg.length < 1) return;

    socket?.send(
      JSON.stringify({
        event: "send-message",
        roomId,
        username,
        message: msg,
      })
    );

    setMsg("");
  }

  return (
    <SafeAreaView
      style={{
        margin: 10,
      }}
    >
      <View>
        <TextInput
          placeholder="enter your username"
          style={{
            borderWidth: 1,
            borderRadius: 10,
            marginVertical: 10,
          }}
          onChangeText={setUsername}
          value={username}
        />
      </View>

      <View>
        <TextInput
          placeholder="enter room code"
          style={{
            borderWidth: 1,
            borderRadius: 10,
            marginVertical: 10,
          }}
          onChangeText={setInputRoomId}
          value={inputRoomId}
        />
      </View>

      {/* <View>
        <Pressable
          style={{
            paddingVertical: 20,
            paddingHorizontal: 20,
            backgroundColor: "black",
            borderRadius: 10,
            marginVertical: 5,
          }}
          onPress={createRoom}
        >
          <Text
            style={{
              color: "white",
            }}
          >
            Create Room
          </Text>
        </Pressable>
      </View> */}

      <View>
        <Pressable
          style={{
            paddingVertical: 20,
            paddingHorizontal: 20,
            backgroundColor: "black",
            borderRadius: 10,
            marginVertical: 5,
          }}
          onPress={joinRoom}
        >
          <Text
            style={{
              color: "white",
            }}
          >
            Join Room
          </Text>
        </Pressable>
      </View>

      {roomId && (
        <View style={{ marginVertical: 10 }}>
          <Text>Generated RoomId: {roomId}</Text>
        </View>
      )}

      <View style={{ marginVertical: 10 }}>
        <Text>
          Users: {onlineUsers.length} / {totalUsers.length}
        </Text>
      </View>

      <ScrollView
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 10,
          borderColor: "black",
          height: "50%",
        }}
      >
        {roomMessages.length > 0 &&
          roomMessages.map((item, idx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <View key={idx}>
              <Text>
                {item.username}: {item.message}
              </Text>
            </View>
          ))}
      </ScrollView>

      <View style={{ flexDirection: "row", gap: 5 }}>
        <TextInput
          placeholder="enter your message"
          style={{
            borderWidth: 1,
            borderRadius: 10,
            marginVertical: 10,
            width: "80%",
          }}
          onChangeText={setMsg}
          value={msg}
        />
        <Pressable
          style={{
            width: "20%",
            marginHorizontal: "auto",
            backgroundColor: "black",
            borderRadius: 10,
            marginVertical: 5,
          }}
          onPress={sendMessage}
        >
          <Text
            style={{
              color: "white",
              marginVertical: "auto",
              textAlign: "center",
            }}
          >
            Send
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
