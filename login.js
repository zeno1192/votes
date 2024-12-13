import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyCSJNkXlmr1xToKV6iR_o9Sp3gLsqqd6eA",
  authDomain: "touhyouproject.firebaseapp.com",
  projectId: "touhyouproject",
  storageBucket: "touhyouproject.firebasestorage.app",
  messagingSenderId: "662619066348",
  appId: "1:662619066348:web:6924f4dfb8c47de7097ac9"
};

// Firebase 初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// HTML 要素の取得
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toggleButton = document.getElementById('toggleButton');
const formTitle = document.querySelector('h1');
const errorDiv = document.getElementById('error');

// 初期状態: ログインフォームを表示、新規登録フォームを非表示
loginForm.classList.remove('hidden');
registerForm.classList.add('hidden');

// フォーム切り替え処理
toggleButton.addEventListener('click', () => {
  if (loginForm.classList.contains('hidden')) {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    formTitle.textContent = "ログイン / 新規登録";
    toggleButton.textContent = "新規登録はこちら";
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    formTitle.textContent = "新規登録 / ログイン";
    toggleButton.textContent = "ログインはこちら";
  }
});

// ログイン処理
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("ログイン成功！");
    window.location.href = './vote.html'; // 投票画面に移動
  } catch (error) {
    errorDiv.textContent = `ログイン失敗: ${error.message}`;
  }
});

// 新規登録処理
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "Users", user.uid), {
      email: user.email,
      points: 100
    });

    alert("登録成功！ポイントが付与されました。");
    window.location.href = './vote.html';
  } catch (error) {
    errorDiv.textContent = `登録失敗: ${error.message}`;
  }
});
