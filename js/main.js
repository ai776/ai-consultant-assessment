import { questions, levels } from './questions.js';
import { encodeAnswersBase64, decodeAnswersBase64 } from './utils.js';
import {
  initializeAuth,
  handleDiagnosisComplete,
  getUserStats,
} from './firebase.js';

// --- ここからクイズロジック ---

let currentQuestion = 0;
let answers = [];
let totalScore = 0;
let isFirebaseInitialized = false;

// DOM要素取得
const startScreen = document.getElementById('start-screen');
const questionContainer = document.getElementById('question-container');
const resultContainer = document.getElementById('result-container');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const retryBtn = document.getElementById('retry-btn');
const shareBtn = document.getElementById('share-btn');

// イベントリスナー
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', nextQuestion);
prevBtn.addEventListener('click', prevQuestion);
retryBtn.addEventListener('click', retryQuiz);
shareBtn.addEventListener('click', shareResult);

export async function initQuiz() {
  // Firebase初期化
  try {
    await initializeAuth();
    isFirebaseInitialized = true;
    console.log('Firebase初期化完了');

    // uidを取得して書籍プレゼントリンクを更新
    updateBookPresentLink();

    // ユーザー統計情報を表示
    try {
      const userStats = await getUserStats();
      console.log('取得したユーザー統計:', userStats);
      if (userStats.hasPreviousResult) {
        const levelTitle = userStats.lastLevel
          ? userStats.lastLevel.title
          : '不明';
        console.log(`前回の診断: ${userStats.lastScore}点 (${levelTitle})`);
      }
    } catch (statsError) {
      console.error('ユーザー統計の取得でエラー:', statsError);
    }
  } catch (error) {
    console.error('Firebase初期化エラー:', error);
    isFirebaseInitialized = false;
  }

  // 前回の診断結果を表示
  await displayPreviousResult();

  // URLパラメータをチェックして診断結果を表示
  parseAnswersFromURL();
  // 初期状態で最初の質問を表示
  if (!answers.length) {
    showQuestion();
  }
}

// 書籍プレゼントリンクを更新する関数
function updateBookPresentLink() {
  console.log('書籍プレゼントリンクを更新中...');
  const link = document.getElementById('book-present-link');
  console.log('リンク要素を取得:', link);

  if (!link) return;

  // 現在認証されているユーザーのuidを取得
  const user = window.firebaseAuth?.currentUser;
  console.log('現在のユーザー:', user);
  if (user && user.uid) {
    console.log('ユーザーUIDを取得:', user.uid);
    console.log('リンクの現在のhref:', link.href);
    // 診断IDフィールドにuidを事前入力するためのパラメータを追加
    // Googleフォームの事前入力URLの形式: &entry.XXXXXXX=値
    // 診断IDフィールドのentry番号を取得する必要がありますが、
    // 一般的なフィールド名から推定して追加します
    const baseUrl =
      'https://docs.google.com/forms/d/e/1FAIpQLScm6jVLdv9LqNTigeBYA5npocHzZHZ7vmp6ir8-_qPufVX_tg/viewform?usp=pp_url';

    // 診断IDフィールドのentry番号（実際のフォームに合わせて調整が必要）
    // この番号は実際のGoogleフォームの「事前入力」機能で確認する必要があります
    const diagnosisIdEntry = '&entry.835667435=' + encodeURIComponent(user.uid);

    link.href = baseUrl + diagnosisIdEntry;
    console.log('書籍プレゼントリンクを更新:', link.href);
  }
}

// 前回の診断結果を開始画面に表示
async function displayPreviousResult() {
  const userStats = await getUserStats();
  const ctaSection = document.querySelector('.cta-section');

  if (userStats.hasPreviousResult && ctaSection) {
    // const previousResultHtml = `
    //   <div class="previous-result">
    //     <h4>前回の診断結果</h4>
    //     <p>スコア: <strong>${userStats.lastScore}点</strong> - ${
    //   userStats.lastLevel.title
    // }</p>
    //     <p class="date">診断日: ${userStats.lastDiagnosisDate.toLocaleDateString(
    //       'ja-JP'
    //     )}</p>
    //   </div>
    // `;
    // ctaSection.insertAdjacentHTML('beforebegin', previousResultHtml);
  }
}

function startQuiz() {
  startScreen.style.display = 'none';
  questionContainer.style.display = 'block';
  currentQuestion = 0;
  answers = [];
  showQuestion();
}

