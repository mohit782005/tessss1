const { readData, processData, writeData } = require('./files');

async function main() {
  try {
    const fileResult = readData('input.txt');
    if (!fileResult.success) {
      throw new Error("Failed to read file");
    }

    const processed = processData(fileResult.data);
    writeData('output.txt', processed);
    
    console.log("Pipeline executed successfully.");
  } catch (err) {
    console.error("Error executing pipeline:", err.message);
  }
}

main();
