import { useEffect, useMemo, useReducer, useRef } from "react";
import axios from "axios";
import socket from "../utils/socket";

const initialState = {
  connected: false,
  messages: [],
  typingUsers: [],
  presence: {},
};

function reducer(state, action) {
  switch (action.type) {
    case "CONNECTED":
      return { ...state, connected: true };
    case "DISCONNECTED":
      return { ...state, connected: false };
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case "REPLACE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((message) =>
          message._id === action.tempId ? action.payload : message
        ),
      };
    case "UPDATE_MESSAGE_STATUS":
      return {
        ...state,
        messages: state.messages.map((message) => {
          const matchesSingle = action.messageId && message._id === action.messageId;
          const matchesMany =
            Array.isArray(action.messageIds) && action.messageIds.includes(message._id);

          if (!matchesSingle && !matchesMany) return message;

          return {
            ...message,
            status: action.status,
          };
        }),
      };
    case "SET_TYPING":
      return {
        ...state,
        typingUsers: action.payload,
      };
    case "SET_PRESENCE":
      return {
        ...state,
        presence: {
          ...state.presence,
          [action.payload.userId]: action.payload,
        },
      };
    default:
      return state;
  }
}

const createOptimisticMessage = ({ tempId, content, currentUser, recipient, roomId }) => ({
  _id: tempId,
  content,
  roomId,
  status: "sending",
  createdAt: new Date().toISOString(),
  sender: {
    _id: currentUser._id,
    fullName: currentUser.fullName,
    profileImage: currentUser.profileImage,
  },
  recipient: {
    _id: recipient._id,
    fullName: recipient.fullName,
    profileImage: recipient.profileImage,
  },
  group: recipient.isGroup
    ? {
        _id: recipient._id,
        name: recipient.fullName,
        roomId,
      }
    : null,
});

