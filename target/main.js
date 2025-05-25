"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
/**
 * Reads the content of a source file and writes it to a destination file.
 *
 * @param sourcePath The path to the source file.
 * @param destinationPath The path to the destination file.
 */
async function copyFileContent(sourcePath, destinationPath) {
    try {
        // Resolve to absolute paths to ensure clarity
        const absoluteSourcePath = path.resolve(sourcePath);
        const absoluteDestinationPath = path.resolve(destinationPath);
        console.log(`Reading from: ${absoluteSourcePath}`);
        const content = await fs.readFile(absoluteSourcePath, { encoding: 'utf8' });
        console.log(`Writing to: ${absoluteDestinationPath}`);
        await fs.writeFile(absoluteDestinationPath, content, { encoding: 'utf8' });
        console.log('File content copied successfully!');
    }
    catch (error) {
        console.error('An error occurred:', error);
        // Re-throw the error if you want calling code to handle it,
        // or handle it more gracefully here.
        throw error;
    }
}
// --- Example Usage ---
async function main() {
    // Define your source and destination file paths
    // Make sure 'source.txt' exists in the same directory as your script,
    // or provide an absolute path.
    const sourceFile = 'source.txt';
    const destinationFile = 'destination.txt';
    // For demonstration, let's create a dummy source.txt if it doesn't exist
    try {
        await fs.access(sourceFile);
    }
    catch {
        console.log(`Creating dummy ${sourceFile} for demonstration...`);
        await fs.writeFile(sourceFile, 'Hello from the source file!\nThis is a test.', 'utf8');
    }
    try {
        await copyFileContent(sourceFile, destinationFile);
    }
    catch (error) {
        // Error is already logged by copyFileContent,
        // but you might want to do additional cleanup or logging here.
        console.error('Failed to copy file content in main function.');
    }
}
// Run the example
main();
