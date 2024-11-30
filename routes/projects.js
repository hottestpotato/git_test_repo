const express = require('express');
const db = require('../db');

const router = express.Router();

// 모든 프로젝트 가져오기
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM projects ORDER BY created_at DESC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// 특정 상태의 프로젝트 가져오기
router.get('/status/:status', (req, res) => {
    const { status } = req.params;

    // 상태 값 검증
    if (!['in_progress', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }

    const sql = 'SELECT * FROM projects WHERE status = ? ORDER BY created_at DESC';
    db.query(sql, [status], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// 마감일 기준 정렬된 프로젝트 가져오기
router.get('/sorted/:order', (req, res) => {
    const { order } = req.params;

    // 정렬 순서 검증
    if (!['asc', 'desc'].includes(order.toLowerCase())) {
        return res.status(400).json({ error: 'Invalid order value. Use "asc" or "desc".' });
    }

    const sql = `SELECT * FROM projects ORDER BY deadline ${order.toUpperCase()}`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});



// 새로운 프로젝트 추가
router.post('/', (req, res) => {
    console.log(req.body); // 디버깅: 클라이언트에서 받은 데이터 확인
    const { name, description, deadline } = req.body;

    if (!name || !description || !deadline) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const sql = 'INSERT INTO projects (name, description, deadline) VALUES (?, ?, ?)';
    db.query(sql, [name, description, deadline], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ id: result.insertId, name, description, deadline, status: 'in_progress', progress: 0 });
    });
});


// 프로젝트 상태 또는 진행률 업데이트
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { status, progress } = req.body;

    if (progress !== undefined && (progress < 0 || progress > 100)) {
        return res.status(400).json({ error: 'Progress must be between 0 and 100.' });
    }

    const updates = [];
    const values = [];

    if (status) {
        updates.push('status = ?');
        values.push(status);
    }

    if (progress !== undefined) {
        updates.push('progress = ?');
        values.push(progress);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update.' });
    }

    const sql = `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id);

    db.query(sql, values, (err) => {
        if (err) return res.status(500).send(err);
        res.send('Project updated successfully.');
    });
});




// 프로젝트 삭제
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM projects WHERE id = ?';
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).send(err);
        res.send('프로젝트가 삭제되었습니다.');
    });
});

module.exports = router;
