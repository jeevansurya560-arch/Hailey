import { describe, it, expect } from 'vitest'
import { validateApproveItemInput, validateProposeItemInput } from '../../backend/server/security/validation/validate.js'

describe('server/security/validation/validate.js - Input Validation Unit Tests', () => {
  describe('validateApproveItemInput', () => {
    it('rejects null or non-object payloads', () => {
      expect(validateApproveItemInput(null).error).toContain('JSON object')
      expect(validateApproveItemInput('string').error).toContain('JSON object')
      expect(validateApproveItemInput(123).error).toContain('JSON object')
    })

    it('rejects missing or non-string itemId', () => {
      expect(validateApproveItemInput({ action: 'approve' }).error).toContain('itemId is required')
      expect(validateApproveItemInput({ itemId: 12345, action: 'approve' }).error).toContain('itemId is required')
    })

    it('rejects invalid non-UUID itemId', () => {
      const res = validateApproveItemInput({ itemId: 'not-a-valid-uuid', action: 'approve' })
      expect(res.error).toContain('valid UUID')
      expect(res.data).toBeNull()
    })

    it('rejects invalid action names', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000'
      expect(validateApproveItemInput({ itemId: validUuid, action: 'delete' }).error).toContain(
        "either 'approve' or 'reject'"
      )
      expect(validateApproveItemInput({ itemId: validUuid, action: '' }).error).toContain(
        "either 'approve' or 'reject'"
      )
    })

    it('accepts valid approve and reject actions with UUID', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000'
      const approveRes = validateApproveItemInput({ itemId: validUuid, action: 'approve' })
      expect(approveRes.error).toBeNull()
      expect(approveRes.data).toEqual({ itemId: validUuid, action: 'approve' })

      const rejectRes = validateApproveItemInput({ itemId: validUuid, action: 'reject' })
      expect(rejectRes.error).toBeNull()
      expect(rejectRes.data).toEqual({ itemId: validUuid, action: 'reject' })
    })
  })

  describe('validateProposeItemInput', () => {
    const validCollUuid = '550e8400-e29b-41d4-a716-446655440001'
    const validPostUuid = '550e8400-e29b-41d4-a716-446655440002'

    it('rejects invalid collectionId', () => {
      expect(validateProposeItemInput({ kind: 'link', url: 'https://example.com' }).error).toContain(
        'collectionId is required'
      )
      expect(
        validateProposeItemInput({ collectionId: 'abc', kind: 'link', url: 'https://example.com' }).error
      ).toContain('valid UUID')
    })

    it('rejects invalid kind', () => {
      expect(
        validateProposeItemInput({ collectionId: validCollUuid, kind: 'video' }).error
      ).toContain("must be one of 'post', 'link', or 'note'")
    })

    it('validates link kind requires valid http/https URL', () => {
      expect(
        validateProposeItemInput({ collectionId: validCollUuid, kind: 'link', url: 'ftp://bad.com' }).error
      ).toContain('must start with http:// or https://')

      expect(
        validateProposeItemInput({ collectionId: validCollUuid, kind: 'link', url: 'not-a-url' }).error
      ).toContain('must start with http:// or https://')
    })

    it('validates post kind requires valid UUID postId', () => {
      expect(
        validateProposeItemInput({ collectionId: validCollUuid, kind: 'post' }).error
      ).toContain('postId is required and must be a valid UUID')

      expect(
        validateProposeItemInput({ collectionId: validCollUuid, kind: 'post', postId: 'invalid' }).error
      ).toContain('postId is required and must be a valid UUID')
    })

    it('rejects notes exceeding 500 characters', () => {
      const longNote = 'a'.repeat(501)
      expect(
        validateProposeItemInput({
          collectionId: validCollUuid,
          kind: 'link',
          url: 'https://valid.com',
          note: longNote,
        }).error
      ).toContain('maximum 500 characters')
    })

    it('accepts valid post proposals', () => {
      const res = validateProposeItemInput({
        collectionId: validCollUuid,
        kind: 'post',
        postId: validPostUuid,
        note: 'Important dispatch',
      })
      expect(res.error).toBeNull()
      expect(res.data.collectionId).toBe(validCollUuid)
      expect(res.data.kind).toBe('post')
      expect(res.data.postId).toBe(validPostUuid)
      expect(res.data.note).toBe('Important dispatch')
    })
  })
})
