import * as fs from 'fs';
import * as path from 'path';

interface Choice {
    message: {
        content: string;
    };
}

interface ResponseData {
    choices: Choice[];
}

function extractAndSaveJson(filePath: string): void {
    // Read the input file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: ResponseData = JSON.parse(fileContent);

    // Extract the JSON content from the assistant's message
    const content = data.choices[0].message.content;

    // Find the start and end of the JSON in the content
    const jsonStart = content.indexOf('```json') + 7;
    const jsonEnd = content.lastIndexOf('```');
    const jsonContent = content.slice(jsonStart, jsonEnd).trim();

    // Parse the extracted JSON
    const extractedJson = JSON.parse(jsonContent);

    // Create the results directory if it doesn't exist
    const resultsDir = './results';
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir);
    }

    // Generate the output file name
    const fileName = 'analysis-' + path.basename(filePath, path.extname(filePath)).replace(/response-/, '') + '.json';
    const outputPath = path.join(resultsDir, fileName);

    // Write the extracted JSON to the output file
    fs.writeFileSync(outputPath, JSON.stringify(extractedJson, null, 2));

    console.log(`Extracted JSON saved to ${outputPath}`);
}

// Check if a file path is provided as a command-line argument
if (process.argv.length < 3) {
    console.error('Please provide a file path as a command-line argument.');
    process.exit(1);
}

const filePath = process.argv[2];
extractAndSaveJson(filePath);