
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
            if (match) {
                let val = match[1].trim().replace(/^["']|["']$/g, '');
                // Sanitization for URL
                if (key === 'COOLIFY_SERVER' && val.endsWith('/')) {
                    val = val.slice(0, -1);
                }
                return val;
            }
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

const COOLIFY_SERVER = getEnv('COOLIFY_SERVER');
const COOLIFY_TOKEN = getEnv('COOLIFY_TOKEN');

async function deployToCoolify(repoUrl) {
    if (!COOLIFY_SERVER || !COOLIFY_TOKEN) {
        log('Coolify credentials missing. Skipping automated Coolify deployment.');
        return;
    }

    log('Deploying to Coolify...');

    // 1. Get List of Servers
    const servers = await coolifyRequest('/api/v1/servers');
    if (!servers || servers.length === 0) throw new Error('No servers found in Coolify.');
    const serverUuid = servers[0].uuid; // Use first server

    // 2. Check if project exists or create new
    let project = null;
    try {
        const projects = await coolifyRequest('/api/v1/projects');
        project = projects.find(p => p.name === PROJECT_NAME);
    } catch (e) { }

    if (!project) {
        log(`Creating new project: ${PROJECT_NAME}...`);
        project = await coolifyRequest('/api/v1/projects', 'POST', {
            name: PROJECT_NAME,
            description: 'Deployed via AutoPartQuote'
        });
    }
    const projectUuid = project.uuid;

    // 3. Create Environment (Production)
    let environment = project.environments?.find(e => e.name === 'production');
    if (!environment) {
        // Environments usually exist by default, but just in case
        environment = await coolifyRequest(`/api/v1/projects/${projectUuid}/environments`, 'POST', { name: 'production' });
    }

    // 4. Create Application (Git Resource)
    log('Creating application resource...');
    const app = await coolifyRequest(`/api/v1/projects/${projectUuid}/${environment.name}/applications`, 'POST', {
        server_uuid: serverUuid,
        git_repository: repoUrl,
        branch: 'main',
        build_pack: 'docker_compose',
        ports_expose: '3000',
        name: PROJECT_NAME,
        git_user: GITHUB_USERNAME,
        git_token: GITHUB_TOKEN
    });

    log(`Application created! UUID: ${app.uuid}`);

    // 5. Deploy
    log('Triggering deployment...');
    await coolifyRequest(`/api/v1/applications/${app.uuid}/deploy`, 'POST', { force: true });

    log('Deployment triggered successfully! Check your Coolify dashboard.');
}

async function coolifyRequest(endpoint, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const urlStr = `${COOLIFY_SERVER}${endpoint}`;
        try {
            new URL(urlStr); // Validate URL
        } catch (e) {
            reject(`Invalid URL constructed: "${urlStr}" (Check COOLIFY_SERVER)`);
            return;
        }

        const isHttps = urlStr.startsWith('https');
        const lib = isHttps ? https : require('http');

        const req = lib.request(urlStr, {
            method,
            headers: {
                'Authorization': `Bearer ${COOLIFY_TOKEN}`,
                'Content-Type': 'application/json'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) { resolve(data); } // Handle non-JSON response
                } else {
                    reject(`Coolify API Error (${res.statusCode}): ${data}`);
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    if (!GITHUB_TOKEN || !GITHUB_USERNAME) {
        error('Missing GitHub credentials. Please provide GITHUB_TOKEN and GITHUB_USERNAME in .env.coolify');
    }

    try {
        log('Starting Deployment Process...');
        const repoUrl = await createGitHubRepo();
        await pushToGitHub(repoUrl);

        console.log('\n\x1b[32m✅ CODE PUSHED TO GITHUB!\x1b[0m');

        await deployToCoolify(repoUrl);
        console.log('\n\x1b[32m🚀 FULL DEPLOYMENT SEQUENCE COMPLETE!\x1b[0m');

    } catch (e) {
        error(e);
    }
}

main();
