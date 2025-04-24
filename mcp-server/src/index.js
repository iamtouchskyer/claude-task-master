import { FastMCP } from 'fastmcp';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';
import logger from './logger.js';
import { registerTaskMasterTools } from './tools/index.js';
import { asyncOperationManager } from './core/utils/async-manager.js';

// Load environment variables
dotenv.config();

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建调试日志目录和文件
const projectRoot = path.resolve(__dirname, '../..');
const logDir = path.join(projectRoot, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const mcpLogFile = path.join(logDir, 'mcp-detailed.log');
const mcpLogStream = fs.createWriteStream(mcpLogFile, { flags: 'a' });

// 增强日志记录功能
function logToFile(message) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}\n`;
    mcpLogStream.write(formattedMessage);
}

/**
 * Main MCP server class that integrates with Task Master
 */
class TaskMasterMCPServer {
	constructor() {
		// Get version from package.json using synchronous fs
		const packagePath = path.join(__dirname, '../../package.json');
		const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

		this.options = {
			name: 'Task Master MCP Server',
			version: packageJson.version
		};

		logToFile(`Initializing Task Master MCP Server v${packageJson.version}`);
		logToFile(`Environment variables loaded: MODEL_PROVIDER=${process.env.MODEL_PROVIDER || 'not set'}`);
		
		// 创建服务器实例
		this.server = new FastMCP(this.options);
		this.initialized = false;

		// 注意：FastMCP不支持拦截器，所以我们改用自定义日志记录
		logToFile('Using custom logging instead of interceptors');
        
		// 添加资源和模板
		this.server.addResource({});
		this.server.addResourceTemplate({});

		// 使管理器可访问（例如，将其传递给工具注册）
		this.asyncManager = asyncOperationManager;

		// 绑定方法
		this.init = this.init.bind(this);
		this.start = this.start.bind(this);
		this.stop = this.stop.bind(this);

		// 设置日志记录
		this.logger = logger;
		
		// 添加详细环境调试信息
		logToFile('=== MCP Server Configuration ===');
		logToFile(`Working Directory: ${process.cwd()}`);
		logToFile(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
		logToFile(`DEBUG: ${process.env.DEBUG || 'false'}`);
		
		// 记录AI相关配置
		const aiConfig = {
			modelProvider: process.env.MODEL_PROVIDER || 'anthropic',
			claudeModel: process.env.MODEL || 'claude-3-7-sonnet-20250219',
			deepseekModel: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
			perplexityModel: process.env.PERPLEXITY_MODEL || 'sonar-pro',
			maxTokens: process.env.MAX_TOKENS || '4000',
			temperature: process.env.TEMPERATURE || '0.7'
		};
		
		logToFile(`AI Configuration: ${JSON.stringify(aiConfig, null, 2)}`);
		logToFile(`API Keys: ANTHROPIC=${process.env.ANTHROPIC_API_KEY ? 'SET' : 'NOT SET'}, DEEPSEEK=${process.env.DEEPSEEK_API_KEY ? 'SET' : 'NOT SET'}, PERPLEXITY=${process.env.PERPLEXITY_API_KEY ? 'SET' : 'NOT SET'}`);
	}

	/**
	 * Initialize the MCP server with necessary tools and routes
	 */
	async init() {
		if (this.initialized) return;

		logToFile('Initializing MCP Server tools and routes...');
		
		try {
			// 添加我们自己的log函数到工具注册函数
			const logFunction = logToFile;
			
			// Pass the manager instance to the tool registration function
			registerTaskMasterTools(this.server, this.asyncManager, { logFunction });
			logToFile('Task Master tools registered successfully');
			
			this.initialized = true;
			logToFile('MCP Server initialization complete');
		} catch (error) {
			logToFile(`ERROR during initialization: ${error.message}`);
			logToFile(error.stack);
			throw error;
		}

		return this;
	}

	/**
	 * Start the MCP server
	 */
	async start() {
		if (!this.initialized) {
			logToFile('Server not initialized, initializing now...');
			await this.init();
		}

		logToFile('Starting MCP Server...');
		
		try {
			// Start the FastMCP server with increased timeout
			await this.server.start({
				transportType: 'stdio',
				timeout: 120000 // 2 minutes timeout (in milliseconds)
			});
			
			logToFile('MCP Server started successfully with stdio transport');
			logToFile(`Timeout set to ${120000}ms`);
		} catch (error) {
			logToFile(`ERROR starting server: ${error.message}`);
			logToFile(error.stack);
			throw error;
		}

		return this;
	}

	/**
	 * Stop the MCP server
	 */
	async stop() {
		logToFile('Stopping MCP Server...');
		
		if (this.server) {
			try {
				await this.server.stop();
				logToFile('MCP Server stopped successfully');
			} catch (error) {
				logToFile(`ERROR stopping server: ${error.message}`);
				logToFile(error.stack);
			}
		}
		
		// 关闭日志流
		mcpLogStream.end();
	}
}

// Export the manager from here as well, if needed elsewhere
export { asyncOperationManager };

export default TaskMasterMCPServer;
