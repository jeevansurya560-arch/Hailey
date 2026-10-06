/**
 * Maps tag kind to design token color variable per System Design §11.1
 */
export function getThreadColor(kind) {
  switch (kind) {
    case 'culture':
    case 'place':
      return 'var(--clay)'
    case 'music':
      return 'var(--indigo)'
    case 'fashion':
      return 'var(--rose)'
    case 'food':
      return 'var(--saffron)'
    case 'art':
      return 'var(--teal)'
    case 'film':
      return 'var(--plum)'
    case 'heritage':
    case 'language':
      return 'var(--moss)'
    case 'internet':
      return 'var(--onchain)'
    default:
      return 'var(--clay)'
  }
}
