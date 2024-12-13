import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collection, query, getDocs } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

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

// チームリスト
const teams = [
  "Team 1", "Team 2", "Team 3", "Team 4", "Team 5", 
  "Team 6", "Team 7", "Team 8", "Team 9", "Team 10", 
  "Team 11", "Team 12", "Team 13"
];

// HTML 要素
const resultsTable = document.getElementById("resultsTable").querySelector("tbody");
const backButton = document.getElementById("backButton");

// 投票結果の取得と表示
async function loadResults() {
  try {
    console.log("Firestoreからデータを取得中...");
    const votesQuery = query(collection(db, "Votes"));
    const querySnapshot = await getDocs(votesQuery);

    // 各チームのポイントを初期化
    const teamPoints = {};
    teams.forEach((team) => {
      teamPoints[team] = 0; // 全チームを0で初期化
    });

    // Firestoreから取得したデータを集計
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("データ取得:", data);
      const team = data.team;
      const points = data.points;

      if (team in teamPoints) {
        teamPoints[team] += points;
      }
    });

    // チーム順にソートして結果を表示
    resultsTable.innerHTML = ""; // テーブル内容をクリア
    teams.forEach((team) => {
      const row = resultsTable.insertRow(); // 新しい行を挿入
      row.innerHTML = `
        <td>${team}</td>
        <td>${teamPoints[team]}</td>
      `;
    });

    console.log("投票結果が正常にロードされました:", teamPoints);
  } catch (error) {
    console.error("Firestoreからのデータ取得に失敗しました:", error);
    alert("投票結果の取得に失敗しました。再度お試しください。");
  }
}

// 戻るボタンの設定
backButton.addEventListener("click", () => {
  window.location.href = "./index.html"; // 戻る画面を指定
});

// 初期化
document.addEventListener("DOMContentLoaded", () => {
  loadResults(); // ページロード後に投票結果を取得
});
