
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

// Load env vars
function getEnv(key) {
    // Try process.env first
    if (process.env[key]) return process.env[key];

    // Try .env.coolify
    try {
        const envPath = path.join(__dirname, '..', '.env.coolify');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
            if (match) return match[1].trim().replace(/^["']|["']$/g, '');
        }
    } catch (e) { }

    return null;
}

const GITHUB_TOKEN = getEnv('GITHUB_TOKEN');
const GITHUB_USERNAME = getEnv('GITHUB_USERNAME');
const PROJECT_NAME = 'autopartquote';

function log(msg) { console.log(`\x1b[36m[DEPLOY]\x1b[0m ${msg}`); }
function error(msg) { console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`); process.exit(1); }

async function createGitHubRepo() {
    log(`Creating private GitHub repository: ${PROJECT_NAME}...`);

    const data = JSON.stringify({
        name: PROJECT_NAME,
        private: true,
        description: 'Auto-deployed to Coolify via AutoPartQuote'
    });

    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'api.github.com',
            path: '/user/repos',
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'AutoPartQuote-Deploy',
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const response = JSON.parse(body);
                if (res.statusCode === 201) {
                    log('Repository created successfully.');
                    resolve(response.clone_url);
                } else if (res.statusCode === 422 && response.errors && response.errors[0].message.includes('already exists')) {
                    log('Repository already exists. Using existing one.');
                    resolve(`https://github.com/${GITHUB_USERNAME}/${PROJECT_NAME}.git`);
                } else {
                    reject(`GitHub API Error: ${JSON.stringify(response)}`);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

async function pushToGitHub(repoUrl) {
    try {
        log('Configuring Git...');

        // Configure git user
        try { execSync('git config user.email "deploy@autopartquote.ai"'); } catch (e) { }
        try { execSync('git config user.name "AutoPartQuote Deployer"'); } catch (e) { }

        // Initialize if needed
        if (!fs.existsSync(path.join(__dirname, '..', '.git'))) {
            execSync('git init', { cwd: path.join(__dirname, '..') });
        }

        const cwd = path.join(__dirname, '..');

        log('Adding files...');
        execSync('git add .', { cwd });

        try {
            execSync('git commit -m "Automated deployment"', { cwd });
        } catch (e) {
            log('Nothing to commit or commit failed (ignoring).');
        }

        // Add authentication to URL
        const authRepoUrl = repoUrl.replace('https://', `https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@`);

        log('Pushing to remote...');
        try { execSync('git remote remove origin', { cwd }); } catch (e) { }
        execSync(`git remote add origin ${authRepoUrl}`, { cwd });
        execSync('git branch -M main', { cwd });
        execSync('git push -u origin main --force', { cwd });

        log('Code pushed successfully!');
        return repoUrl;
    } catch (e) {
        error(`Failed to push to GitHub: ${e.message}`);
    }
}

async function main() {
    if (!GITHUB_TOKEN || !GITHUB_USERNAME) {
        error('Missing GitHub credentials. Please provide GITHUB_TOKEN and GITHUB_USERNAME in .env.coolify');
    }

    try {
        const repoUrl = await createGitHubRepo();
        await pushToGitHub(repoUrl);

        console.log('\n\x1b[32m✅ DEPLOYMENT CODE PUSHED SUCCESSFULLY!\x1b[0m');
        console.log(`\nNext Steps in Coolify:`);
        console.log(`1. Create New Resource -> Git Repository (Private)`);
        console.log(`2. Paste this URL: \x1b[33m${repoUrl}\x1b[0m`);
        console.log(`3. Use User: ${GITHUB_USERNAME} and your Token.`);
        console.log(`4. Select "Docker Compose" build pack.`);
    } catch (e) {
        error(e);
    }
}

main();
