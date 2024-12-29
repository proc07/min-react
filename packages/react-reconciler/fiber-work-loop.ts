import { FiberRoot, Fiber } from './internal-type'
import {ensureRootIsScheduled} from './fiber-root-scheduler'
import { createWorkInProgress } from './fiber'
import { beginWork } from './begin-work'
import { completeWork } from './complete-work'
import { commitMutationEffects } from './commit-work'

type ExecutionContext = number;

export const NoContext = /* */ 0b000;
const BatchedContext = /* */ 0b001;
export const RenderContext = /* */ 0b010;
export const CommitContext = /* */ 0b100;

// Describes where we are in the React execution stack
let executionContext: ExecutionContext = NoContext

let workInProgress: Fiber | null = null
let workInProgressRoot: FiberRoot | null = null
//  fiber 计划更新
export function scheduleUpdateOnFiber(root: FiberRoot, current: Fiber) {
  workInProgressRoot = root
  workInProgress = current

  ensureRootIsScheduled(root)
}
// 在 root 上执行并发工作
export function performConcurrentWorkOnRoot(root: FiberRoot) {
  // 1.render 构建fiber 树 （vdom）
  renderRootSync(root)
  // 2.commit vdom -> dom
  const finishedWork = root.current.alternate
  root.finishedWork = finishedWork
  commitRoot(root)
}

function commitRoot(root: FiberRoot) {
  const prevExecutionContext = executionContext
  // 1. commit 阶段初始化
  executionContext |= CommitContext // (如果某个位上至少有一个是 1，结果就是 1；否则结果是 0)
  // 2. mutation 阶段，渲染dom树
  commitMutationEffects(root, root.finishedWork as Fiber)

  // 4. render 结束，需要恢复一些数据
  executionContext = prevExecutionContext
  workInProgress = null
}


// 同步渲染根节点
function renderRootSync(root: FiberRoot) {
  const prevExecutionContext = executionContext
  // 1. render 阶段初始化
  executionContext |= RenderContext // (如果某个位上至少有一个是 1，结果就是 1；否则结果是 0)
  // 2. 初始化
  prepareFreshStack(root)
  // 3. 递归构建 fiber 树
  workLoopSync()
  // 4. render 结束，需要恢复一些数据
  executionContext = prevExecutionContext
  workInProgress = null
}
// 准备新的堆栈(创建 an alternate fiber)
function prepareFreshStack(root: FiberRoot): Fiber {
  root.finishedWork = null;

  workInProgressRoot = root; // FiberRoot

  // create an alternate fiber
  const rootWorkInProgress = createWorkInProgress(root.current, null);
  
  workInProgress = rootWorkInProgress; // Fiber
  
  return rootWorkInProgress;
}
// 工作循环同步
function workLoopSync() {
  while(workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}
// 执行工作单元
function performUnitOfWork(unitOfWork: Fiber) {
  const current = unitOfWork.alternate

  // 1. begin work
  // 这2个参数都是 fiber，区别是
  let next = beginWork(current, unitOfWork)
  
  if (next === null) {
    // 2.complete work
    completeUnitOfWork(unitOfWork)
  } else {
    workInProgress = next as Fiber
  }
}
// 深度优先遍历，子节点，兄弟节点
function completeUnitOfWork(unitOfWork: Fiber) {
  let completedWork = unitOfWork

  do {
    const currentFiber = completedWork.alternate // 备用fiber
    const returnFiber = completedWork.return as Fiber // 父节点fiber
    // 下一个节点
    let next = completeWork(currentFiber, completedWork)

    if (next !== null) {
      // children mode
      workInProgress = next
      return
    }

    const siblingFiber = completedWork.sibling

    if (siblingFiber !== null) {
      workInProgress = siblingFiber
      return
    }

    completedWork = returnFiber

    workInProgress = completedWork

  } while (completedWork !== null);
}