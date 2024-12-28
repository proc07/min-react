import { describe, expect, it } from 'vitest'
import {peek, Heap ,Node, push, pop} from '../src/min-heap'

let id = 0
function createNode(val: number): Node {
  return { id: id++, sortIndex: val }
}

describe('test min heap', () => {
  it('empty heap case', () => {
    const tasks = []
    expect(peek(tasks)).toBe(null)
  })
  it('min heap length === 1 case', () => {
    const tasks = [createNode(1)]
    expect(peek(tasks)?.sortIndex).toEqual(1)
  })
  it('min heap case', () => {
    const tasks: Heap<Node> = [createNode(1)]
    push(tasks, createNode(2))
    push(tasks, createNode(3))
    push(tasks, createNode(4))
    expect(peek(tasks)?.sortIndex).toEqual(1)
    push(tasks, createNode(0))
    expect(peek(tasks)?.sortIndex).toEqual(0)
    pop(tasks)
    expect(peek(tasks)?.sortIndex).toEqual(1)
  })
})