function showQuestion() {
  const question = questions[currentQuestion];
  const questionContent = document.getElementById('question-content');
  const currentQuestionSpan = document.getElementById('current-question');
  const totalQuestionsSpan = document.getElementById('total-questions');
  const progressFill = document.getElementById('progress-fill');

  // 質問コンテナに質問IDを設定
  questionContent.setAttribute('data-question-id', question.id);

  // 進捗更新
  currentQuestionSpan.textContent = currentQuestion + 1;
  if (totalQuestionsSpan) {
    totalQuestionsSpan.textContent = questions.length;
  }
  progressFill.style.width =
    ((currentQuestion + 1) / questions.length) * 100 + '%';

  // 質問内容作成
  let html = `<h3>${question.question}</h3>`;

  // 質問の説明文がある場合は表示
  if (question.description) {
    html += `<p class="question-description">${question.description}</p>`;
  }

  // 質問タイプのインジケーターを追加
  if (question.type === 'single') {
    html +=
      '<div class="question-type-indicator question-type-single">単一選択（1つだけ選択）</div>';
  } else {
    html +=
      '<div class="question-type-indicator question-type-multiple">複数選択（複数選択可能）</div>';
  }

  // 共通資料（globalAssets）がある場合は選択肢の前に表示
  if (question.globalAssets && question.globalAssets.length > 0) {
    const lpGridClass = question.id === 2 ? ' lp-grid' : '';
    html += `<div class="question-global-assets${lpGridClass}">`;

    if (question.assetType === 'slideshow') {
      // スライドショーの場合
      html += `
        <div class="global-asset">
          <h4>AIプレゼン生成スライド</h4>
          <div class="slideshow-container" data-slideshow-id="global">
            <div class="slideshow-wrapper">
              <div class="slide active">
                <img src="${question.globalAssets[0].src}" alt="${question.globalAssets[0].label}" class="slideshow-image" />
              </div>
            </div>
            <div class="slideshow-controls">
              <button class="slideshow-btn prev" onclick="changeGlobalSlide(-1)">‹</button>
              <span class="slide-counter">1 / ${question.globalAssets.length}</span>
              <button class="slideshow-btn next" onclick="changeGlobalSlide(1)">›</button>
            </div>
            <button class="slideshow-fullscreen" onclick="openGlobalSlideshowPopup('AIプレゼン生成スライド')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
              全画面で見る
            </button>
          </div>
        </div>
      `;
    } else {
      question.globalAssets.forEach((asset) => {
        if (question.assetType === 'images') {
          if (asset.src.endsWith('.pdf')) {
            html += `
              <div class="global-asset">
                <h4>${asset.label}</h4>
                <embed src="${asset.src}#toolbar=0&navpanes=0" type="application/pdf" class="global-pdf" />
              </div>
            `;
          } else {
            // 質問2のLP画像の場合は特別な表示構造にする
            if (question.id === 2) {
              html += `
                <div class="global-asset" data-label="${asset.label}">
                  <h4>${asset.label}</h4>
                  <div class="global-image lp-preview" onclick="openImagePopup('${asset.src}', '${asset.label}')">
                    <img src="${asset.src}" alt="${asset.label}" />
                  </div>
                </div>
              `;
            } else {
              // 通常の画像表示
              html += `
                <div class="global-asset">
                  <h4>${asset.label}</h4>
                  <img src="${asset.src}" alt="${asset.label}" class="global-image"
                       onclick="openImagePopup('${asset.src}', '${asset.label}')" />
                </div>
              `;
            }
          }
        } else if (question.assetType === 'video') {
          html += `
            <div class="global-asset">
              <h4>${asset.label}</h4>
              <video controls class="global-video">
                <source src="${asset.src}" type="video/mp4">
                お使いのブラウザは動画をサポートしていません。
              </video>
            </div>
          `;
        } else if (question.assetType === 'text') {
          html += `
            <div class="global-asset">
              <h4>${asset.label}</h4>
              <div class="global-text-content" data-src="${asset.src}">読み込み中...</div>
            </div>
          `;
        }
      });
    }
    html += '</div>';
  }

  html += '<div class="options">';
  question.options.forEach((option, index) => {
    const isChecked =
      answers[currentQuestion] && answers[currentQuestion].includes(index);
    const inputType = question.type === 'multiple' ? 'checkbox' : 'radio';
    const name = `q${currentQuestion}`;
    const choiceClass =
      question.type === 'multiple' ? 'multiple-choice' : 'single-choice';
    const hasAssetClass =
      question.assets && question.assets[index] ? 'has-asset' : '';

    html += `
      <label class="option ${choiceClass} ${hasAssetClass} ${
      isChecked ? 'selected' : ''
    }">`;

    // 資料付き選択肢の場合は、inputとテキストをoption-headerで囲む
    if (hasAssetClass === 'has-asset') {
      html += `
        <div class="option-header">
          <input type="${inputType}" name="${name}" value="${index}" ${
        isChecked ? 'checked' : ''
      }>
          <div class="option-text">${option.text}</div>
        </div>`;
    } else {
      // 通常の選択肢（資料なし）- inputとtextを1行に
      html += `
        <input type="${inputType}" name="${name}" value="${index}" ${
        isChecked ? 'checked' : ''
      }>
        <div class="option-text">${option.text}</div>`;
    }

    // 対応する資料がある場合は選択肢内に表示
    if (question.assets && question.assets[index]) {
      const asset = question.assets[index];

      if (question.assetType === 'slideshow') {
        // スライドショーの場合
        html += `
          <div class="option-asset">
            <div class="slideshow-container" data-slideshow-id="option-${index}">
              <div class="slideshow-wrapper">
                <div class="slide active">
                  <img src="${asset.slides[0]}" alt="${asset.label} - スライド 1" class="slideshow-image" />
                </div>
              </div>
              <div class="slideshow-controls">
                <button class="slideshow-btn prev" onclick="changeSlide('option-${index}', -1)">‹</button>
                <span class="slide-counter">1 / ${asset.slides.length}</span>
                <button class="slideshow-btn next" onclick="changeSlide('option-${index}', 1)">›</button>
              </div>
              <button class="slideshow-fullscreen" onclick="openSlideshowPopup('${index}', '${asset.label}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
                全画面で見る
              </button>
            </div>
          </div>
        `;
      } else if (question.assetType === 'images') {
        if (asset.src.endsWith('.pdf')) {
          // PDFの場合
          html += `
            <div class="option-asset">
              <embed src="${asset.src}#toolbar=0&navpanes=0" type="application/pdf" class="option-pdf" />
            </div>
          `;
        } else {
          // 画像の場合
          html += `
            <div class="option-asset">
              <img src="${asset.src}" alt="${asset.label}" class="option-image"
                   onclick="openImagePopup('${asset.src}', '${asset.label}')" />
            </div>
          `;
        }
      } else if (question.assetType === 'video') {
        html += `
          <div class="option-asset">
            <video controls class="option-video">
              <source src="${asset.src}" type="video/mp4">
              お使いのブラウザは動画をサポートしていません。
            </video>
          </div>
        `;
      } else if (question.assetType === 'text') {
        html += `
          <div class="option-asset">
            <div class="option-text-content" data-src="${asset.src}">読み込み中...</div>
          </div>
        `;
      }
    }

    html += `</label>`;
  });
  html += '</div>';
  questionContent.innerHTML = html;

  // スライドショーの状態をリセット
  if (question.assetType === 'slideshow') {
    slideshowStates = {}; // 全ての状態をリセット

    // globalAssetsのスライドショーを初期化
    if (question.globalAssets && question.globalAssets.length > 0) {
      slideshowStates['global'] = 0;
    }

    // 各選択肢のスライドショーを初期化
    question.assets.forEach((asset, index) => {
      if (asset) {
        slideshowStates[`option-${index}`] = 0;
      }
    });
  }

  // テキストファイルの読み込み
  if (question.assetType === 'text') {
    // 選択肢内のテキストファイル
    if (question.assets) {
      question.assets.forEach((asset) => {
        if (asset) {
          loadTextContent(asset.src, true); // 選択肢内のテキストコンテンツ用フラグ
        }
      });
    }
    // 共通のテキストファイル
    if (question.globalAssets) {
      question.globalAssets.forEach((asset) => {
        loadTextContent(asset.src, false); // 共通テキストコンテンツ用フラグ
      });
    }
  }

  // オプションクリックイベント
  const options = questionContent.querySelectorAll('.option');
  options.forEach((option, index) => {
    const input = option.querySelector('input');
    if (input) {
      input.addEventListener('change', (e) => {
        selectOption(index);
      });
    }
  });
  updateNavigationButtons();
}

