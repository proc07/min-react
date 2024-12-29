import {enqueueConcurrentClassUpdate} from "./fiber-concurrent-updates.ts";
import type {Lane, Lanes} from "./fiber-lane";
import type {Fiber} from "./internal-type";
import {NoLanes} from "./fiber-lane";
import {FiberRoot} from "./internal-type";

export type Update<State> = {
  eventTime: number;
  lane: Lane;
  tag: 0 | 1 | 2 | 3;
  payload: any;
  callback: (() => any) | null;
  next: Update<State> | null;
};

export type SharedQueue<State> = {
  pending: Update<State> | null;
  lanes: Lanes;
  hiddenCallbacks: Array<() => any> | null;
};

export type UpdateQueue<State> = {
  baseState: State;
  firstBaseUpdate: Update<State> | null;
  lastBaseUpdate: Update<State> | null;
  shared: SharedQueue<State>;
  callbacks: Array<() => any> | null;
};

export const UpdateState = 0;
export const ReplaceState = 1;
export const ForceUpdate = 2;
export const CaptureUpdate = 3;

export function createUpdate(eventTime: number, lane: Lane) {
  const update = {
    eventTime,
    lane,

    tag: UpdateState,
    payload: null,
    callback: null,

    next: null,
  };

  return update;
}
export function enqueueUpdate<State>(
  fiber: Fiber,
  update: Update<State>,
  lane: Lane
): FiberRoot | null {
  const updateQueue = fiber.updateQueue;
  if (updateQueue == null) {
    // Only occurs if the fiber has been unmounted.
    return null;
  }

  const shareQueue: SharedQueue<State> = updateQueue.shared;

  return enqueueConcurrentClassUpdate(fiber, shareQueue, update as any, lane);
}

export function initializeUpdateQueue<State>(fiber: Fiber): void {
  const queue: UpdateQueue<State> = {
    baseState: fiber.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: {
      pending: null,
      lanes: NoLanes,
      hiddenCallbacks: null,
    },
    callbacks: null,
  };

  fiber.updateQueue = queue;
}