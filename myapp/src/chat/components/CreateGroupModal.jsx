import { useMemo, useState } from "react";
import axios from "axios";
import { Users, X } from "lucide-react";

export default function CreateGroupModal({
  currentUserId,
  connections,
  onClose,
  onGroupCreated,
}) {
  const [groupName, setGroupName] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCount = useMemo(
    () => selectedMemberIds.length + 1,
    [selectedMemberIds.length]
  );

  const toggleMember = (memberId) => {
    setSelectedMemberIds((previous) =>
      previous.includes(memberId)
        ? previous.filter((id) => id !== memberId)
        : [...previous, memberId]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!groupName.trim() || selectedMemberIds.length === 0) return;

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/groups`,
        {
          name: groupName.trim(),
          adminId: currentUserId,
          memberIds: selectedMemberIds,
        }
      );

      onGroupCreated(response.data);
      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4">
      <div className="w-full max-w-lg rounded-3xl border border-[#4790fd]/20 bg-[#070707] shadow-2xl shadow-black/70">
        <div className="flex items-center justify-between border-b border-[#4790fd]/20 px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Create Group</h2>
            <p className="text-sm text-white/60">
              Pick friends from your connections list.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 sm:px-6 sm:py-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white/85">
              Group name
            </span>
            <input
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              placeholder="Design team, Project squad..."
              className="w-full rounded-2xl border border-[#ffffff]/10 bg-[#ffffff]/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#4790fd]/50 focus:ring-4 focus:ring-[#4790fd]/20"
            />
          </label>

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-white/85">Add members</span>
              <span className="text-xs text-white/55">{selectedCount} selected</span>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-2xl border border-[#ffffff]/10 bg-[#040404] sm:max-h-80">
              {connections.map((friend) => {
                const checked = selectedMemberIds.includes(friend._id);
                return (
                  <label
                    key={friend._id}
                    className="flex cursor-pointer items-center gap-3 border-b border-[#ffffff]/5 px-3 py-3 last:border-b-0 hover:bg-white/5 sm:px-4"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMember(friend._id)}
                      className="h-4 w-4 rounded border-[#ffffff]/30 text-[#4790fd] focus:ring-[#4790fd]/60"
                    />
                    <img
                      src={friend.profileImage || "default-user.jpg"}
                      alt={friend.fullName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {friend.fullName}
                      </p>
                      <p className="truncate text-xs text-white/55">
                        {friend.designation || "Friend"}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !groupName.trim() || selectedMemberIds.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4790fd] to-[#27dc66] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-white/20"
            >
              <Users className="h-4 w-4" />
              Create group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
