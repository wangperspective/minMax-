// 重置密码脚本
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function resetPassword() {
  // 连接数据库
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '314419',
    database: 'admin_system'
  });

  try {
    // 生成密码哈希
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);

    console.log('密码哈希值:', hash);

    // 更新admin用户密码
    await connection.execute(
      'UPDATE users SET password = ? WHERE username = ?',
      [hash, 'admin']
    );

    console.log('✅ admin 用户密码已重置为: admin123');

    // 更新user用户密码
    await connection.execute(
      'UPDATE users SET password = ? WHERE username = ?',
      [hash, 'user']
    );

    console.log('✅ user 用户密码已重置为: admin123');

  } finally {
    await connection.end();
  }
}

resetPassword().catch(console.error);
