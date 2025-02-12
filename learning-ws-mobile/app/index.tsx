import Chat from "@/components/chat";
import { SocketProvider } from "@/context/Socket";

export default function App() {
  return (
    <SocketProvider>
      <Chat />
    </SocketProvider>
  );
}
