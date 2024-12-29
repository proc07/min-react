import { ReactNodeList } from 'shared/types'
import { FiberRoot, Container } from './internal-type'
import {scheduleUpdateOnFiber} from './fiber-work-loop.ts'

export function updateContainer(element: ReactNodeList, container: FiberRoot) {
  // 1, 获取 current
  const current = container.current
  current.memoizedState = {
    element,
  }

  console.log('current', current)

  // 2，调度更新
  scheduleUpdateOnFiber(container, current)
}