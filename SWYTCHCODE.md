# Swytchcode Integration Guide — MindCommit (MuskMelon)

> Architectural specification for using Swytchcode as the API execution layer and middleware for the MindCommit Knowledge Twin.

---

## 1. What is Swytchcode?

Swytchcode is an **API execution layer and middleware runtime** that sits between AI agents (such as MindCommit) and production APIs. It provides a unified boundary for:

- **Managed Authentication** — Secure OAuth token resolution and credential handling without hardcoded secrets.
- **Input & Schema Validation** — Validates incoming request payloads against provider API schemas prior to network execution.
- **Policy Enforcement** — Evaluates guardrails defined in `.swytchcode/integrations/policies.json` before requests reach upstream endpoints.
- **Automatic Retries & Backoff** — Handles transient network failures (e.g., HTTP 429, 500, 503) with exponential backoff.
- **Idempotency** — Attaches idempotency keys to mutating requests to prevent duplicate side effects.
- **Execution Telemetry** — Captures execution metadata (timing, policy evaluations, and network status).

---

## 2. Core Architecture: 3 Key Integrations for the Knowledge Twin

To ensure maximum reliability and strict compliance for the hackathon architecture, MindCommit focuses on **three core integrations** (plus an optional authorized chat channel):

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MindCommit Architecture                         │
│                                                                        │
│   ┌────────────────────────┐         ┌──────────────────────────────┐  │
│   │ Approved Data Sources  │         │   Swytchcode Runtime Layer   │  │
│   │ (Google Drive docs)    │────────▶│ • Auth resolution (OAuth)    │  │
│   └────────────────────────┘         │ • Policy: Drive read allowed │  │
│                                      │ • Schema validation          │  │
│                                      └──────────────┬───────────────┘  │
│                                                     │                  │
│                                                     ▼                  │
│                                      ┌──────────────────────────────┐  │
│                                      │  Versioned Knowledge Commits │  │
│                                      │  • Timestamped chunks        │  │
│                                      │  • Consent Ledger (Local DB) │  │
│                                      └──────────────┬───────────────┘  │
│                                                     │                  │
│                                                     ▼                  │
│   ┌────────────────────────┐         ┌──────────────────────────────┐  │
│   │  User Query            │────────▶│ Time-Aware Vector Retrieval  │  │
│   │  (Now / Time / Diff)   │         │ (Weaviate / Temporal Store)  │  │
│   └────────────────────────┘         └──────────────┬───────────────┘  │
│                                                     │                  │
│                                                     ▼                  │
│                                      ┌──────────────────────────────┐  │
│                                      │  Grounded Generation Layer   │  │
│                                      │  (OpenAI GPT-4o / Gemini)    │  │
│                                      │  • Knowledge-Voice Firewall  │  │
│                                      │  • Answer Receipt Generation │  │
│                                      └──────────────┬───────────────┘  │
│                                                     │                  │
│                                                     ▼                  │
│                                      ┌──────────────────────────────┐  │
│                                      │  Verified Answer Receipt     │  │
│                                      │  + Optional Telegram / Slack │  │
│                                      └──────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### The 3 Core Integrations:

1. **Google Drive (`googledrive`)**:
   - **Role**: Ingest approved documents, transcripts, and timeline data.
   - **Swytchcode Function**: Resolves OAuth credentials via Managed Auth, checks read policies, and downloads source files into the Knowledge Commit pipeline.

2. **Weaviate (`weaviate`)**:
   - **Role**: Stores versioned temporal embeddings with `validFrom` and `validTo` date boundaries.
   - **Swytchcode Function**: Connects knowledge storage with schema enforcement.

3. **OpenAI / Gemini**:
   - **Role**: Generates grounded responses with citation synthesis and trap-question refutation.
   - **Swytchcode Function**: Manages API rate limits and execution retries.

*(Optional 4th Channel)*: **Telegram / Slack**:
   - **Role**: Authorized external communication channel to query the Knowledge Twin.
   - **Swytchcode Function**: Requires human approval policy before outbound dispatches.

---

## 3. Configuration & File Locations

### Project Tooling Manifest: `.swytchcode/tooling.json`

