import { FiberRoot, Fiber } from './internal-types'
import {NormalPriority} from 'scheduler/src/priorities'
import { scheduleCallback } from 'scheduler/src/scheduler'
import {performConcurrentWorkOnRoot} from './fiber-work-loop'

export function ensureRootIsScheduled(root: FiberRoot) {
  queueMicrotask(() => {
    scheduleTaskForRootDuringMicrotask(root)
  })
}
// 在微任务期间为 root 安排任务
function scheduleTaskForRootDuringMicrotask(root: FiberRoot) {
  scheduleCallback(NormalPriority, performConcurrentWorkOnRoot.bind(null, root))
}