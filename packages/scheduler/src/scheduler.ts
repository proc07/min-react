import {
  PriorityLevel,
  NoPriority,
  ImmediatePriority,
  UserBlockingPriority,
  NormalPriority,
  LowPriority,
  IdlePriority
} from './priorities'
import { getCurrentTime, isFn } from 'shared/utils'
import { peek, pop, push } from '../src/min-heap'

type Callback = (arg: boolean) => null | undefined | Callback

export type Task = {
  id: number;
  callback: Callback | null;
  priorityLevel: PriorityLevel;
  startTime: number;
  expirationTime: number;
  sortIndex: number;
};

// 任务队列，最小堆
const taskQueue: Task[] = [] // 非延迟的任务队列
const timerQueue: Task[] = [] // 延迟的任务队列

let taskIdCounter = 1;
let currentTask: Task | null = null
let currentPriorityLevel: PriorityLevel = NoPriority

// 记录时间切⽚的起始值，时间戳
let startTime = -1;
// 时间切⽚，这是个时间段
let frameInterval = 5;

// 当前是否有任务在执行（时间切片）
let isPerformingWork = false
// 主线程是否在调度
let isHostCallbackScheduled = false

// 任务调度器的入口函数
function scheduleCallback(
  priorityLevel: PriorityLevel,
  callback: Callback,
  // 调度延迟任务
  options?: {  delay: number }
) {
  const startTime = getCurrentTime()
  
  let timeout: number
  switch(priorityLevel) {
    case ImmediatePriority: // 立即超时
      timeout = -1
      break
    case UserBlockingPriority: // case:
      timeout = 250
      break
    case IdlePriority: // 永不超时
      timeout = Math.pow(2, 30) - 1 // v8 里面最大的值
      break
    case LowPriority: // case:
      timeout = 10000
      break
    case NormalPriority: // case:
    default:
      timeout = 5000
      break
  }

  const expirationTime = startTime + timeout
  const newTask: Task = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1,
  }
  // 哪个 task 过期时间越小，就应该先被执行
  newTask.sortIndex = expirationTime

  push(taskQueue, newTask)

  if (!isHostCallbackScheduled && !isPerformingWork) {
    isHostCallbackScheduled = true;
    requestHostCallback();
  }
}

let isMessageLoopRunning = false
function requestHostCallback() {
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true
    // 创建一个宏任务，确保只有1个
    schedulePerformWorkUntilDeadline()
  }
}
// 创建一个宏任务（确保 React 在执⾏更新时能够合并多个更新操作，并在下⼀个宏任务中⼀次性更新，以提⾼性能并减少不必要的重复渲染，从⽽提⾼⻚⾯性能和⽤户体验）
const channel = new MessageChannel()
const port = channel.port2
// port1 来监听 (收到到消息)
channel.port1.onmessage = function performWorkUntilDeadline() {
  if (isMessageLoopRunning) {
    const currentTime = getCurrentTime()
    // 记录当前 work 的开始时间，作用是: 与 shouldYieldToHost 函数检测，是否应该交还控制权给主线程
    startTime = currentTime

    let hasMoreWork = true
    try {
      hasMoreWork = flushWork(currentTime)
    } finally {
      if (hasMoreWork) {
        // 还有更多的任务，继续执行
        schedulePerformWorkUntilDeadline()
      } else {
        // 否则结束这次宏任务
        isMessageLoopRunning = false
      }
    }
  }
}
// port2 用来触发
function schedulePerformWorkUntilDeadline() {
  port.postMessage(null)
}

function flushWork(initalTime: number) {
  // 主线程在调度结束
  isHostCallbackScheduled = false
  // 接下来是 work 执行过程
  isPerformingWork = true

  const previousPriorityLevel = currentPriorityLevel

  try {
    return workLoop(initalTime)
  } finally {
    // 本次 work 执行完毕，清空数据
    currentTask = null
    // 为什么提前保存，为什么要恢复 ？？？
    currentPriorityLevel = previousPriorityLevel

    isPerformingWork = false
  }
}

// 一个 work 时间内需要执行多个 tasks
function workLoop(initalTime: number): boolean {
  let currentTime = initalTime
  currentTask = peek(taskQueue)

  while(currentTask !== null) {
    if (currentTask.expirationTime > currentTime && shouldYieldToHost()) {
      break
    }

    const callback = currentTask.callback

    if (isFn(callback)) {
      // 有效任务
      currentTask.callback = null // 一个任务执行的时间可能比较久，防止重复执行
      // ？？？
      currentPriorityLevel = currentTask.priorityLevel
      // 不太理解 ？？？
      const didUserCbTimeout = currentTask.expirationTime <= currentTime
      // case: ？？？
      const continuationCallback = callback(didUserCbTimeout)

      if (isFn(continuationCallback)) {
        // 还有剩余的任务，保留下来，下次继续执行
        currentTask.callback = continuationCallback
        return true
      } else {
        // 可能有其他任务添加进来，可能不是堆顶位置了
        // 当前任务前面已经 cb 设置为 null了，等待再次到达堆顶的时候，走无效任务直接del
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue)
        }
      }
    } else {
      // 无效任务，删除
      pop(taskQueue)
    }
    // 获取下一个任务
    currentTask = peek(taskQueue)
  }

  if (currentTask !== null) {
    // 还有剩余的任务
    return true
  } else {
    return false
  }
}

function cancelCallback() {}

function getCurrentPriorityLevel() {
  return currentPriorityLevel
}
// 应该交还控制权给主线程
function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime

  if (timeElapsed < frameInterval) {
    return false
  }

  return true
}

export {
  ImmediatePriority,
  UserBlockingPriority,
  NormalPriority,
  IdlePriority,
  LowPriority,
  scheduleCallback, // 某个任务进入调度器，等待调度
  cancelCallback, // 取消某个任务，由于最⼩堆没法直接删除，因此只能初步把 task.
  getCurrentPriorityLevel, // 获取当前正在执⾏任务的优先级
  shouldYieldToHost as shouldYield, // 把控制权交换给主线程
}