// app.js (간결한 CRUD 예제)
const API = 'https://jsonplaceholder.typicode.com/posts';

//html에서 요소를 미리 가져온다.

//게시글 목록이 렌더링될 ul 태그
const postsEl = document.getElementById('posts');

//글 작성/수정에 사용하는 form 태그
const form = document.getElementById('postForm');

//제목을 입력하는 input
const titleInput = document.getElementById('title');

//내용을 입력하는 input=>textarea
const bodyInput = document.getElementById('body');

//수정 모드일때만 사용되는 hidden input
const postIdInput = document.getElementById('postId');

//작성 버튼
const submitBtn = document.getElementById('submitBtn');

//취소버튼
const cancelBtn = document.getElementById('cancelBtn');

//새로고침 버튼
const refreshBtn = document.getElementById('refreshBtn');

//더보기
const loadMoreBtn = document.getElementById('loadMoreBtn');

//목록 로딩시 보여주는 UI(스피너)
const listLoader = document.getElementById('listLoader');

//수정 모드일때만 사용되는 hidden input 2
const formLoader = document.getElementById('formLoader');

let page = 1;
const LIMIT = 10;
let loading = false;
//setloading
//간단한 로더 표시 토글함수
//실제로는 히든 클래스를 제거/추가해 요소를 보이거나 숨김.
//el : 로딩요소 , on : 로딩 여부

function setloading(el,on) {
    if (on) {
        if (on) el.classList.remove('hidden');
        else el.classList.add('hidden');
    }
}

function escapeHtml(s) {
    return s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
}

//게시물 목록을 불러와 렌더링
//로딩중이면 중복호출을 막고 에러발생시 에러메세지 출력
//성공하면 renderPosts에 데이터를 넘긴다.
async function fetchPosts() {
    if (loading) return; //로딩중이면 실행x
    loading = true;
    setLoading(listLoader, true);//로딩 표시

    try {
        const res = await fetch(`${API}?_page=${page}&_limit=${LIMIT}`);
        //실패 했을때 에러 발생
        if (!res.ok) throw new Error('목록 불러오기 실패');
        //데이터를 json으로 변환하여 renderPosts()함수의 인수로 전달
        const data = await res.json();
        renderPosts(data);
        page++;
    } catch (err) { //에러 발생시 실행할 코드
        console.error(err); alert('목록을 불러오는 중 오류가 발생했다');
    } finally { // 에러와 상관없이 실행하는 코드
        loading = false; setLoading(listLoader, false);
    }
}

function renderPosts(items) {
    if (page === 1) postsEl.innerHTML = '';
    //초기 로드거나 새로고침시 기존목록 제거

    //내용이 없을경우에
    if (items.length === 0) {
        postsEl.insertAdjacentHTML(
            //ul 태그에 소괄호 안에 있는 내용 삽입
            //beforeend 선택한 요소 안쪽 맨 뒤
            'beforeend',
            `<li class="item"><div class="meta muted">더 이상 게시물이 없습니다</div></li>`
        );
        loadMoreBtn.disabled = true;
        return;
    }

    //각 게시물 생성

    for (const p of items) {
        //li 요소를 만들겠다
        const li = document.createElement('li');
        li.className = 'item';
        li.innerHTML = `
        <div style="width:36px; height:36px; border-radius:6px; background:#eef8ff; display:flex;
        align-items:center;justify-content:center;color:var(--accent);font-weight:700">${p.id}</div>
        <div style="flex:1">
            <div class="meta">작성자: ${p.userId} · ID: ${p.id}</div>
            <div class="title">${escapeHtml(p.title)}</div>
            <div class="body" style="white-space:pre-wrap">${escapeHtml(p.body)}</div>
        </div>
        <div class="actions">
        <button data-id="${p.id}" class="editBtn muted">수정</button>
        <button data-id="${p.id}" class="delBtn" style="background:#fee2e2;color:#7f1d1d">삭제</button>
        </div>`;
        
        postsEl.appendChild(li);
    }
    
    // 이벤트 위임보다 간단히 버튼 바인딩
    document.querySelectorAll('.editBtn').forEach(b => b.onclick = onEdit);
    document.querySelectorAll('.delBtn').forEach(b => b.onclick = onDelete);
}


