import {  Fiber } from './internal-type'
import { HostComponent, HostRoot } from './work-tags'
import {mountChildFibers, reconcileChildFibers} from './child-fiber'
import {isStr, isNum} from 'shared/utils'

// 1.处理当前 fiber， 不同组件对应的fiber 处理方式不同。返回子节点
export function beginWork(current: Fiber | null, workInProgress: Fiber) {
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(current, workInProgress)
    case HostComponent:
      return updateHostComponent(current, workInProgress)
  }
  throw new Error('无法处理当前 fiber 的组件类型')
}

function updateHostRoot(current: Fiber | null, workInProgress: Fiber) {
  const nextChildren = workInProgress.memoizedState.element

  reconcileChildren(current, workInProgress, nextChildren)

  return workInProgress.child
}
function updateHostComponent(current: Fiber | null, workInProgress: Fiber) {
  const { type } = workInProgress;
  let nextChildren = workInProgress.pendingProps.children;
  const isDirectTextChild = shouldSetTextContent(type, workInProgress.pendingProps);

  if (isDirectTextChild) {
    // ⽂本属性
    nextChildren = null;
    return null;
  }

  reconcileChildren(current, workInProgress, nextChildren);
  
  return workInProgress.child;
}

// 协调子节点
function reconcileChildren(current: Fiber | null, workInProgress: Fiber, nextChildren: any) {
  if (current === null) {
    // 初次渲染
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren)
  } else {
    // 更新
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren)
  }
}

function shouldSetTextContent(type: string, props: any): boolean {
  return (
    type === "textarea" ||
    type === "noscript" ||
    isStr(props.children) ||
    isNum(props.children) ||
    (typeof props.dangerouslySetInnerHTML === "object" &&
    props.dangerouslySetInnerHTML !== null &&
    props.dangerouslySetInnerHTML.__html != null)
  );
}