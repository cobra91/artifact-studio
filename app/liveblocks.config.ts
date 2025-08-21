import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});

// Presence represents the properties that exist on every user in the room
type Presence = {
  cursor: { x: number; y: number } | null;
  selectedNodeIds: string[];
};

// Storage represents the shared document that persists in the room
type Storage = {
  // We'll store our canvas components here
  canvas: any;
};

// UserMeta represents static/readonly metadata on each user
type UserMeta = {
  id: string;
  info: {
    name: string;
    avatar: string;
  };
};

// RoomEvent represents events that are sent to everyone in the room
type RoomEvent = {
  type: "CUSTOM_EVENT";
  data: any;
};

// ThreadMetadata represents metadata on each thread
type ThreadMetadata = {
  resolved: boolean;
  quote: string;
};

export const {
  RoomProvider,
  useMyPresence,
  useOthers,
  useUpdateMyPresence,
  useStorage,
  useMutation,
  useSelf,
  useRoom,
  useOthersMapped,
  useOthersConnectionIds,
  useOther,
  useBroadcastEvent,
  useEventListener,
  useErrorListener,
  useHistory,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
  useStatus,
  useLostConnectionListener,
  useThreads,
  useUser,
  useCreateThread,
  useEditThreadMetadata,
  useCreateComment,
  useEditComment,
  useDeleteComment,
  useAddReaction,
  useRemoveReaction,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(client);