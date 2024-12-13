import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

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
const db = getFirestore(app);

// HTML 要素
const resultsTableBody = document.getElementById('resultsTableBody');
const errorDiv = document.getElementById('error');

// 投票結果をロードする関数
async function loadResults() {
  try {
    const resultsSnapshot = await getDocs(collection(db, "Results"));
    resultsTableBody.innerHTML = ""; // テーブルを初期化

    resultsSnapshot.forEach((doc) => {
      const result = doc.data();
      const row = document.createElement('tr');

      // チーム名セル
      const teamCell = document.createElement('td');
      teamCell.textContent = result.teamName;
      row.appendChild(teamCell);

      // ポイントセル
      const pointsCell = document.createElement('td');
      pointsCell.textContent = result.points;
      row.appendChild(pointsCell);

      // 日時セル
      const dateCell = document.createElement('td');
      dateCell.textContent = new Date(result.timestamp?.seconds * 1000).toLocaleString();
      row.appendChild(dateCell);

      resultsTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Firestoreからのデータ取得に失敗しました:", error);
    errorDiv.textContent = "投票結果の取得に失敗しました。再度お試しください。";
  }
}

// ページ読み込み時に投票結果をロード
document.addEventListener('DOMContentLoaded', loadResults);
