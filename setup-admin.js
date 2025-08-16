// setup-admin.js
const readline = require('readline');
const https = require('https');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('========================================');
console.log('PerfectRatio Admin Setup');
console.log('========================================\n');

// Change this to your Railway URL
const SERVER_URL = 'https://perfectratio-production.up.railway.app';

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setupAdmin() {
    try {
        // Get admin credentials
        const username = await question('Enter admin username: ');
        const password = await question('Enter admin password: ');
        const confirmPassword = await question('Confirm password: ');
        
        if (password !== confirmPassword) {
            console.log('\n❌ Passwords do not match!');
            rl.close();
            return;
        }
        
        if (password.length < 8) {
            console.log('\n❌ Password must be at least 8 characters!');
            rl.close();
            return;
        }
        
        const setupKey = await question('Enter SETUP_KEY from Railway environment variables: ');
        
        console.log('\nCreating admin user...');
        
        // Make request to create admin
        const data = JSON.stringify({
            username,
            password,
            setupKey
        });
        
        const url = new URL(`${SERVER_URL}/admin/setup`);
        
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };
        
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(responseData);
                    
                    if (res.statusCode === 200) {
                        console.log('\n✅ Admin user created successfully!');
                        console.log('\n========================================');
                        console.log('You can now login at:');
                        console.log(`${SERVER_URL}/login.html`);
                        console.log('========================================\n');
                    } else {
                        console.log(`\n❌ Error: ${response.error || 'Failed to create admin user'}`);
                        if (response.error === 'Admin user already exists') {
                            console.log('\nAn admin user has already been created.');
                            console.log('If you forgot your password, you may need to:');
                            console.log('1. Delete the perfectratio.db file and restart the server');
                            console.log('2. Or manually update the database');
                        }
                    }
                } catch (e) {
                    console.log('\n❌ Error:', responseData);
                }
                
                rl.close();
            });
        });
        
        req.on('error', (error) => {
            console.log('\n❌ Connection error:', error.message);
            console.log('\nMake sure:');
            console.log('1. Your server is running');
            console.log('2. The SERVER_URL is correct');
            console.log('3. You have internet connection');
            rl.close();
        });
        
        req.write(data);
        req.end();
        
    } catch (error) {
        console.log('\n❌ Error:', error.message);
        rl.close();
    }
}

// Run setup
setupAdmin();
