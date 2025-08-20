export type Presence = {
  cursor: { x: number; y: number } | null;
};

export type Storage = {
  // Example storage items
  // components: LiveList<LiveObject<ComponentNode>>;
};

export type UserMeta = {
  id: string;
  info: {
    name: string;
    color: string;
    picture: string;
  };
};

export type RoomEvent = {
  // Example room events
  // type: "REACTION";
  // emoji: string;
};

export type ThreadMetadata = {
  // Example thread metadata
  // resolved: boolean;
  // zIndex: number;
  // time: number;
};
