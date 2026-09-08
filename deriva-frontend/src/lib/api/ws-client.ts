import { Client } from "@stomp/stompjs";
import { useAuthStore } from "@/store/auth-store";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws";

export const createStompClient = () => {
  const token = useAuthStore.getState().token;

  return new Client({
    brokerURL: WS_URL,
    connectHeaders: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });
};
