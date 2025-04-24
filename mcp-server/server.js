#!/usr/bin/env node

import TaskMasterMCPServer from './src/index.js';
import dotenv from 'dotenv';
import logger from './src/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// 添加更多环境信息日志
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 创建日志目录
const logDir = path.join(projectRoot, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logFilePath = path.join(logDir, 'mcp-server.log');
const debugStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// 增强日志功能
function enhancedLog(level, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    // 控制台输出
    console.log(logMessage);
    
    // 文件日志
    debugStream.write(logMessage + '\n');
}

// 添加自定义日志方法
const debugLogger = {
    info: (message) => enhancedLog('info', message),
    warn: (message) => enhancedLog('warn', message),
    error: (message) => enhancedLog('error', message),
    debug: (message) => enhancedLog('debug', message)
};

// 打印环境信息
debugLogger.info('=== MCP Server Starting ===');
debugLogger.info(`Node.js version: ${process.version}`);
debugLogger.info(`Working directory: ${process.cwd()}`);
debugLogger.info(`Project root: ${projectRoot}`);
debugLogger.info(`MODEL_PROVIDER: ${process.env.MODEL_PROVIDER || 'not set'}`);
debugLogger.info(`DEEPSEEK_MODEL: ${process.env.DEEPSEEK_MODEL || 'not set'}`);
debugLogger.info(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'Set (masked)' : 'Not set'}`);
debugLogger.info(`DEEPSEEK_API_KEY: ${process.env.DEEPSEEK_API_KEY ? 'Set (masked)' : 'Not set'}`);
debugLogger.info(`PERPLEXITY_API_KEY: ${process.env.PERPLEXITY_API_KEY ? 'Set (masked)' : 'Not set'}`);

/**
 * Start the MCP server
 */
async function startServer() {
	const server = new TaskMasterMCPServer();

	// Handle graceful shutdown
	process.on('SIGINT', async () => {
		debugLogger.info('Received SIGINT signal. Shutting down...');
		await server.stop();
		process.exit(0);
	});

	process.on('SIGTERM', async () => {
		debugLogger.info('Received SIGTERM signal. Shutting down...');
		await server.stop();
		process.exit(0);
	});

	// 添加全局未捕获异常处理
	process.on('uncaughtException', (error) => {
		debugLogger.error(`Uncaught Exception: ${error.message}`);
		debugLogger.error(error.stack);
	});

	process.on('unhandledRejection', (reason, promise) => {
		debugLogger.error(`Unhandled Promise Rejection at: ${promise}, reason: ${reason}`);
		if (reason instanceof Error) {
			debugLogger.error(reason.stack);
		}
	});

	try {
		debugLogger.info('Starting MCP server...');
		await server.start();
		debugLogger.info('MCP server started successfully');
	} catch (error) {
		debugLogger.error(`Failed to start MCP server: ${error.message}`);
		debugLogger.error(error.stack);
		logger.error(`Failed to start MCP server: ${error.message}`);
		process.exit(1);
	}
}

// Start the server
startServer();
