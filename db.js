const mysql = require('mysql2');

// MySQL 데이터베이스 연결 설정
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',           // MySQL 사용자 이름
//     password: 'Dnflwlq809!', // MySQL 비밀번호
//     database: 'project_manager'
// });

const db = mysql.createConnection({
    host: 'pm-database.ckn5bghmmz5k.us-east-1.rds.amazonaws.com',
    user: 'admin',           // MySQL 사용자 이름
    password: 'pm-password', // MySQL 비밀번호
    database: 'project_manager'
});

// 연결 확인
db.connect((err) => {
    if (err) {
        console.error('MySQL 연결 실패:', err.message);
    } else {
        console.log('MySQL 연결 성공!');
    }
});

module.exports = db;
