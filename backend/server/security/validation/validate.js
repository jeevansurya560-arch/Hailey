const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function validateApproveItemInput(body) {
  if (!body || typeof body !== 'object') {
    return { data: null, error: 'Request body must be a JSON object' }
  }

  const payload = body

  if (!payload.itemId || typeof payload.itemId !== 'string') {
    return { data: null, error: 'itemId is required and must be a string' }
  }

  if (!UUID_REGEX.test(payload.itemId)) {
    return { data: null, error: 'itemId must be a valid UUID' }
  }

  if (!payload.action || (payload.action !== 'approve' && payload.action !== 'reject')) {
    return { data: null, error: "action is required and must be either 'approve' or 'reject'" }
  }

  return {
    data: {
      itemId: payload.itemId,
      action: payload.action,
    },
    error: null,
  }
}

export function validateProposeItemInput(body) {
  if (!body || typeof body !== 'object') {
    return { data: null, error: 'Request body must be a JSON object' }
  }

  const payload = body

  if (!payload.collectionId || typeof payload.collectionId !== 'string' || !UUID_REGEX.test(payload.collectionId)) {
    return { data: null, error: 'collectionId is required and must be a valid UUID' }
  }

  if (!payload.kind || !['post', 'link', 'note'].includes(payload.kind)) {
    return { data: null, error: "kind must be one of 'post', 'link', or 'note'" }
  }

  if (payload.kind === 'post') {
    if (!payload.postId || typeof payload.postId !== 'string' || !UUID_REGEX.test(payload.postId)) {
      return { data: null, error: 'postId is required and must be a valid UUID when kind is post' }
    }
  }

  if (payload.kind === 'link') {
    if (!payload.url || typeof payload.url !== 'string' || !/^https?:\/\//.test(payload.url)) {
      return { data: null, error: 'url is required and must start with http:// or https:// when kind is link' }
    }
  }

  if (payload.note && (typeof payload.note !== 'string' || payload.note.length > 500)) {
    return { data: null, error: 'note must be a string with maximum 500 characters' }
  }

  return {
    data: {
      collectionId: payload.collectionId,
      kind: payload.kind,
      postId: payload.postId || null,
      url: payload.url || null,
      note: payload.note || null,
    },
    error: null,
  }
}
