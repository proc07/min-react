import {  Fiber } from './internal-types'
import { ClassComponent, FunctionComponent, Fragment, HostComponent, HostRoot, HostText } from './work-tags'
import {mountChildFibers, reconcileChildFibers} from './child-fiber'
import {isStr, isNum} from 'shared/utils'
import { renderWithHooks } from './fiber-hooks'

// 1.处理当前 fiber， 不同组件对应的fiber 处理方式不同。返回子节点
export function beginWork(current: Fiber | null, workInProgress: Fiber) {
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(current, workInProgress)
    case HostComponent:
      return updateHostComponent(current, workInProgress)
    case HostText:
      return updateHostText(current, workInProgress)
    case Fragment:
      return updateHostFragment(current, workInProgress)
    // case ClassComponent:
    case FunctionComponent:
      return updateFunctionComponent(current, workInProgress)
  }
  throw new Error('无法处理当前 fiber 的组件类型')
}

function updateHostRoot(current: Fiber | null, workInProgress: Fiber) {
  const nextChildren = workInProgress.memoizedState.element

  reconcileChildren(current, workInProgress, nextChildren)

  if (current) {
    // 更新阶段，workInProgress.child 复用的节点连接父级
    current.child = workInProgress.child
  }

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

function updateHostText(current: Fiber | null, workInProgress: Fiber) {
  // 文本没有子节点，不需要协调
  return null
}

function updateHostFragment(current: Fiber | null, workInProgress: Fiber) {
  const nextChildren = workInProgress.pendingProps.children

  reconcileChildren(current, workInProgress, nextChildren)

  return workInProgress.child
}

function updateFunctionComponent(current: Fiber | null, workInProgress: Fiber) {
  const { type, pendingProps } = workInProgress
  // const children = type(pendingProps)
  const children = renderWithHooks(current, workInProgress, type, pendingProps)

  reconcileChildren(current, workInProgress, children)

  return workInProgress.child
}

// 协调子节点
// 函数在处理子节点当中，创建 child dom 对应的 fiber 节点，会把dom节点中的属性值赋值到 fiber 节点当中
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