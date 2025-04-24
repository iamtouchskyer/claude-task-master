# Configuration

Task Master can be configured using environment variables or through the `.cursor/mcp.json` file.

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| ANTHROPIC_API_KEY | Your Anthropic API key | Required | - |
| PERPLEXITY_API_KEY | Perplexity API key for research | Optional | - |
| DEEPSEEK_API_KEY | DeepSeek API key for alternate model | Optional | - |
| MODEL_PROVIDER | AI model provider to use (anthropic, deepseek) | Optional | anthropic |
| MODEL | Claude model to use | Optional | claude-3-7-sonnet-20250219 |
| DEEPSEEK_MODEL | DeepSeek model to use | Optional | deepseek-chat |
| PERPLEXITY_MODEL | Perplexity model to use | Optional | sonar-pro |
| MAX_TOKENS | Maximum tokens for responses | Optional | 4000 |
| TEMPERATURE | Temperature for model responses | Optional | 0.7 |
| DEFAULT_SUBTASKS | Default number of subtasks to generate | Optional | 3 |
| DEFAULT_PRIORITY | Default task priority (low, medium, high) | Optional | medium |
| DEBUG | Enable debug logging | Optional | false |
| LOG_LEVEL | Console output level (debug, info, warn, error) | Optional | info |
| PROJECT_NAME | Project name displayed in UI | Optional | Task Master |
| MCP_REQUEST_TIMEOUT | MCP server request timeout in milliseconds | Optional | 120000 |

## Configuring with mcp.json

Environment variables can also be configured in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "taskmaster-ai": {
      "command": "node",
      "args": ["./mcp-server/server.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your-api-key",
        ...
      }
    }
  }
}
```

The configuration in `mcp.json` takes precedence over environment variables.
