import { createFiberFromElement, createFiberFromText, createFiberFromFragment } from "./fiber";
import { Fiber } from "./internal-types";
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from "shared/symbols";
import { Placement, ChildDeletion } from "./fiber-flags";
import { ReactElement } from "shared/types";
import {isArray} from 'shared/utils'
import { createWorkInProgress } from './fiber'

type ChildReconciler = (
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChild: any
) => Fiber | null

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

  function useFiber(fiber: Fiber, pendingProps: any): Fiber {
    const clone = createWorkInProgress(fiber, pendingProps);
    clone.index = 0;
    clone.sibling = null;
    return clone;
  }

  function deleteChild(returnFiber: Fiber, childToDelete: Fiber) {
    if (!shouldTrackSideEffects) {
      return
    }

    const deletions = returnFiber.deletions

    if (deletions === null) {
      returnFiber.deletions = [childToDelete]
      returnFiber.flags |= ChildDeletion
    } else {
      returnFiber.deletions!.push(childToDelete)
    }
  }
  // 删除当前子节点，以及后面全部的兄弟节点
  function deleterenaububgChildren(returnFiber: Fiber, currentFirstChild: Fiber) {
    if (!shouldTrackSideEffects) {
      return
    }

    let childToDelete:Fiber| null  = currentFirstChild;
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }
    return null;
  }

  // （协调）创建单个节点的 fiber
  function reconcileSingleElement(returnFiber: Fiber, currentFirstChild: Fiber| null, element: ReactElement) {
    // 节点复用的条件
    // 1.同一层级，key 相同，type 相同
    const key = element.key // 新 key
    let child = currentFirstChild // 旧节点fiber

    while (child !== null) {
      // key 相同，type 相同
      if (child.key === key) {
        // 复用
        if (child.elementType === element.type) {
          const existing = useFiber(child, element.props);
          existing.return = returnFiber;
          return existing;
        } else {
          // 同一层级下不应该存在2个相同 key 的元素，删除
          deleterenaububgChildren(returnFiber, child)
          break;
        }
      } else {
        deleteChild(returnFiber, child)
      }

      // 当前节点不同，对比下一个兄弟节点
      child = child.sibling
    }

    let createdFiber = createFiberFromElement(element)
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

  function reconcileChildFibers(returnFiber: Fiber, currentFirstChild: Fiber| null, newChildren: ReactElement | string) {
    // 检查 newchild 类型，单个节点，文本，数组
    if (isText(newChildren)) {
      return placeSingleChild(
        reconcileSingleTextNode(returnFiber, currentFirstChild, newChildren as string)
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