export default function useChatSocket({
  currentUser,
  recipient,
  onConversationUpdate,
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const typingTimeoutRef = useRef(null);

  const roomId = useMemo(() => {
    if (!currentUser?._id || !recipient?._id) return "";
    if (recipient.isGroup) return recipient.roomId;
    return [currentUser._id, recipient._id].sort().join("_");
  }, [currentUser?._id, recipient?._id, recipient?.isGroup, recipient?.roomId]);

  useEffect(() => {
    if (!currentUser?._id) return undefined;

    // Sync local connection state immediately for already-open sockets.
    dispatch({ type: socket.connected ? "CONNECTED" : "DISCONNECTED" });

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("register_user", {
      userId: currentUser._id,
    });

    const handleConnect = () => {
      dispatch({ type: "CONNECTED" });
      socket.emit("register_user", {
        userId: currentUser._id,
      });
    };

    const handleDisconnect = () => {
      dispatch({ type: "DISCONNECTED" });
    };

    const handleMessageReceived = (message) => {
      if (message.roomId !== roomId) return;
      dispatch({ type: "ADD_MESSAGE", payload: message });

      if (!recipient?.isGroup && message.sender?._id === recipient?._id) {
        socket.emit("message_delivered", { messageId: message._id });
      }

      onConversationUpdate?.({
        participantId:
          recipient?.isGroup
            ? recipient._id
            : message.sender?._id === currentUser._id
              ? recipient?._id
              : message.sender?._id,
        conversationType: recipient?.isGroup ? "group" : "direct",
        message,
      });
    };

    const handleMessageSent = ({ tempId, message }) => {
      dispatch({ type: "REPLACE_MESSAGE", tempId, payload: message });
      onConversationUpdate?.({
        participantId: recipient?._id,
        conversationType: recipient?.isGroup ? "group" : "direct",
        message,
      });
    };

    const handleMessageStatus = ({ messageId, messageIds, status }) => {
      dispatch({ type: "UPDATE_MESSAGE_STATUS", messageId, messageIds, status });
    };

    const handleTypingStatus = ({ roomId: incomingRoomId, userId, isTyping, userName }) => {
      if (incomingRoomId !== roomId || userId === currentUser._id) return;
      dispatch({
        type: "SET_TYPING",
        payload: isTyping ? [{ userId, userName }] : [],
      });
    };

    const handlePresenceUpdate = (payload) => {
      dispatch({ type: "SET_PRESENCE", payload });
    };

    const handleConversationUpdate = ({
      participantId,
      conversationType,
      message,
    }) => {
      onConversationUpdate?.({
        participantId,
        conversationType,
        message,
      });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("receive_message", handleMessageReceived);
    socket.on("message_sent", handleMessageSent);
    socket.on("message_status", handleMessageStatus);
    socket.on("typing_status", handleTypingStatus);
    socket.on("presence:update", handlePresenceUpdate);
    socket.on("conversation:update", handleConversationUpdate);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("receive_message", handleMessageReceived);
      socket.off("message_sent", handleMessageSent);
      socket.off("message_status", handleMessageStatus);
      socket.off("typing_status", handleTypingStatus);
      socket.off("presence:update", handlePresenceUpdate);
      socket.off("conversation:update", handleConversationUpdate);
    };
  }, [currentUser?._id, onConversationUpdate, recipient?._id, recipient?.isGroup, roomId]);

  useEffect(() => {
    if (!roomId || !currentUser?._id || !recipient?._id) {
      dispatch({ type: "SET_MESSAGES", payload: [] });
      return undefined;
    }

    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          recipient.isGroup
            ? `${import.meta.env.VITE_BACKEND_URL}/api/chat/groups/${recipient._id}/messages?userId=${currentUser._id}`
            : `${import.meta.env.VITE_BACKEND_URL}/api/chat/chats/${recipient._id}?senderId=${currentUser._id}`
        );

        if (!isMounted) return;

        dispatch({ type: "SET_MESSAGES", payload: response.data });
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    fetchMessages();
    socket.emit("join_room", { roomId, userId: currentUser._id });

    return () => {
      isMounted = false;
      socket.emit("leave_room", { roomId });
    };
  }, [currentUser?._id, recipient?._id, recipient?.isGroup, roomId]);

  useEffect(() => {
    if (
      recipient?.isGroup ||
      !roomId ||
      !currentUser?._id ||
      !recipient?._id ||
      state.messages.length === 0
    ) {
      return;
    }

    const unreadMessages = state.messages.filter(
      (message) =>
        message.sender?._id === recipient._id &&
        message.status !== "read"
    );

    if (unreadMessages.length === 0) return;

    socket.emit("message_read", {
      roomId,
      messageIds: unreadMessages.map((message) => message._id),
    });
  }, [currentUser?._id, recipient?._id, recipient?.isGroup, roomId, state.messages]);

  const sendMessage = (content) => {
    if (!content.trim() || !currentUser?._id || !recipient?._id || !roomId) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = createOptimisticMessage({
      tempId,
      content,
      currentUser,
      recipient,
      roomId,
    });

    dispatch({ type: "ADD_MESSAGE", payload: optimisticMessage });
    socket.emit("send_message", {
      tempId,
      senderId: currentUser._id,
      recipientId: recipient.isGroup ? undefined : recipient._id,
      groupId: recipient.isGroup ? recipient._id : undefined,
      content,
      roomId,
    });
  };

  const setTyping = (isTyping) => {
    if (!roomId || !currentUser?._id) return;

    socket.emit("typing_status", {
      roomId,
      userId: currentUser._id,
      userName: currentUser.fullName,
      isTyping,
    });

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping) {
      typingTimeoutRef.current = window.setTimeout(() => {
        socket.emit("typing_status", {
          roomId,
          userId: currentUser._id,
          userName: currentUser.fullName,
          isTyping: false,
        });
      }, 1200);
    }
  };

  const recipientPresence = recipient?._id
    ? state.presence[recipient._id]
    : undefined;

  return {
    connected: state.connected,
    messages: state.messages,
    roomId,
    typingLabel:
      state.typingUsers.length > 0
        ? recipient?.isGroup
          ? `${state.typingUsers[0].userName || "Someone"} is typing...`
          : "Typing..."
        : "",
    recipientPresence,
    sendMessage,
    setTyping,
  };
}
