import {ReactNodeList} from 'shared/types'
import { createFiberRoot } from 'react-reconciler/fiber-root'
import { FiberRoot, Container } from 'react-reconciler/internal-types'
import {updateContainer} from 'react-reconciler/fiber-reconciler'

type RootType = {
  render: (children: ReactNodeList) => void
  _internalRoot: FiberRoot
}

function ReactDOMRoot (_internalRoot: FiberRoot) {
  this._internalRoot =  _internalRoot
}

ReactDOMRoot.prototype.render = function (children: ReactNodeList) {

  updateContainer(children, this._internalRoot)
}

export function createRoot(container :Container): RootType {
  const root: FiberRoot = createFiberRoot(container)

  // @ts-ignore
  return new ReactDOMRoot(root)
}

export default {
  createRoot
}