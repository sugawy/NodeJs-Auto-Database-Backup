const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const config = require('./config.json');

// Create backup directory if it doesn't exist
const backupDir = path.resolve(__dirname, config.backup.outputDir);
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Function to execute shell commands
function runCommand(command, callback) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return callback(error);
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }
    console.log(`Stdout: ${stdout}`);
    callback(null);
  });
}

// Function to perform the backup
function backupDatabase() {
  const now = new Date();
  const dateDir = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const dailyBackupDir = path.join(backupDir, dateDir);

  // Create a subdirectory for the current date
  if (!fs.existsSync(dailyBackupDir)) {
    fs.mkdirSync(dailyBackupDir, { recursive: true });
  }

  const timestamp = now.toISOString().replace(/[-:.]/g, '_');
  const backupFile = path.join(dailyBackupDir, `${config.db.database}_${timestamp}.sql`);

  const command = `"mysqldump" -h ${config.db.host} -u ${config.db.user} -p${config.db.password} ${config.db.database} > "${backupFile}"`;
  runCommand(command, (error) => {
    if (error) return;
    console.log(`Database backup successful: ${backupFile}`);
    cleanOldBackups();
    uploadToGitHub();
  });
}

// Function to clean up backups older than the retention period
function cleanOldBackups() {
  const retentionPeriod = config.backup.retentionDays; // Read from config
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionPeriod);

  fs.readdirSync(backupDir).forEach((folder) => {
    const folderPath = path.join(backupDir, folder);
    if (fs.lstatSync(folderPath).isDirectory()) {
      const folderDate = new Date(folder);
      if (!isNaN(folderDate) && folderDate < cutoffDate) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`Deleted old backup folder: ${folderPath}`);
      }
    }
  });
}

// Function to upload backups to GitHub
function uploadToGitHub() {
  const commands = [
    `git -C ${backupDir} init`, // Initialize Git repository if not already
    `git -C ${backupDir} remote add origin ${config.github.repo} || true`, // Add remote repository
    `git -C ${backupDir} add .`, // Stage changes
    `git -C ${backupDir} commit -m "${config.github.commitMessage}"`, // Commit changes
    `git -C ${backupDir} branch -M ${config.github.branch}`, // Set branch name
    `git -C ${backupDir} push -u origin ${config.github.branch} --force` // Push changes
  ];

  // Execute commands sequentially
  (function executeCommands(index) {
    if (index >= commands.length) {
      console.log('Backup uploaded to GitHub successfully.');
      return;
    }
    runCommand(commands[index], (error) => {
      if (error) return;
      executeCommands(index + 1);
    });
  })(0);
}

// Calculate interval in milliseconds
const interval = config.backup.intervalHours * 60 * 60 * 1000;

// Start backup immediately, then every interval
backupDatabase();
setInterval(backupDatabase, interval);
