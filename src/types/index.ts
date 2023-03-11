export type SharedOptions = {
  defaultTtl: number;
  unrefTimeouts: boolean;
};

export type ExpirableLinkedListOptions = SharedOptions;

export type ExpirableMapOptions = SharedOptions & {
  keepAlive?: boolean;
};

export type ExpirableQueueOptions = SharedOptions;

export type ExpirableSetOptions = SharedOptions & {
  keepAlive?: boolean;
};

export type ExpirableStackOptions = SharedOptions;
