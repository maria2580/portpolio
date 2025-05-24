document.addEventListener('DOMContentLoaded', function() {
    // ... (기존 script.js 상단 내용: marked.js 로드 확인, menuToggle, navMenu, scrollTopBtn 등은 동일) ...
    console.log('DOM fully loaded and parsed.');
    if (typeof marked === 'function' && typeof marked.parse === 'function') {
        console.log('marked.js library is loaded successfully and `marked.parse` is available.');
    } else if (typeof marked === 'function') {
        console.warn('marked.js library is loaded, but `marked.parse` is not directly available.');
    } else {
        console.error('marked.js library is NOT loaded or `marked` is not a function. typeof marked:', typeof marked);
    }

    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-links');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const mainNavLinks = document.querySelectorAll('#nav-links a'); // 메인 네비게이션 링크
    const currentPath = window.location.pathname.split("/").pop() || "index.html";

    // 모바일 메뉴 토글 (이전과 동일)
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // 현재 페이지 메인 네비게이션 링크 활성화 (이전과 동일)
    mainNavLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split("/").pop();
        if (linkPath === currentPath && linkPath.includes('html')) { // index.html 등 특정 페이지 링크만 active
             link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // 스크롤 탑 버튼 (이전과 동일)
    function handleScrollTopButton() { /* ... */ }
    window.addEventListener('scroll', handleScrollTopButton);
    handleScrollTopButton(); 
    if (scrollTopBtn) { /* ... */ }


    // README 모달 관련 로직 (이전과 동일)
    // ... (fetchReadme 및 관련 로직은 이전 답변과 동일하게 유지) ...
    const readmeModal = document.getElementById('readmeModal');
    const readmeProjectTitle = document.getElementById('readmeProjectTitle');
    const readmeHtmlDisplay = document.getElementById('readmeHtmlDisplay');
    const readmeLoading = document.getElementById('readmeLoading');
    const readmeError = document.getElementById('readmeError');
    const readmeCloseButton = document.querySelector('.modal .close-button'); // README 모달의 닫기 버튼
    const readmeButtons = document.querySelectorAll('.readme-button');
    // (fetchReadme, readmeButtons.forEach, readmeCloseButton, window click for readmeModal 로직은 그대로 둡니다)
    async function fetchReadme(repoPath, projectTitle) {
        if (!readmeModal || !readmeHtmlDisplay || !readmeLoading || !readmeError || !readmeProjectTitle) {
            console.error('Modal elements not found!');
            return;
        }
        console.log(`Workspaceing README for: ${projectTitle} (Repo: ${repoPath})`);
        readmeProjectTitle.textContent = projectTitle;
        readmeHtmlDisplay.innerHTML = ''; 
        readmeLoading.style.display = 'block';
        readmeError.style.display = 'none'; 
        readmeError.textContent = '';
        readmeModal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        const readmeUrlMain = `https://raw.githubusercontent.com/${repoPath}/main/README.md`;
        const readmeUrlMaster = `https://raw.githubusercontent.com/${repoPath}/master/README.md`;
        
        let rawContent = null;
        let fetchErr = null; 
        let triedMain = false;
        let triedMaster = false;

        try {
            console.log('Attempting to fetch from main branch:', readmeUrlMain);
            let response = await fetch(readmeUrlMain);
            triedMain = true;
            console.log(`Response for ${readmeUrlMain}: status ${response.status}`);
            if (response.ok) {
                rawContent = await response.text();
            } else {
                console.log(`Failed to fetch from main branch (status: ${response.status}). Trying master branch...`);
                console.log('Attempting to fetch from master branch:', readmeUrlMaster);
                response = await fetch(readmeUrlMaster);
                triedMaster = true;
                console.log(`Response for ${readmeUrlMaster}: status ${response.status}`);
                if (response.ok) {
                    rawContent = await response.text();
                } else {
                    fetchErr = new Error(`README 로딩 실패 (main: ${triedMain ? response.status : '시도 안함'}, master: ${triedMaster ? response.status : '시도 안함'}). 저장소와 브랜치를 확인해주세요.`);
                }
            }
        } catch (e) {
            fetchErr = e; 
            console.error('Exception during fetch README:', e);
        } finally {
            readmeLoading.style.display = 'none';
            if (rawContent) {
                console.log('README content fetched successfully.');
                readmeError.style.display = 'none';
                if (typeof marked === 'object' && marked !== null && typeof marked.parse === 'function') {
                    console.log('marked.js is available (object with parse method). Parsing Markdown...');
                    try {
                        readmeHtmlDisplay.innerHTML = marked.parse(rawContent);
                    } catch (parseError) {
                        console.error('Markdown parsing error:', parseError);
                        readmeError.textContent = 'Markdown 내용을 HTML로 변환 중 오류가 발생했습니다.';
                        readmeError.style.display = 'block';
                        readmeHtmlDisplay.innerHTML = `<pre>${rawContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
                    }
                } else if (typeof marked === 'function') {
                     console.log('marked.js is available (as a function). Attempting to parse...');
                     try {
                        readmeHtmlDisplay.innerHTML = marked(rawContent); 
                     } catch (parseError) {
                        console.error('Markdown parsing error (functional call):', parseError);
                        readmeError.textContent = 'Markdown 내용을 HTML로 변환 중 오류가 발생했습니다 (functional call).';
                        readmeError.style.display = 'block';
                        readmeHtmlDisplay.innerHTML = `<pre>${rawContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
                     }
                }
                else {
                    console.warn('marked.js 라이브러리가 올바르게 로드되지 않았거나, `parse` 함수를 찾을 수 없습니다. Markdown 원본을 표시합니다. typeof marked:', typeof marked);
                    readmeHtmlDisplay.innerHTML = `<p style="color:orange; font-weight:bold; text-align:center;">[주의] Markdown 파서가 로드되지 않아 원본 텍스트로 표시됩니다.</p><pre>${rawContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
                }
            } else {
                console.error('Failed to fetch rawContent for README.');
                readmeError.textContent = `README.md 파일을 가져올 수 없습니다. 저장소: ${repoPath}. 상세 오류: ${fetchErr ? fetchErr.message : '알 수 없는 네트워크 오류 또는 파일 없음'}`;
                readmeError.style.display = 'block';
                readmeHtmlDisplay.innerHTML = ''; 
            }
        }
    }

    readmeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const repoPath = this.dataset.repo;
            const projectTitle = this.dataset.title || "README";
            if (repoPath) {
                fetchReadme(repoPath, projectTitle);
            } else {
                console.error('Button is missing data-repo attribute.');
                if(readmeModal && readmeError && readmeHtmlDisplay) {
                    readmeProjectTitle.textContent = projectTitle;
                    readmeError.textContent = '프로젝트 저장소 정보가 버튼에 설정되지 않았습니다.';
                    readmeError.style.display = 'block';
                    readmeHtmlDisplay.innerHTML = '';
                    readmeModal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    });

    if (readmeCloseButton) {
        readmeCloseButton.addEventListener('click', function() {
            if (readmeModal) readmeModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    if (readmeModal) {
        window.addEventListener('click', function(event) {
            if (event.target === readmeModal) {
                readmeModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // "더보기" 버튼 로직 (이전과 동일)
    const mainProjectsContainer = document.getElementById('main-projects');
    const toggleProjectsButton = document.getElementById('toggle-projects-button');
    const moreProjectsContainer = document.getElementById('more-projects-container');
    let allProjectCards = [];
    if (mainProjectsContainer) {
        allProjectCards = Array.from(mainProjectsContainer.getElementsByClassName('project-card'));
    }
    let initialShowCount = 3;
    // (더보기 관련 로직은 이전 답변과 동일하게 유지)
    function updateVisibleProjects() {
        if (!mainProjectsContainer) return;

        const windowWidth = window.innerWidth;
        if (windowWidth <= 768) { 
            initialShowCount = 3;
        } else if (windowWidth <= 1024) { 
            initialShowCount = 2;
        } else { 
            initialShowCount = 3;
        }

        allProjectCards.forEach((card, index) => {
            if (index < initialShowCount) {
                card.style.display = 'flex'; 
            } else {
                card.style.display = 'none'; 
            }
        });

        if (allProjectCards.length > initialShowCount) {
            if (moreProjectsContainer) moreProjectsContainer.style.display = 'block'; 
            if (toggleProjectsButton) toggleProjectsButton.textContent = '더보기';
        } else {
            if (moreProjectsContainer) moreProjectsContainer.style.display = 'none';
        }
    }

    if (toggleProjectsButton && mainProjectsContainer && allProjectCards.length > 0) {
        updateVisibleProjects();
        toggleProjectsButton.addEventListener('click', function() {
            const isCurrentlyExpanded = this.textContent === '간략히 보기';
            if (isCurrentlyExpanded) {
                allProjectCards.forEach((card, index) => {
                    if (index >= initialShowCount) {
                        card.style.display = 'none';
                    }
                });
                this.textContent = '더보기';
            } else {
                allProjectCards.forEach(card => {
                    card.style.display = 'flex'; 
                });
                this.textContent = '간략히 보기';
            }
        });
        window.addEventListener('resize', function() {
            if (toggleProjectsButton.textContent === '더보기') {
                updateVisibleProjects();
            }
        });
    } else if (moreProjectsContainer) {
        moreProjectsContainer.style.display = 'none';
    }


    // --- 스크롤 애니메이션 (Scroll Reveal) 및 타임라인 바 채우기 로직 ---
    const timeline = document.querySelector('.timeline');
    const scrollRevealItems = document.querySelectorAll('.timeline-item');

    // 화면 특정 지점에 요소의 상단이 도달했는지 확인 (애니메이션 시작 조건용)
    const isItemTopInTriggerZone = (element, triggerOffset = 150) => {
        const rect = element.getBoundingClientRect();
        return rect.top < (window.innerHeight || document.documentElement.clientHeight) - triggerOffset;
    };

    // 타임라인 바의 "채워진" 높이를 업데이트하는 함수 (새로운 요구사항 반영)
    const updateTimelineFill = () => {
        if (!timeline) return;

        const viewportY = window.innerHeight * 0.90;
        const timelineRect = timeline.getBoundingClientRect();
        const timelinePaddingTop = parseFloat(window.getComputedStyle(timeline).paddingTop);

        let fillHeight = viewportY - (timelineRect.top + timelinePaddingTop);

        const timelineScrollHeight = timeline.scrollHeight;
        const timelinePaddings = timelinePaddingTop + parseFloat(window.getComputedStyle(timeline).paddingBottom);
        const maxPossibleFillHeight = timelineScrollHeight - timelinePaddings;

        fillHeight = Math.max(0, Math.min(fillHeight, maxPossibleFillHeight));

        timeline.style.setProperty('--timeline-fill-height', `${fillHeight}px`);
    };

    // viewportY(70%)를 넘은 아이템만 is-visible, 넘지 못한 아이템은 is-visible 제거
    const handleScrollAndResize = () => {
        const viewportY = window.innerHeight * 0.70;
        scrollRevealItems.forEach((item) => {
            const rect = item.getBoundingClientRect();
            if (rect.top < viewportY) {
                item.classList.add('is-visible');
            } else {
                item.classList.remove('is-visible');
            }
        });
        updateTimelineFill();
    };

    if (scrollRevealItems.length > 0 && timeline) {
        timeline.style.setProperty('--timeline-fill-height', '0px');

        window.addEventListener('scroll', handleScrollAndResize);
        window.addEventListener('resize', handleScrollAndResize);

        setTimeout(handleScrollAndResize, 50);
    }

    // --- 플로팅 목차 (Floating TOC) 로직 수정 ---
    const floatingToc = document.getElementById('floating-toc');
    const tocToggleButton = document.getElementById('toc-toggle-button');
    const tocList = document.getElementById('toc-list'); // ul에 ID 부여 후 사용

    // index.html 에만 플로팅 목차가 있으므로, 해당 요소가 있을 때만 스크립트 실행
    if (floatingToc && currentPath === "index.html") {
        const tocLinks = floatingToc.querySelectorAll('#toc-list a'); // ID를 사용한 ul 내부의 a 선택
        const sections = [];
        tocLinks.forEach(link => {
            const sectionId = link.getAttribute('href').substring(1);
            const section = document.getElementById(sectionId);
            if (section) {
                sections.push(section);
            }
        });

        const navBarHeight = document.getElementById('navbar').offsetHeight;
        const tocOffset = navBarHeight + 30;

        // 부드러운 스크롤 (TOC 링크 클릭 시)
        tocLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - tocOffset + 10;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    // 중간 크기 화면에서 목차 링크 클릭 후 목차 접기 (선택적)
                    if (window.innerWidth <= 1600 && floatingToc.classList.contains('is-open')) {
                        floatingToc.classList.remove('is-open');
                    }
                }
            });
        });

        // 스크롤스파이
        function activateTocLink() { /* ... (이전과 동일한 activateTocLink 함수) ... */ }
        if (sections.length > 0) {
            activateTocLink();
            window.addEventListener('scroll', activateTocLink);
        }

        // 목차 토글 버튼 기능
        if (tocToggleButton && tocList) {
            tocToggleButton.addEventListener('click', function() {
                floatingToc.classList.toggle('is-open');
            });
        }

        // 화면 크기 변경에 따른 목차 상태 업데이트
        function handleTocDisplayByScreenSize() {
            const windowWidth = window.innerWidth;
            if (windowWidth > 1600) { // 큰 화면: 항상 펼침 (토글 버튼 숨김)
                floatingToc.classList.add('is-open'); // 기본 펼침
                if (tocList) tocList.style.display = 'block';
                if (tocToggleButton) tocToggleButton.style.display = 'none'; // 토글 버튼 숨김
                 // CSS에서 :not(.is-open) ul { display: none; }을 사용하지 않고 JS로 직접 제어 시
                // floatingToc.style.width = '200px';
                // floatingToc.style.padding = '10px';
            } else if (windowWidth <= 1600 && windowWidth > 992) { // 중간 화면: 토글 가능 (기본 접힘)
                // floatingToc.classList.remove('is-open'); // 기본 접힘 상태로 시작하려면
                if (tocToggleButton) tocToggleButton.style.display = 'flex'; // 토글 버튼 보임
                // CSS에서 .is-open 클래스로 제어하므로 JS에서 display 직접 변경 불필요
            } else { // 작은 화면: 목차 숨김 (CSS에서 display:none 처리)
                if (tocToggleButton) tocToggleButton.style.display = 'none';
            }
        }

        // 초기 로드 시 및 화면 크기 변경 시 실행
        handleTocDisplayByScreenSize();
        window.addEventListener('resize', handleTocDisplayByScreenSize);

    } // End of if (floatingToc && currentPath === "index.html")
});