Specifies the trust boundary and enabled methods for the agent:

```json
{
  "project": "muskmelon-knowledge-twin",
  "version": "1.0.0",
  "description": "MindCommit (MuskMelon) - Version-Controlled Knowledge Twin of Elon Musk",
  "integrations": [
    {
      "name": "googledrive",
      "description": "Sync approved documents and historical text for knowledge commits",
      "tools": [
        "googledrive.list_files",
        "googledrive.download_file"
      ]
    },
    {
      "name": "telegram",
      "description": "Authorized twin access channel for verified subscribers",
      "tools": [
        "telegram.send_message"
      ]
    }
  ]
}
```

### Policy Guardrails: `.swytchcode/integrations/policies.json`

Evaluated deterministically prior to every tool execution:

```json
{
  "version": "1.0",
  "rules": [
    {
      "id": "allow-drive-read",
      "description": "Allow reading approved knowledge documents from Google Drive",
      "condition": {
        "tool": "googledrive.*",
        "method": ["list_files", "download_file"]
      },
      "action": "allow"
    },
    {
      "id": "approve-telegram-send",
      "description": "Require human authorization before outbound Telegram messages",
      "condition": {
        "tool": "telegram.send_message"
      },
      "action": "require_approval",
      "message": "Outbound message via Telegram requires human review."
    },
    {
      "id": "deny-destructive-mutations",
      "description": "Deny all destructive deletion operations across providers",
      "condition": {
        "tool": "*.delete_*"
      },
      "action": "deny",
      "message": "Destructive mutations are strictly prohibited by MindCommit policy."
    },
    {
      "id": "rate-limit-messaging",
      "description": "Rate limit outbound communication",
      "condition": {
        "tool": ["telegram.send_message", "slack.post_message"]
      },
      "action": "rate_limit",
      "limit": {
        "max": 10,
        "window": "1h"
      }
    }
  ]
}
```

---

## 4. CLI Verification & Execution Commands

### Installation & Initialization

```bash
# Global CLI install
npm install -g swytchcode

# Verify version
swy.cmd --version

# Initialize and sign in
swy.cmd init
swy.cmd login

# Connect provider OAuth
swy.cmd auth connect google
swy.cmd auth status
```

### Inspecting Methods & Executing Tools

Always inspect an integration's method schema with `swy info` before invoking:

```bash
# Discover methods
swy.cmd list methods googledrive

# Inspect method schema and accepted parameters
swy.cmd info googledrive.list_files

# Execute a tool
swy.cmd exec googledrive.list_files '{"query":"Elon Musk timeline"}'
```

### Execution Telemetry & Audit Commands

Swytchcode records execution metadata for diagnostics and policy monitoring:

```bash
# View overall audit statistics
swy.cmd audit stats

# View recent network execution metadata
swy.cmd audit network -n 10

# View policy evaluation outcomes
swy.cmd audit policy -n 10
```

> **Note on Consent**: The Swytchcode audit trail stores *execution metadata* (tool, timestamp, policy result). The **Consent Ledger** (tracking authorized data owners, approval timestamps, and ingestion rights) is maintained independently by MindCommit's core database.

---

## 5. Model Context Protocol (MCP) Server Setup

Swytchcode can expose its execution layer to AI coding assistants and agents via MCP:

```bash
# General MCP stdio transport
swy.cmd mcp serve

# Specifically configure for Claude Code
swy.cmd mcp serve --claude
```

---

## 6. Standard Execution Exit Codes

When executing commands via the CLI runtime, standard exit codes are returned:

| Code | Meaning | Description |
|:---:|---|---|
| **0** | **Successful execution** | The tool executed and returned valid normalized output. |
| **1** | **Execution failed** | Upstream provider returned an error or unhandled network exception. |
| **2** | **Invalid input** | Payload failed schema validation against the tool definition. |
| **3** | **Authentication failed** | Provider credentials were missing, expired, or rejected. |
| **4** | **Blocked by policy** | Denied by rules defined in `.swytchcode/integrations/policies.json`. |
| **5** | **Tool not found** | The requested tool is not configured or enabled in `tooling.json`. |
