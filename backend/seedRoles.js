const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm';

async function seedRoles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const roles = ['CEO', 'Sales', 'Manager', 'Support', 'admin'];
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    for (const role of roles) {
      const email = `${role.toLowerCase()}@prodify.com`;
      const name = `${role} User`;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log(`User ${email} already exists, updating role...`);
        existingUser.role = role;
        await existingUser.save();
        continue;
      }

      const user = new User({
        name,
        email,
        password: hashedPassword,
        role
      });

      await user.save();
      console.log(`Created ${role} user: ${email}`);
    }

    console.log('\nAll test users created successfully!');
    console.log('Password for all users: ' + password);

  } catch (error) {
    console.error('Error seeding roles:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seedRoles();
