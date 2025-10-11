// Universal LLM Client - Switch between OpenAI and Ollama (FREE!)
// Ollama runs locally via Docker and has UNLIMITED tokens with NO rate limits

interface LLMResponse {
  content: string
  model: string
  tokens_used?: number
}

interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface LLMOptions {
  model?: string
  temperature?: number
  max_tokens?: number
  response_format?: { type: 'json_object' }
}

/**
 * Call Ollama API (FREE, UNLIMITED, runs locally in Docker)
 * Docker endpoint: http://localhost:11434
 */
async function callOllama(
  messages: LLMMessage[],
  options: LLMOptions = {}
): Promise<LLMResponse> {
  const {
    model = 'llama3.1:8b', // 8B model - fast, good quality
    temperature = 0.7,
  } = options

  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature,
        num_predict: options.max_tokens
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  return {
    content: data.message.content,
    model: data.model,
    tokens_used: data.eval_count || 0
  }
}

/**
 * Call OpenAI API (paid, rate limited)
 */
async function callOpenAI(
  messages: LLMMessage[],
  options: LLMOptions = {}
): Promise<LLMResponse> {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    max_tokens = 4000,
    response_format
  } = options

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
      response_format
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`OpenAI error: ${response.status} ${error.error?.message || response.statusText}`)
  }

  const data = await response.json()

  return {
    content: data.choices[0].message.content,
    model: data.model,
    tokens_used: data.usage.total_tokens
  }
}

/**
 * Universal LLM client - automatically chooses best provider
 *
 * Priority:
 * 1. Ollama (if available) - FREE, UNLIMITED, LOCAL
 * 2. OpenAI (fallback) - Paid, rate limited
 *
 * Usage:
 * ```ts
 * const result = await callLLM([
 *   { role: 'system', content: 'You are a helpful assistant' },
 *   { role: 'user', content: 'Analyze this transcript...' }
 * ], {
 *   model: 'llama3.1:8b', // Ollama
 *   // model: 'gpt-4o-mini', // OpenAI
 *   temperature: 0.7
 * })
 * ```
 */
export async function callLLM(
  messages: LLMMessage[],
  options: LLMOptions = {}
): Promise<LLMResponse> {
  const preferredProvider = process.env.LLM_PROVIDER || 'ollama'

  try {
    if (preferredProvider === 'ollama') {
      console.log(`🦙 Using Ollama (FREE, unlimited) - model: ${options.model || 'llama3.1:8b'}`)
      return await callOllama(messages, options)
    } else if (preferredProvider === 'openai') {
      console.log(`🤖 Using OpenAI (paid) - model: ${options.model || 'gpt-4o-mini'}`)
      return await callOpenAI(messages, options)
    } else {
      throw new Error(`Unknown LLM provider: ${preferredProvider}`)
    }
  } catch (error: any) {
    // If Ollama fails, fall back to OpenAI
    if (preferredProvider === 'ollama') {
      console.warn(`⚠️  Ollama failed (${error.message}), falling back to OpenAI...`)
      return await callOpenAI(messages, { ...options, model: 'gpt-4o-mini' })
    }
    throw error
  }
}

/**
 * Helper for JSON-mode responses
 */
export async function callLLMForJSON<T>(
  messages: LLMMessage[],
  options: Omit<LLMOptions, 'response_format'> = {}
): Promise<T> {
  const result = await callLLM(messages, {
    ...options,
    response_format: { type: 'json_object' }
  })

  try {
    return JSON.parse(result.content)
  } catch (error) {
    console.error('Failed to parse LLM JSON response:', result.content)
    throw new Error('LLM did not return valid JSON')
  }
}

/**
 * Check if Ollama is available
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(2000) // 2 second timeout
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * List available Ollama models
 */
export async function getOllamaModels(): Promise<string[]> {
  try {
    const response = await fetch('http://localhost:11434/api/tags')
    if (!response.ok) return []

    const data = await response.json()
    return data.models?.map((m: any) => m.name) || []
  } catch {
    return []
  }
}
