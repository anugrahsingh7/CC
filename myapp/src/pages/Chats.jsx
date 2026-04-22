import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import ConnectionRequestsModal from "../components/ConnectionRequestsModal";
import ChatList from "../chat/components/ChatList";
import ChatPanel from "../chat/components/ChatPanel";
import CreateGroupModal from "../chat/components/CreateGroupModal";

const buildRoomId = (firstId, secondId) => [firstId, secondId].sort().join("_");

const normalizeDesignation = (designation) => (designation || "").toLowerCase();

const mergeConversations = (users, conversations, currentUserId) => {
  const summaryMap = new Map(
    conversations.map((conversation) => [conversation._id, conversation])
  );

  const directConversations = users
    .map((connectedUser) => {
      const summary = summaryMap.get(connectedUser._id);

      return {
        ...connectedUser,
        roomId: summary?.roomId || buildRoomId(currentUserId, connectedUser._id),
        lastMessage: summary?.lastMessage || null,
        unreadCount: summary?.unreadCount || 0,
        status: summary?.status ?? connectedUser.status,
      };
    })
  const groupConversations = conversations.filter((conversation) => conversation.isGroup);

  return [...directConversations, ...groupConversations].sort((first, second) => {
      const firstTime = first.lastMessage?.createdAt
        ? new Date(first.lastMessage.createdAt).getTime()
        : 0;
      const secondTime = second.lastMessage?.createdAt
        ? new Date(second.lastMessage.createdAt).getTime()
        : 0;

      return secondTime - firstTime;
    });
};

export default function ChatApp() {
  const { user: clerkUser } = useUser();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [conversationSummaries, setConversationSummaries] = useState([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!clerkUser) return;

    const bootstrap = async () => {
      try {
        setIsLoading(true);
        const profileResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/${clerkUser.id}`
        );

        const user = profileResponse.data;
        setCurrentUser(user);

        const [connectionsResponse, conversationsResponse, pendingResponse] =
          await Promise.all([
            axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/api/user/getAllConnections/${user._id}`
            ),
            axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/api/chat/conversations/${user._id}`
            ),
            axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/api/user/getPendingConnections/${user._id}`
            ),
          ]);

        setConnections(connectionsResponse.data);
        setConversationSummaries(conversationsResponse.data);
        setPendingCount(pendingResponse.data.length || 0);
      } catch (error) {
        console.error("Error loading chat workspace:", error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [clerkUser]);

  const mergedConversationList = useMemo(() => {
    if (!currentUser?._id) return [];

    return mergeConversations(
      connections,
      conversationSummaries,
      currentUser._id
    )
      .filter((user) => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;

        return (
          user.fullName?.toLowerCase().includes(query) ||
          user.designation?.toLowerCase().includes(query)
        );
      })
      .filter((user) => {
        if (user.isGroup) {
          return activeFilter === "all" || activeFilter === "groups";
        }
        if (activeFilter === "all") return true;
        if (activeFilter === "groups") return false;
        const designation = normalizeDesignation(user.designation);
        if (activeFilter === "faculty") return designation.includes("faculty");
        if (activeFilter === "students") return !designation.includes("faculty");
        return true;
      });
  }, [activeFilter, connections, conversationSummaries, currentUser?._id, searchQuery]);

  useEffect(() => {
    if (!selectedRecipientId && mergedConversationList.length > 0 && !isMobile) {
      setSelectedRecipientId(mergedConversationList[0]._id);
    }
  }, [isMobile, mergedConversationList, selectedRecipientId]);

  const fullConversationList = currentUser?._id
    ? mergeConversations(connections, conversationSummaries, currentUser._id)
    : [];

  const selectedRecipient =
    fullConversationList.find((user) => user._id === selectedRecipientId) || null;

  const handleConversationUpdate = ({ participantId, conversationType, message }) => {
    setConversationSummaries((previous) => {
      const next = [...previous];
      const existingIndex = next.findIndex(
        (conversation) =>
          conversation._id === participantId &&
          Boolean(conversation.isGroup) === (conversationType === "group")
      );

      const summaryPayload = {
        roomId: message.roomId,
        unreadCount:
          message.sender?._id === currentUser?._id ||
          participantId === selectedRecipientId
            ? 0
            : 1,
        lastMessage: {
          _id: message._id,
          content: message.content,
          fileType: message.fileType,
          createdAt: message.createdAt,
          status: message.status,
          sender: message.sender?._id,
        },
      };

      if (existingIndex >= 0) {
        next[existingIndex] = {
          ...next[existingIndex],
          ...summaryPayload,
        };
        return next;
      }

      if (conversationType === "group") return previous;

      const connection = connections.find((user) => user._id === participantId);
      if (!connection) return previous;

      next.push({
        ...connection,
        ...summaryPayload,
      });

      return next;
    });
  };

  const refreshConnections = async () => {
    if (!currentUser?._id) return;

    const [connectionsResponse, conversationsResponse, pendingResponse] =
      await Promise.all([
        axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/getAllConnections/${currentUser._id}`
        ),
        axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/chat/conversations/${currentUser._id}`
        ),
        axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/getPendingConnections/${currentUser._id}`
        ),
      ]);

    setConnections(connectionsResponse.data);
    setConversationSummaries(conversationsResponse.data);
    setPendingCount(pendingResponse.data.length || 0);
  };

  return (
    <div className="h-dvh w-full bg-[#040404]">
      <div className="flex h-full w-full items-stretch overflow-hidden border border-[#4790fd]/20 bg-[#070707] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.8)]">
        <div className={`${isMobile && showChat ? "hidden" : "flex"} min-h-0 w-full md:w-auto`}>
          <div className="flex h-full min-h-0 w-full flex-col border-r border-[#4790fd]/20 md:w-[380px] lg:w-[420px]">
            <ChatList
              currentUser={currentUser}
              conversations={mergedConversationList}
              selectedRecipientId={selectedRecipientId}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              pendingCount={pendingCount}
              onGoNetwork={() => navigate("/Network")}
              onOpenRequests={() => setShowRequestsModal(true)}
              onCreateGroup={() => setShowCreateGroupModal(true)}
              onSelectConversation={(conversation) => {
                setSelectedRecipientId(conversation._id);
                setConversationSummaries((previous) =>
                  previous.map((item) =>
                    item._id === conversation._id
                      ? { ...item, unreadCount: 0 }
                      : item
                  )
                );
                if (isMobile) setShowChat(true);
              }}
            />
          </div>
        </div>

        <div
          className={`${isMobile && !showChat ? "hidden" : "flex"} min-h-0 min-w-0 flex-1 bg-[#040404]`}
        >
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center bg-[#040404]">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ffffff]/15 border-t-[#4790fd]" />            </div>
          ) : (
            <ChatPanel
              currentUser={currentUser}
              recipient={selectedRecipient}
              isMobile={isMobile}
              onBack={() => setShowChat(false)}
              onConversationUpdate={handleConversationUpdate}
            />
          )}
        </div>
      </div>

      {showRequestsModal && (
        <ConnectionRequestsModal
          onClose={() => setShowRequestsModal(false)}
          currentUserId={currentUser?._id}
          onRequestsUpdated={refreshConnections}
        />
      )}

      {showCreateGroupModal && (
        <CreateGroupModal
          currentUserId={currentUser?._id}
          connections={connections}
          onClose={() => setShowCreateGroupModal(false)}
          onGroupCreated={(group) => {
            setConversationSummaries((previous) => [group, ...previous]);
            setSelectedRecipientId(group._id);
            setShowChat(true);
          }}
        />
      )}
    </div>
  );
}