// テキストファイルの内容を読み込む関数
async function loadTextContent(src, isOptionContent = false) {
  try {
    const response = await fetch(src);
    const text = await response.text();
    const selector = isOptionContent
      ? `.option-text-content[data-src="${src}"]`
      : `.global-text-content[data-src="${src}"]`;
    const contentElement = document.querySelector(selector);
    if (contentElement) {
      // Markdownファイルの場合はmarkedライブラリでHTMLに変換
      if (src.endsWith('.md')) {
        const htmlContent = marked.parse(text);
        contentElement.innerHTML = `<div class="markdown-content">${htmlContent}</div>`;
      } else {
        // 通常のテキストファイルはpreタグで表示
        contentElement.innerHTML = `<pre class="text-content">${text}</pre>`;
      }
    }
  } catch (error) {
    console.error('テキストファイルの読み込みに失敗しました:', error);
    const selector = isOptionContent
      ? `.option-text-content[data-src="${src}"]`
      : `.global-text-content[data-src="${src}"]`;
    const contentElement = document.querySelector(selector);
    if (contentElement) {
      contentElement.textContent = 'ファイルの読み込みに失敗しました。';
    }
  }
}

function selectOption(index) {
  const question = questions[currentQuestion];
  if (question.type === 'single') {
    answers[currentQuestion] = [index];
    const options = document.querySelectorAll('.option');
    options.forEach((option, i) => {
      const isSelected = i === index;
      option.classList.toggle('selected', isSelected);
      const input = option.querySelector('input');
      if (input) input.checked = isSelected;
    });
  } else {
    if (!answers[currentQuestion]) answers[currentQuestion] = [];
    const optionIndex = answers[currentQuestion].indexOf(index);
    if (optionIndex === -1) {
      answers[currentQuestion].push(index);
    } else {
      answers[currentQuestion].splice(optionIndex, 1);
    }
    const options = document.querySelectorAll('.option');
    options.forEach((option, i) => {
      const isSelected = answers[currentQuestion].includes(i);
      option.classList.toggle('selected', isSelected);
      const input = option.querySelector('input');
      if (input) input.checked = isSelected;
    });
  }
  const hasSelection =
    answers[currentQuestion] && answers[currentQuestion].length > 0;
  nextBtn.disabled = !hasSelection;
  nextBtn.classList.toggle('disabled', !hasSelection);
  if (currentQuestion === questions.length - 1) {
    nextBtn.textContent = '結果を見る';
  } else {
    nextBtn.textContent = '次の問題';
  }
}

