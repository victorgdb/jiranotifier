# jiranotifier

Allows to display a desktop notification each time a ticket of a specific jira board transitions to a new status.

Just create a .env file and add:
```
JIRA_BASE_URL= #your jira repository address
JIRA_USERNAME= #your email address
JIRA_API_TOKEN= #your token
JIRA_BOARD_ID=123 #your board id
```

Then 
```
yarn install
yarn start
```
Don't forget to allow electron notifications
