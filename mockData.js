export const MOCK_DATA = [
    // Student A: Excel Dates, High Performing
    { 이름: "김철수", 과목: "수학", 과제명: "미적분 심화 문제풀이", 날짜: 45290.5, 상태: "완료", 점수: 95, 풀이시간: 50, 복습시간: 20, 반: "S반" },
    { 이름: "김철수", 과목: "수학", 과제명: "기하와 벡터 기초", 날짜: 45292.5, 상태: "완료", 점수: 88, 풀이시간: 45, 복습시간: 15, 반: "S반" },
    { 이름: "김철수", 과목: "영어", 과제명: "수능 필수 영단어 Day1", 날짜: 45300.5, 상태: "완료", 점수: 100, 풀이시간: 30, 복습시간: 10, 반: "S반" },

    // Student B: String Dates, Middle Performing, Mixed Status
    { name: "이영희", subject: "국어", assignmentName: "비문학 독해 연습", date: "2026-01-05", status: "완료", score: 78, solveTime: "40", reviewTime: "0", class: "A반" },
    { name: "이영희", subject: "국어", assignmentName: "고전시가 특강", date: "2026-01-08", status: "미완료", score: 0, solveTime: 0, reviewTime: 0, class: "A반" },
    { name: "이영희", subject: "수학", assignmentName: "확률과 통계", date: "2026.01.02", status: "완료", score: 82, solveTime: 60, reviewTime: 30, class: "A반" },

    // Student C: Recent Data (for RealTime View), varied formats
    { 이름: "박지성", 과목: "과학", 과제명: "물리I 역학 과제", 날짜: new Date().toISOString().split('T')[0], 상태: "완료", 점수: 92, 풀이시간: "01:20:00", 복습시간: 40, 반: "B반" },
    { 이름: "박지성", 과목: "과학", 과제명: "화학I 산화환원 과제", 날짜: new Date(Date.now() - 86400000).toISOString().split('T')[0], 상태: "진행중", 점수: 0, 풀이시간: 30, 복습시간: 0, 반: "B반" },

    // Student D: Old Data (Should be filtered out in RealTime, visible in Dashboard with large range)
    { 이름: "최동수", 과목: "영어", 과제명: "6월 모의고사 복기", 날짜: "2025-06-15", 상태: "완료", 점수: 85, 풀이시간: 70, 복습시간: 30, 반: "A반" },

    // Edge Case: Missing Class, Missing Score (should default to 0)
    { 이름: "정미나", 과목: "수학", 과제명: "함수의 극한", 날짜: 45280, 상태: "완료", 풀이시간: 40 },
];
