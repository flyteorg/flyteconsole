/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

/**
 * This script will scan all test files in the project and output a CSV file
 * The CSV file can be uploaded to JIRA to create tickets for each TODO comment.
 * Upload here: https://unionai.atlassian.net/secure/BulkCreateSetupPage
 * Issues page -> Upload CSV
 */

// Function to recursively search for files ending with "test.ts" or "test.tsx"
function findTestFiles(directory = '/') {
  const testFileNames = [];

  // Get a list of all the files in the current directory
  const entries = fs.readdirSync(directory);
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry.endsWith('.test.ts') || entry.endsWith('.test.tsx')) {
      testFileNames.push(`${directory}/${entry}`);
    }
    if (fs.statSync(`${directory}/${entry}`).isDirectory()) {
      const moreFiles = findTestFiles(`${directory}/${entry}`);
      for (let i = 0; i < moreFiles.length; i++) {
        testFileNames.push(moreFiles[i]);
      }
    }
  }

  return testFileNames;
}

// Function to find all comments with "TODO" in a file
function findTodoComments(filePath) {
  // Read the contents of the file as a string
  const fileContents = fs.readFileSync(filePath, 'utf8');

  // Split the contents of the file into an array of lines
  const lines = fileContents.split('\n');

  // Loop through each line and search for TODO comments
  const todoComments = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('// TODO') || lines[i].includes('* TODO')) {
      // Get all the comments on this line
      const commentsOnThisLine = [];
      for (let j = i; j < lines.length; j++) {
        if (
          lines[j].includes('TODO') ||
          lines[j].includes('//') ||
          lines[j].includes('*/')
          // /* represents the start of a *new* multi-line comment, end this block
        ) {
          commentsOnThisLine.push(
            lines[j]
              .trim()
              .replace('//', '')
              .replace('/**', '')
              .replace('/*', '')
              .replace('*/', '')
              .trim(),
          );
        } else {
          i = j;
          break;
        }
      }

      const fileName = path.basename(filePath);

      // Add the found TODO comment to the array of all found TODO comments
      todoComments.push({
        fileName,
        lineNumber: i + 1,
        comments: `${commentsOnThisLine.join('\n')}`,
      });
    }
  }

  return todoComments;
}

function groupByFile(todoEntries) {
  const grouped = {};
  for (let i = 0; i < todoEntries.length; i++) {
    const todo = todoEntries[i];
    if (!grouped[todo.fileName]) {
      grouped[todo.fileName] = [];
    }
    grouped[todo.fileName].push(todo);
  }
  return grouped;
}

function fileGroupsToJiraCSVArray(todoEntiesByFile) {
  const keys = Object.keys(todoEntiesByFile);
  const csvBody = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const todos = todoEntiesByFile[key];
    const todosMessages = todos.map((todo) => {
      return `Test marked with TODO at line ${todo.lineNumber}.\n\n\`\`\`\n${todo.comments}\n\`\`\`\n`;
    });
    const Summary = `"Fix test suite ${key}"`;
    const Description = `"The following issues are present in ${key} which require more investigation:\n\n${todosMessages.join(
      '\n',
    )}"`;

    // Field options
    // https://support.atlassian.com/jira-cloud-administration/docs/import-data-from-a-csv-file/
    csvBody.push({
      'Issue Type': 'Sub-task',
      Summary,
      Description,
      'Parent id': 'FE-412', // https://unionai.atlassian.net/browse/FE-412
    });
  }

  return csvBody;
}

// Main function to find all TODO comments in a project
function main() {
  // Get the current working directory of the project
  const cwd = process.cwd();
  console.log(`Looking for test files in directory: ${cwd}`);

  // Find all files ending with "test.ts" or "test.tsx" in the project
  const testFileNames = findTestFiles(cwd);
  console.log(`Found ${testFileNames.length} test files`);

  // Loop through each test file and search for TODO comments
  const todoEntries = [];
  for (let i = 0; i < testFileNames.length; i++) {
    const todoComments = findTodoComments(testFileNames[i]);
    for (let j = 0; j < todoComments.length; j++) {
      todoEntries.push(todoComments[j]);
    }
  }
  console.log(todoEntries.length, 'TODO comments found');

  // Output the found TODO comments to a CSV file
  const jiraFormat = fileGroupsToJiraCSVArray(groupByFile(todoEntries));
  const headers = Object.keys(jiraFormat[0]).join(',');

  // Object to CSV builder
  const body = jiraFormat.map((obj) => Object.values(obj).join(',')).join('\n');

  // ".coverage" folder is gitignored
  const coverageDir = path.dirname('.coverage');
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir);
  }

  // make to for JIRA CSV upload
  fs.writeFileSync('.coverage/todos.csv', [headers, body].join('\n'), 'utf8');
}

// Call the main function
main();