function updateNavigationButtons() {
  const navigation = document.querySelector('.navigation');
  prevBtn.style.display = currentQuestion > 0 ? 'block' : 'none';
  if (currentQuestion === 0) {
    navigation.classList.add('first-question');
  } else {
    navigation.classList.remove('first-question');
  }
  const hasSelection =
    answers[currentQuestion] && answers[currentQuestion].length > 0;
  nextBtn.disabled = !hasSelection;
  nextBtn.classList.toggle('disabled', !hasSelection);
  if (currentQuestion === questions.length - 1) {
    nextBtn.textContent = '結果を見る';
  } else {
    nextBtn.textContent = '次の問題';
  }
}

function nextQuestion() {
  if (currentQuestion === questions.length - 1) {
    showResult();
  } else {
    currentQuestion++;
    showQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    showQuestion();
  }
}

function calculateScore() {
  let score = 0;
  answers.forEach((answer, questionIndex) => {
    if (answer && answer.length > 0) {
      answer.forEach((optionIndex) => {
        score += questions[questionIndex].options[optionIndex].score;
      });
    }
  });
  // 最低点は0点とする
  return Math.max(0, score);
}

function getLevel(score) {
  return levels.find((level) => score >= level.min && score <= level.max);
}

async function showResult() {
  totalScore = calculateScore();
  const level = getLevel(totalScore);

  // ローディング表示
  // showSavingIndicator();

  // Firebase保存処理
  if (isFirebaseInitialized) {
    try {
      const saveResult = await handleDiagnosisComplete(
        answers,
        totalScore,
        level
      );

      if (saveResult.isSameAsPrevious) {
        console.log('前回と同じ結果のため、Firestore保存をスキップしました');
      } else {
        console.log('新しい診断結果をFirestoreに保存しました');
      }
    } catch (error) {
      console.error('診断結果保存エラー:', error);
    }
  }

  // ローディング非表示
  hideSavingIndicator();

  questionContainer.style.display = 'none';
  resultContainer.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('total-score').textContent = totalScore;
  document.getElementById('level-icon').textContent = level.icon;
  document.getElementById('level-title').textContent = level.title;
  document.getElementById('level-description').textContent = level.description;
  const characterImg = document.getElementById('level-character-img');
  if (totalScore <= 39) {
    characterImg.src = 'images/beginner-character.gif';
    characterImg.alt = 'ビギナーキャラクター';
  } else if (totalScore <= 89) {
    characterImg.src = 'images/challenger-character.gif';
    characterImg.alt = 'チャレンジャーキャラクター';
  } else {
    characterImg.src = 'images/professional-character.gif';
    characterImg.alt = 'プロフェッショナルキャラクター';
  }
  document.getElementById('advice-text').textContent = level.advice;
  updateTrainingSection(totalScore);
  const levelDisplay = document.querySelector('.level-display');
  levelDisplay.className = 'level-display';
  if (totalScore <= 39) {
    levelDisplay.classList.add('level-lv1');
  } else if (totalScore <= 89) {
    levelDisplay.classList.add('level-lv10');
  } else {
    levelDisplay.classList.add('level-lv99');
  }
  retryBtn.textContent = 'もう一度チェック';

  // 展示会特典リンクの事前入力は不要のため処理なし
}

