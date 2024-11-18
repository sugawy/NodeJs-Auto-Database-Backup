# NodeJs Automatic Database Backup
## Node Js Script to backup databases. Made to backup a fivem server database. Can work in other use cases.


<b>Step 1: Prepare Your Environment</b>

Install Required Tools:
Node.js:
Download and install from https://nodejs.org/.
During installation, ensure you check the box to add Node.js to your PATH.

MariaDB/MySQL Client Tools:
Verify that mysqldump.exe is installed (typically with MariaDB).
If not, reinstall MariaDB or download the client tools.

Add the directory containing mysqldump.exe (e.g., C:\Program Files\MariaDB 10.11\bin) to your system's PATH environment variable:

Open Control Panel > System > Advanced system settings > Environment Variables.
Under System variables, find and edit Path.
Add the directory containing mysqldump.exe.
Git for Windows:
Download from https://git-scm.com/.
During installation, ensure you check the option to add Git to your PATH.

<b>Step 2: Set Up GitHub Repository</b>

Create a GitHub repository for storing backups.
Set up SSH or HTTPS authentication:
SSH Authentication:
Generate an SSH key:


ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

Add the public key (~/.ssh/id_rsa.pub) to your GitHub account under Settings > SSH and GPG keys.

HTTPS with PAT:
If using HTTPS, create a Personal Access Token (PAT) in GitHub with the repo scope.



## This should work fine on Linux as well.
