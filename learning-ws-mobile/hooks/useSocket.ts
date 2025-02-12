import SocketContext from "@/context/Socket";
import { useContext } from "react";

export function useSocket() {
  const socket = useContext(SocketContext);

  if (socket === undefined) {
    throw new Error("Socket Context must be used inside Socket Provider");
  }

  return socket;
}
