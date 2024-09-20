import { Command } from "commander";
import fs from "fs/promises";
import dotenv from "dotenv";
import path from "path";
import { extractAndSaveJson } from "./tools/extractJson";
import JSONCombiner from "./tools/jsonCombiner";
import OpenAIClient from "./tools/openAIClient";

dotenv.config();

const program = new Command();

program
	.requiredOption("-m, --message <message>", "User message")
	.option("-i, --instructions <file>", "Instructions file path")
	.option(
		"-f, --folder <folder>",
		"Attachment folder path (processes all .json files in the folder)"
	);

program.parse(process.argv);

const options = program.opts();

async function main() {
	try {
		const { message, instructions, folder } = options;
		const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

		if (!OPENAI_API_KEY) {
			throw new Error(
				"OpenAI API key is missing. Please check your .env file."
			);
		}

		if (!folder) {
			throw new Error(
				"No folder provided to process. Use the -f option to specify the folder."
			);
		}

		let instructionsContent = "";
		if (instructions) {
			instructionsContent = await fs.readFile(instructions, "utf-8");
		}

		const testCasesDir = path.resolve(__dirname, folder);
		const files = await fs.readdir(testCasesDir);
		const jsonFiles = files.filter((file) => path.extname(file) === ".json");

		const openAIClient = new OpenAIClient(OPENAI_API_KEY);

		for (const fileName of jsonFiles) {
			const filePath = path.join(testCasesDir, fileName);
			const attachmentContent = await fs.readFile(filePath, "utf-8");
			const parsedPath = path.parse(fileName);
			const uid = parsedPath.name.replace(/cases-/, "");

			const response = await openAIClient.getChatCompletion({
				instructions: instructionsContent,
				message,
				attachment: attachmentContent,
			});

			console.log(`Processing file: ${fileName}`);
			console.log("---------------Response-----------------");
			console.log(response.message);
			console.log("------------------End-------------------");

			const responsesDir = path.resolve(__dirname, "./data/responses");
			await fs.mkdir(responsesDir, { recursive: true });

			const responseFileName = `response-${uid}.json`;
			const responseFilePath = path.join(responsesDir, responseFileName);

			await fs.writeFile(
				responseFilePath,
				JSON.stringify(response.data, null, 2)
			);
			console.log(`Response saved to '${responseFilePath}'`);

			const resultsDir = path.resolve(__dirname, "./data/results");
			await fs.mkdir(resultsDir, { recursive: true });

			// Extract and save JSON analysis from the response
			const analysisFilePath = await extractAndSaveJson(
				responseFilePath,
				resultsDir,
				uid
			);

			// Combine original test case data with the results data
			const combinedData = await new JSONCombiner(
				path.resolve(__dirname, "./data/testCases"),
				path.resolve(__dirname, "./data/results")
			).combineJSON(uid);

			const combinedDir = path.resolve(__dirname, "./data/combinedOutput");
			await fs.mkdir(combinedDir, { recursive: true });
			await fs.writeFile(
				`${combinedDir}/combined-${uid}.json`,
				JSON.stringify(combinedData, null, 2)
			);
			console.log(
				`Combined data saved to '${combinedDir}/combined-${uid}.json'`
			);
		}

		console.log("All files have been processed.");
	} catch (error: any) {
		console.error("Error:", error.message);
		process.exit(1);
	}
}

main();
