import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';

// Firebase 설정 및 초기화
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 앱 ID (Canvas 환경에서 제공되는 전역 변수 사용)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-action-dashboard-app';

// 폰트 및 아이콘 로드 (Tailwind CSS와 함께 사용)
// Inter 폰트: https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap
// Lucide React 아이콘: https://unpkg.com/lucide-react@latest/dist/umd/lucide-react.min.js (CDN 사용)

// Lucide React 아이콘을 위한 더미 컴포넌트 (실제 환경에서는 import하여 사용)
const Bell = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
const User = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const AlertTriangle = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
const Settings = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.73l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2.73l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const FileText = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>;
const Download = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;


// 더미 데이터 생성 함수
const generateDummyIssues = () => {
  const issues = [
    {
      id: 'vuln-2025-12345',
      type: 'vulnerability',
      name: 'Critical CVE 2025-12345',
      impactScore: 9.8,
      discoveryTime: new Date(Date.now() - 3600 * 1000).toISOString(), // 1시간 전
      component: 'OA 로그인 모듈',
      status: 'critical',
      recommendedAction: '지금 패치 적용',
      detailsLink: '#',
      suggestedAlternativeLink: '#',
      description: 'OA 로그인 모듈에서 심각한 원격 코드 실행 취약점이 발견되었습니다. 즉시 패치가 필요합니다.',
      riskScore: 98,
      businessImpact: '높음',
      category: '보안 취약점'
    },
    {
      id: 'license-conflict-001',
      type: 'license_conflict',
      name: 'Apache-2.0 vs GPL-3.0 충돌',
      impactScore: 7.5,
      discoveryTime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1일 전
      component: '데이터 처리 라이브러리',
      status: 'high',
      recommendedAction: '대체 라이브러리 검토',
      detailsLink: '#',
      suggestedAlternativeLink: '#',
      description: '데이터 처리 라이브러리에서 Apache-2.0과 GPL-3.0 라이선스 충돌이 감지되었습니다. 법적 리스크가 존재합니다.',
      riskScore: 75,
      businessImpact: '중간',
      category: '라이선스 리스크'
    },
    {
      id: 'ci-fail-003',
      type: 'ci_failure',
      name: 'CI 빌드 실패: 보안 스캔 오류',
      impactScore: 6.0,
      discoveryTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2시간 전
      component: '결제 서비스 API',
      status: 'medium',
      recommendedAction: 'CI/CD 파이프라인 로그 확인',
      detailsLink: '#',
      suggestedAlternativeLink: '#',
      description: '결제 서비스 API의 CI 빌드 중 보안 스캔 단계에서 오류가 발생했습니다. 빌드 파이프라인을 확인해주세요.',
      riskScore: 60,
      businessImpact: '낮음',
      category: 'CI/CD'
    },
    {
      id: 'vuln-2025-54321',
      type: 'vulnerability',
      name: 'SQL Injection 가능성',
      impactScore: 8.0,
      discoveryTime: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 2일 전
      component: '사용자 관리 시스템',
      status: 'high',
      recommendedAction: '입력 값 검증 강화',
      detailsLink: '#',
      suggestedAlternativeLink: '#',
      description: '사용자 관리 시스템에서 SQL Injection 취약점 가능성이 발견되었습니다. 입력 값 검증 로직을 강화해야 합니다.',
      riskScore: 80,
      businessImpact: '중간',
      category: '보안 취약점'
    },
    {
      id: 'policy-violation-002',
      type: 'policy_violation',
      name: '사용 금지 컴포넌트 사용',
      impactScore: 7.0,
      discoveryTime: new Date(Date.now() - 72 * 3600 * 1000).toISOString(), // 3일 전
      component: '로그 분석 도구',
      status: 'medium',
      recommendedAction: '대체 컴포넌트 교체',
      detailsLink: '#',
      suggestedAlternativeLink: '#',
      description: '로그 분석 도구에서 사내 정책상 사용이 금지된 컴포넌트가 탐지되었습니다. 즉시 교체해야 합니다.',
      riskScore: 70,
      businessImpact: '중간',
      category: '정책 위반'
    },
  ];
  return issues;
};

