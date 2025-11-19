const { db, dbRun } = require('./database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const initDatabase = async () => {
  try {
    console.log('Initializing database...');

    // Create clubs table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS clubs (
        id TEXT PRIMARY KEY,
        club_name TEXT NOT NULL UNIQUE,
        contact_person TEXT NOT NULL,
        contact_number TEXT NOT NULL,
        email TEXT,
        zone TEXT,
        registration_fee REAL DEFAULT 4000.00,
        payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'approved', 'rejected')),
        payment_method TEXT CHECK(payment_method IN ('BDO', 'G-cash')),
        proof_of_payment_url TEXT,
        upload_date DATETIME,
        approved_by TEXT,
        approved_date DATETIME,
        rejection_reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Clubs table created');

    // Create members table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        club_id TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        contact_number TEXT NOT NULL,
        email TEXT NOT NULL,
        callsign TEXT,
        position TEXT,
        badge_number TEXT UNIQUE,
        qr_code_url TEXT,
        badge_generated INTEGER DEFAULT 0,
        badge_sent INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Members table created');

    // Create payment_info table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS payment_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_method TEXT NOT NULL,
        account_name TEXT NOT NULL,
        account_number TEXT,
        mobile_number TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Payment info table created');

    // Create email_logs table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id TEXT PRIMARY KEY,
        club_id TEXT,
        member_id TEXT,
        email_type TEXT NOT NULL CHECK(email_type IN ('registration_confirmation', 'payment_reminder', 'approval_notification', 'badge_delivery', 'rejection_notification')),
        recipient_email TEXT NOT NULL,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending' CHECK(status IN ('sent', 'failed', 'pending')),
        error_message TEXT,
        FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
      )
    `);
    console.log('✓ Email logs table created');

    // Create zones table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS zones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        zone_name TEXT NOT NULL UNIQUE,
        total_clubs INTEGER DEFAULT 0,
        paid_clubs INTEGER DEFAULT 0,
        is_complete INTEGER DEFAULT 0,
        lechon_claimed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Zones table created');

    // Create admins table for authentication
    await dbRun(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'admin' CHECK(role IN ('admin')),
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Admins table created');

    // Create attendance_logs table for event check-ins
    await dbRun(`
      CREATE TABLE IF NOT EXISTS attendance_logs (
        id TEXT PRIMARY KEY,
        member_id TEXT NOT NULL,
        scan_type TEXT DEFAULT 'check-in' CHECK(scan_type IN ('check-in', 'check-out', 'verify')),
        scanned_by TEXT,
        scan_location TEXT,
        notes TEXT,
        scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
        FOREIGN KEY (scanned_by) REFERENCES admins(id) ON DELETE SET NULL
      )
    `);
    console.log('✓ Attendance logs table created');

    // Create indexes
    await dbRun('CREATE INDEX IF NOT EXISTS idx_clubs_payment_status ON clubs(payment_status)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_clubs_zone ON clubs(zone)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_members_club_id ON members(club_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_members_email ON members(email)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_members_badge_number ON members(badge_number)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON attendance_logs(member_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_attendance_scanned_at ON attendance_logs(scanned_at)');
    console.log('✓ Indexes created');

    // Insert default payment information
    const paymentCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM payment_info', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    if (paymentCount === 0) {
      await dbRun(`
        INSERT INTO payment_info (payment_method, account_name, account_number, mobile_number)
        VALUES
          ('BDO', 'Rotary Club of Marikina Hilltop', '0021 5802 5770', NULL),
          ('G-cash', 'Karl Marcus Montaner', NULL, '0917 522 5275')
      `);
      console.log('✓ Default payment information inserted');
    }

    // Create default admin user (username: admin, password: admin123)
    const adminCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM admins', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminId = uuidv4();
      await dbRun(`
        INSERT INTO admins (id, username, password, name, email, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [adminId, 'admin', hashedPassword, 'System Administrator', 'admin@palarotary.com', 'admin']);
      console.log('✓ Default admin user created (username: admin, password: admin123)');
    }

    console.log('\n✅ Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
