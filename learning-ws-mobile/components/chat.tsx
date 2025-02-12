import { useSocket } from "@/hooks/useSocket";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Chat() {
  const [msg, setMsg] = useState("");

  const {
    createRoom,
    joinRoom,
    messages,
    onlineUsers,
    sendMessage,
    inputRoomId,
    setInputRoomId,
    roomId,
    username,
    setUsername,
    totalUsers,
  } = useSocket();

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

      <View>
        <Pressable
          style={{
            paddingVertical: 20,
            paddingHorizontal: 20,
            backgroundColor: "black",
            borderRadius: 10,
            marginVertical: 5,
          }}
          onPress={() => createRoom(username)}
        >
          <Text
            style={{
              color: "white",
            }}
          >
            Create Room
          </Text>
        </Pressable>
      </View>

      <View>
        <Pressable
          style={{
            paddingVertical: 20,
            paddingHorizontal: 20,
            backgroundColor: "black",
            borderRadius: 10,
            marginVertical: 5,
          }}
          onPress={() => joinRoom(username, inputRoomId)}
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
        {messages.length > 0 &&
          messages.map((item, idx) => (
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
          onPress={() => {
            sendMessage(msg);
            setMsg("");
          }}
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
