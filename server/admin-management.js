const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createConnection() {
  return await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'flower_ecommerce'
  });
}

// Create a new admin user
async function createAdmin(email, password, firstName, lastName) {
  try {
    const connection = await createConnection();

    // Check if user already exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      console.log(`❌ User with email ${email} already exists!`);
      await connection.end();
      return false;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create admin user
    await connection.execute(
      'INSERT INTO users (email, password, first_name, last_name, role, is_active, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, 'admin', 1, 1]
    );
    
    console.log(`✅ Admin user created successfully!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Name: ${firstName} ${lastName}`);
    console.log(`🎯 Role: admin`);
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    return false;
  }
}

// List all admin users
async function listAdmins() {
  try {
    const connection = await createConnection();
    
    const [admins] = await connection.execute(
      'SELECT id, email, first_name, last_name, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
      ['admin']
    );
    
    console.log('\n👥 Admin Users:');
    console.log('================');
    
    if (admins.length === 0) {
      console.log('No admin users found.');
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.first_name} ${admin.last_name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Created: ${admin.created_at}`);
        console.log('');
      });
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error listing admins:', error.message);
  }
}

// Update admin user
async function updateAdmin(userId, updates) {
  try {
    const connection = await createConnection();
    
    const updateFields = [];
    const updateValues = [];
    
    if (updates.first_name) {
      updateFields.push('first_name = ?');
      updateValues.push(updates.first_name);
    }
    
    if (updates.last_name) {
      updateFields.push('last_name = ?');
      updateValues.push(updates.last_name);
    }
    
    if (updates.email) {
      updateFields.push('email = ?');
      updateValues.push(updates.email);
    }
    
    if (updates.password) {
      const hashedPassword = await bcrypt.hash(updates.password, 12);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }
    
    if (updateFields.length === 0) {
      console.log('❌ No fields to update');
      await connection.end();
      return false;
    }
    
    updateValues.push(userId);
    
    await connection.execute(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role = 'admin'`,
      updateValues
    );
    
    console.log(`✅ Admin user ${userId} updated successfully!`);
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Error updating admin:', error.message);
    return false;
  }
}

// Delete admin user
async function deleteAdmin(userId) {
  try {
    const connection = await createConnection();
    
    const [result] = await connection.execute(
      'DELETE FROM users WHERE id = ? AND role = ?',
      [userId, 'admin']
    );
    
    if (result.affectedRows === 0) {
      console.log(`❌ Admin user with ID ${userId} not found!`);
      await connection.end();
      return false;
    }
    
    console.log(`✅ Admin user ${userId} deleted successfully!`);
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Error deleting admin:', error.message);
    return false;
  }
}

// Main function to handle command line arguments
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'create':
      const email = process.argv[3];
      const password = process.argv[4];
      const firstName = process.argv[5];
      const lastName = process.argv[6];
      
      if (!email || !password || !firstName || !lastName) {
        console.log('Usage: node admin-management.js create <email> <password> <firstName> <lastName>');
        console.log('Example: node admin-management.js create admin2@example.com AdminPass123 John Doe');
        return;
      }
      
      await createAdmin(email, password, firstName, lastName);
      break;
      
    case 'list':
      await listAdmins();
      break;
      
    case 'update':
      const userId = process.argv[3];
      const updates = {};
      
      for (let i = 4; i < process.argv.length; i += 2) {
        const field = process.argv[i];
        const value = process.argv[i + 1];
        if (field && value) {
          updates[field] = value;
        }
      }
      
      if (!userId || Object.keys(updates).length === 0) {
        console.log('Usage: node admin-management.js update <userId> <field> <value> [field2] [value2] ...');
        console.log('Example: node admin-management.js update 6 first_name Jane password NewPass123');
        return;
      }
      
      await updateAdmin(userId, updates);
      break;
      
    case 'delete':
      const deleteUserId = process.argv[3];
      
      if (!deleteUserId) {
        console.log('Usage: node admin-management.js delete <userId>');
        console.log('Example: node admin-management.js delete 6');
        return;
      }
      
      await deleteAdmin(deleteUserId);
      break;
      
    default:
      console.log('🛠️  Admin Management Tool');
      console.log('========================');
      console.log('');
      console.log('Commands:');
      console.log('  create <email> <password> <firstName> <lastName>  - Create new admin');
      console.log('  list                                            - List all admins');
      console.log('  update <userId> <field> <value> [field2] [value2] - Update admin');
      console.log('  delete <userId>                                 - Delete admin');
      console.log('');
      console.log('Examples:');
      console.log('  node admin-management.js create admin2@example.com AdminPass123 John Doe');
      console.log('  node admin-management.js list');
      console.log('  node admin-management.js update 6 first_name Jane password NewPass123');
      console.log('  node admin-management.js delete 6');
  }
}

main().catch(console.error);
