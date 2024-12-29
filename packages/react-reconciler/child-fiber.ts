import { createFiberFromElement, createFiberFromText } from "./fiber";
import { Fiber } from "./internal-types";
import { REACT_ELEMENT_TYPE } from "shared/symbols";
import { Placement } from "./fiber-flags";
import { ReactElement } from "shared/types";
import {isArray} from 'shared/utils'

type ChildReconciler = (
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChild: any) => Fiber | null

export const reconcileChildFibers: ChildReconciler = createChildReconciler(true)
export const mountChildFibers: ChildReconciler = createChildReconciler(false)

function createChildReconciler(shouldTrackSideEffects: boolean) {
  // 给 fiber 节点添加 flags
  function placeSingleChild(newFiber: Fiber) {
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      // 刚刚创建的节点 (flags 用来标记节点create update del)
      newFiber.flags |= Placement
    }
    return newFiber
  }
  // （协调）创建单个节点的 fiber
  function reconcileSingleElement(returnFiber: Fiber, currentFirstChild: Fiber| null, newChild: ReactElement) {
    let createdFiber = createFiberFromElement(newChild)
    createdFiber.return = returnFiber
    return createdFiber
  }

  function reconcileSingleTextNode(eturnFiber: Fiber, currentFirstChild: Fiber| null, textContent: string) {
    let createdFiber = createFiberFromText(textContent)
    createdFiber.return = returnFiber
    return createdFiber
  }

  function createChild(returnFiber: Fiber, newChild: ReactElement) {
    if (isText(newChild)) {
      // reconcileSingleTextNode
      let createdFiber = createFiberFromText(`${newChild}`) //newChild maybe number
      createdFiber.return = returnFiber
      return createdFiber
    }
    if (typeof newChild === 'object' && newChild !== null) {
      switch(newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          const created = createFiberFromElement(newChild)
          created.return = returnFiber
          return created
      }
    }

    return null
  }

  function reconileChildrenArray(returnFiber: Fiber, currentFirstChild: Fiber| null, newChildren: ReactElement[]) {
    let newIndex = 0
    let resultFirstChild: Fiber| null = null
    let oldFiber = currentFirstChild
    let prevNewFiber: Fiber| null = null

    if (oldFiber === null) {
      // 初次渲染
      for (; newIndex < newChildren.length; newIndex++) {
        const newFiber = createChild(returnFiber, newChildren[newIndex])
  
        if (newFiber === null) {
          // 无效的fiber 过滤
          continue
        }
        // 组件更新阶段，判断在更新前后的位置是否一致，如果不一致，则移动
        newFiber.index = newIndex

        if (prevNewFiber === null) {
          resultFirstChild = newFiber
        } else {
          prevNewFiber.sibling = newFiber
        }
        // 保存上一步的 fiber
        prevNewFiber = newFiber
       }

      return resultFirstChild
    } else {

    }
    return resultFirstChild
  } 

  function reconcileChildFibers(returnFiber: Fiber, currentFirstChild: Fiber| null, newChildren: ReactElement) {
    // 检查 newchild 类型，单个节点，文本，数组
    if (isText(newChildren)) {
      return placeSingleChild(
        reconcileSingleTextNode(returnFiber, currentFirstChild, newChildren)
      )
    }

    if (typeof newChildren === 'object' && newChildren !== null) {
      switch(newChildren.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFirstChild, newChildren)
          )
      }
    }

    // 子节点数组
    if (isArray(newChildren)) {
      return reconileChildrenArray(returnFiber, currentFirstChild, newChildren)
    }

    return null
  }
  return reconcileChildFibers
}

function isText(newChild: any) {
  return (
    (typeof newChild === "string" && newChild !== "") ||
    typeof newChild === "number"
  );
}