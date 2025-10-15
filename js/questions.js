export const questions = [
  {
    id: 1,
    type: 'single',
    question: '問1. AIコンサルタントの定義',
    description: 'AIコンサルタントの最も適切な定義はどれか。',
    options: [
      { text: 'A. AIアルゴリズムを開発し、モデルの精度向上を専門とするエンジニア。', score: 0 },
      { text: 'B. 企業の経営課題に対し、AI技術に関する専門知識とビジネス理解を融合し、解決を支援する専門家。', score: 10 },
      { text: 'C. デジタル化を推進し、組織文化やビジネスモデルを根本から変革する専門家。', score: 0 },
      { text: 'D. AIの研究や論文執筆を行い、学術的な知見を社会に提供する専門家。', score: 0 },
    ],
    answerIndex: 1,
    explanation:
      'AIコンサルタントは技術とビジネスの橋渡し役。AI導入を通じて企業課題を解決する専門家である。',
  },
  {
    id: 2,
    type: 'single',
    question: '問2. DXコンサルタントとの違い',
    description: 'AIコンサルタントとDXコンサルタントの目的の違いとして最も適切なものはどれか。',
    options: [
      { text: 'A. DXコンサルはITインフラ整備が目的で、AIコンサルは業務効率化を目的とする。', score: 0 },
      { text: 'B. AIコンサルはAI技術を駆使して企業課題を解決し、DXコンサルは社会・産業・生活の構造を変革することを目的とする。', score: 10 },
      { text: 'C. 両者は同義であり、扱う技術領域が同じである。', score: 0 },
      { text: 'D. AIコンサルは戦略策定を担当し、DXコンサルは運用のみを担当する。', score: 0 },
    ],
    answerIndex: 1,
    explanation:
      'DXは社会や産業レベルの変革が目的。一方でAIコンサルは企業単位でAI技術を使い経営課題を解決する。',
  },
  {
    id: 3,
    type: 'single',
    question: '問3. ITコンサルタントとの技術領域の違い',
    description: 'AIコンサルタントとITコンサルタントの技術領域の違いとして最も正しいものはどれか。',
    options: [
      { text: 'A. AIコンサルはIT全般を扱い、ITコンサルはAIに特化する。', score: 0 },
      { text: 'B. ITコンサルはネットワークやシステム構築など広範なIT全般を扱い、AIコンサルは機械学習やデータサイエンスなどAI技術を中心に扱う。', score: 10 },
      { text: 'C. 両者に明確な違いはない。', score: 0 },
      { text: 'D. ITコンサルは研究開発を担当し、AIコンサルは運用を担当する。', score: 0 },
    ],
    answerIndex: 1,
    explanation:
      'ITコンサルはIT全般を広く支援し、AIコンサルはその中でもAI領域に特化した派生職種である。',
  },
  {
    id: 4,
    type: 'single',
    question: '問4. AIコンサルタントの主な目的',
    description: 'AIコンサルタントの活動目的として最も包括的な記述はどれか。',
    options: [
      { text: 'A. 最新AIモデルの精度を最大化すること。', score: 0 },
      { text: 'B. 企業の業務を自動化し、人的コストを削減すること。', score: 0 },
      { text: 'C. 経営課題をAI技術で解決し、企業の競争力を高めること。', score: 10 },
      { text: 'D. AI分野の学術的貢献を行うこと。', score: 0 },
    ],
    answerIndex: 2,
    explanation:
      'AIコンサルタントの目的は企業価値の向上。AI活用により競争優位性を築くことがゴールとなる。',
  },
  {
    id: 5,
    type: 'single',
    question: '問5. AIコンサルタントに求められる専門性',
    description: 'AIコンサルタントに必要な専門スキルとして最も適切なものはどれか。',
    options: [
      { text: 'A. ネットワーク設計やハードウェア管理能力。', score: 0 },
      { text: 'B. データサイエンス、機械学習、自然言語処理などAI関連技術の知見。', score: 10 },
      { text: 'C. 経理処理や法務知識。', score: 0 },
      { text: 'D. Webデザインとマーケティング知識。', score: 0 },
    ],
    answerIndex: 1,
    explanation:
      'AI導入を提案するためにはAI技術を理解しビジネスへ落とし込むリテラシーが欠かせない。',
  },
  {
    id: 6,
    type: 'single',
    question: '問6. AIコンサルタントの価値提供',
    description: 'AIコンサルタントがクライアント企業に提供する価値として最も適切なものはどれか。',
    options: [
      { text: 'A. AI研究の成果を論文化し、学会に発表する。', score: 0 },
      { text: 'B. AI技術を用いて、業務効率化や新しいビジネスモデルの構築を支援する。', score: 10 },
      { text: 'C. インフラ構築を通して、ITシステムの安定稼働を保証する。', score: 0 },
      { text: 'D. マーケティング予算の最適化に特化する。', score: 0 },
    ],
    answerIndex: 1,
    explanation:
      'AIコンサルタントは技術を事業価値へ変換し、業務再設計や意思決定の高度化を支援する。',
  },
  {
    id: 7,
    type: 'single',
    question: '問7. AIコンサルタントの典型的な業務範囲',
    description: 'AIコンサルタントが通常担当する業務範囲として最も適切なものはどれか。',
    options: [
      { text: 'A. AIモデルのコーディングのみ。', score: 0 },
      { text: 'B. AI戦略立案、技術選定、導入支援、運用体制構築までを包括的に行う。', score: 10 },
      { text: 'C. 顧客サポート業務。', score: 0 },
      { text: 'D. AIハードウェア開発。', score: 0 },
    ],
    answerIndex: 1,
    explanation:
      '構想から定着までの全フェーズを伴走するのがAIコンサルタントの役割である。',
  },
  {
    id: 8,
    type: 'single',
    question: '問8. AIコンサルティングの一般的な流れ',
    description: 'AIコンサルティングのプロジェクトフェーズの正しい流れはどれか。',
    options: [
      { text: 'A. 実装 → 戦略策定 → データ収集 → 運用。', score: 0 },
      { text: 'B. 戦略策定 → データ収集 → モデル構築 → 導入・運用。', score: 10 },
      { text: 'C. データ収集 → 導入 → モデル構築 → 運用。', score: 0 },
      { text: 'D. 戦略策定 → 運用 → 導入 → 検証。', score: 0 },
    ],
    answerIndex: 1,
    explanation:
      '一般的には戦略策定からPoC、導入・運用へとフェーズを進めるのが定石である。',
  },
  {
    id: 9,
    type: 'single',
    question: '問9. AIコンサルタントの主要顧客層',
    description: 'AIコンサルタントが主に支援対象とする企業・部門として最も適切なものはどれか。',
    options: [
      { text: 'A. 学術機関や研究所。', score: 0 },
      { text: 'B. 経営企画部門・DX推進部門・マーケティング部門など、経営課題を抱える企業部門。', score: 10 },
      { text: 'C. サーバー管理部門。', score: 0 },
      { text: 'D. 財務監査部門。', score: 0 },
    ],
    answerIndex: 1,
    explanation:
      '経営課題を抱える部門がAI活用の相談相手となるため、企画・DX推進・マーケ領域が中心顧客である。',
  },
  {
    id: 10,
    type: 'single',
    question: '問10. AIコンサルタントとAIエンジニアの違い',
    description: 'AIコンサルタントとAIエンジニアの役割の違いとして最も適切なものはどれか。',
    options: [
      { text: 'A. コンサルタントは開発を担当し、エンジニアは戦略を立てる。', score: 0 },
      { text: 'B. コンサルタントは戦略・提案・導入支援を担い、エンジニアはAIモデルの開発・実装を担う。', score: 10 },
      { text: 'C. 両者の業務は同一である。', score: 0 },
      { text: 'D. コンサルタントは営業活動に特化する。', score: 0 },
    ],
    answerIndex: 1,
    explanation:
      'AIコンサルタントは活用方針を描き、エンジニアが実装する。役割は明確に異なる。',
  },
];

export const levels = [
  {
    min: 0,
    max: 39,
    icon: '🌱',
    title: '基礎理解',
    description: '学習を始めたばかり',
    advice:
      'まずはAIコンサルタントの役割全体像を押さえましょう。AI導入プロセスや基本用語の復習からスタートすると理解が深まります。',
  },
  {
    min: 40,
    max: 69,
    icon: '🚀',
    title: '実務準備',
    description: '基礎を押さえた準備段階',
    advice:
      '定義や役割は理解できています。次は業界別のユースケースやファシリテーションスキルを学び、提案力を高めましょう。',
  },
  {
    min: 70,
    max: 89,
    icon: '🧭',
    title: '現場リード',
    description: 'プロジェクトを牽引できるレベル',
    advice:
      '実務で価値を出す一歩手前です。PoC設計やROI試算、組織変革との連携など上流領域を強化しましょう。',
  },
  {
    min: 90,
    max: 100,
    icon: '🏆',
    title: '戦略パートナー',
    description: '経営アジェンダを共創できるレベル',
    advice:
      '高度な知識を備えています。クライアントの自走支援や倫理・ガバナンス整備にも踏み込み、継続的な価値創出を目指しましょう。',
  },
];
