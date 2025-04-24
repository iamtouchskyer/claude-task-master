/**
 * tools/index.js
 * Export all Task Master CLI tools for MCP server
 */

import { registerListTasksTool } from './get-tasks.js';
import logger from '../logger.js';
import { registerSetTaskStatusTool } from './set-task-status.js';
import { registerParsePRDTool } from './parse-prd.js';
import { registerUpdateTool } from './update.js';
import { registerUpdateTaskTool } from './update-task.js';
import { registerUpdateSubtaskTool } from './update-subtask.js';
import { registerGenerateTool } from './generate.js';
import { registerShowTaskTool } from './get-task.js';
import { registerNextTaskTool } from './next-task.js';
import { registerExpandTaskTool } from './expand-task.js';
import { registerAddTaskTool } from './add-task.js';
import { registerAddSubtaskTool } from './add-subtask.js';
import { registerRemoveSubtaskTool } from './remove-subtask.js';
import { registerAnalyzeTool } from './analyze.js';
import { registerClearSubtasksTool } from './clear-subtasks.js';
import { registerExpandAllTool } from './expand-all.js';
import { registerRemoveDependencyTool } from './remove-dependency.js';
import { registerValidateDependenciesTool } from './validate-dependencies.js';
import { registerFixDependenciesTool } from './fix-dependencies.js';
import { registerComplexityReportTool } from './complexity-report.js';
import { registerAddDependencyTool } from './add-dependency.js';
import { registerRemoveTaskTool } from './remove-task.js';
import { registerInitializeProjectTool } from './initialize-project.js';
import { asyncOperationManager } from '../core/utils/async-manager.js';

/**
 * Register all Task Master tools with the MCP server
 * @param {Object} server - FastMCP server instance
 * @param {asyncOperationManager} asyncManager - The async operation manager instance
 * @param {Object} options - Additional options
 * @param {Function} options.logFunction - Optional custom logging function
 */
export function registerTaskMasterTools(server, asyncManager, options = {}) {
    const { logFunction } = options;
    
    // Use custom log function if provided
    const logRequest = (method, params) => {
        if (logFunction) {
            logFunction(`Tool called: ${method} with params: ${JSON.stringify(params, null, 2)}`);
        }
    };
    
    try {
        if (logFunction) {
            logFunction('Registering Task Master tools with MCP server...');
        }
        
        // Register each tool - wrap each registration with logging
        const tools = [
            { name: 'listTasks', fn: registerListTasksTool },
            { name: 'setTaskStatus', fn: registerSetTaskStatusTool },
            { name: 'parsePRD', fn: registerParsePRDTool },
            { name: 'update', fn: registerUpdateTool },
            { name: 'updateTask', fn: registerUpdateTaskTool },
            { name: 'updateSubtask', fn: registerUpdateSubtaskTool },
            { name: 'generate', fn: registerGenerateTool },
            { name: 'showTask', fn: registerShowTaskTool },
            { name: 'nextTask', fn: registerNextTaskTool },
            { name: 'expandTask', fn: registerExpandTaskTool },
            { name: 'addTask', fn: (s) => registerAddTaskTool(s, asyncManager) },
            { name: 'addSubtask', fn: registerAddSubtaskTool },
            { name: 'removeSubtask', fn: registerRemoveSubtaskTool },
            { name: 'analyze', fn: registerAnalyzeTool },
            { name: 'clearSubtasks', fn: registerClearSubtasksTool },
            { name: 'expandAll', fn: registerExpandAllTool },
            { name: 'removeDependency', fn: registerRemoveDependencyTool },
            { name: 'validateDependencies', fn: registerValidateDependenciesTool },
            { name: 'fixDependencies', fn: registerFixDependenciesTool },
            { name: 'complexityReport', fn: registerComplexityReportTool },
            { name: 'addDependency', fn: registerAddDependencyTool },
            { name: 'removeTask', fn: registerRemoveTaskTool },
            { name: 'initializeProject', fn: registerInitializeProjectTool }
        ];
        
        // Register each tool with logging
        tools.forEach(tool => {
            if (logFunction) {
                logFunction(`Registering tool: ${tool.name}`);
            }
            try {
                tool.fn(server);
                if (logFunction) {
                    logFunction(`Successfully registered tool: ${tool.name}`);
                }
            } catch (toolError) {
                if (logFunction) {
                    logFunction(`Error registering tool ${tool.name}: ${toolError.message}`);
                }
                logger.error(`Error registering tool ${tool.name}: ${toolError.message}`);
                throw toolError;
            }
        });
        
        // Patch server methods to add logging if possible
        if (server && typeof server.handleRequest === 'function' && !server._logPatched) {
            const originalHandleRequest = server.handleRequest;
            server.handleRequest = function(request) {
                // Log non-ping requests
                if (request.method !== 'ping' && logFunction) {
                    logFunction(`>> REQUEST: ${JSON.stringify(request, null, 2)}`);
                }
                return originalHandleRequest.call(this, request);
            };
            server._logPatched = true;
            if (logFunction) {
                logFunction('Server handleRequest method patched for logging');
            }
        }
        
        if (logFunction) {
            logFunction('All Task Master tools registered successfully');
        }
    } catch (error) {
        if (logFunction) {
            logFunction(`ERROR registering Task Master tools: ${error.message}`);
            logFunction(error.stack);
        }
        logger.error(`Error registering Task Master tools: ${error.message}`);
        throw error;
    }
}

export default {
    registerTaskMasterTools
};
