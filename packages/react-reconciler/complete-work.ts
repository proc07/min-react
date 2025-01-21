import {  Fiber } from './internal-types'
import { ClassComponent, Fragment, FunctionComponent, HostComponent, HostRoot, HostText } from './work-tags'
import {isStr, isNum} from 'shared/utils'

// 根据 fiber 信息创建真实 dom 添加到父节点
export function completeWork(current: Fiber | null, workInProgress: Fiber) {
  const newProps =  workInProgress.pendingProps

  switch(workInProgress.tag) {
    case Fragment:
    case HostRoot:
    case FunctionComponent:
    case ClassComponent:
      return null

    case HostComponent:
      // 原生标签
      const {type} = workInProgress

      if (current !== null && workInProgress.stateNode !== null) {
        // 更新节点
        updateHostComponent(current, workInProgress, type, newProps)
      } else {
        // 创建真实dom
        const instance = document.createElement(type)
        // 初始化DOM属性
        finalizeInitialChildren(instance, null, newProps);
        // 添加子节点到父节点
        appendAllChildren(instance, workInProgress)

        workInProgress.stateNode = instance
      }
      return null

    case HostText:
      workInProgress.stateNode = document.createTextNode(newProps)
      return null
  }
  throw new Error('completeWork error')
}

function updateHostComponent(current: Fiber, workInProgress: Fiber, type: string, newProps: any) {
  if (current.memoizedProps !== newProps) {
    // 属性更新
    finalizeInitialChildren(workInProgress.stateNode, current.memoizedProps, newProps)
  }
}

// 初始化dom属性
function finalizeInitialChildren(domElement: Element, prevProps: any, nextProps: any) {
  // 遍历旧的节点属性
  // debugger
  for (const propKey in prevProps) {
    const prevProp = prevProps[propKey];
    if (propKey === "children") {
      if (isStr(prevProp) || isNum(prevProp)) {
        // 属性
        domElement.textContent = "";
      }
    } else {
      if (propKey.startsWith("on")) {
        // 删除事件
        const eventName = propKey.slice(2).toLowerCase();
        domElement.removeEventListener(eventName, prevProp);
      } else {
        if (!(prevProp in nextProps)) {
          (domElement as any)[propKey] = "";
        }
      }
    }
  }

  // 遍历新的props
  for (const propKey in nextProps) {
    const nextProp = nextProps[propKey];
    
    if (propKey === "children") {
      if (isStr(nextProp) || isNum(nextProp)) {
        // 属性
        domElement.textContent = nextProp.toString();
      }
    } else {
      // 3. 设置属性
      if (propKey.startsWith("on")) {
        // 设置事件
        const eventName = propKey.slice(2).toLowerCase();
        domElement.addEventListener(eventName, nextProp);
      } else {
        (domElement as any)[propKey] = nextProp;
      }
    }
  }
}

function appendAllChildren(parent: Element, workInProgress: Fiber) {
  let nodeFiber = workInProgress.child
  // sibling 链表结构
  while (nodeFiber !== null) {
    if (isHost(nodeFiber)) {
      parent.appendChild(nodeFiber.stateNode);
    } else if (nodeFiber.child !== null) {
      // 如果node这个fiber本⾝不直接对应DOM节点，那么就往下找它的⼦节点，直到找到
      nodeFiber = nodeFiber.child;
      continue;
    }

    if (nodeFiber === workInProgress) {
      // 如果当前已经为起始节点，直接退出
      return
    }

    while(nodeFiber.sibling === null) {
      // 同层已经没有节点了，往上一层找
      // <>
      //   <div><h1><h2><h3></div>
      //   <div><h1><h2><h3></div>
      // </>
      if (nodeFiber.return === null || nodeFiber.return === workInProgress) {
        // 1.父级节点为空 2.父级节点为当前函数起始节点
        return
      }
      nodeFiber = nodeFiber.return
    }
    // nodeFiber.sibling 将拿到父级节点的相邻节点，重新赋值
    nodeFiber = nodeFiber.sibling
  }
}

export function isHost(parent: Fiber) {
  return parent.tag === HostComponent || parent.tag === HostRoot
}