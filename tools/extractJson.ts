import fs from 'fs/promises';
import path from 'path';

export async function extractAndSaveJson(
  responseFilePath: string,
  resultsDir: string,
  uid: string
): Promise<string> {
  const responseContent = await fs.readFile(responseFilePath, 'utf-8');
  const responseData = JSON.parse(responseContent);

  const responseMessage = responseData.choices[0].message.content;

  // Assume that the assistant's response contains JSON data enclosed in triple backticks
  const jsonMatch = responseMessage.match(/```json([\s\S]*?)```/);

  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error('No JSON data found in the response.');
  }

  const jsonString = jsonMatch[1].trim();
  let analysisData;

  try {
    analysisData = JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Failed to parse JSON data from the response.');
  }

  const analysisFileName = `analysis-${uid}.json`;
  const analysisFilePath = path.join(resultsDir, analysisFileName);

  await fs.writeFile(analysisFilePath, JSON.stringify(analysisData, null, 2));

  console.log(`Analysis data saved to '${analysisFilePath}'`);

  return analysisFilePath;
}
