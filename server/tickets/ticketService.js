/**
 * Re-exports canonical ticket service from server/services/tickets/ticketService.js
 * Retains backward compatibility for existing callers and tests.
 */
export {
  normalizeAddress,
  issueTicket,
  verifyTicketAccess,
  revokeTicket,
  consumeTicket,
} from '../services/tickets/ticketService.js'
