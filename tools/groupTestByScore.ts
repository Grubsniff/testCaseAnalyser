import fs from "fs/promises";
import path from "path";

interface TestObject {
	score: number;
	key: string;
	[key: string]: any;
}

async function groupTestsByScore() {
	const inputFolder = path.resolve(__dirname, "../data/combinedOutput");
	const outputFolder = path.resolve(__dirname, "../analysedCases");

	// Ensure the output folder exists
	await fs.mkdir(outputFolder, { recursive: true });

	let scoreGroups: { [score: number]: TestObject[] } = {};

	// Read all files in the input folder
	const files = await fs.readdir(inputFolder);

	for (const file of files) {
		const filePath = path.join(inputFolder, file);

		// Only process .json files
		if (path.extname(file) === ".json") {
			const data = await fs.readFile(filePath, "utf-8");
			let jsonArray: TestObject[];

			try {
				jsonArray = JSON.parse(data);
			} catch (e) {
				console.error(`Error parsing JSON in file ${file}:`, e);
				continue;
			}

			jsonArray.forEach((obj) => {
				const score = obj.score;
				const key = obj.key;

				if (score >= 1 && score <= 5) {
					if (!scoreGroups[score]) {
						scoreGroups[score] = [];
					}
					scoreGroups[score].push(obj);
				} else {
					console.warn(
						`Object with key ${key} has invalid score ${score}. Skipping.`
					);
				}
			});
		}
	}

	// Write grouped JSON files
	for (let i = 1; i <= 5; i++) {
		const outputFilePath = path.join(outputFolder, `score_${i}.json`);
		await fs.writeFile(
			outputFilePath,
			JSON.stringify(scoreGroups[i] || [], null, 2),
			"utf-8"
		);
	}

	// Create grouped overview
	const overview: { [score: number]: string[] } = {};

	for (let score in scoreGroups) {
		overview[score] = scoreGroups[score].map((obj) => obj.key);
	}

	const overviewOutputPath = path.join(outputFolder, "score_overview.json");
	await fs.writeFile(
		overviewOutputPath,
		JSON.stringify(overview, null, 2),
		"utf-8"
	);
	console.log("Processing complete. Output files are in the output folder.");
}

groupTestsByScore().catch((error) => {
	console.error("Error:", error.message);
	process.exit(1);
});
