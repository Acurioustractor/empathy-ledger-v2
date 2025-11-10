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
 * Call Ollama API (FREE, UNLIMITED, runs locally)
 * Local endpoint: http://localhost:11434
 */
async function callOllama(
  messages: LLMMessage[],
  options: LLMOptions = {}
): Promise<LLMResponse> {
  const {
    model = process.env.OLLAMA_MODEL || 'llama3.1:8b',
    temperature = 0.7,
    response_format
  } = options

  // For JSON requests, add explicit JSON format instruction to system message
  let modifiedMessages = [...messages]
  if (response_format?.type === 'json_object') {
    const systemMessage = modifiedMessages.find(m => m.role === 'system')
    if (systemMessage) {
      systemMessage.content += '\n\nIMPORTANT: You MUST respond with valid JSON only. No explanatory text before or after the JSON. Just pure JSON.'
    } else {
      modifiedMessages.unshift({
        role: 'system',
        content: 'You MUST respond with valid JSON only. No explanatory text before or after the JSON. Just pure JSON.'
      })
    }

    // Also add to last user message as reinforcement
    const lastUserMsg = [...modifiedMessages].reverse().find(m => m.role === 'user')
    if (lastUserMsg) {
      lastUserMsg.content += '\n\nRespond with ONLY valid JSON. No other text.'
    }
  }

  const response = await fetch(`${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: modifiedMessages,
      stream: false,
      options: {
        temperature,
        num_predict: options.max_tokens
      },
      format: response_format?.type === 'json_object' ? 'json' : undefined
    }),
    // Add 5-minute timeout for long transcript analysis with batching
    signal: AbortSignal.timeout(300000)
  })

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  let content = data.message.content

  // Aggressive JSON cleaning for Ollama responses
  if (response_format?.type === 'json_object') {
    // Strip markdown code blocks
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '')

    // Remove common prefixes that LLMs add
    content = content.replace(/^Here is the JSON:?\s*/i, '')
    content = content.replace(/^Here's the JSON:?\s*/i, '')
    content = content.replace(/^After analysis:?\s*/i, '')
    content = content.replace(/^Based on .*?:?\s*/i, '')
    content = content.replace(/^The JSON response is:?\s*/i, '')

    // Try to extract JSON object/array from text
    const jsonMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      content = jsonMatch[1]
    }

    content = content.trim()

    // Validate and attempt to fix common issues
    try {
      JSON.parse(content)
    } catch (e) {
      console.warn('⚠️  Ollama returned invalid JSON, attempting aggressive extraction...')

      // Last resort: find everything between first { and last }
      const firstBrace = content.indexOf('{')
      const lastBrace = content.lastIndexOf('}')

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        content = content.substring(firstBrace, lastBrace + 1)

        try {
          JSON.parse(content)
          console.log('✅ Successfully extracted valid JSON')
        } catch (e2) {
          console.error('❌ Could not extract valid JSON:', e2.message)
          throw new Error(`Ollama returned unparseable JSON: ${content.substring(0, 100)}...`)
        }
      } else {
        throw new Error(`No JSON structure found in Ollama response: ${content.substring(0, 100)}...`)
      }
    }
  }

  return {
    content,
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
    // Only fall back to OpenAI if Ollama was tried as default, not explicitly requested
    if (preferredProvider === 'ollama' && !process.env.LLM_PROVIDER) {
      console.warn(`⚠️  Ollama failed (${error.message}), falling back to OpenAI...`)
      return await callOpenAI(messages, { ...options, model: 'gpt-4o-mini' })
    }
    // If Ollama was explicitly requested via LLM_PROVIDER, don't fall back
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

/**
 * Create an LLM client with OpenAI-compatible interface
 * This allows easy migration from OpenAI to Ollama
 */
export function createLLMClient() {
  return {
    async createChatCompletion(options: {
      messages: Array<{ role: string; content: string }>
      temperature?: number
      maxTokens?: number
      responseFormat?: 'json' | 'text'
    }): Promise<string> {
      const provider = process.env.LLM_PROVIDER || 'openai'

      if (provider === 'ollama') {
        console.log('🦙 Using Ollama (FREE, unlimited)')
      } else {
        console.log('🔑 Using OpenAI (paid, rate-limited)')
      }

      const llmMessages: LLMMessage[] = options.messages.map(m => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content
      }))

      const llmOptions: LLMOptions = {
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens,
        response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined
      }

      const response = await callLLM(llmMessages, llmOptions)
      return response.content
    }
  }
}