/* 여기부터 안댐 */
// 작성/수정
// 작성/수정
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = postIdInput.value;
    const payload = { title: titleInput.value.trim(), body: bodyInput.value.trim(), userId: 1 };
    if (!payload.title || !payload.body) { alert('제목과 내용을 입력하세요'); return; }

    try {
        setLoading(formLoader, true);
        submitBtn.disabled = true;
        if (id) { // 수정
            const res = await fetch(`${API}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error('수정 실패');
            alert('수정 응답을 받았다 (테스트 API는 실제로 저장하지 않음)');
            // 간단하게 목록 다시 로드
            page = 1; postsEl.innerHTML = ''; await fetchPosts();
            resetForm();
        } else { // 생성
            const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error('작성 실패');
            const data = await res.json();
            alert('작성 완료, 생성 ID: ' + data.id);
            page = 1; postsEl.innerHTML = ''; await fetchPosts();
            resetForm();
        }
    } catch (err) {
        console.error(err); alert('요청 중 오류가 발생했다');
    } finally {
        setLoading(formLoader, false);
        submitBtn.disabled = false;
    }
});

function resetForm() {
    postIdInput.value = ''; titleInput.value = ''; bodyInput.value = '';
    submitBtn.textContent = '작성'; cancelBtn.classList.add('hidden');
}

async function onEdit(e) {
    const id = e.currentTarget.dataset.id;
    try {
        setLoading(formLoader, true);
        const res = await fetch(`${API}/${id}`);
        if (!res.ok) throw new Error('불러오기 실패');
        const p = await res.json();
        postIdInput.value = p.id;
        titleInput.value = p.title;
        bodyInput.value = p.body;
        submitBtn.textContent = '수정';
        cancelBtn.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error(err); alert('게시글을 불러오는 중 오류');
    } finally {
        setLoading(formLoader, false);
    }
}

async function onDelete(e) {
    const id = e.currentTarget.dataset.id;
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
        setLoading(listLoader, true);
        const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('삭제 실패');
        alert('삭제 요청 전송됨 (테스트 API는 실제 삭제를 수행하지 않음)');
        page = 1; postsEl.innerHTML = ''; await fetchPosts();
    } catch (err) {
        console.error(err); alert('삭제 중 오류가 발생했다');
    } finally {
        setLoading(listLoader, false);
    }
}

cancelBtn.addEventListener('click', resetForm);
refreshBtn.addEventListener('click', () => { page = 1; postsEl.innerHTML = ''; fetchPosts(); });
loadMoreBtn.addEventListener('click', fetchPosts);

// 초기 로드
fetchPosts();

/*
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

const postsContainer = document.getElementById('posts');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const refreshBtn = document.getElementById('refreshBtn');

const postForm = document.getElementById('postForm');
const postIdInput = document.getElementById('postId');
const titleInput = document.getElementById('title');
const bodyInput = document.getElementById('body');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');

const listLoader = document.getElementById('listLoader');
const formLoader = document.getElementById('formLoader');

let posts = [];
let limit = 10;
let start = 0;
let editing = false;

// --------------------
// 공통 로딩 토글 함수
// --------------------
function toggleLoader(loader, show) {
  loader.classList.toggle('hidden', !show);
  loader.setAttribute('aria-hidden', !show);
}

// --------------------
// 게시글 목록 불러오기
// --------------------
async function fetchPosts(refresh = false) {
  toggleLoader(listLoader, true);

  if (refresh) {
    posts = [];
    start = 0;
    postsContainer.innerHTML = '';
  }

  try {
    const res = await fetch(`${API_URL}?_start=${start}&_limit=${limit}`);
    const data = await res.json();
    posts = posts.concat(data);
    renderPosts();
    start += limit;
  } catch (error) {
    alert('게시글을 불러오는 중 오류가 발생했습니다.');
  } finally {
    toggleLoader(listLoader, false);
  }
}

// --------------------
// 게시글 렌더링
// --------------------
function renderPosts() {
  postsContainer.innerHTML = posts.map(post => `
    <li class="list-item">
      <strong>${post.title}</strong>
      <p>${post.body}</p>
      <div class="row">
        <button class="editBtn" data-id="${post.id}">수정</button>
        <button class="deleteBtn muted" data-id="${post.id}">삭제</button>
      </div>
    </li>
  `).join('');

  // 각 버튼에 이벤트 바인딩
  document.querySelectorAll('.editBtn').forEach(btn =>
    btn.addEventListener('click', () => editPost(btn.dataset.id))
  );
  document.querySelectorAll('.deleteBtn').forEach(btn =>
    btn.addEventListener('click', () => deletePost(btn.dataset.id))
  );
}

// --------------------
// 게시글 작성/수정 폼 제출
// --------------------
postForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title || !body) {
    alert('제목과 내용을 모두 입력해주세요.');
    return;
  }

  toggleLoader(formLoader, true);
  submitBtn.disabled = true;

  try {
    if (editing) {
      const id = postIdInput.value;
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, body, userId: 1 })
      });
      const updatedPost = await res.json();

      posts = posts.map(p => (p.id == id ? updatedPost : p));
      renderPosts();
      resetForm();
      alert('게시글이 수정되었습니다.');
    } else {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, userId: 1 })
      });
      const newPost = await res.json();

      posts.unshift(newPost);
      renderPosts();
      resetForm();
      alert('게시글이 작성되었습니다.');
    }
  } catch (error) {
    alert('요청 중 오류가 발생했습니다.');
  } finally {
    toggleLoader(formLoader, false);
    submitBtn.disabled = false;
  }
});

// --------------------
// 게시글 수정 버튼 클릭
// --------------------
function editPost(id) {
  const post = posts.find(p => p.id == id);
  if

*/