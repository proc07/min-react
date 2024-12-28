// 左位移运算符 <<，将一个数字的二进制表示向左移动指定的位数，右侧空出的位用零填充。

// 有符号位移 >>，向右移动 n 位。使用符号位（根据二进制第一位数是 0正数 或 1负数）来填充空位。

// (9-1) >>> 1  或 (10-1) >>> 1  结果: 4
// 无符号右移运算 >>>，向右移动 n 位（左侧的空位都会被填充为0）。在二进制中，右移1位相当于将该数除以2并向下取整。

export type Heap<T extends Node> = T[]

export type Node = {
  id: number // 任务 id
  sortIndex: number // 排序索引
}

function compare(a: Node, b: Node) {
  const diff = a.sortIndex - b.sortIndex
  return diff !== 0 ? diff : a.id - b.id
}

export function peek<T extends Node>(heap: Heap<T>): T | null {
  return heap.length === 0 ? null : heap[0]
}

export function push<T extends Node>(heap: Heap<T>, node: T): void{
  // 1.先把node放到堆的最后
  const index = heap.length;
  heap.push(node);
  // 2.调整最小堆，从下往上（与父节点比较，替换）
  siftUp(heap, node, index)
}

function siftUp<T extends Node>(heap: Heap<T>, node: T, i: number): void {
  let index = i

  while(index > 0) {
    const parentIndex = (index - 1) >>> 1
    const parentNode = heap[parentIndex]
    if (compare(parentNode, node) > 0) {
      // parent > child, 子节点更小
      heap[parentIndex] = node
      heap[index] = parentNode
      index = parentIndex
    } else {
      return
    }
  }
}

export function pop<T extends Node>(heap: Heap<T>): T | null {
  if (heap.length === 0) {
    return null
  }

  const first = heap[0] // save first node
  const last = heap.pop()! // del last node
  if (first !== last) {
    // 防止 heap 只有 1 个 Node
    heap[0] = last
    siftDown(heap, last, 0)
  }

  return first
}

function siftDown<T extends Node>(heap: Heap<T>, node: T, i: number): void {
  let index = i
  const length = heap.length
  const halfLength = length >>> 1

  while(index < halfLength) {
    const leftIndex = (index + 1) * 2 - 1 // 公式：获取左边的子节点
    const leftNode = heap[leftIndex]
    const rightIndex = leftIndex + 1
    const rightNode = heap[rightIndex]
    // left node 更小
    if (compare(leftNode, node) < 0) {
      if (rightIndex < length && compare(rightNode, leftNode) < 0) {
        // right node 更小
        heap[index] = rightNode
        heap[rightIndex] = node
        index = rightIndex
      } else {
        // (left node 更小)或(right node 不存在)
        heap[index] = leftNode
        heap[leftIndex] = node
        index = leftIndex
      }
    } else if (rightIndex < length && compare(rightNode, node) < 0) {
        // 发现左节点更大，接着和右节点对比是否小于当前node
        heap[index] = rightNode
        heap[rightIndex] = node
        index = rightIndex
    } else {
      return
    }
  }
}