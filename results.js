import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Firebase 構成情報
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase 初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// HTML 要素
const resultsTableBody = document.getElementById("resultsTableBody");
const errorDiv = document.getElementById("error");

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
    resultsTableBody.innerHTML = ""; // テーブルを初期化

    if (resultsSnapshot.empty) {
      errorDiv.textContent = "表示するデータがありません。";
      return;
    }

    // Resultsコレクションの各ドキュメントをテーブルに追加
    resultsSnapshot.forEach((doc) => {
      const result = doc.data();
      const row = document.createElement("tr");

      const teamCell = document.createElement("td");
      teamCell.textContent = result.teamName || "不明";
      row.appendChild(teamCell);

      const pointsCell = document.createElement("td");
      pointsCell.textContent = result.points || 0;
      row.appendChild(pointsCell);

      const dateCell = document.createElement("td");
      dateCell.textContent = result.timestamp
        ? new Date(result.timestamp.seconds * 1000).toLocaleString()
        : "N/A";
      row.appendChild(dateCell);

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
