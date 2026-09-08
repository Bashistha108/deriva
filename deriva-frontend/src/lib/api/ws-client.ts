import { Client } from "@stomp/stompjs";
import { useAuthStore } from "@/store/auth-store";

export const createStompClient = () => {
  const token = useAuthStore.getState().token;

  const client = new Client({
    brokerURL: "ws://localhost:8080/ws",
    connectHeaders: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    debug: function (str) {
      console.log("[STOMP] ", str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });

  return client;
};