function updateTrainingSection(score) {
  const trainingDescription = document.getElementById('training-description');
  const trainingOptions = document.getElementById('training-options');
  if (score <= 39) {
    trainingDescription.textContent =
      'AIコンサルタントの全体像を押さえる基礎講座からスタートしましょう。';
    trainingOptions.innerHTML = `
      <div class="training-option">
        <h4>AIコンサルタント入門ブートキャンプ</h4>
        <p>AI領域の基礎知識とビジネス活用のフレームを体系的に学ぶ導入講座。役割理解と用語整理に最適です。</p>
      </div>
    `;
  } else if (score <= 69) {
    trainingDescription.textContent =
      '提案力と案件推進力を身につけ、現場で通用するスキルへ磨き上げましょう。';
    trainingOptions.innerHTML = `
      <div class="training-option">
        <h4>AIコンサルタント実務演習</h4>
        <p>ヒアリング設計からPoC企画までをケーススタディで体得。提案資料の作り方やROI試算も学べます。</p>
      </div>
    `;
  } else if (score <= 89) {
    trainingDescription.textContent =
      'プロジェクトリードとしての引き出しを増やし、顧客価値を最大化しましょう。';
    trainingOptions.innerHTML = `
      <div class="training-option">
        <h4>エンタープライズAI案件マネジメント</h4>
        <p>大規模導入におけるガバナンス設計、データ基盤連携、ステークホルダーマネジメントを徹底解説します。</p>
      </div>
    `;
  } else {
    trainingDescription.textContent =
      '経営と並走する戦略パートナーとしての価値提供に踏み込みましょう。';
    trainingOptions.innerHTML = `
      <div class="training-option">
        <h4>戦略AIコンサルタントマスタークラス</h4>
        <p>全社ロードマップ設計やAI倫理・ガバナンス構築を実践的に学ぶ上級プログラム。CxOとの共創力を磨きます。</p>
      </div>
      <div class="training-option">
        <h4>AI変革伴走パートナーシップ</h4>
        <p>自走支援から運用定着までを長期的にサポート。社内育成とプロジェクト推進を同時に実現します。</p>
      </div>
    `;
  }
}

function retryQuiz() {
  const url = new URL(window.location.href);
  url.searchParams.delete('answers');
  window.history.replaceState({}, '', url);
  resultContainer.style.display = 'none';
  startScreen.style.display = 'block';
  currentQuestion = 0;
  answers = [];
  totalScore = 0;
  retryBtn.textContent = 'もう一度チェック';
  shareBtn.style.display = 'block';
}

function shareResult() {
  const level = getLevel(totalScore);
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const answerParam = encodeURIComponent(
    encodeAnswersBase64(answers, questions)
  );
  const tweetText = `AIコンサルタント認定診断の結果\n\nスコア: ${totalScore}点/100点\nレベル: ${level.title} ${level.description}\n\nあなたもAIコンサルタントとしての理解度をチェックしてみませんか？\n\n${baseUrl}?answers=${answerParam}\n\n#AIコンサルタント #AIコンサル認定 #生成AI`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}`;
  window.open(twitterUrl, '_blank');
}

function parseAnswersFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const answersParam = urlParams.get('answers');
  if (answersParam) {
    answers = decodeAnswersBase64(decodeURIComponent(answersParam), questions);
    startScreen.style.display = 'none';
    questionContainer.style.display = 'none';
    resultContainer.style.display = 'block';
    retryBtn.textContent = '自分も認定チェック';
    shareBtn.style.display = 'none';
    showResult();
  } else {
    startScreen.style.display = 'block';
    questionContainer.style.display = 'none';
    resultContainer.style.display = 'none';
  }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  // ポップアップ要素を作成
  createImagePopup();
  initQuiz();
});

// 画像ポップアップ要素を作成
function createImagePopup() {
  const popup = document.createElement('div');
  popup.className = 'image-popup';
  popup.id = 'image-popup';
  popup.innerHTML = `
    <button class="popup-close" onclick="closeImagePopup()">&times;</button>
    <div class="popup-content">
      <div class="popup-header">
        <h4 class="popup-title" id="popup-title"></h4>
      </div>
      <div class="popup-image-container">
        <img class="popup-image" id="popup-image" src="" alt="" />
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  // 背景クリック・タッチで閉じる
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      closeImagePopup();
    }
  });

  // タッチデバイス対応
  popup.addEventListener('touchend', (e) => {
    if (e.target === popup) {
      closeImagePopup();
    }
  });

  // ESCキーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeImagePopup();
    }
  });
}

