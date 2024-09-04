import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
	console.error(
		"Error: OpenAI API key is missing. Please check your .env file."
	);
	process.exit(1);
}

function parseArgs(args: string[]): {
	message: string;
	instructionsFile?: string;
	file?: string;
} {
	if (args.length < 1) {
		console.error("Usage: cli.ts <message> [instructionsFile] [filePath]");
		process.exit(1);
	}

	const message = args[0];
	const instructionsFile = args.length > 1 ? args[1] : undefined;
	const file = args.length > 2 ? args[2] : undefined;

	return { message, instructionsFile, file };
}

function generateUniqueFilename(baseName: string, dir: string): string {
	let filename = `${baseName}.json`;
	let filePath = path.join(dir, filename);
	let counter = 1;
	while (fs.existsSync(filePath)) {
		filename = `${baseName}-${counter}.json`;
		filePath = path.join(dir, filename);
		counter++;
	}
	return filename;
}

async function main() {
	try {
		const { message, instructionsFile, file } = parseArgs(
			process.argv.slice(2)
		);

		let instructions = "";
		if (instructionsFile) {
			if (!fs.existsSync(instructionsFile)) {
				console.error(
					`Error: Instructions file '${instructionsFile}' not found.`
				);
				process.exit(1);
			}
			instructions = fs.readFileSync(instructionsFile, "utf-8");
		}

		let attachment = "";
		if (file) {
			if (!fs.existsSync(file)) {
				console.error(`Error: File '${file}' not found.`);
				process.exit(1);
			}
			attachment = fs.readFileSync(file, "utf-8");
		}

		const response = await axios.post(
			"https://api.openai.com/v1/chat/completions",
			{
				model: "gpt-4o",
				messages: [
					{ role: "system", content: instructions },
					{ role: "user", content: message },
					...(attachment ? [{ role: "user", content: attachment }] : []),
				],
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
			}
		);

		const responseMessage = response.data.choices[0].message.content;
		console.log("---------------Response-----------------");
		console.log(responseMessage);
		console.log("------------------End-------------------");

		const outputDir = path.resolve(__dirname, "./responses");
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}
		let baseFilename;
		if (file) {
			const parsedPath = path.parse(file);
			baseFilename = `response-${parsedPath.name.replace(/cases-/, '')}`;
		} else {
			const today = new Date().toISOString().split("T")[0];
			baseFilename = `response-${today}`;
		}

		const uniqueFilename = generateUniqueFilename(baseFilename, outputDir);

		const outputFilePath = path.join(outputDir, uniqueFilename);
		fs.writeFileSync(outputFilePath, JSON.stringify(response.data, null, 2));
		console.log(`Response saved to '${outputFilePath}'`);
	} catch (error: any) {
		console.error("Error:", error.message);
	}
}

main();
