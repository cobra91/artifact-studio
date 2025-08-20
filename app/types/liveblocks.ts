export type Presence = {
  cursor: { x: number; y: number } | null;
};

export type Storage = Record<string, never>;

export type UserMeta = {
  id: string;
  info: {
    name: string;
    color: string;
    picture: string;
  };
};

export type RoomEvent = Record<string, never>;

export type ThreadMetadata = Record<string, never>;