// 画像ポップアップを開く
function openImagePopup(src, title) {
  const popup = document.getElementById('image-popup');
  if (!popup) {
    console.error('Image popup element not found');
    return;
  }

  const image = document.getElementById('popup-image');
  const titleElement = document.getElementById('popup-title');
  const imageContainer = popup.querySelector('.popup-image-container');

  image.src = src;
  image.alt = title;
  titleElement.textContent = title;
  popup.classList.add('active');
  document.body.style.overflow = 'hidden'; // スクロールを無効化

  // 画像コンテナのスクロール位置を最上部にリセット
  setTimeout(() => {
    if (imageContainer) {
      imageContainer.scrollTop = 0;
    }
  }, 50); // 画像の読み込みを待って実行
}

// 画像ポップアップを閉じる
function closeImagePopup() {
  const popup = document.getElementById('image-popup');
  popup.classList.remove('active');
  document.body.style.overflow = ''; // スクロールを有効化
}

// グローバル関数として定義（onclick属性から呼び出すため）
window.openImagePopup = openImagePopup;
window.closeImagePopup = closeImagePopup;

// ローディング表示機能
function createSavingIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'saving-indicator';
  indicator.id = 'saving-indicator';
  indicator.innerHTML = `
    <div class="spinner"></div>
    <p>診断結果を保存しています...</p>
  `;
  document.body.appendChild(indicator);
}

function showSavingIndicator() {
  let indicator = document.getElementById('saving-indicator');
  if (!indicator) {
    createSavingIndicator();
    indicator = document.getElementById('saving-indicator');
  }
  indicator.classList.add('active');
}

function hideSavingIndicator() {
  const indicator = document.getElementById('saving-indicator');
  if (indicator) {
    indicator.classList.remove('active');
  }
}

// スライドショー機能
let slideshowStates = {}; // 各スライドショーの現在のスライド位置を管理

function changeSlide(slideshowId, direction) {
  const container = document.querySelector(
    `[data-slideshow-id="${slideshowId}"]`
  );
  if (!container) return;

  const question = questions[currentQuestion];
  const optionIndex = parseInt(slideshowId.split('-')[1]);
  const asset = question.assets[optionIndex];

  if (!slideshowStates[slideshowId]) {
    slideshowStates[slideshowId] = 0;
  }

  // 新しいスライド位置を計算
  slideshowStates[slideshowId] += direction;

  // 範囲チェック
  if (slideshowStates[slideshowId] < 0) {
    slideshowStates[slideshowId] = 0;
  } else if (slideshowStates[slideshowId] >= asset.slides.length) {
    slideshowStates[slideshowId] = asset.slides.length - 1;
  }

  // スライドを更新
  const slideWrapper = container.querySelector('.slideshow-wrapper');
  const currentSlide = slideshowStates[slideshowId];

  slideWrapper.innerHTML = `
    <div class="slide active">
      <img src="${asset.slides[currentSlide]}" alt="${asset.label} - スライド ${
    currentSlide + 1
  }" class="slideshow-image" />
    </div>
  `;

  // カウンターを更新
  const counter = container.querySelector('.slide-counter');
  counter.textContent = `${currentSlide + 1} / ${asset.slides.length}`;

  // ボタンの状態を更新
  const prevBtn = container.querySelector('.prev');
  const nextBtn = container.querySelector('.next');

  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === asset.slides.length - 1;
}

