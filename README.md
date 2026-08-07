# Contact Name Cleaner

Bulk-remove a word or suffix from all your Google Contacts names in one click.

## The problem this solves

Ever saved your school/college/work friends like this?

```
Alex NSBM
Sam NSBM
Jordan NSBM
```

...and now you want to strip that `NSBM` part off all of them, but you've got 70+ contacts and editing them one by one sounds miserable?

This tool scans all your Google Contacts, finds every name containing a word you specify, and removes it safely, with a preview step before anything is actually saved.

## Features

- **Dry run by default** - preview every change before anything touches your real contacts
- **Configurable target word** — works for any word/suffix, not just "NSBM"
- **Case-insensitive by default** — catches `NSBM`, `nsbm`, `Nsbm`, etc.
- **Whole-word matching** — won't accidentally chop up unrelated words
- **Handles pagination** — works whether you have 20 contacts or 2,000
- **Full logging** — see exactly what changed, and what was skipped

## Requirements

- A Google account with contacts you want to clean up
- 5 minutes
- No coding experience needed - just copy, paste, and click Run

## Setup

1. Go to [script.google.com](https://script.google.com) and click **New project**.
2. Delete the placeholder code, and paste in the full contents of [`Code.gs`](./Code.gs).
3. In the left sidebar, click the **+** next to **Services**, find **People API**, and click **Add**.
4. Rename the project (top left) to something like "Contact Cleaner".

## Usage

### Step 1 — Configure

At the top of `Code.gs`, edit the `CONFIG` block:

```js
var CONFIG = {
  WORD_TO_REMOVE: 'NSBM',     // <-- change this to whatever word you want gone
  MATCH_WHOLE_WORD: true,
  CASE_SENSITIVE: false,
  DRY_RUN: true,               // keep this true for your first run
  DELAY_BETWEEN_UPDATES_MS: 200
};
```

### Step 2 — Preview

With `DRY_RUN: true`, select the `run` function from the dropdown next to the ▷ Run button, and click Run.

The first time, Google will ask you to authorize access to your contacts — this is expected for personal scripts. Click **Advanced → Go to Contact Cleaner (unsafe) → Allow**.

Open **View → Logs** to see a preview of every change that *would* be made. Nothing is saved yet.

### Step 3 - Go live

If the preview looks correct, set `DRY_RUN: false` and run `run` again. This time, changes are actually saved to your Google Contacts. The log will confirm each update as it happens.

## Safety notes

- **Back up first.** Before your first live run, export your contacts as a safety net: [contacts.google.com](https://contacts.google.com) → Export → Google CSV.
- **Always dry-run first.** Don't flip `DRY_RUN` to false until you've checked the preview output.
- **Linked/merged contacts.** If a contact is synced from multiple sources (e.g. phone + Google account), the update may apply to only one source. If a name doesn't visually update after a live run, check that contact for a "linked contacts" / merge option in Google Contacts.

## License

MIT - use it, fork it, adapt it for whatever word you need stripped from your own contact list.
