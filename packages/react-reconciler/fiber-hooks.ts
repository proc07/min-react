import { Fiber, FiberRoot } from './internal-types'
import {HostRoot} from './work-tags'
import {scheduleUpdateOnFiber} from './fiber-work-loop'

type Hook = {
  memoizedState: any
  next: Hook | null
}
// 当前正在渲染的 fiber
let currentlyRenderingFiber: Fiber | null = null;
// 当前正在工作的 hook
let workInProgressHook: Hook | null = null;
// 当前正在处理的 hook
let currentHook: Hook | null = null;

export function renderWithHooks<Props>(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  props: Props
): any {
  currentlyRenderingFiber = workInProgress;
  workInProgress.memoizedState = null;
  
  let children = Component(props);
  
  finishRenderingHooks();
  
  return children;
}
function finishRenderingHooks() {
  currentlyRenderingFiber = null;
  currentHook = null;
  workInProgressHook = null;
}

function updateWorkInProgressHook() {
  let hook;
  let current = currentlyRenderingFiber?.alternate; // 旧的 fiber

  if (current) {
    // update 阶段
    // 从备用 fiber 中复制 hook
    currentlyRenderingFiber!.memoizedState = current?.memoizedState;

    if (workInProgressHook) {
      // 其他hook关联到链表
      workInProgressHook = hook = workInProgressHook.next;
      currentHook = currentHook!.next;
    } else {
      // 第一个 hook
      hook = workInProgressHook = currentlyRenderingFiber!.memoizedState;
      // 旧的 hook 的头节点
      currentHook = current?.memoizedState;
    }
  } else {
    // mount 阶段
    currentHook = null;
    hook = {
      memoizedState: null,
      next: null
    }

    if (workInProgressHook) {
        // 其他hook关联到链表
        workInProgressHook = workInProgressHook.next = hook
    } else {
        // 第一个 hook
        workInProgressHook = currentlyRenderingFiber!.memoizedState = hook;
    }
  }

  return hook;
}

type Dispatch<A> = (action: A) => void;

export function useReducer<S, I, A>(
  reducer: (state: S, action: A) => S,
  initialArg: I,
  init?: (initialArg: I) => S
) {
  // 构建 hook 链表
  const hook: Hook = updateWorkInProgressHook()

  let initialState: S = init ? init(initialArg) : initialArg as any

  // 区分函数组件事初次渲染还是更新
  if(!currentlyRenderingFiber?.alternate) {
    // mount 阶段
    hook.memoizedState = initialState
  }

  // 这里使用 bind 来调用，是为了保存当前的 currentlyRenderingFiber 值，可能存在提前执行 为 null 的情况
  const dispatch: Dispatch<A> = dispatchReducerAction.bind(
    null,
    currentlyRenderingFiber as Fiber,
    hook,
    reducer,
  )

  return [hook.memoizedState, dispatch]
}

function dispatchReducerAction<S, A>(
  fiber: Fiber,
  hook: Hook,
  reducer: (state: S, action: A) => S,
  action: any // 该参数为用户传入的
) {
  // 更新 state
  hook.memoizedState = reducer ? reducer(hook.memoizedState, action) : action

  // ?????
  fiber.alternate = { ...fiber };
  if (fiber.sibling) {
    fiber.sibling.alternate = fiber.sibling;
  }

  // 查找到当前 fiber 的根节点
  const root = getRootForUpdatedFiber(fiber);

  scheduleUpdateOnFiber(root, fiber);
}

// 根据 sourceFiber 找根节点 (从下往上找)
function getRootForUpdatedFiber(sourceFiber: Fiber): FiberRoot {
  let node = sourceFiber;
  let parent = node.return;

  while (parent !== null) {
    node = parent;
    parent = node.return;
  }
  return node.tag === HostRoot ? node.stateNode : null;
}