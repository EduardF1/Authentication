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
```
              |-----> Register ---
Home page --> |                  |-----> Secrets
              |-----> Log In -----   
```

# Level 1 security : Username and password only, plain text account data storage
- Email & Password authentication (account creation and validation). This is done using a Database of users.
- This approach raises the following problem (passwords stored in plain text), if a DBA wants to gain access 
  to a specific password (related to an account, he could easily do it). Furthermore, a hacker would also have the possibility to read the DB records
  and then use the gained information maliciously (worst case scenario, a user reuses his password for all platforms/accounts).
  
# Level 2 security : Database encryption
- Using a secret, a message is encrypted and only by knowing the key can the message be decrypted and read. Remember the Enigma Machine story.
- The Caesar cipher, messages encrypted by shifting letters to the left. Say the shift was of 3. Then the message M = `Hello how are you` would become M' = `Khoor krz duh brx`.
- The core principle of Cryptography/Encryption is the message encoding/decoding through the use of a key/secret.

- Implementation with `mongoose-encryption` (can be used for both encryption and authentication). Encryption performed using the AES-256-CBC algorithm, at DB insertion (create), encrypt and
  at find (read), decrypt.
  
```
ENC.: PASSWORD + KEY  --CIPHER_METHOD-->  CIPHERTEXT
DEC.: CIPHERTEXT + KEY --CIPHER_METHOD--> PASSWORD 
```

# Using Environment variables
- Docs.: https://www.npmjs.com/package/dotenv
- Story case: https://www.theregister.com/2015/01/06/dev_blunder_shows_github_crawling_with_keyslurping_bots/.
- The issue of posting code with API keys/secrets used within code and then being exploited after being posted on Github.
- Find on NPM : `.ENV`.
- We should remember though that Github history is accessible, thus, if say the application was using level 2 security and then it was
updated to level 3, most likely in the commit history of the project, secrets would be shown.
  <span style="color:red">**This is why the first consideration when starting a project should be the creation of the environment variables file env file, and the inclusion of sensitive data within it.**</span>
- When deploying to Heroku, we can use the `Dashboard -> Settings -> Config Variables` section to store config/env variables (the storage pattern is that of the same as in .env files).  

# Level 3 security : Hashing
- Docs.: https://www.npmjs.com/package/md5
```
ENC.: PASSWORD  --HASH_F-->  CIPHERTEXT
- Almost impossible to decode, fast and easy to encode.
```
- The mechanism is that upon user registration, the registration password is hashed, and the hash is stored within the DB. Upon user log in, a new hash is produced, and it is compared against the initial one (DB stored hash 
  vs currently entered hash), if the hashes match, then the validation passes.

# How passwords might be hacked
- The same password is mapped to the same hash.
- A hacker might break into for example LinkedIn and obtain several accounts, and their hashed passwords. Afterwards, the hacker might build a hashtable and use it to store the key-value pairs of the most used passwords, and their
hashed values. Afterwards, by looking up the user table (retrieved linkedIn accounts) against the made hash table (most commonly used passwords) and comparing them, the hacker would be able to decode the hashed passwords.
- The longer a password is, and the more diversified, the longer it takes to break it. The decoding difficulty increases exponentially with the length of the password.
- Remember the dictionary attack type and hash table construction.

# Level 4 security : Hashing & Salting
- Docs.: https://www.npmjs.com/package/bcrypt
```
ENC.: PASSWORD + SALT  --HASH_F-->  CIPHERTEXT
- Where the SALT is a set of randomly generated characters which is stored in the DB.
- Within the DB we would store only the hash and salt.
```
- The concept of Salting Rounds:
  ```
  PASSWORD + SALT --> HASH /then : HASH + SALT --> HASH' /then : HASH' + SALT --> HASH''.
  The number of procedure occurence is the number of salt rounds.
  ```
- DB contents:  username, the hashed password after a set number of salting rounds, the randomly generated salt
- Login (authentication) : take the stored password, combine it with the salt that is stored in the DB and run it through the same set number of salting rounds until
we reach the final hash. Then, compare the final hash against the one stored in the DB, if they match, the authentication is valid.
  <span style="color:green">**To install specific versions of npm packages, run `npm i packageName@V_MAJOR.V_MINOR.V_PATCH` where `V_` stands for version.**</span>
  
# Level 5 Security : Cookies and Sessions
- When discussing web development, cookies can be seen as fortune cookies as they have a message packed in them.
- They can be passed around and "broken" to retrieve the message. Cookies are used to save browsing session data.
```
Simplified model:

Day 1: BROWSER (Client) ---GET (browse Amazon.co)----------->  SERVER (ex.: Amazon.co)
                        <--RESPONSE--------------------------
                        --POST (add a PC to shopping cart)-->  
                        <--RESPONSE (Containing a Cookie) ---
                        
- During the browsing session on day, we add 1 PC to our shopping cart (POST REQ. to the server), the response of
the server is to create a cookie storing our selection for the shopping cart.

Day 2: BROWSER (Client) ---GET (browse Amazon.co and send cookie)----------->  SERVER (ex.: Amazon.co)
                        <--RESPONSE------------------------------------------  
                        * the response will contain the previous session's data (the shopping cart list) which will be part of the reponse.
```
- There are multiple types of cookies.

# Sessions
- Periods of time during which a browser interacts with a server. At the moment of logging in to a website, the session starts and that is also
when the session cookie gets created. The session cookie will contain data that specifies that the user is authenticated and in a valid session.
  The cookie is then destroyed at the moment of logging out from the web platform.
- Implementation: using Passport.JS. Run `npm i passport passport-local passport-local-mongoose express-session`.

# Third Party OAuth2.0
- OAuth = Open Authorisation. 
- Delegate the authentication process to a more resourceful company (ex.: FB/G.).
- Why OAuth ? 
1)  Allow granular level of access. 
2)  Read/Write access.
3)  Revoke Access.

- How it works ?
1)  Set up the web app in the 3rd party's dev. console and then use the provided app it (token).
2)  Redirect to Authenticate via the 3rd party platform.
3)  User logs in
4)  User grants permissions to the 3rd party authenticator.
5)  Receive Authorisation code or exchange the code for an access token. (Auth code = 1 time access ticket/ access token = year pass).
