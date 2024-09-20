import fs from "fs/promises";
import path from "path";

class JSONCombiner {
	private dataFolder1: string; // Original test cases
	private dataFolder2: string; // Analysis results

	constructor(dataFolder1: string, dataFolder2: string) {
		this.dataFolder1 = dataFolder1;
		this.dataFolder2 = dataFolder2;
	}

	private async readJSONFile(filePath: string): Promise<any[]> {
		const fileContent = await fs.readFile(filePath, "utf-8");
		return JSON.parse(fileContent);
	}

	public async combineJSON(uid: string): Promise<any[]> {
		const testCaseFile = path.join(this.dataFolder1, `cases-${uid}.json`);
		const analysisFile = path.join(this.dataFolder2, `analysis-${uid}.json`);

		const [testCases, analysisResults] = await Promise.all([
			this.readJSONFile(testCaseFile),
			this.readJSONFile(analysisFile),
		]);

		// Create a map of analysis results by "key"
		const analysisMap = new Map();
		analysisResults.forEach((item: any) => {
			analysisMap.set(item.key, item);
		});

		// Combine data by "key"
		const combinedData = testCases.map((testCase: any) => {
			const analysis = analysisMap.get(testCase.key);
			if (analysis) {
				return { ...testCase, ...analysis };
			} else {
				return testCase;
			}
		});

		return combinedData;
	}
}

export default JSONCombiner;
