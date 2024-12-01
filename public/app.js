// API 엔드포인트
const API_URL = 'http://pm-load-balancer-227593286.us-east-1.elb.amazonaws.com/api/projects';

// 프로젝트 목록을 가져와 화면에 렌더링
async function fetchProjects(sortField = null, sortOrder = 'asc') {
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = '<p>Loading...</p>'; // 로딩 메시지 표시

    try {
        const response = await fetch('http://pm-load-balancer-227593286.us-east-1.elb.amazonaws.com/api/projects');
        let projects = await response.json();
        projectList.innerHTML = ''; // 기존 로딩 메시지 제거

        // 정렬 로직
        if (sortField) {
            projects.sort((a, b) => {
                let valueA = a[sortField];
                let valueB = b[sortField];

                // 날짜 필드인 경우
                if (sortField === 'deadline') {
                    valueA = new Date(valueA);
                    valueB = new Date(valueB);
                }

                if (sortOrder === 'asc') {
                    return valueA > valueB ? 1 : -1; // 오름차순
                } else {
                    return valueA < valueB ? 1 : -1; // 내림차순
                }
            });
        }

        projects.forEach((project) => {
            // 데드라인 포맷팅
            const formattedDeadline = project.deadline
                ? new Date(project.deadline).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long', // 요일 포함
                  })
                : 'No Deadline Set';

            const projectDiv = document.createElement('div');
            projectDiv.className = `project ${project.status}`;
            let progressClass = 'low';
            if (project.progress >= 70) progressClass = 'high';
            else if (project.progress >= 40) progressClass = 'medium';

            projectDiv.innerHTML = `
                <h3>${project.name}</h3>
                <p>${project.description}</p>
                <p>Status: <strong>${project.status}</strong></p>
                <p>Progress: <strong>${project.progress}%</strong></p>
                <p>Deadline: <strong>${formattedDeadline}</strong></p>
                <div id="progress-bar-${project.id}" class="progress-bar ${progressClass}">
                    <span style="width: ${project.progress}%;"></span>
                </div>
                <input type="number" id="progress-input-${project.id}" placeholder="Update Progress" min="0" max="100" />
                <button onclick="updateProgress(${project.id})">Update Progress</button>
                <button onclick="updateStatus(${project.id})" ${project.status === 'completed' ? 'disabled' : ''}>
                    Complete
                </button>
                <button onclick="deleteProject(${project.id})">Delete</button>
            `;
            projectList.appendChild(projectDiv);
        });
    } catch (error) {
        projectList.innerHTML = '<p>Failed to load projects.</p>';
        console.error('Error fetching projects:', error);
    }
}


// 프로젝트 추가 폼 이벤트 처리
document.getElementById('project-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // 폼 제출 기본 동작 방지

    const name = document.getElementById('project-name').value;
    const description = document.getElementById('project-description').value;
    const deadline = document.getElementById('project-deadline').value;

    const newProject = { name, description, deadline };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProject)
        });

        if (response.ok) {
            alert('Project added successfully!');
            fetchProjects(); // 목록 다시 로드
        } else {
            alert('Failed to add project.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});


// 진행률 업데이트 함수
async function updateProgress(id) {
    const inputField = document.getElementById(`progress-input-${id}`);
    const newProgress = inputField.value;

    if (newProgress === '' || isNaN(newProgress) || newProgress < 0 || newProgress > 100) {
        alert('Please enter a valid progress between 0 and 100.');
        return;
    }

    try {
        // 로딩 표시
        inputField.disabled = true;
        const response = await fetch(`http://localhost:3000/api/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ progress: parseInt(newProgress, 10) })
        });

        if (response.ok) {
            alert('Progress updated successfully!');
            inputField.value = ''; // 입력 필드 초기화
            fetchProjects(); // 전체 목록 재렌더링
        } else {
            alert('Failed to update progress.');
        }
    } catch (error) {
        console.error('Error updating progress:', error);
    } finally {
        inputField.disabled = false; // 로딩 표시 제거
    }
}


//상태 업데이트 함수
async function updateStatus(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed', progress: 100 })
        });

        if (response.ok) {
            alert('Project updated successfully!');
            fetchProjects(); // 목록 다시 로드
        } else {
            alert('Failed to update project.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

//삭제 함수
async function deleteProject(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/projects/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Project deleted successfully!');
            fetchProjects(); // 목록 다시 로드
        } else {
            alert('Failed to delete project.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 페이지 로드 시 프로젝트 목록 가져오기
window.onload = fetchProjects;
