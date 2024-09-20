import fs from 'fs/promises';
import path from 'path';
import xml2js from 'xml2js';

interface TestCase {
  id: string;
  key: string;
  name: string;
  folder: string | null;
  priority: string;
  status: string;
  issues: string[];
  objective: string | null;
  testScript: string | null;
}

async function parseTestCases(xmlString: string): Promise<TestCase[]> {
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(xmlString);
  const testCaseElements = result.project.testCases.testCase;

  if (!Array.isArray(testCaseElements)) {
    return [];
  }

  return testCaseElements.map(parseTestCase);
}

function parseTestCase(tc: any): TestCase {
  return {
    id: tc.$.id,
    key: tc.$.key,
    name: tc.name,
    folder: tc.folder || null,
    priority: tc.priority,
    status: tc.status,
    issues: parseIssues(tc.issues),
    objective: tc.objective || null,
    testScript: parseTestScript(tc.testScript),
  };
}

function parseIssues(issues: any): string[] {
  if (!issues) return [];
  const issue = issues.issue;
  if (Array.isArray(issue)) {
    return issue.map((i) => i.key);
  }
  return [issue.key];
}

function parseTestScript(testScript: any): string | null {
  if (!testScript) return null;
  if (typeof testScript === 'string') return testScript;
  if (testScript.details) return testScript.details;
  if (testScript.steps) return JSON.stringify(testScript.steps);
  return null;
}

async function processXmlFiles(
  inputDirectory: string,
  outputDirectory: string
): Promise<void> {
  try {
    await fs.mkdir(outputDirectory, { recursive: true });
    const files = await fs.readdir(inputDirectory);
    const xmlFiles = files.filter((file) => path.extname(file) === '.xml');

    for (const filename of xmlFiles) {
      const inputPath = path.join(inputDirectory, filename);
      const outputPath = path.join(
        outputDirectory,
        `parsed_${path.parse(filename).name}.json`
      );

      const xmlData = await fs.readFile(inputPath, 'utf-8');
      const testCases = await parseTestCases(xmlData);

      await fs.writeFile(outputPath, JSON.stringify(testCases, null, 2));
      console.log(`Processed ${filename} and saved results to ${outputPath}`);
    }
  } catch (error) {
    console.error('Error processing XML files:', error);
    throw error;
  }
}

async function main() {
  const inputDir = './data/rawXml';
  const outputDir = './data/parsedJson';

  try {
    await processXmlFiles(inputDir, outputDir);
    console.log('All XML files processed successfully');
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
}

main();
