const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Admin Password Setup');
console.log('----------------------');

rl.question('Enter your desired admin password: ', async (password) => {
  try {
    const hash = await bcrypt.hash(password, 10);
    
    console.log('\n✅ Password hash generated successfully!');
    console.log('\n📝 Add this to your .env file:');
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
    console.log('\nThen restart the server and login with:');
    console.log('Username: admin');
    console.log(`Password: ${password}`);
    
  } catch (error) {
    console.error('Error generating password hash:', error);
  }
  
  rl.close();
});