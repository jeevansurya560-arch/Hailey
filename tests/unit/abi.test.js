import { describe, it, expect } from 'vitest'
import { HAILEY_CONTRIBUTIONS_ABI } from '../../shared/contracts/HaileyContributions.abi.js'

describe('shared/contracts/HaileyContributions.abi.js - Canonical ABI Drift & Structure Test', () => {
  it('exports a valid ABI array', () => {
    expect(Array.isArray(HAILEY_CONTRIBUTIONS_ABI)).toBe(true)
    expect(HAILEY_CONTRIBUTIONS_ABI.length).toBeGreaterThanOrEqual(6)
  })

  it('contains the canonical attest write function with expected parameters', () => {
    const attestFn = HAILEY_CONTRIBUTIONS_ABI.find(
      (item) => item.type === 'function' && item.name === 'attest'
    )
    expect(attestFn).toBeDefined()
    expect(attestFn.stateMutability).toBe('nonpayable')
    expect(attestFn.inputs.map((i) => `${i.name}:${i.type}`)).toEqual([
      'contributor:address',
      'communityId:bytes32',
      'contentHash:bytes32',
      'kind:uint8',
    ])
  })

  it('contains the canonical count read function returning uint32', () => {
    const countFn = HAILEY_CONTRIBUTIONS_ABI.find(
      (item) => item.type === 'function' && item.name === 'count'
    )
    expect(countFn).toBeDefined()
    expect(countFn.stateMutability).toBe('view')
    expect(countFn.inputs.map((i) => `${i.name}:${i.type}`)).toEqual([
      'contributor:address',
      'communityId:bytes32',
    ])
    expect(countFn.outputs[0].type).toBe('uint32')
  })

  it('contains the canonical attested view function returning bool', () => {
    const attestedFn = HAILEY_CONTRIBUTIONS_ABI.find(
      (item) => item.type === 'function' && item.name === 'attested'
    )
    expect(attestedFn).toBeDefined()
    expect(attestedFn.stateMutability).toBe('view')
    expect(attestedFn.inputs[0].type).toBe('bytes32')
    expect(attestedFn.outputs[0].type).toBe('bool')
  })

  it('contains the canonical attestor and setAttestor functions', () => {
    const attestorFn = HAILEY_CONTRIBUTIONS_ABI.find(
      (item) => item.type === 'function' && item.name === 'attestor'
    )
    expect(attestorFn).toBeDefined()
    expect(attestorFn.stateMutability).toBe('view')
    expect(attestorFn.outputs[0].type).toBe('address')

    const setAttestorFn = HAILEY_CONTRIBUTIONS_ABI.find(
      (item) => item.type === 'function' && item.name === 'setAttestor'
    )
    expect(setAttestorFn).toBeDefined()
    expect(setAttestorFn.stateMutability).toBe('nonpayable')
    expect(setAttestorFn.inputs[0].type).toBe('address')
  })

  it('contains the required contract events', () => {
    const attestedEvent = HAILEY_CONTRIBUTIONS_ABI.find(
      (item) => item.type === 'event' && item.name === 'Attested'
    )
    expect(attestedEvent).toBeDefined()
    expect(attestedEvent.inputs.map((i) => i.name)).toEqual([
      'contributor',
      'communityId',
      'contentHash',
      'kind',
      'at',
    ])

    const attestorUpdatedEvent = HAILEY_CONTRIBUTIONS_ABI.find(
      (item) => item.type === 'event' && item.name === 'AttestorUpdated'
    )
    expect(attestorUpdatedEvent).toBeDefined()
  })

  it('contains the canonical custom errors for zero-address and replay guards', () => {
    const errorNames = HAILEY_CONTRIBUTIONS_ABI.filter((item) => item.type === 'error').map(
      (item) => item.name
    )
    expect(errorNames).toContain('NotAttestor')
    expect(errorNames).toContain('AlreadyAttested')
    expect(errorNames).toContain('ZeroAddress')
    expect(errorNames).toContain('ZeroContentHash')
    expect(errorNames).toContain('ZeroCommunityId')
  })
})
