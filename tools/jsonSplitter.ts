import fs from 'fs/promises';
import path from 'path';

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

async function splitJsonFile(
  inputFilePath: string,
  chunksCount: number = 4
): Promise<void> {
  try {
    const jsonData: TestCase[] = JSON.parse(
      await fs.readFile(inputFilePath, 'utf-8')
    );

    const totalItems = jsonData.length;
    if (totalItems === 0) {
      console.error('Error: Input JSON file is empty.');
      return;
    }

    const itemsPerChunk = Math.ceil(totalItems / chunksCount);

    for (let i = 0; i < chunksCount; i++) {
      const start = i * itemsPerChunk;
      const end = Math.min((i + 1) * itemsPerChunk, totalItems);
      const chunk = jsonData.slice(start, end);

      if (chunk.length === 0) break;

      const firstKey = chunk[0].key;
      const lastKey = chunk[chunk.length - 1].key;
      const outputFileName = `cases-${firstKey.split('-')[1]}-${lastKey.split('-')[1]}.json`;
      const outputFilePath = path.join(
        path.dirname(inputFilePath),
        outputFileName
      );

      await fs.writeFile(outputFilePath, JSON.stringify(chunk, null, 2));
      console.log(`Created file: ${outputFileName}`);
    }

    console.log('JSON file has been split successfully.');
  } catch (error) {
    console.error('Error splitting JSON file:', error);
  }
}

// Command-line execution
const inputFilePath = process.argv[2];
const chunksCount = parseInt(process.argv[3]) || 4;

if (!inputFilePath) {
  console.error(
    'Usage: node jsonSplitter.js <path_to_input_json> [number_of_chunks]'
  );
  process.exit(1);
}

splitJsonFile(inputFilePath, chunksCount);