// 모달 컴포넌트 (alert/confirm 대체)
const Modal = ({ isOpen, title, message, onClose, onConfirm, showConfirmButton = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 font-inter">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
          >
            닫기
          </button>
          {showConfirmButton && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              확인
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// 위젯 컴포넌트
const Widget = ({ title, children, className = '' }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md border border-gray-200 ${className}`}>
    <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
    {children}
  </div>
);

// 메인 앱 컴포넌트
const App = () => {
  const [userId, setUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('developer'); // 기본 역할
  const [issues, setIssues] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', showConfirmButton: false, onConfirm: null });

  // Firebase 인증 및 Firestore 데이터 로드
  useEffect(() => {
    const initFirebase = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined') {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase 인증 오류:", error);
        setModal({
          isOpen: true,
          title: "인증 오류",
          message: "Firebase 인증 중 오류가 발생했습니다. 콘솔을 확인해주세요.",
          onClose: () => setModal({ ...modal, isOpen: false })
        });
      }
    };
    initFirebase();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true);
      } else {
        setUserId(null);
        setIsAuthReady(true); // 인증 상태 확인 완료
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 사용자 역할 및 대시보드 데이터 로드 (인증 완료 후)
  useEffect(() => {
    if (!isAuthReady || !userId) return;

    // 사용자 역할 설정 로드
    const userSettingsDocRef = doc(db, `artifacts/${appId}/users/${userId}/dashboard_settings/user_role`);
    const unsubscribeRole = onSnapshot(userSettingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setCurrentUserRole(docSnap.data().role || 'developer');
      } else {
        // 역할 설정이 없으면 기본값으로 저장
        setDoc(userSettingsDocRef, { role: 'developer' }).catch(e => console.error("역할 저장 오류:", e));
        setCurrentUserRole('developer');
      }
    }, (error) => {
      console.error("역할 스냅샷 오류:", error);
      setModal({
        isOpen: true,
        title: "데이터 로드 오류",
        message: "사용자 역할 정보를 불러오는 데 실패했습니다.",
        onClose: () => setModal({ ...modal, isOpen: false })
      });
    });

    // 이슈 데이터 로드
    const issuesCollectionRef = collection(db, `artifacts/${appId}/public/data/dashboard_issues`);
    // orderBy는 인덱스 오류를 유발할 수 있으므로, 클라이언트 측에서 정렬
    const unsubscribeIssues = onSnapshot(issuesCollectionRef, (snapshot) => {
      const fetchedIssues = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // impactScore 내림차순으로 정렬
      fetchedIssues.sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0));
      setIssues(fetchedIssues);
      if (fetchedIssues.length === 0) {
        // 더미 데이터가 없으면 초기 데이터 추가
        const dummyData = generateDummyIssues();
        dummyData.forEach(issue => {
          setDoc(doc(db, `artifacts/${appId}/public/data/dashboard_issues`, issue.id), issue)
            .catch(e => console.error("더미 이슈 저장 오류:", e));
        });
      }
    }, (error) => {
      console.error("이슈 스냅샷 오류:", error);
      setModal({
        isOpen: true,
        title: "데이터 로드 오류",
        message: "이슈 데이터를 불러오는 데 실패했습니다.",
        onClose: () => setModal({ ...modal, isOpen: false })
      });
    });

    return () => {
      unsubscribeRole();
      unsubscribeIssues();
    };
  }, [isAuthReady, userId]); // isAuthReady와 userId가 변경될 때마다 실행

  // 실시간 시계 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 역할 변경 핸들러
  const handleRoleChange = async (newRole) => {
    if (!userId) return;
    try {
      const userSettingsDocRef = doc(db, `artifacts/${appId}/users/${userId}/dashboard_settings/user_role`);
      await setDoc(userSettingsDocRef, { role: newRole });
      setCurrentUserRole(newRole);
      setModal({
        isOpen: true,
        title: "역할 변경 완료",
        message: `역할이 ${newRole} (으)로 변경되었습니다.`,
        onClose: () => setModal({ ...modal, isOpen: false })
      });
    } catch (error) {
      console.error("역할 변경 오류:", error);
      setModal({
        isOpen: true,
        title: "역할 변경 오류",
        message: "역할 변경 중 오류가 발생했습니다. 콘솔을 확인해주세요.",
        onClose: () => setModal({ ...modal, isOpen: false })
      });
    }
  };

  // 모달 닫기
  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  // 보고서 생성 (시뮬레이션)
  const handleGenerateReport = () => {
    setModal({
      isOpen: true,
      title: "보고서 생성",
      message: "보고서 생성 기능은 현재 개발 중입니다. (PDF/Excel 형식으로 내보내기)",
      onClose: closeModal
    });
  };

  // 심층 분석 링크 클릭 (시뮬레이션)
  const handleActionClick = (actionType, issueName) => {
    let message = "";
    switch (actionType) {
      case '분석':
        message = `${issueName}에 대한 VEX Feed 및 세부 정보 페이지로 이동합니다.`;
        break;
      case '패치 권고':
        message = `${issueName}에 대한 최신 패치 버전 및 적용 가이드 페이지로 이동합니다.`;
        break;
      case '대체 제안':
        message = `${issueName}에 대한 대체 컴포넌트 비교 테이블 페이지로 이동합니다.`;
        break;
      default:
        message = "해당 액션 페이지로 이동합니다.";
    }
    setModal({
      isOpen: true,
      title: "액션 실행",
      message: message,
      onClose: closeModal
    });
  };

  // 역할에 따른 위젯 필터링 로직
  const getFilteredWidgets = () => {
    const commonWidgets = [
      { id: 'urgent-issues', title: '긴급 이슈 Top 5', component: <UrgentIssues issues={issues} onActionClick={handleActionClick} /> },
    ];

    switch (currentUserRole) {
      case 'developer':
        return [
          ...commonWidgets,
          { id: 'ci-scan-report', title: 'CI 스캔 리포트 요약', component: <CIScanReport issues={issues} /> },
          { id: 'recent-component-issues', title: '최근 24시간 이슈 발생 컴포넌트', component: <RecentComponentIssues issues={issues} /> },
        ];
      case 'security_manager':
        return [
          ...commonWidgets,
          { id: 'vulnerability-trend', title: '전체 취약점 추이', component: <VulnerabilityTrend /> },
          { id: 'license-risk', title: '라이선스 리스크 Top 3', component: <LicenseRisk issues={issues} onActionClick={handleActionClick} /> },
          { id: 'policy-violation-ranking', title: '정책·규정 위반 랭킹', component: <PolicyViolationRanking issues={issues} /> },
        ];
      case 'ciso':
        return [
          { id: 'org-risk-summary', title: '조직 단위 리스크 요약', component: <OrgRiskSummary issues={issues} /> },
          { id: 'top-legal-risk', title: 'Top 3 법적 리스크', component: <TopLegalRisk issues={issues} onActionClick={handleActionClick} /> },
          { id: 'top-critical-cve', title: 'Top 5 Critical CVE', component: <TopCriticalCVE issues={issues} onActionClick={handleActionClick} /> },
          { id: 'budget-allocation', title: '예산 투입 현황', component: <BudgetAllocation /> },
        ];
      default:
        return commonWidgets;
    }
  };

  const filteredWidgets = getFilteredWidgets();
  const criticalCveAlert = issues.find(issue => issue.status === 'critical' && issue.type === 'vulnerability');

  return (
    <div className="min-h-screen bg-gray-100 font-inter text-gray-900 flex flex-col">
      <Modal {...modal} />

      {/* 헤더 영역 */}
      <header className="bg-white shadow-md p-4 flex items-center justify-between z-10 sticky top-0 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-blue-700">액션 대시보드</h1>
          <div className="flex items-center text-gray-600 text-sm">
            <User className="w-5 h-5 mr-1" />
            <span>{userId ? `사용자 ID: ${userId}` : '로그인 중...'}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Settings className="w-5 h-5 mr-1" />
            <span className="font-medium">{currentUserRole === 'developer' ? '개발자' : currentUserRole === 'security_manager' ? '보안담당자' : currentUserRole === 'ciso' ? 'CISO' : '알 수 없음'}</span>
            <select
              value={currentUserRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="ml-2 p-1 border border-gray-300 rounded-md bg-white text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="developer">개발자</option>
              <option value="security_manager">보안담당자</option>
              <option value="ciso">CISO</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-gray-600 text-sm">
            <span className="font-medium">현재 시각:</span> {currentTime.toLocaleTimeString('ko-KR')}
          </div>
          <div className="text-gray-600 text-sm">
            <span className="font-medium">데이터 최신화:</span> {new Date().toLocaleTimeString('ko-KR')}
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
            <Bell className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </header>

      {/* 상단 주요 알림 배너 */}
      {criticalCveAlert && (
        <div className="bg-red-600 text-white p-3 text-center font-semibold flex items-center justify-center space-x-2 shadow-inner">
          <AlertTriangle className="w-6 h-6 animate-pulse" />
          <span>
            긴급 알림: {criticalCveAlert.name}: {criticalCveAlert.component} 영향 → {criticalCveAlert.recommendedAction}
          </span>
          <button
            onClick={() => handleActionClick('분석', criticalCveAlert.name)}
            className="ml-4 px-4 py-1 bg-white text-red-600 rounded-full text-sm font-bold hover:bg-red-100 transition-colors duration-200 shadow-md"
          >
            지금 조치
          </button>
        </div>
      )}

      <main className="flex flex-1 overflow-hidden p-6">
        {/* 사이드바 영역 */}
        <aside className="w-64 bg-white p-6 rounded-lg shadow-md border border-gray-200 flex-shrink-0 mr-6 h-full overflow-y-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">필터 및 설정</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">
                역할 선택
              </label>
              <select
                id="role-filter"
                value={currentUserRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="developer">개발자</option>
                <option value="security_manager">보안담당자</option>
                <option value="ciso">CISO</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상황 필터 (더미)</label>
              <div className="space-y-2">
                <label className="flex items-center text-gray-700">
                  <input type="checkbox" className="form-checkbox rounded text-blue-600" defaultChecked />
                  <span className="ml-2">긴급 취약점</span>
                </label>
                <label className="flex items-center text-gray-700">
                  <input type="checkbox" className="form-checkbox rounded text-blue-600" />
                  <span className="ml-2">라이선스 위반</span>
                </label>
                <label className="flex items-center text-gray-700">
                  <input type="checkbox" className="form-checkbox rounded text-blue-600" />
                  <span className="ml-2">SBOM 변경</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">사용자 지정 필터 (더미)</label>
              <input
                type="text"
                placeholder="서비스명, 팀, 프로젝트"
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleGenerateReport}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md transform hover:scale-105"
            >
              <FileText className="w-5 h-5 mr-2" />
              보고서 생성
            </button>
          </div>
        </aside>

        {/* 중앙 핵심 위젯 영역 */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-min overflow-y-auto">
          {filteredWidgets.map((widget) => (
            <Widget key={widget.id} title={widget.title}>
              {widget.component}
            </Widget>
          ))}
        </div>
      </main>
    </div>
  );
};

// --- 위젯별 컴포넌트 ---

const UrgentIssues = ({ issues, onActionClick }) => {
  const urgentIssues = issues.filter(issue => ['critical', 'high'].includes(issue.status)).slice(0, 5);
  return (
    <div className="space-y-4">
      {urgentIssues.length > 0 ? (
        urgentIssues.map((issue) => (
          <div key={issue.id} className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center justify-between shadow-sm">
            <div>
              <p className="font-semibold text-red-700">{issue.name}</p>
              <p className="text-sm text-gray-600">{issue.component} | 영향도: {issue.impactScore}</p>
              <p className="text-xs text-gray-500">발견: {new Date(issue.discoveryTime).toLocaleString('ko-KR')}</p>
            </div>
            <button
              onClick={() => onActionClick('분석', issue.name)}
              className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors duration-200 shadow-sm"
            >
              분석
            </button>
          </div>
        ))
      ) : (
        <p className="text-gray-500">현재 긴급 이슈가 없습니다.</p>
      )}
    </div>
  );
};

const LicenseRisk = ({ issues, onActionClick }) => {
  const licenseIssues = issues.filter(issue => issue.type === 'license_conflict').slice(0, 3);
  return (
    <div className="overflow-x-auto">
      {licenseIssues.length > 0 ? (
        <table className="min-w-full bg-white rounded-lg">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">컴포넌트</th>
              <th className="py-3 px-4">라이선스</th>
              <th className="py-3 px-4">충돌 대상</th>
              <th className="py-3 px-4">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {licenseIssues.map((issue) => (
              <tr key={issue.id}>
                <td className="py-3 px-4 text-sm text-gray-800">{issue.component}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{issue.name.split(' vs ')[0]}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{issue.name.split(' vs ')[1]}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onActionClick('대체 제안', issue.name)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors duration-200 shadow-sm"
                  >
                    대체 제안
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">현재 라이선스 리스크가 없습니다.</p>
      )}
    </div>
  );
};

const CIScanReport = ({ issues }) => {
  const ciFailures = issues.filter(issue => issue.type === 'ci_failure');
  return (
    <div className="space-y-3">
      <p className="text-gray-700">최근 CI/CD 빌드 실패 현황:</p>
      {ciFailures.length > 0 ? (
        <ul className="list-disc list-inside text-gray-600">
          {ciFailures.map(issue => (
            <li key={issue.id} className="text-sm">
              <span className="font-medium text-red-600">{issue.component}</span>: {issue.name} ({new Date(issue.discoveryTime).toLocaleDateString('ko-KR')})
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">최근 CI 빌드 실패가 없습니다.</p>
      )}
      <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 transition-colors duration-200">
        전체 CI 스캔 리포트 보기
      </button>
    </div>
  );
};

const RecentComponentIssues = ({ issues }) => {
  const recentIssues = issues.filter(issue => (new Date() - new Date(issue.discoveryTime)) < 24 * 3600 * 1000); // 지난 24시간
  return (
    <div className="space-y-3">
      {recentIssues.length > 0 ? (
        <ul className="list-disc list-inside text-gray-600">
          {recentIssues.map(issue => (
            <li key={issue.id} className="text-sm">
              <span className="font-medium text-blue-600">{issue.component}</span>: {issue.name} ({issue.status === 'critical' ? '긴급' : '일반'})
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">최근 24시간 내 이슈 발생 컴포넌트가 없습니다.</p>
      )}
    </div>
  );
};

const VulnerabilityTrend = () => {
  // 더미 차트 데이터 (실제로는 D3.js나 Recharts 같은 라이브러리 사용)
  const data = [
    { month: '1월', high: 10, critical: 2 },
    { month: '2월', high: 12, critical: 3 },
    { month: '3월', high: 8, critical: 1 },
    { month: '4월', high: 15, critical: 4 },
    { month: '5월', high: 11, critical: 2 },
  ];
  return (
    <div className="space-y-3">
      <p className="text-gray-700">월별 취약점 발생 추이 (더미 차트):</p>
      <div className="bg-gray-50 p-4 rounded-md h-40 flex items-center justify-center text-gray-500">
        {/* 실제 차트가 들어갈 자리 */}
        <p>[차트: High/Critical CVE 발생 추이]</p>
      </div>
      <p className="text-sm text-gray-600">데이터는 지난 5개월간의 가상 데이터입니다.</p>
    </div>
  );
};

const PolicyViolationRanking = ({ issues }) => {
  const policyViolations = issues.filter(issue => issue.type === 'policy_violation');
  return (
    <div className="space-y-3">
      <p className="text-gray-700">주요 정책 위반 현황:</p>
      {policyViolations.length > 0 ? (
        <ul className="list-disc list-inside text-gray-600">
          {policyViolations.map(issue => (
            <li key={issue.id} className="text-sm">
              <span className="font-medium text-orange-600">{issue.name}</span>: {issue.component}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">현재 정책 위반 사항이 없습니다.</p>
      )}
    </div>
  );
};

const OrgRiskSummary = ({ issues }) => {
  const totalCritical = issues.filter(issue => issue.status === 'critical').length;
  const totalHigh = issues.filter(issue => issue.status === 'high').length;
  const totalLicense = issues.filter(issue => issue.type === 'license_conflict').length;

  return (
    <div className="grid grid-cols-2 gap-4 text-center">
      <div className="bg-red-100 p-4 rounded-md border border-red-200">
        <p className="text-red-700 text-3xl font-bold">{totalCritical}</p>
        <p className="text-red-600 text-sm">Critical 이슈</p>
      </div>
      <div className="bg-orange-100 p-4 rounded-md border border-orange-200">
        <p className="text-orange-700 text-3xl font-bold">{totalHigh}</p>
        <p className="text-orange-600 text-sm">High 이슈</p>
      </div>
      <div className="bg-blue-100 p-4 rounded-md border border-blue-200 col-span-2">
        <p className="text-blue-700 text-3xl font-bold">{totalLicense}</p>
        <p className="text-blue-600 text-sm">라이선스 리스크</p>
      </div>
      <button className="col-span-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md">
        전체 리스크 대시보드 보기
      </button>
    </div>
  );
};

const TopLegalRisk = ({ issues, onActionClick }) => {
  const legalRisks = issues.filter(issue => issue.category === '라이선스 리스크' || issue.category === '정책 위반')
                           .sort((a, b) => b.riskScore - a.riskScore)
                           .slice(0, 3);
  return (
    <div className="space-y-4">
      {legalRisks.length > 0 ? (
        legalRisks.map(issue => (
          <div key={issue.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-center justify-between shadow-sm">
            <div>
              <p className="font-semibold text-yellow-700">{issue.name}</p>
              <p className="text-sm text-gray-600">{issue.component} | 리스크 점수: {issue.riskScore}</p>
            </div>
            <button
              onClick={() => onActionClick('분석', issue.name)}
              className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 transition-colors duration-200 shadow-sm"
            >
              상세 보기
            </button>
          </div>
        ))
      ) : (
        <p className="text-gray-500">현재 Top 법적 리스크가 없습니다.</p>
      )}
    </div>
  );
};

const TopCriticalCVE = ({ issues, onActionClick }) => {
  const criticalCVEs = issues.filter(issue => issue.type === 'vulnerability' && issue.status === 'critical')
                             .sort((a, b) => b.impactScore - a.impactScore)
                             .slice(0, 5);
  return (
    <div className="space-y-4">
      {criticalCVEs.length > 0 ? (
        criticalCVEs.map(issue => (
          <div key={issue.id} className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center justify-between shadow-sm">
            <div>
              <p className="font-semibold text-red-700">{issue.name}</p>
              <p className="text-sm text-gray-600">{issue.component} | 영향도: {issue.impactScore}</p>
            </div>
            <button
              onClick={() => onActionClick('패치 권고', issue.name)}
              className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors duration-200 shadow-sm"
            >
              패치 권고
            </button>
          </div>
        ))
      ) : (
        <p className="text-gray-500">현재 Top Critical CVE가 없습니다.</p>
      )}
    </div>
  );
};

const BudgetAllocation = () => {
  // 더미 예산 데이터
  const budgetData = [
    { category: '보안 솔루션', allocated: 70, spent: 55 },
    { category: '인력 교육', allocated: 20, spent: 15 },
    { category: '컨설팅', allocated: 10, spent: 8 },
  ];
  return (
    <div className="space-y-3">
      <p className="text-gray-700">예산 투입 현황 (더미):</p>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">항목</th>
              <th className="py-3 px-4">할당 (%)</th>
              <th className="py-3 px-4">소비 (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {budgetData.map((item, index) => (
              <tr key={index}>
                <td className="py-3 px-4 text-sm text-gray-800">{item.category}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{item.allocated}%</td>
                <td className="py-3 px-4 text-sm text-gray-800">{item.spent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors duration-200 shadow-md">
        예산 승인 요청 (CISO 전용)
      </button>
    </div>
  );
};

export default App;
