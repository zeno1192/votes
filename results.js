import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Firebase 構成情報
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
const resultsTableBody = document.getElementById("resultsTableBody");
const errorDiv = document.getElementById("error");

// チーム一覧（1から13）
const teamList = Array.from({ length: 13 }, (_, i) => `Team ${i + 1}`);

// Votesコレクションを集計し、Resultsコレクションに保存する関数
async function aggregateVotesToResults() {
  try {
    const votesSnapshot = await getDocs(collection(db, "Votes"));
    const results = {};

    // Votesコレクションの各ドキュメントを集計
    votesSnapshot.forEach((doc) => {
      const data = doc.data();
      const team = data.team;
      const points = data.points;

      if (!results[team]) {
        results[team] = 0; // チームがまだない場合、初期化
      }
      results[team] += points; // ポイントを加算
    });

    // Resultsコレクションに保存
    for (const [teamName, points] of Object.entries(results)) {
      await setDoc(doc(db, "Results", teamName), {
        teamName,
        points,
        timestamp: serverTimestamp(), // 最新のタイムスタンプを記録
      });
    }

    console.log("Votesの集計が完了し、Resultsに保存されました！");
  } catch (error) {
    console.error("Votes集計中にエラーが発生しました:", error);
    errorDiv.textContent = "集計中にエラーが発生しました。";
  }
}

// Resultsコレクションを取得し、テーブルに表示する関数
async function loadResults() {
  try {
    const resultsSnapshot = await getDocs(collection(db, "Results"));
    const results = {};

    // Resultsコレクションからデータを取得
    resultsSnapshot.forEach((doc) => {
      const data = doc.data();
      results[data.teamName] = data.points || 0; // ポイントを格納
    });

    resultsTableBody.innerHTML = ""; // テーブルを初期化

    // チームリストをループしてテーブルを作成
    teamList.forEach((team) => {
      const row = document.createElement("tr");

      const teamCell = document.createElement("td");
      teamCell.textContent = team;
      row.appendChild(teamCell);

      const pointsCell = document.createElement("td");
      pointsCell.textContent = results[team] || 0; // 獲得ポイント（0でも表示）
      row.appendChild(pointsCell);

      resultsTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Resultsの取得中にエラーが発生しました:", error);
    errorDiv.textContent = "投票結果の取得に失敗しました。再度お試しください。";
  }
}

// ページ読み込み時に実行
document.addEventListener("DOMContentLoaded", async () => {
  await aggregateVotesToResults(); // Votesを集計してResultsに保存
  await loadResults(); // Resultsを読み込んで表示
});

