import {  Fiber } from './internal-type'
import { HostComponent, HostRoot } from './work-tags'
import {isStr, isNum} from 'shared/utils'

export function completeWork(current: Fiber | null, workInProgress: Fiber) {
  switch(workInProgress.tag) {
    case HostRoot:
      return null
    case HostComponent:
      // 原生标签
      const {type} = workInProgress
      // 创建真实dom
      const instance = document.createElement(type)
      // 初始化DOM属性
      finalizeInitialChildren(instance, workInProgress.pendingProps);
      // 添加子节点到父节点
      appendAllChildren(instance, workInProgress)

      workInProgress.stateNode = instance

      return null
  }
  throw new Error('completeWork error')
}

// 初始化属性
function finalizeInitialChildren(domElement: Element, props: any) {
  for (const propKey in props) {
    const nextProp = props[propKey];
    
    if (propKey === "children") {
      if (isStr(nextProp) || isNum(nextProp)) {
        // 属性
        domElement.textContent = nextProp.toString();
      }
    } else {
        // 3. 设置属性
        (domElement as any)[propKey] = nextProp;
    }
  }
}

function appendAllChildren(parent: Element, workInProgress: Fiber) {
  let nodeFiber = workInProgress.child;
  if (nodeFiber) {
    parent.appendChild(nodeFiber.stateNode);  
  }
}