#!/usr/bin/env node

import TaskMasterMCPServer from './src/index.js';
import dotenv from 'dotenv';
import logger from './src/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables with fallback to .env.example
const envPath = fs.existsSync('.env') ? '.env' : '.env.example';
dotenv.config({ path: envPath });

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Create logs directory
const logDir = path.join(projectRoot, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logFilePath = path.join(logDir, 'mcp-server.log');
const debugStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Enhanced logging functionality
function enhancedLog(level, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    // Console output based on LOG_LEVEL
    const logLevels = ['debug', 'info', 'warn', 'error'];
    const configuredLevel = process.env.LOG_LEVEL?.toLowerCase() || 'info';
    const configuredLevelIndex = logLevels.indexOf(configuredLevel);
    const currentLevelIndex = logLevels.indexOf(level.toLowerCase());
    
    if (currentLevelIndex >= configuredLevelIndex) {
        console.log(logMessage);
    }
    
    // Always write to file log
    debugStream.write(logMessage + '\n');
}

// Custom logger with environment-aware logging
const debugLogger = {
    info: (message) => enhancedLog('info', message),
    warn: (message) => enhancedLog('warn', message),
    error: (message) => enhancedLog('error', message),
    debug: (message) => enhancedLog('debug', message)
};

// Load and validate environment configuration
function validateConfig() {
    const requiredVars = ['DEEPSEEK_API_KEY'];
    const missingVars = requiredVars.filter(
        (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}`
        );
    }
}

// Print environment configuration
function logEnvironment() {
    debugLogger.info('=== MCP Server Configuration ===');
    debugLogger.info(`Node.js version: ${process.version}`);
    debugLogger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    debugLogger.info(`Working directory: ${process.cwd()}`);
    debugLogger.info(`Project root: ${projectRoot}`);
    debugLogger.info(`Log level: ${process.env.LOG_LEVEL || 'info'}`);
    debugLogger.info(`Debug mode: ${process.env.DEBUG === 'true' ? 'enabled' : 'disabled'}`);
    
    // Log AI configuration with DeepSeek first
    debugLogger.info('\n=== AI Configuration ===');
    debugLogger.info(`Model provider: ${process.env.MODEL_PROVIDER || 'deepseek'}`);
    debugLogger.info(`DeepSeek model: ${process.env.DEEPSEEK_MODEL || 'deepseek-chat'}`);
    debugLogger.info(`DeepSeek API key: ${process.env.DEEPSEEK_API_KEY ? 'Set (masked)' : 'Not set'}`);
    debugLogger.info('\n=== Optional AI Providers ===');
    debugLogger.info(`Anthropic model: ${process.env.MODEL || 'claude-3-7-sonnet-20250219'}`);
    debugLogger.info(`Anthropic API key: ${process.env.ANTHROPIC_API_KEY ? 'Set (masked)' : 'Not set'}`);
    debugLogger.info(`Perplexity model: ${process.env.PERPLEXITY_MODEL || 'sonar-pro'}`);
    debugLogger.info(`Perplexity API key: ${process.env.PERPLEXITY_API_KEY ? 'Set (masked)' : 'Not set'}`);

    // Log model settings
    debugLogger.info('\n=== Model Settings ===');
    debugLogger.info(`Max tokens: ${process.env.MAX_TOKENS || '4000'}`);
    debugLogger.info(`Temperature: ${process.env.TEMPERATURE || '0.2'}`);
    
    // Log task configuration
    debugLogger.info('\n=== Task Configuration ===');
    debugLogger.info(`Project name: ${process.env.PROJECT_NAME || 'Task Master'}`);
    debugLogger.info(`Default subtasks: ${process.env.DEFAULT_SUBTASKS || '3'}`);
    debugLogger.info(`Default priority: ${process.env.DEFAULT_PRIORITY || 'medium'}`);
}

/**
 * Start the MCP server
 */
async function startServer() {
    try {
        // Validate required environment variables
        validateConfig();
        
        // Log environment configuration
        logEnvironment();
        
        // Initialize server with validated configuration
        const server = new TaskMasterMCPServer();
        await server.init();
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
