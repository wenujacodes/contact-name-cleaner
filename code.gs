/**
 * Contact Name Cleaner
 * ---------------------------------------------------------
 * Bulk-remove a word/suffix from all your Google Contacts names in one click.
 *
 * Example use case: you saved your school/college friends as
 * "Alex NSBM", "Sam NSBM", "Jordan NSBM" ... and now want to strip
 * "NSBM" from all of them at once, without editing 100+ contacts by hand.
 *
 * HOW TO USE
 * 1. Edit the CONFIG block below — set the word you want removed.
 * 2. Leave DRY_RUN as true first, and run the `run()` function.
 * 3. Check the logs (View > Logs) to see a preview of every change.
 * 4. If it looks correct, set DRY_RUN to false and run `run()` again.
 *    This time it will actually save the changes to your Google Contacts.
 *
 * Nothing is changed on your account until DRY_RUN is set to false.
 */

// ======================= CONFIG =======================
var CONFIG = {
  // The word or phrase you want removed from your contact names.
  // Example: 'NSBM', 'Work', 'Uni', 'Old Job', etc.
  WORD_TO_REMOVE: 'NSBM',

  // true  = only matches the word on its own (e.g. "NSBM" but not "NSBMX")
  // false = matches the word even inside other words (rarely what you want)
  MATCH_WHOLE_WORD: true,

  // false = matches NSBM, nsbm, Nsbm, NsBm... all variations of casing
  // true  = only matches the exact casing you typed above
  CASE_SENSITIVE: false,

  // true  = PREVIEW ONLY. Nothing is changed, just logged. Always start here.
  // false = LIVE MODE. Actually updates your contacts. Only flip this after
  //         checking the preview output looks correct.
  DRY_RUN: true,

  // Small delay (ms) between each update to stay well within Google's
  // API rate limits. You normally don't need to change this.
  DELAY_BETWEEN_UPDATES_MS: 200
};
// ========================================================


function run() {
  var flags = CONFIG.CASE_SENSITIVE ? 'g' : 'gi';
  var escapedWord = CONFIG.WORD_TO_REMOVE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  var pattern = CONFIG.MATCH_WHOLE_WORD ? '\\b' + escapedWord + '\\b' : escapedWord;
  var wordRegex = new RegExp(pattern, flags);

  var pageToken = null;
  var totalChecked = 0;
  var matched = 0;
  var updated = 0;
  var errors = 0;

  Logger.log(CONFIG.DRY_RUN ? '=== PREVIEW MODE (no changes will be saved) ===' : '=== LIVE MODE (changes will be saved) ===');
  Logger.log('Looking for: "' + CONFIG.WORD_TO_REMOVE + '"');
  Logger.log('---------------------------------------------------');

  do {
    var response = People.People.Connections.list('people/me', {
      personFields: 'names',
      pageSize: 200,
      pageToken: pageToken
    });

    var connections = response.connections || [];

    connections.forEach(function (person) {
      totalChecked++;
      if (!person.names || !person.names[0]) return;

      var nameObj = person.names[0];
      var givenName = nameObj.givenName || '';
      var familyName = nameObj.familyName || '';
      var displayName = nameObj.displayName || (givenName + ' ' + familyName).trim();

      var hasMatch = wordRegex.test(givenName) || wordRegex.test(familyName);
      // reset lastIndex since we used the 'g' flag and .test() can be stateful
      wordRegex.lastIndex = 0;

      if (!hasMatch) return;
      matched++;

      var newGivenName = givenName.replace(wordRegex, '').replace(/\s{2,}/g, ' ').trim();
      var newFamilyName = familyName.replace(wordRegex, '').replace(/\s{2,}/g, ' ').trim();
      var newDisplayName = (newGivenName + ' ' + newFamilyName).trim();

      if (CONFIG.DRY_RUN) {
        Logger.log(displayName + '  -->  ' + newDisplayName);
        return;
      }

      try {
        People.People.updateContact(
          { names: [{ givenName: newGivenName, familyName: newFamilyName }], etag: person.etag },
          person.resourceName,
          { updatePersonFields: 'names' }
        );
        Logger.log('Updated: ' + displayName + '  -->  ' + newDisplayName);
        updated++;
        Utilities.sleep(CONFIG.DELAY_BETWEEN_UPDATES_MS);
      } catch (e) {
        errors++;
        Logger.log('ERROR updating ' + person.resourceName + ': ' + e.message);
      }
    });

    pageToken = response.nextPageToken;
  } while (pageToken);

  Logger.log('---------------------------------------------------');
  Logger.log('Total contacts checked: ' + totalChecked);
  Logger.log('Matched "' + CONFIG.WORD_TO_REMOVE + '": ' + matched);
  if (!CONFIG.DRY_RUN) {
    Logger.log('Updated: ' + updated);
    Logger.log('Errors: ' + errors);
  } else {
    Logger.log('This was a DRY RUN. No changes were saved.');
    Logger.log('If this looks correct, set DRY_RUN to false in CONFIG and run again.');
  }
}
