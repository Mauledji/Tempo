#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

const API_URL = process.env.TEMPO_API_URL ?? 'https://api.tempo.app'
const API_KEY = process.env.TEMPO_API_KEY

const server = new Server(
  { name: 'tempo-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } },
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'health_check',
      description: 'Check that the Tempo API is reachable',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params

  if (name === 'health_check') {
    const res = await fetch(`${API_URL}/api/health`, {
      headers: API_KEY ? { 'X-API-Key': API_KEY } : {},
    })
    const body = await res.text()
    return {
      content: [
        { type: 'text', text: `Status ${res.status}: ${body}` },
      ],
    }
  }

  throw new Error(`Unknown tool: ${name}`)
})

const transport = new StdioServerTransport()
await server.connect(transport)
console.error('tempo-mcp ready (stdio)')