// globalAssets用のスライドショー制御関数
function changeGlobalSlide(direction) {
  const container = document.querySelector('[data-slideshow-id="global"]');
  if (!container) return;

  const question = questions[currentQuestion];
  if (!question.globalAssets || question.globalAssets.length === 0) return;

  if (!slideshowStates['global']) {
    slideshowStates['global'] = 0;
  }

  // 新しいスライド位置を計算
  slideshowStates['global'] += direction;

  // 範囲チェック
  if (slideshowStates['global'] < 0) {
    slideshowStates['global'] = 0;
  } else if (slideshowStates['global'] >= question.globalAssets.length) {
    slideshowStates['global'] = question.globalAssets.length - 1;
  }

  // スライドを更新
  const slideWrapper = container.querySelector('.slideshow-wrapper');
  const currentSlide = slideshowStates['global'];
  const asset = question.globalAssets[currentSlide];

  slideWrapper.innerHTML = `
    <div class="slide active">
      <img src="${asset.src}" alt="${asset.label}" class="slideshow-image" />
    </div>
  `;

  // カウンターを更新
  const counter = container.querySelector('.slide-counter');
  counter.textContent = `${currentSlide + 1} / ${question.globalAssets.length}`;

  // ボタンの状態を更新
  const prevBtn = container.querySelector('.prev');
  const nextBtn = container.querySelector('.next');

  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === question.globalAssets.length - 1;
}

function openSlideshowPopup(optionIndex, title) {
  const question = questions[currentQuestion];
  const asset = question.assets[optionIndex];

  // ポップアップを作成
  const popup = document.createElement('div');
  popup.className = 'slideshow-popup';
  popup.id = 'slideshow-popup';

  const currentSlide = slideshowStates[`option-${optionIndex}`] || 0;

  popup.innerHTML = `
    <div class="popup-content">
      <button class="popup-close" onclick="closeSlideshowPopup()">&times;</button>
      <div class="popup-header">
        <h4 class="popup-title">${title}</h4>
      </div>
      <div class="popup-slideshow-container">
        <div class="slideshow-wrapper">
          <div class="slide active">
            <img src="${asset.slides[currentSlide]}" alt="${title} - スライド ${
    currentSlide + 1
  }" class="popup-slideshow-image" />
          </div>
        </div>
        <div class="slideshow-controls">
          <button class="slideshow-btn prev" onclick="changePopupSlide(-1)">‹</button>
          <span class="slide-counter">${currentSlide + 1} / ${
    asset.slides.length
  }</span>
          <button class="slideshow-btn next" onclick="changePopupSlide(1)">›</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  popup.classList.add('active');
  document.body.style.overflow = 'hidden';

  // ポップアップ用の状態を初期化
  slideshowStates['popup'] = currentSlide;
  slideshowStates['popup-asset'] = asset;

  // 背景クリック・タッチで閉じる
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      closeSlideshowPopup();
    }
  });

  // タッチデバイス対応
  popup.addEventListener('touchend', (e) => {
    if (e.target === popup) {
      closeSlideshowPopup();
    }
  });

  // ESCキーで閉じる
  document.addEventListener('keydown', handlePopupKeydown);
}

function changePopupSlide(direction) {
  const popup = document.getElementById('slideshow-popup');
  if (!popup) return;

  const asset = slideshowStates['popup-asset'];
  if (!asset) return;

  // 新しいスライド位置を計算
  slideshowStates['popup'] += direction;

  // 範囲チェック
  if (slideshowStates['popup'] < 0) {
    slideshowStates['popup'] = 0;
  } else if (slideshowStates['popup'] >= asset.slides.length) {
    slideshowStates['popup'] = asset.slides.length - 1;
  }

  // スライドを更新
  const slideWrapper = popup.querySelector('.slideshow-wrapper');
  const currentSlide = slideshowStates['popup'];

  slideWrapper.innerHTML = `
    <div class="slide active">
      <img src="${asset.slides[currentSlide]}" alt="スライド ${
    currentSlide + 1
  }" class="popup-slideshow-image" />
    </div>
  `;

  // カウンターを更新
  const counter = popup.querySelector('.slide-counter');
  counter.textContent = `${currentSlide + 1} / ${asset.slides.length}`;

  // ボタンの状態を更新
  const prevBtn = popup.querySelector('.prev');
  const nextBtn = popup.querySelector('.next');

  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === asset.slides.length - 1;
}

function closeSlideshowPopup() {
  const popup = document.getElementById('slideshow-popup');
  if (popup) {
    popup.remove();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handlePopupKeydown);
    delete slideshowStates['popup'];
    delete slideshowStates['popup-asset'];
  }
}

function handlePopupKeydown(e) {
  if (e.key === 'Escape') {
    closeSlideshowPopup();
  } else if (e.key === 'ArrowLeft') {
    changePopupSlide(-1);
  } else if (e.key === 'ArrowRight') {
    changePopupSlide(1);
  }
}

function openGlobalSlideshowPopup(title) {
  const question = questions[currentQuestion];
  if (!question.globalAssets || question.globalAssets.length === 0) return;

  // ポップアップを作成
  const popup = document.createElement('div');
  popup.className = 'slideshow-popup';
  popup.id = 'global-slideshow-popup';

  const currentSlide = slideshowStates['global'] || 0;
  const asset = question.globalAssets[currentSlide];

  popup.innerHTML = `
    <div class="popup-content">
      <button class="popup-close" onclick="closeGlobalSlideshowPopup()">&times;</button>
      <div class="popup-header">
        <h4 class="popup-title">${title}</h4>
      </div>
      <div class="popup-slideshow-container">
        <div class="slideshow-wrapper">
          <div class="slide active">
            <img src="${asset.src}" alt="${
    asset.label
  }" class="popup-slideshow-image" />
          </div>
        </div>
        <div class="slideshow-controls">
          <button class="slideshow-btn prev" onclick="changeGlobalPopupSlide(-1)">‹</button>
          <span class="slide-counter">${currentSlide + 1} / ${
    question.globalAssets.length
  }</span>
          <button class="slideshow-btn next" onclick="changeGlobalPopupSlide(1)">›</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  popup.classList.add('active');
  document.body.style.overflow = 'hidden';

  // ポップアップ用の状態を初期化
  slideshowStates['global-popup'] = currentSlide;
  slideshowStates['global-popup-assets'] = question.globalAssets;

  // 背景クリック・タッチで閉じる
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      closeGlobalSlideshowPopup();
    }
  });

  // タッチデバイス対応
  popup.addEventListener('touchend', (e) => {
    if (e.target === popup) {
      closeGlobalSlideshowPopup();
    }
  });

  // ESCキーで閉じる
  document.addEventListener('keydown', handleGlobalPopupKeydown);
}

