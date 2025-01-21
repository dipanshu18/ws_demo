import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 7777 });

const onlineUsers: {
  [roomId: string]: {
    users: string[];
  };
} = {};

const rooms: {
  [roomId: string]: {
    users: string[];
    messages: { username: string; message: string }[];
  };
} = {};

const userRoomMap = new Map<WebSocket, { username: string; roomId: string }>();

wss.on("connection", (socket) => {
  console.log("client Connected");

  socket.on("error", (err) => {
    console.log("Error:", err);
  });

  socket.on("message", (data) => {
    const decoded = JSON.parse(data.toString());

    if (decoded.event === "create-room") {
      const { username } = decoded;

      const newRoomId = Math.ceil(Math.random() * 10000);

      rooms[newRoomId] = {
        users: [username],
        messages: [
          {
            username,
            message: `${username} created the room`,
          },
        ],
      };

      socket.send(JSON.stringify({ event: "new-room-id", newRoomId }));

      console.log(rooms);
      return;
    }

    if (decoded.event === "join-room") {
      const { roomId, username } = decoded;

      if (!rooms[roomId]) {
        socket.send("Room doesn't exists");
        return;
      }

      if (!rooms[roomId].users.includes(username)) {
        rooms[roomId].users.push(username);
      }

      rooms[roomId].messages.push({
        username,
        message: `${username} joined the room`,
      });

      // Map the socket to the room
      userRoomMap.set(socket, { roomId, username });

      if (!onlineUsers[roomId]) {
        onlineUsers[roomId] = {
          users: [username],
        };
      }

      if (!onlineUsers[roomId].users.includes(username)) {
        onlineUsers[roomId].users.push(username);
      }

      // biome-ignore lint/complexity/noForEach: <explanation>
      wss.clients.forEach(function each(client) {
        if (
          client.readyState === WebSocket.OPEN &&
          userRoomMap.get(client)?.roomId === roomId
        ) {
          client.send(
            JSON.stringify({
              event: "joined-room",
              roomInfo: rooms[roomId],
              online: onlineUsers[roomId],
            })
          );
        }
      });
      console.log(rooms);
    }

    if (decoded.event === "send-message") {
      const { roomId, username, message } = decoded;

      if (!rooms[roomId]) {
        socket.send("Room doesn't exists");
        return;
      }

      if (rooms[roomId]) {
        if (!rooms[roomId].users.includes(username)) {
          rooms[roomId].users.push(username);
        }

        rooms[roomId].messages.push({ username, message });

        // biome-ignore lint/complexity/noForEach: <explanation>
        wss.clients.forEach(function each(client) {
          if (
            client.readyState === WebSocket.OPEN &&
            userRoomMap.get(client)?.roomId === roomId
          ) {
            client.send(
              JSON.stringify({
                event: "new-message",
                roomInfo: rooms[roomId],
              })
            );
          }
        });
      }
    }
  });

  socket.on("close", () => {
    // Retrieve user info from the map
    const userInfo = userRoomMap.get(socket);

    if (userInfo) {
      const { roomId, username } = userInfo;

      // Remove user from onlineUsers
      if (onlineUsers[roomId]) {
        onlineUsers[roomId].users = onlineUsers[roomId].users.filter(
          (user) => user !== username
        );
      }

      // Add a "user left" message to the room
      if (rooms[roomId]) {
        rooms[roomId].messages.push({
          username,
          message: `${username} left the room`,
        });
      }

      // Notify other clients in the room
      // biome-ignore lint/complexity/noForEach: <explanation>
      wss.clients.forEach((client) => {
        if (
          client.readyState === WebSocket.OPEN &&
          userRoomMap.get(client)?.roomId === roomId
        ) {
          client.send(
            JSON.stringify({
              event: "user-left",
              roomInfo: rooms[roomId],
              online: onlineUsers[roomId],
            })
          );
        }
      });

      // Remove the socket from the map
      userRoomMap.delete(socket);
    }

    console.log("Connection closed");
  });
});
