import axios from "axios";

interface ChatCompletionOptions {
	instructions?: string;
	message: string;
	attachment?: string;
}

interface ChatCompletionResponse {
	data: any;
	message: string;
}

class OpenAIClient {
	private apiKey: string;
	private apiUrl: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
		this.apiUrl = "https://api.openai.com/v1/chat/completions";
	}

	public async getChatCompletion(
		options: ChatCompletionOptions
	): Promise<ChatCompletionResponse> {
		const { instructions = "", message, attachment = "" } = options;

		const messages = [];

		if (instructions) {
			messages.push({ role: "system", content: instructions });
		}

		messages.push({ role: "user", content: message });

		if (attachment) {
			messages.push({ role: "user", content: attachment });
		}

		try {
			const response = await axios.post(
				this.apiUrl,
				{
					model: "gpt-4o",
					messages: messages,
				},
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${this.apiKey}`,
					},
				}
			);

			const responseMessage = response.data.choices[0].message.content;

			return {
				data: response.data,
				message: responseMessage,
			};
		} catch (error: any) {
			if (error.response) {
				throw new Error(
					`OpenAI API request failed with status ${error.response.status}: ${error.response.data.error.message}`
				);
			} else {
				throw new Error(`OpenAI API request failed: ${error.message}`);
			}
		}
	}
}

export default OpenAIClient;
