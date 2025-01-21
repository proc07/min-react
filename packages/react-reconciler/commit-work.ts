import { Placement, Update, ChildDeletion } from './fiber-flags'
import { FiberRoot, Fiber } from './internal-types'
import { HostComponent, HostRoot, HostText } from './work-tags'
import {isHost} from './complete-work'

export function commitMutationEffects(root: FiberRoot, finishedWork: Fiber) {
  // 递归遍历 fiber 节点
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

  } else if (flags & ChildDeletion) {
    // 删除节点
    // 获取父节点
    const parnetFiber = isHostParent(finishedWork) ? finishedWork : getHostParentFiber(finishedWork)
    // 删除节点
    commitDeletions(finishedWork.deletions!, parnetFiber.stateNode)

    finishedWork.flags &= ~ChildDeletion
    finishedWork.deletions = null
  }
}
// 删除dom节点，根据 父 dom 删除 子 dom
function commitDeletions(deletions: Fiber[], parnetDom: Element) {
  deletions?.forEach((deletion) => {
    // deletion 不一定有子节点, 有可能是一个 fragment
    console.log('commitDeletions', getStateNode(deletion), deletion)
    parnetDom.removeChild(getStateNode(deletion))
  });
}

function getStateNode(fiber: Fiber) {
  let node = fiber;
  while (1) {
    if (isHost(node) && node.stateNode) {
      return node.stateNode;
    }
    node = node.child as Fiber;
  }
}

function commitPlacement(finishedWork: Fiber) {
  if (finishedWork.stateNode && (
    finishedWork.tag === HostComponent || finishedWork.tag === HostText
  )) {
    // finishedWork 是一个 dom 节点
    const childDom = finishedWork.stateNode
    const parentFiber =  getHostParentFiber(finishedWork)
    let parentDom = parentFiber.stateNode

    if (parentDom.containerInfo) {
      // 针对 root 节点（only）
      parentDom = parentDom.containerInfo
    }

    parentDom.appendChild(childDom)
  } else {
    // 最外层是 fragment node. eg. render(<>123</>)
    let child = finishedWork.child

    while(child !== null) {
      commitPlacement(child)
      child = child.sibling
    }
  }
}

function getHostParentFiber(fiber: Fiber) {
  let parnet = fiber.return

  while (parnet !== null) {
    if (isHostParent(parnet)) {
      return parnet
    }
    parnet = parnet.return
  }

  throw new Error('getHostParentFiber')
}

function isHostParent(fiber: Fiber) {
  return fiber.tag === HostComponent || fiber.tag === HostRoot
}