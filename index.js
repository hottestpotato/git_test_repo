const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const projectRoutes = require('./routes/projects'); // 라우트 연결

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());

// 정적 파일 제공 설정 추가 (여기 추가)
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// 기본 라우트
app.get('/', (req, res) => {
    res.send('프로젝트 관리 앱 서버 실행 중');
});

// 프로젝트 관련 API 라우트 연결
app.use('/api/projects', projectRoutes);

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
//포트 설정(AWS EC2에서 포드 80(HTTP 기본 포트) 사용)
// const PORT = process.env.PORT || 80;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });