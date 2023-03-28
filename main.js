const { app, Notification } = require("electron");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const jiraBaseUrl = process.env.JIRA_BASE_URL;
const jiraUsername = process.env.JIRA_USERNAME;
const jiraApiToken = process.env.JIRA_API_TOKEN;
const jiraBoardId = process.env.JIRA_BOARD_ID;

const auth = {
  username: jiraUsername,
  password: jiraApiToken,
};

const fetchActiveSprint = async () => {
  try {
    const response = await axios.get(
      `${jiraBaseUrl}/rest/agile/1.0/board/${jiraBoardId}/sprint?state=active`,
      { auth }
    );
    return response.data.values[0];
  } catch (error) {
    console.error("Error fetching active sprint:", error);
  }
};

const fetchIssues = async (sprintId) => {
  try {
    const response = await axios.get(
      `${jiraBaseUrl}/rest/agile/1.0/sprint/${sprintId}/issue`,
      { auth }
    );
    return response.data.issues;
  } catch (error) {
    console.error("Error fetching issues:", error);
  }
};
let previousIssues = null;

const compareIssues = (oldIssues, newIssues) => {
  newIssues.forEach((newIssue) => {
    const oldIssue = oldIssues.find((issue) => issue.id === newIssue.id);

    if (oldIssue && oldIssue.fields.status.id !== newIssue.fields.status.id) {
      console.log(
        `Ticket ${newIssue.key} has changed status from ${oldIssue.fields.status.name} to ${newIssue.fields.status.name}`
      );
      const notification = new Notification({
        title: "Jira Ticket Status Update",
        body: `[${oldIssue.fields.status.name} -> ${newIssue.fields.status.name}] ${newIssue.key} - ${newIssue.fields.summary}`,
        silent: false,
      });

      notification.show();
    }
  });
};

const pollJiraBoard = async () => {
  console.log("Polling Jira board...");
  const activeSprint = await fetchActiveSprint();
  if (!activeSprint) {
    console.log("No active sprint found");
    return;
  }
  const issues = await fetchIssues(activeSprint.id);

  if (previousIssues) {
    console.log("Comparing issues...");
    compareIssues(previousIssues, issues);
  }
  previousIssues = issues;
};

app.whenReady().then(() => {
  if (process.platform === "darwin") {
    app.dock.hide();
  }

  // Poll the Jira board every minute
  setInterval(pollJiraBoard, 60 * 1000);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
