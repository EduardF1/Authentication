# Why ?
- Multiple users might access the web platform using different accounts.
- An account will have related data (such as user preferences, contact information etc.).
- They sign up to the platform using a username and a password, and the platform provider/owner associates their account with a
database entry to uniquely identify the user(s) and to save all user-generated data related to the account.
- Each time the user logs in to their account, the user will be able to access their data and use/retrieve their
private (personal) information. Another reason for using authentication is the limitations/restrictions that different user types
should have (common user - client vs premium user tiers - more available services vs Platform Admin).
  
# The complexity/difficulty of Authentication
- Is related not to setting up authentication itself but rather the different layers/levels of security that the platform can have.

- Website structure:

              |-----> Register ---
Home page --> |                  |-----> Secrets
              |-----> Log In -----   

# Level 1 security (Username and password only, plain text account data storage)
- Email & Password authentication (account creation and validation). This is done using a Database of users.
- This approach raises the following problem (passwords stored in plain text), if a DBA wants to gain access 
  to a specific password (related to an account, he could easily do it). Furthermore, a hacker would also have the possibility to read the DB records
  and then use the gained information maliciously (worst case scenario, a user reuses his password for all platforms/accounts).
  
# Level 2 security (Database encryption)
- Using a secret, a message is encrypted and only by knowing the key can the message be decrypted and read. Remember the Enigma Machine story.
- The Caesar cipher, messages encrypted by shifting letters to the left. Say the shift was of 3. Then the message M = `Hello how are you` would become M' = `Khoor krz duh brx`.
- The core principle of Cryptography/Encryption is the message encoding/decoding through the use of a key/secret.

- Implementation with `mongoose-encryption` (can be used for both encryption and authentication). Encryption performed using the AES-256-CBC algorithm, at DB insertion (create), encrypt and
  at find (read), decrypt.
  
# Level 3 Using Environment variables
- Docs.: https://www.npmjs.com/package/dotenv
- Story case: https://www.theregister.com/2015/01/06/dev_blunder_shows_github_crawling_with_keyslurping_bots/.
- The issue of posting code with API keys/secrets used within code and then being exploited after being posted on Github.
- Find on NPM : `.ENV`.