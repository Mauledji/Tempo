# Tempo

Open source productivity SaaS with native Claude integration.

## Structure

```
tempo/
├── frontend/          # React + Vite + Tailwind (Cloudflare Pages)
├── backend/           # FastAPI on AWS Lambda
├── mcp-server/        # MCP server (npm: @mauledji/tempo-mcp)
├── infra/             # AWS SAM templates
└── [ds-*.jsx, tempo-*.jsx, *.html]  # Claude Design reference (mock)
```

## Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind v4, TanStack Query/Router, Zustand
- **Backend:** FastAPI (Python 3.12), asyncpg, Mangum on AWS Lambda
- **DB/Auth:** Supabase (Postgres + Auth + Realtime + Storage)
- **MCP:** TypeScript, @modelcontextprotocol/sdk

## License

AGPL-3.0 for the app. MIT for the MCP server.
