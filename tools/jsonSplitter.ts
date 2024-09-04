import * as fs from 'fs';
import * as path from 'path';

interface TestCase {
    id: string;
    key: string;
    name: string;
    folder: string;
    priority: string;
    status: string;
    issues: string[];
    objective: string | null;
    testScript: string;
}

function splitJsonFile(inputFilePath: string): void {
    // Check if the file exists
    if (!fs.existsSync(inputFilePath)) {
        console.error(`Error: File not found at ${inputFilePath}`);
        process.exit(1);
    }

    // Read the input file
    const jsonData: TestCase[] = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));

    if (!Array.isArray(jsonData)) {
        console.error('Error: Input JSON must be an array of objects');
        process.exit(1);
    }

    const totalItems = jsonData.length;
    const chunksCount = 4;
    const itemsPerChunk = Math.ceil(totalItems / chunksCount);

    for (let i = 0; i < chunksCount; i++) {
        const start = i * itemsPerChunk;
        const end = Math.min((i + 1) * itemsPerChunk, totalItems);
        const chunk = jsonData.slice(start, end);

        const firstKey = chunk[0].key;
        const lastKey = chunk[chunk.length - 1].key;
        const outputFileName = `cases-${firstKey.split('-')[1]}-${lastKey.split('-')[1]}.json`;
        const outputFilePath = path.join(path.dirname(inputFilePath), outputFileName);

        fs.writeFileSync(outputFilePath, JSON.stringify(chunk, null, 2));
        console.log(`Created file: ${outputFileName}`);
    }
    
    console.log('JSON file has been split into four parts.');
}

// Get the input file path from command-line arguments
const inputFilePath = process.argv[2];

if (!inputFilePath) {
    console.error('Please provide the input JSON file path as a command-line argument.');
    console.error('Usage: node jsonSplitter.js <path_to_input_json>');
    process.exit(1);
}

splitJsonFile(inputFilePath);