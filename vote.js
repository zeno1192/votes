import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, addDoc, deleteDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

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

// HTML要素
const userInfo = document.getElementById("user-info");
const balance = document.getElementById("balance");
const voteForm = document.getElementById("voteForm");
const historyTable = document.getElementById("historyTable").querySelector("tbody");
const logoutButton = document.getElementById("logoutButton");

// 現在のユーザー情報
let currentUser = null;

// ユーザー認証状態を監視
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    document.getElementById("userEmail").textContent = user.email;

    // Firestoreからポイントを取得
    const userDoc = await getDoc(doc(db, "Users", user.uid));
    const userData = userDoc.data();
    document.getElementById("userPoints").textContent = userData.points;

    // 投票履歴を取得して表示
    loadVoteHistory();
  } else {
    window.location.href = "./index.html"; // ログイン画面に戻る
  }
});

// 投票処理
voteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const team = document.getElementById("team").value;
  const points = parseInt(document.getElementById("points").value, 10);

  if (!team || isNaN(points) || points <= 0) {
    alert("正しい投票先とポイント数を入力してください！");
    return;
  }

  try {
    const userDocRef = doc(db, "Users", currentUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      alert("ユーザー情報が見つかりません！");
      return;
    }

    const userData = userDoc.data();

    if (userData.points < points) {
      alert("ポイントが足りません！");
      return;
    }

    // Firestoreに投票を記録
    await addDoc(collection(db, "Votes"), {
      userId: currentUser.uid,
      team: team,
      points: points,
      timestamp: new Date(),
    });

    // ポイントを更新
    await setDoc(userDocRef, { points: userData.points - points }, { merge: true });

    alert("投票が完了しました！");
    loadVoteHistory(); // 履歴を更新
  } catch (error) {
    console.error("投票エラー:", error);
    alert("投票中にエラーが発生しました。再度お試しください。");
  }
});

// 投票履歴の読み込み
async function loadVoteHistory() {
  historyTable.innerHTML = ""; // 既存の履歴をクリア

  const votesQuery = query(
    collection(db, "Votes"),
    where("userId", "==", currentUser.uid)
  );
  const querySnapshot = await getDocs(votesQuery);

  querySnapshot.forEach((doc) => {
    const vote = doc.data();
    const row = historyTable.insertRow();
    row.innerHTML = `
      <td>${vote.team}</td>
      <td>${vote.points}</td>
      <td>${new Date(vote.timestamp.seconds * 1000).toLocaleString()}</td>
      <td><button class="btn delete-btn" data-id="${doc.id}" data-points="${vote.points}">取り消し</button></td>
    `;
  });

  // 取り消しボタンにイベントリスナーを追加
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const docId = e.target.dataset.id;
      const points = parseInt(e.target.dataset.points, 10);

      try {
        // 投票を削除
        await deleteDoc(doc(db, "Votes", docId));

        // ポイントを戻す
        const userDocRef = doc(db, "Users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        await setDoc(userDocRef, { points: userData.points + points }, { merge: true });

        alert("投票を取り消しました！");
        loadVoteHistory(); // 履歴を更新
      } catch (error) {
        console.error("取り消しエラー:", error);
        alert("取り消し中にエラーが発生しました。");
      }
    });
  });
}

// ログアウト処理
logoutButton.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "./index.html";
  });
});
