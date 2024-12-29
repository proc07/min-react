import { Placement, Update } from './fiber-flags'
import { FiberRoot, Fiber } from './internal-type'
import { HostComponent, HostRoot } from './work-tags'

export function commitMutationEffects(root: FiberRoot, finishedWork: Fiber) {
  // 遍历 fiber 节点
  recursivelyTraverseMutationEffects(root, finishedWork)
  // 根据 flags 来操作
  commitReconciliationEffects(finishedWork)
}

function recursivelyTraverseMutationEffects(root: FiberRoot, parentFiber: Fiber) {
  let child = parentFiber.child

  while (child !== null) {
    commitMutationEffects(root, child)
    child = child.sibling
  }
}

function commitReconciliationEffects(finishedWork: Fiber) {
  const flags = finishedWork.flags

  if (flags & Placement) {
    // 页面初次渲染。新增插入节点
    commitPlacement(finishedWork)
    // Placement 位被清零，其他位保持不变。
    finishedWork.flags &= ~Placement
  } else if (flags & Update) {

  }
}

function commitPlacement(finishedWork: Fiber) {
  if (finishedWork.stateNode && finishedWork.tag === HostComponent) {
    // finishedWork 是一个 dom 节点
    const childDom = finishedWork.stateNode
    const parentFiber =  getHostParentFiber(finishedWork)
    let parentDom = parentFiber.stateNode

    if (parentDom.containerInfo) {
      // 针对 root 节点（only）
      parentDom = parentDom.containerInfo
    }

    parentDom.appendChild(childDom)
  }
}

function getHostParentFiber(fiber: Fiber) {
  let parnet = fiber.return

  while (parnet !== null) {
    if (parnet.tag === HostComponent || parnet.tag === HostRoot) {
      return parnet
    }
    parnet = parnet.return
  }

  throw new Error('getHostParentFiber')
}
