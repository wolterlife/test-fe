import React, { useState } from 'react';

// --- Тестовые константы ---
const VALID_LOGIN_EMAIL = 'helena.hills@social.com';
const VALID_LOGIN_PASSWORD = 'password789';

// ID для тестирования CRUD операций
const TEST_POST_ID = 101;
const TEST_COMMENT_ID = 2; // Используем ID 2, так как ID 1 принадлежит другому пользователю в моках
const TEST_GROUP_ID = 1;

// --- 🎯 API Endpoints ---
const API_PATHS = {
  BASE: '/api',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  ME: '/api/me',
  SUGGESTED_USERS: '/api/users/suggested',
  PROFILE: '/api/me/profile',

  POSTS: '/api/posts',
  POST: (id) => `/api/posts/${id}`,
  POST_LIKE: (id) => `/api/posts/${id}/like`,
  POST_DISLIKE: (id) => `/api/posts/${id}/dislike`,

  COMMENTS: (postId) => `/api/posts/${postId}/comments`,
  COMMENT: (id) => `/api/comments/${id}`,

  GROUPS: '/api/groups',
  GROUP: (id) => `/api/groups/${id}`,

  ME_POSTS: '/api/me/posts',
  ME_COMMENTS: '/api/me/comments',
  ME_LIKES: '/api/me/likes',
  ME_COUNTS: '/api/me/counts',
};
// -----------------------------

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  /**
   * @param {string} path - Путь к API (e.g., '/api/posts')
   * @param {string} method - Метод HTTP (GET, POST, PUT, DELETE)
   * @param {object} body - Тело запроса для POST/PUT
   * @param {boolean} isAuthRequired - Требуется ли токен авторизации
   * @param {boolean} isLogin - Флаг для специальной обработки логина
   */
  const sendRESTRequest = async (path, method = 'GET', body = null, isAuthRequired = true, isLogin = false) => {
    setLoading(true);
    setError(null);
    setData(null);

    const headers = {
      'Content-Type': 'application/json',
      // Добавляем токен только если требуется и он существует
      ...(isAuthRequired && authToken && { 'Authorization': `Bearer ${authToken}` }),
    };

    try {
      console.log(`Sending REST request: ${method} ${path}`);

      if (isAuthRequired && !authToken && !isLogin) {
        throw new Error("Authorization token is missing. Please log in.");
      }

      const fetchOptions = {
        method: method,
        headers: headers,
        body: body ? JSON.stringify(body) : undefined,
      };

      const response = await fetch(path, fetchOptions);

      // Проверка HTTP-статуса
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP Error: ${response.status} - ${errorText || response.statusText}`);
      }

      const result = await response.json().catch(() => ({ message: 'No content or successful operation.' }));

      // Специальная обработка для Login
      if (isLogin && result?.token) {
        setAuthToken(result.token);
        setData({ message: "Login successful!", user: result.user });
        return;
      }

      // Специальная обработка для Logout
      if (path === API_PATHS.LOGOUT) {
        setAuthToken(null);
        setData({ message: "Logout successful! Token cleared." });
        return;
      }

      setData(result);

    } catch (err) {
      setError(`REST API Error: ${err.message}`);
      console.error("REST Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------

  // --- 1. Обработчики Auth & Profile ---
  const handleLogin = () =>
    sendRESTRequest(API_PATHS.LOGIN, 'POST', { email: VALID_LOGIN_EMAIL, password: VALID_LOGIN_PASSWORD }, false, true);

  const handleLogout = () => sendRESTRequest(API_PATHS.LOGOUT, 'POST');

  const handleGetMeUser = () => sendRESTRequest(API_PATHS.ME, 'GET');

  const handleUpdateProfile = () =>
    sendRESTRequest(API_PATHS.PROFILE, 'PUT', { username: 'REST_User', description: 'Updated via REST mock.' });

  const handleGetSuggestedUsers = () => sendRESTRequest(API_PATHS.SUGGESTED_USERS, 'GET');

  // --- 2. Обработчики /me Methods ---
  const handleGetMePosts = () => sendRESTRequest(API_PATHS.ME_POSTS, 'GET');
  const handleGetMeComments = () => sendRESTRequest(API_PATHS.ME_COMMENTS, 'GET');
  const handleGetMeLikes = () => sendRESTRequest(API_PATHS.ME_LIKES, 'GET');
  const handleGetMeCounts = () => sendRESTRequest(API_PATHS.ME_COUNTS, 'GET');

  // --- 3. Обработчики Posts CRUD & Likes ---
  const handleGetAllPosts = () => sendRESTRequest(API_PATHS.POSTS, 'GET', null, false); // No auth required for all posts
  const handleGetPostById = (id) => sendRESTRequest(API_PATHS.POST(id), 'GET', null, false); // No auth required for single post

  const handleCreatePost = () => sendRESTRequest(API_PATHS.POSTS, 'POST', {
    title: `REST Post ${Date.now()}`,
    content: 'Content from REST client.',
    image: ''
  });

  const handleUpdatePost = (id) => sendRESTRequest(API_PATHS.POST(id), 'PUT', {
    title: `Updated REST Post ${new Date().toLocaleTimeString()}`,
    content: 'Updated content.',
    image: '/new/image.png'
  });

  const handleDeletePost = (id) => sendRESTRequest(API_PATHS.POST(id), 'DELETE');

  const handleLikePost = (id) => sendRESTRequest(API_PATHS.POST_LIKE(id), 'POST');

  const handleDislikePost = (id) => sendRESTRequest(API_PATHS.POST_DISLIKE(id), 'DELETE'); // Often DELETE method for removal

  // --- 4. Обработчики Comments CRUD ---
  const handleGetPostComments = (postId) => sendRESTRequest(API_PATHS.COMMENTS(postId), 'GET', null, false);

  const handleCreateComment = (postId) => sendRESTRequest(API_PATHS.COMMENTS(postId), 'POST', {
    text: `REST Comment ${Date.now()}`
  });

  const handleUpdateComment = (id) => sendRESTRequest(API_PATHS.COMMENT(id), 'PUT', {
    text: `Updated REST Comment ${new Date().toLocaleTimeString()}`
  });

  const handleDeleteComment = (id) => sendRESTRequest(API_PATHS.COMMENT(id), 'DELETE');

  // --- 5. Обработчики Groups CRUD ---
  const handleGetAllGroups = () => sendRESTRequest(API_PATHS.GROUPS, 'GET', null, false);
  const handleGetGroupById = (id) => sendRESTRequest(API_PATHS.GROUP(id), 'GET', null, false);

  const handleCreateGroup = () => sendRESTRequest(API_PATHS.GROUPS, 'POST', {
    title: `REST Group ${Date.now()}`,
    photo: '/group/image.png'
  });

  const handleUpdateGroup = (id) => sendRESTRequest(API_PATHS.GROUP(id), 'PUT', {
    title: `Updated REST Group ${new Date().toLocaleTimeString()}`
  });

  const handleDeleteGroup = (id) => sendRESTRequest(API_PATHS.GROUP(id), 'DELETE');


  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Social Network Mock (Pure REST API)</h1>
      <p>🔑 **Auth Status:** {authToken ? <span style={{ color: 'green' }}>Logged In</span> : <span style={{ color: 'red' }}>Logged Out</span>}</p>
      <p>**Test IDs:** Post: **{TEST_POST_ID}** | Comment: **{TEST_COMMENT_ID}** | Group: **{TEST_GROUP_ID}**</p>

      <hr />
      <h2>1. Auth & Profile (Requires Mock Authentication)</h2>
      <button onClick={handleLogin} disabled={!!authToken}>POST /api/auth/login</button>
      <button onClick={handleLogout} disabled={!authToken}>POST /api/auth/logout</button>
      <button onClick={handleGetMeUser} disabled={!authToken}>GET /api/me</button>
      <button onClick={handleUpdateProfile} disabled={!authToken}>PUT /api/me/profile</button>
      <button onClick={handleGetSuggestedUsers} disabled={!authToken}>GET /api/users/suggested</button>

      <hr />
      <h2>2. REST `/me` Methods (Requires Auth)</h2>
      <button onClick={handleGetMePosts} disabled={!authToken}>GET /api/me/posts</button>
      <button onClick={handleGetMeComments} disabled={!authToken}>GET /api/me/comments</button>
      <button onClick={handleGetMeLikes} disabled={!authToken}>GET /api/me/likes</button>
      <button onClick={handleGetMeCounts} disabled={!authToken}>GET /api/me/counts</button>

      <hr />
      <h2>3. Posts CRUD & Likes (Test ID: {TEST_POST_ID})</h2>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={handleGetAllPosts}>GET /api/posts</button>
        <button onClick={() => handleGetPostById(TEST_POST_ID)}>GET /api/posts/{TEST_POST_ID}</button>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={handleCreatePost} disabled={!authToken}>POST /api/posts</button>
        <button onClick={() => handleUpdatePost(TEST_POST_ID)} disabled={!authToken}>PUT /api/posts/{TEST_POST_ID}</button>
        <button onClick={() => handleDeletePost(9999)} disabled={!authToken}>DELETE /api/posts/9999</button>
      </div>
      <div>
        <button onClick={() => handleLikePost(TEST_POST_ID)} disabled={!authToken}>POST /api/posts/{TEST_POST_ID}/like</button>
        <button onClick={() => handleDislikePost(TEST_POST_ID)} disabled={!authToken}>DELETE /api/posts/{TEST_POST_ID}/dislike</button>
      </div>

      <hr />
      <h2>4. Comments CRUD (Post ID: {TEST_POST_ID}, Comment ID: {TEST_COMMENT_ID})</h2>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => handleGetPostComments(TEST_POST_ID)}>GET /api/posts/{TEST_POST_ID}/comments</button>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => handleCreateComment(TEST_POST_ID)} disabled={!authToken}>POST /api/posts/{TEST_POST_ID}/comments</button>
        <button onClick={() => handleUpdateComment(TEST_COMMENT_ID)} disabled={!authToken}>PUT /api/comments/{TEST_COMMENT_ID}</button>
        <button onClick={() => handleDeleteComment(9999)} disabled={!authToken}>DELETE /api/comments/9999</button>
      </div>

      <hr />
      <h2>5. Groups CRUD (Test ID: {TEST_GROUP_ID})</h2>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={handleGetAllGroups}>GET /api/groups</button>
        <button onClick={() => handleGetGroupById(TEST_GROUP_ID)}>GET /api/groups/{TEST_GROUP_ID}</button>
      </div>
      <div>
        <button onClick={handleCreateGroup} disabled={!authToken}>POST /api/groups</button>
        <button onClick={() => handleUpdateGroup(TEST_GROUP_ID)} disabled={!authToken}>PUT /api/groups/{TEST_GROUP_ID}</button>
        <button onClick={() => handleDeleteGroup(9999)} disabled={!authToken}>DELETE /api/groups/9999</button>
      </div>


      <hr />
      <h2>Response Status</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: **{error}**</p>}
      {data && (
        <>
          <h3>Data:</h3>
          <pre style={{ backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
};

export default App;