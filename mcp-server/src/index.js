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
        
        // Create server instance with enhanced configuration
        const timeout = parseInt(process.env.MCP_REQUEST_TIMEOUT || '120000', 10);
        this.server = new FastMCP({
            ...this.options,
            timeout,
            keepalive: {
                interval: 30000,    // Send ping every 30 seconds
                timeout: 45000     // Consider connection dead after 45 seconds of no response
            },
            reconnect: {
                autoReconnect: true,
                maxAttempts: 5,
                delay: 1000        // Start with 1 second delay, will increase exponentially
            }
        });
        this.initialized = false;

        // Note: FastMCP doesn't support interceptors, so we use custom logging
        logToFile(`Server configured with timeout: ${timeout}ms`);
        
        // Add resources and templates
        this.server.addResource({});
        this.server.addResourceTemplate({});
        
        // Make manager accessible (e.g., to pass to tool registration)
        this.asyncManager = asyncOperationManager;

        // Bind methods
        this.init = this.init.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);

        // Set up logging
        this.logger = logger;
        
        // Add detailed environment debug info
        logToFile('=== MCP Server Configuration ===');
        logToFile(`Working Directory: ${process.cwd()}`);
        logToFile(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
        logToFile(`DEBUG: ${process.env.DEBUG || 'false'}`);
        
        // Add connection event handlers
        this.server.on('disconnect', () => {
            logToFile('Connection lost - attempting to reconnect...');
        });
        
        this.server.on('reconnect', () => {
            logToFile('Successfully reconnected to client');
        });
        
        this.server.on('error', (error) => {
            logToFile(`Connection error: ${error.message}`);
        });
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
