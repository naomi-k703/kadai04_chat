// Firebase SDKのインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";

// Firebaseの設定情報
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dbRef = ref(database, 'emotions');

document.addEventListener('DOMContentLoaded', function() {
    // セクション切り替え関数
    function showSection(sectionToShow) {
        document.querySelectorAll(".container").forEach((section) => {
            section.style.display = "none";
        });
        sectionToShow.style.display = "block";
    }

    // ユーザー登録フォームのイベントリスナー
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();  // フォームのデフォルトの送信を無効化
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
            alert('ユーザー登録が完了しました！ログインしてください。');
            showSection(document.getElementById('loginSection'));  // ログインセクションに遷移
        });
    }

    // ログインフォームのイベントリスナー
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const loginUsername = document.getElementById('loginUsername').value;
            const loginPassword = document.getElementById('loginPassword').value;
            const storedUsername = localStorage.getItem('username');
            const storedPassword = localStorage.getItem('password');

            if (loginUsername === storedUsername && loginPassword === storedPassword) {
                alert('ログイン成功！');
                showSection(document.getElementById('section1'));  // 感情入力セクションに遷移
            } else {
                alert('ユーザー名またはパスワードが正しくありません😭');
            }
        });
    }

    // 「ログイン画面に戻る」ボタンのイベントリスナー
    document.querySelectorAll('.toSection1').forEach((button) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            showSection(document.getElementById('loginSection'));
        });
    });

    // データ追加ボタンのイベントリスナー
    const addDataButton = document.getElementById('addDataButton');
    if (addDataButton) {
        addDataButton.onclick = function() {
            const age = document.getElementById('age').value;
            const period = document.getElementById('period').value;
            const event = document.getElementById('event').value;
            const emotionScore = document.getElementById('emotionScore').value;
            const emotionText = document.getElementById('emotionText').value;

            // 全ての入力フィールドが埋まっているかを確認
            if (age && period && event && emotionScore && emotionText) {
                const newPostRef = push(dbRef);
                set(newPostRef, {
                    age: age,
                    period: period,
                    event: event,
                    emotionScore: emotionScore,
                    emotionText: emotionText,
                    timestamp: new Date().toISOString()
                }).then(() => {
                    console.log("データが正常に追加されました！");
                    document.getElementById('age').value = '';
                    document.getElementById('period').value = '';
                    document.getElementById('event').value = '';
                    document.getElementById('emotionScore').value = '';
                    document.getElementById('emotionText').value = '';

                    const messages = ['❤️！', 'Good！', 'Nice！'];
                    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                    alert(randomMessage);

                    showSection(document.getElementById('chartSection'));  // チャートセクションに遷移
                    drawEmotionChart();  // チャートを描画する関数を呼び出す

                }).catch((error) => {
                    console.error("データの追加中にエラーが発生しました:", error);
                });
            } else {
                alert("すべてのフィールドを入力してください。");
            }
        };
    }

    // チャートを描画する関数
    function drawEmotionChart() {
        const ctx = document.getElementById('emotionChart').getContext('2d');
        const dataPoints = [
            { label: '5歳', score: 3, emotion: '喜び', event: '初めての運動会' },
            { label: '10歳', score: -1, emotion: '悲しみ', event: '親友との別れ' },
            { label: '15歳', score: 2, emotion: '楽しい', event: '中学校の卒業' },
            { label: '20歳', score: -2, emotion: '怒り', event: '大学での失敗' },
            { label: '25歳', score: 1, emotion: '嬉しい', event: '初めての就職' },
            { label: '30歳', score: 0, emotion: '悔しさ', event: '大きなプロジェクトの失敗' }
        ];

        const labels = dataPoints.map(point => point.label);
        const scores = dataPoints.map(point => point.score);
        const emotions = dataPoints.map(point => point.emotion);
        const events = dataPoints.map(point => point.event);

        const data = {
            labels: labels,
            datasets: [{
                label: '感情スコア',
                data: scores,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.4
            }]
        };

        new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                plugins: {
                    filler: {
                        propagate: false
                    },
                    title: {
                        display: true,
                        text: '感情曲線チャート'
                    },
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                return '年齢/時期: ' + tooltipItems[0].label;
                            },
                            label: function(tooltipItem) {
                                const index = tooltipItem.dataIndex;
                                const emotion = emotions[index];
                                const event = events[index];
                                return '感情: ' + emotion + ' | 出来事: ' + event;
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false
                },
                radius: 10
            }
        });
    }

    // チーム全体の原動力チャートを描画する関数
    function drawTeamMotivationChart() {
        onValue(ref(database, 'motivations'), (snapshot) => {
            const data = snapshot.val() || {};
            const motivationCounts = {};

            // データの集計
            Object.values(data).forEach(entry => {
                entry.motivations.forEach(motivation => {
                    motivationCounts[motivation] = (motivationCounts[motivation] || 0) + 1;
                });
            });

            const ctx = document.getElementById('teamMotivationChart').getContext('2d');
            const labels = Object.keys(motivationCounts);
            const counts = Object.values(motivationCounts);

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '原動力の選択数',
                        data: counts,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'チーム全体の原動力'
                        }
                    }
                }
            });
        });
    }

    // 「次へ」ボタンのイベントリスナー（自己評価セクションへ遷移）
    const toReviewButton = document.querySelector('.toReview');
    if (toReviewButton) {
        toReviewButton.addEventListener('click', function(e) {
            e.preventDefault();
            showSection(document.getElementById('reviewSection'));  // 自己評価セクションを表示
        });
    }

    // 「次へ」ボタンのイベントリスナー（フィードバックセクションへ遷移）
    const toFeedbackButton = document.querySelector('.toFeedback');
    if (toFeedbackButton) {
        toFeedbackButton.addEventListener('click', function(e) {
            e.preventDefault();
            showSection(document.getElementById('feedbackSection'));  // フィードバックセクションを表示
        });
    }

    // フィードバック共有ボタンのイベントリスナー
    const shareFeedbackYes = document.getElementById('shareFeedbackYes');
    const shareFeedbackNo = document.getElementById('shareFeedbackNo');
    if (shareFeedbackYes && shareFeedbackNo) {
        shareFeedbackYes.onclick = function() {
            showSection(document.getElementById('nameChoiceSection'));  // 記名/匿名選択セクションを表示
        };
        shareFeedbackNo.onclick = function() {
            showSection(document.getElementById('endSection'));  // 終了セクションを表示
        };
    }

    // 記名/匿名選択ボタン
    const shareWithName = document.getElementById('shareWithName');
    const shareAnonymously = document.getElementById('shareAnonymously');
    if (shareWithName && shareAnonymously) {
        shareWithName.onclick = function() {
            document.getElementById('feedbackFrom').style.display = "block"; // 名前入力欄を表示
            showSection(document.getElementById('feedbackInputSection'));  // フィードバック入力セクションを表示
        };
        shareAnonymously.onclick = function() {
            document.getElementById('feedbackFrom').value = "匿名";
            document.getElementById('feedbackFrom').style.display = "none";  // 名前入力欄を非表示
            showSection(document.getElementById('feedbackInputSection'));  // フィードバック入力セクションを表示
        };
    }

    // フィードバック送信ボタンのイベントリスナー
    const submitFeedbackButton = document.getElementById('submitFeedbackButton');
    if (submitFeedbackButton) {
        submitFeedbackButton.onclick = function() {
            const feedbackFrom = document.getElementById('feedbackFrom').value;
            const feedbackTo = document.getElementById('feedbackTo').value;
            const feedbackMessage = document.getElementById('feedbackMessage').value;

            if (feedbackFrom && feedbackTo && feedbackMessage) {
                // フィードバックをFirebaseに保存
                const newFeedbackRef = push(ref(database, 'feedbacks'));
                set(newFeedbackRef, {
                    from: feedbackFrom,
                    to: feedbackTo,
                    message: feedbackMessage,
                    timestamp: new Date().toISOString()
                }).then(() => {
                    console.log("フィードバックが正常に追加されました！");
                    showSection(document.getElementById('chatSection'));  // チャットセクションを表示
                    displayFeedback(feedbackFrom, feedbackTo, feedbackMessage);
                }).catch((error) => {
                    console.error("フィードバックの保存中にエラーが発生しました:", error);
                });
            } else {
                alert("すべてのフィールドに入力してください。");
            }
        };
    }

    // メッセージ送信ボタンのイベントリスナー
    const sendMessageButton = document.getElementById('sendMessageButton');
    if (sendMessageButton) {
        sendMessageButton.onclick = function() {
            const messageInput = document.getElementById('chatMessage').value;
            const messageDisplayArea = document.getElementById('messageDisplayArea');

            if (messageInput.trim() !== "") {
                const currentDateTime = new Date().toLocaleString(); // 現在の日時
                const messageDiv = document.createElement('div');
                messageDiv.innerHTML = `<p><strong>${currentDateTime}</strong>: ${messageInput}</p>`;
                messageDisplayArea.appendChild(messageDiv);
                messageDisplayArea.scrollTop = messageDisplayArea.scrollHeight;  // 最新メッセージにスクロール
                document.getElementById('chatMessage').value = '';  // 入力フィールドをクリア
            }
        };
    }

    // 「自己評価の送信」ボタンのイベントリスナー
    const submitAssessmentButton = document.getElementById('submitAssessmentButton');
    if (submitAssessmentButton) {
        submitAssessmentButton.onclick = function() {
            const selfAssessment = document.getElementById('selfAssessment').value;
            const motivations = Array.from(document.getElementById('motivation').selectedOptions).map(option => option.value);

            if (selfAssessment && motivations.length > 0) {
                // Firebaseに保存するコードを追加
                const newPostRef = push(ref(database, 'motivations'));
                set(newPostRef, {
                    selfAssessment: selfAssessment,
                    motivations: motivations
                }).then(() => {
                    // チーム全体の原動力セクションを表示
                    showSection(document.getElementById('teamMotivationChartSection')); 
                    // モチベーションデータをカウントし、チャートを描画
                    drawTeamMotivationChart();
                }).catch((error) => {
                    console.error("データの保存中にエラーが発生しました:", error);
                });
            } else {
                alert("すべてのフィールドに入力してください。");
            }
        };
    }

    // 「次へ」ボタンのイベントリスナー（終了メッセージへ遷移）
    const NextToSection = document.getElementById('NextToSection');
    if (NextToSection) {
        NextToSection.onclick = function() {
            showSection(document.getElementById('endSection'));  // 終了メッセージのセクションを表示
        };
    } else {
        console.error("NextToSection が見つかりません。");
    }

    // データをリアルタイムで取得して表示する関数
    function loadData() {
        onValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            const graphContainer = document.getElementById('graph');
            graphContainer.innerHTML = '';  // グラフをクリアする

            for (const id in data) {
                const item = data[id];
                const div = document.createElement('div');
                div.innerHTML = `
                    年齢: ${item.age}, 時期: ${item.period}, 出来事: ${item.event}, スコア: ${item.emotionScore}, 感情: ${item.emotionText}
                    <button onclick="deleteData('${id}')">削除</button>
                `;
                graphContainer.appendChild(div);
            }
        });
    }

    // データを削除する関数
    window.deleteData = function(id) {
        const dataRef = ref(database, 'emotions/' + id);
        remove(dataRef)
            .then(() => {
                console.log("データが正常に削除されました！");
            })
            .catch((error) => {
                console.error("データの削除中にエラーが発生しました:", error);
            });
    };

    // フィードバックを表示する関数
    function displayFeedback(from, to, message) {
        const messageDisplayArea = document.getElementById('messageDisplayArea');
        const messageDiv = document.createElement('div');
        const currentDateTime = new Date().toLocaleString();  // 現在の日時

        messageDiv.innerHTML = `<p><strong>${from} から ${to} へ (${currentDateTime})</strong>: ${message}</p>`;
        messageDisplayArea.appendChild(messageDiv);
        messageDisplayArea.scrollTop = messageDisplayArea.scrollHeight;  // 最新メッセージにスクロール
    }

});
