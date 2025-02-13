import {NoLane, NoLanes, createLaneMap, NoTimestamp} from "./fiber-lane.ts";
import type {Container, FiberRoot} from "./internal-type.ts";
import type {ReactNodeList} from "shared/types";
import {createHostRootFiber} from "./fiber.ts";
import {initializeUpdateQueue} from "./fiber-class-update-queue.ts";

export type RootTag = 0 | 1;
// export const LegacyRoot = 0;
export const ConcurrentRoot = 1;

export type RootState = {
  element: any;
};

export function FiberRootNode(containerInfo: Container, tag: RootTag) {
  this.tag = tag;
  this.containerInfo = containerInfo;
  this.pendingChildren = null;
  this.current = null;
  this.finishedWork = null;
  this.callbackNode = null;
  this.callbackPriority = NoLane;

  this.eventTimes = createLaneMap(NoLanes);
  this.expirationTimes = createLaneMap(NoTimestamp);

  this.pendingLanes = NoLanes;
  this.finishedLanes = NoLanes;
}

export function createFiberRoot(
  containerInfo: Container,
  tag: RootTag,
  initialChildren: ReactNodeList
): FiberRoot {
  const root: FiberRoot = new FiberRootNode(containerInfo, tag);

  // Cyclic construction. This cheats the type system right now because
  // stateNode is any.
  const uninitializedFiber = createHostRootFiber(tag);
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;

  const initialState: RootState = {
    element: initialChildren,
  };
  uninitializedFiber.memoizedState = initialState;

  initializeUpdateQueue(uninitializedFiber);

  return root;
}