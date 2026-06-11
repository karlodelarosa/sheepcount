"use client";

import { useCallback, useEffect, useState } from "react";

interface UseRealtimeChatProps {
  roomName: string;
  username: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  user: {
    name: string;
  };
  createdAt: string;
}

const roomMessages = new Map<string, ChatMessage[]>();
const roomListeners = new Map<string, Set<(message: ChatMessage) => void>>();

function getRoomMessages(roomName: string) {
  if (!roomMessages.has(roomName)) {
    roomMessages.set(roomName, []);
  }
  return roomMessages.get(roomName)!;
}

function getRoomListeners(roomName: string) {
  if (!roomListeners.has(roomName)) {
    roomListeners.set(roomName, new Set());
  }
  return roomListeners.get(roomName)!;
}

export function useRealtimeChat({ roomName, username }: UseRealtimeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    getRoomMessages(roomName),
  );
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    setMessages(getRoomMessages(roomName));
    setIsConnected(true);

    const listener = (message: ChatMessage) => {
      setMessages((current) => [...current, message]);
    };

    getRoomListeners(roomName).add(listener);

    return () => {
      getRoomListeners(roomName).delete(listener);
    };
  }, [roomName]);

  const sendMessage = useCallback(
    async (content: string) => {
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        content,
        user: {
          name: username,
        },
        createdAt: new Date().toISOString(),
      };

      getRoomMessages(roomName).push(message);
      getRoomListeners(roomName).forEach((listener) => listener(message));
    },
    [roomName, username],
  );

  return { messages, sendMessage, isConnected };
}