function changeGlobalPopupSlide(direction) {
  const popup = document.getElementById('global-slideshow-popup');
  if (!popup) return;

  const assets = slideshowStates['global-popup-assets'];
  if (!assets) return;

  // 新しいスライド位置を計算
  slideshowStates['global-popup'] += direction;

  // 範囲チェック
  if (slideshowStates['global-popup'] < 0) {
    slideshowStates['global-popup'] = 0;
  } else if (slideshowStates['global-popup'] >= assets.length) {
    slideshowStates['global-popup'] = assets.length - 1;
  }

  // スライドを更新
  const slideWrapper = popup.querySelector('.slideshow-wrapper');
  const currentSlide = slideshowStates['global-popup'];
  const asset = assets[currentSlide];

  slideWrapper.innerHTML = `
    <div class="slide active">
      <img src="${asset.src}" alt="${asset.label}" class="popup-slideshow-image" />
    </div>
  `;

  // カウンターを更新
  const counter = popup.querySelector('.slide-counter');
  counter.textContent = `${currentSlide + 1} / ${assets.length}`;

  // ボタンの状態を更新
  const prevBtn = popup.querySelector('.prev');
  const nextBtn = popup.querySelector('.next');

  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === assets.length - 1;
}

function closeGlobalSlideshowPopup() {
  const popup = document.getElementById('global-slideshow-popup');
  if (popup) {
    popup.remove();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleGlobalPopupKeydown);
    delete slideshowStates['global-popup'];
    delete slideshowStates['global-popup-assets'];
  }
}

function handleGlobalPopupKeydown(e) {
  if (e.key === 'Escape') {
    closeGlobalSlideshowPopup();
  } else if (e.key === 'ArrowLeft') {
    changeGlobalPopupSlide(-1);
  } else if (e.key === 'ArrowRight') {
    changeGlobalPopupSlide(1);
  }
}

// グローバル関数として定義（onclick属性から呼び出すため）
window.changeSlide = changeSlide;
window.openSlideshowPopup = openSlideshowPopup;
window.closeSlideshowPopup = closeSlideshowPopup;
window.changePopupSlide = changePopupSlide;
window.changeGlobalSlide = changeGlobalSlide;
window.openGlobalSlideshowPopup = openGlobalSlideshowPopup;
window.closeGlobalSlideshowPopup = closeGlobalSlideshowPopup;
window.changeGlobalPopupSlide = changeGlobalPopupSlide;
