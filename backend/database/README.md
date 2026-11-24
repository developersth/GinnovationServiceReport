# MongoDB index audit

The application keeps its existing BSON shape. The three collections keep their ObjectId primary keys. Service reports keep a string `ProjectId`, a BSON date for `ReportDate`, and the existing attachment paths. Existing entity updates set named fields so they preserve unrelated fields.

`indexes.js` reports invalid usernames, duplicate username groups, incompatible key and date types, and reports without a matching project. It plans two report indexes for project/date and date-only navigation and a username uniqueness index when existing records support it.

Run against a restored copy first. The database in the connection URI must match `GINNOVATION_DATABASE`. Use a connection URI with the appropriate database and supply production credentials through your normal secret handling.

```powershell
$env:GINNOVATION_DATABASE = 'ginnovation_copy'
Remove-Item Env:GINNOVATION_APPLY_INDEXES -ErrorAction SilentlyContinue
mongosh 'mongodb://127.0.0.1:27017/ginnovation_copy' --file ./backend/database/indexes.js
```

After reviewing the dry run, take a backup with `mongodump --archive` that includes the selected database and retain a separate snapshot of its attachment storage. Confirm recovery by restoring to a separate database with `mongorestore`. Apply with `GINNOVATION_APPLY_INDEXES=1` only to the approved target. Run the script again in dry-run mode to list the matching indexes. The script is safe to rerun and reports conflicts for manual review. To reverse a newly created index, remove that index by name after checking the prior index inventory. The script does not update documents or delete files.

Project deletion is blocked when reports reference the project. The API coordinates simultaneous project and report writes within a single application process. A deployment with multiple API instances needs shared coordination for concurrent project deletion and report creation.
