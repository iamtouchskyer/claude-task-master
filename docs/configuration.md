# Configuration

Task Master can be configured through environment variables in a `.env` file at the root of your project.

## Required Configuration

- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude (Example: `ANTHROPIC_API_KEY=sk-ant-api03-...`)
  - Or alternatively, you can use DeepSeek with `DEEPSEEK_API_KEY` instead

## Optional Configuration

- `MODEL_PROVIDER` (Default: `"anthropic"`): AI provider to use (Options: `"anthropic"`, `"deepseek"`, `"perplexity"`)
- `MODEL` (Default: `"claude-3-7-sonnet-20250219"`): Claude model to use (Example: `MODEL=claude-3-opus-20240229`)
- `DEEPSEEK_API_KEY`: Your DeepSeek API key (Example: `DEEPSEEK_API_KEY=dsk-...`)
- `DEEPSEEK_MODEL` (Default: `"deepseek-chat"`): DeepSeek model (Example: `DEEPSEEK_MODEL=deepseek-coder`)
- `MAX_TOKENS` (Default: `"4000"`): Maximum tokens for responses (Example: `MAX_TOKENS=8000`)
- `TEMPERATURE` (Default: `"0.7"`): Temperature for model responses (Example: `TEMPERATURE=0.5`)
- `DEBUG` (Default: `"false"`): Enable debug logging (Example: `DEBUG=true`)
- `LOG_LEVEL` (Default: `"info"`): Console output level (Example: `LOG_LEVEL=debug`)
- `DEFAULT_SUBTASKS` (Default: `"3"`): Default subtask count (Example: `DEFAULT_SUBTASKS=5`)
- `DEFAULT_PRIORITY` (Default: `"medium"`): Default priority (Example: `DEFAULT_PRIORITY=high`)
- `PROJECT_NAME` (Default: `"MCP SaaS MVP"`): Project name in metadata (Example: `PROJECT_NAME=My Awesome Project`)
- `PROJECT_VERSION` (Default: `"1.0.0"`): Version in metadata (Example: `PROJECT_VERSION=2.1.0`)
- `PERPLEXITY_API_KEY`: For research-backed features (Example: `PERPLEXITY_API_KEY=pplx-...`)
- `PERPLEXITY_MODEL` (Default: `"sonar-medium-online"`): Perplexity model (Example: `PERPLEXITY_MODEL=sonar-large-online`)

## Example .env File

```
# Required - Choose one or more AI providers
ANTHROPIC_API_KEY=sk-ant-api03-your-api-key
DEEPSEEK_API_KEY=dsk-your-deepseek-api-key
PERPLEXITY_API_KEY=pplx-your-perplexity-api-key

# Model Provider Selection
MODEL_PROVIDER=deepseek  # Use DeepSeek as the primary model (options: anthropic, deepseek, perplexity)

# Model Configuration
MODEL=claude-3-7-sonnet-20250219  # Used when MODEL_PROVIDER=anthropic
DEEPSEEK_MODEL=deepseek-chat      # Used when MODEL_PROVIDER=deepseek
PERPLEXITY_MODEL=sonar-pro        # Used when MODEL_PROVIDER=perplexity or for research

# Common Configuration
MAX_TOKENS=64000
TEMPERATURE=0.2

# Optional - Project Info
PROJECT_NAME=My Project
PROJECT_VERSION=1.0.0

# Optional - Application Configuration
DEFAULT_SUBTASKS=5
DEFAULT_PRIORITY=medium
DEBUG=false
LOG_LEVEL=info
```

## Model Provider Selection

Task Master now supports multiple AI providers:

1. **Anthropic (Default)**: Claude models, best for general purpose task generation
2. **DeepSeek**: An alternative to Claude, offering similar capabilities
3. **Perplexity**: Used primarily for research-backed features

You can specify which provider to use with the `MODEL_PROVIDER` environment variable:

```
MODEL_PROVIDER=deepseek  # Use DeepSeek as the primary model
```

If not specified, Task Master will default to using Anthropic (Claude) if an API key is available. You can also configure fallback behavior - if the primary provider is unavailable, Task Master will attempt to use other configured providers automatically.

## Troubleshooting

### If `task-master init` doesn't respond:

Try running it with Node directly:

```bash
node node_modules/claude-task-master/scripts/init.js
```

Or clone the repository and run:

```bash
git clone https://github.com/eyaltoledano/claude-task-master.git
cd claude-task-master
node scripts/init.js
```
