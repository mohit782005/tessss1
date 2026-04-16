function readData(filePath) {
  console.log(`Reading data from ${filePath}...`);
  return { success: true, data: "mock data" };
}

function processData(data) {
  if (!data) throw new Error("No data provided");
  console.log("Processing data...");
  return data.toUpperCase();
}

function writeData(filePath, data) {
  console.log(`Writing ${data} to ${filePath}...`);
  return true;
}

module.exports = {
  readData,
  processData,
  writeData
};
