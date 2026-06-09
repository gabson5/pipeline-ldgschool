const BASE_URL = `https://${process.env.UNIPILE_DSN}`
const API_KEY  = process.env.UNIPILE_API_KEY!

// ---- Types ----------------------------------------------------------------

export interface ChatStartedResponse {
  object:     'ChatStarted'
  chat_id:    string | null
  message_id: string | null
}

export interface MessageSentResponse {
  object:     'MessageSent'
  message_id: string | null
}

// ---- Helpers ---------------------------------------------------------------

function headers() {
  return { 'X-API-KEY': API_KEY }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(`Unipile ${res.status}: ${body?.detail ?? res.statusText}`)
  }
  return res.json() as Promise<T>
}

// ---- Functions -------------------------------------------------------------

/**
 * Démarre une nouvelle conversation LinkedIn et envoie le premier message.
 * @param accountId   ID du compte Unipile connecté
 * @param providerId  ID LinkedIn du destinataire (format ACo..., ACw..., etc.)
 * @param text        Texte du message
 */
export async function startLinkedInChat(
  accountId:  string,
  providerId: string,
  text:       string,
): Promise<ChatStartedResponse> {
  const form = new FormData()
  form.append('account_id',     accountId)
  form.append('attendees_ids[]', providerId)
  form.append('text',           text)

  const res = await fetch(`${BASE_URL}/api/v1/chats`, {
    method:  'POST',
    headers: headers(),
    body:    form,
  })

  return handleResponse<ChatStartedResponse>(res)
}

export interface ProspectionResult {
  chat_id:    string | null
  message_id: string | null
}

/**
 * Point d'entrée unique pour la prospection.
 * - Si `chatId` est fourni : envoie dans le chat existant.
 * - Sinon : démarre une nouvelle conversation avec `providerId`.
 */
export async function sendProspectionMessage(params: {
  accountId:   string
  text:        string
  chatId?:     string
  providerId?: string
}): Promise<ProspectionResult> {
  const { accountId, text, chatId, providerId } = params

  if (chatId) {
    const res = await sendLinkedInMessage(chatId, text)
    return { chat_id: chatId, message_id: res.message_id }
  }

  if (!providerId) throw new Error('providerId requis pour démarrer une nouvelle conversation')

  const res = await startLinkedInChat(accountId, providerId, text)
  return { chat_id: res.chat_id, message_id: res.message_id }
}

/**
 * Envoie un message dans une conversation LinkedIn existante.
 * @param chatId  ID Unipile du chat
 * @param text    Texte du message
 */
export async function sendLinkedInMessage(
  chatId: string,
  text:   string,
): Promise<MessageSentResponse> {
  const form = new FormData()
  form.append('text', text)

  const res = await fetch(`${BASE_URL}/api/v1/chats/${chatId}/messages`, {
    method:  'POST',
    headers: headers(),
    body:    form,
  })

  return handleResponse<MessageSentResponse>(res)
}
