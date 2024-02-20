const { readFileSync } = require('fs');

// load logs.html and prase by line-break

const loadLogs = () => {
  const logs = readFileSync('./.coverage/logs.txt', 'utf8');
  const logsArray = logs.split('\n');
  return logsArray;
};

const filterLogsByFail = (logsArray) => {
  const failLogs = logsArray.filter((log) => log.startsWith('FAIL'));
  return failLogs;
};

const getFilePathFromString = (string) => {
  const filePath = string.split(' ')[1];
  return filePath;
};

const uniqueFilingtestFiles = () => {
  const logs = loadLogs();
  const failLogs = filterLogsByFail(logs);
  const filePaths = failLogs.map((log) => getFilePathFromString(log));
  const unqiueFilePaths = [...new Set(filePaths)];
  return unqiueFilePaths;
};

// eslint-disable-next-line no-console
console.log(uniqueFilingtestFiles());
