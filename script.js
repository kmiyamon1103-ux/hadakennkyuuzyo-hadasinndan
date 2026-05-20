/* ============================================================
   肌研究所 - Skin Laboratory
   script.js
   ------------------------------------------------------------
   ・トップ画面 → 診断画面 → 結果画面の切り替え
   ・Q1（主な悩み）で結果テンプレートを分岐
   ・Q2〜Q6 は単一選択 / Q7 は複数選択
   ・回答は state.answers に蓄積
   ============================================================ */


/* ============================================================
   1. データ定義
   ============================================================ */

/* Q1：主な悩み（ここで分岐する） */
const Q1 = {
  id: "q1_concern",
  text: "今、一番気になることは？",
  hint: "1つだけ選んでください",
  type: "single",
  options: [
    { value: "redness",  label: "赤み・ヒリつき" },
    { value: "pores",    label: "毛穴" },
    { value: "dryness",  label: "乾燥" },
    { value: "oily",     label: "テカリ・ベタつき" },
    { value: "acne",     label: "ニキビ・肌荒れ" },
    { value: "tone",     label: "肌トーン・透明感" },
    { value: "firmness", label: "ハリ・ツヤ不足" }
  ]
};

/* Q2：悩みによって表現を変える「いつ気になる？」 */
const Q2_BY_CONCERN = {
  redness: {
    text: "赤みはいつ気になる？",
    options: [
      { value: "bare",   label: "すっぴんでも気になる" },
      { value: "wash",   label: "洗顔後に気になる" },
      { value: "even",   label: "夕方に気になる" },
      { value: "care",   label: "スキンケア後に気になる" }
    ]
  },
  pores: {
    text: "毛穴が気になるのはどんなとき？",
    options: [
      { value: "morning", label: "朝の洗顔後" },
      { value: "even",    label: "夕方の皮脂が出てきた頃" },
      { value: "makeup",  label: "メイクをしたとき" },
      { value: "always",  label: "一日中ずっと" }
    ]
  },
  dryness: {
    text: "乾燥はいつ感じる？",
    options: [
      { value: "wash",  label: "洗顔直後" },
      { value: "after", label: "スキンケアをしてもすぐ" },
      { value: "even",  label: "夕方〜夜に" },
      { value: "all",   label: "一日中" }
    ]
  },
  oily: {
    text: "テカリ・ベタつきはいつ気になる？",
    options: [
      { value: "morning", label: "朝起きたとき" },
      { value: "noon",    label: "お昼すぎから" },
      { value: "even",    label: "夕方" },
      { value: "all",     label: "ほぼ一日中" }
    ]
  },
  acne: {
    text: "ニキビ・肌荒れの状態は？",
    options: [
      { value: "tzone",  label: "Tゾーン中心" },
      { value: "uzone",  label: "あご・フェイスライン中心" },
      { value: "cycle",  label: "生理周期で繰り返す" },
      { value: "stress", label: "ストレスや睡眠不足で出る" }
    ]
  },
  tone: {
    text: "くすみ・トーンの低下が気になるのは？",
    options: [
      { value: "morning", label: "朝起きたとき" },
      { value: "even",    label: "夕方〜夜" },
      { value: "always",  label: "ずっと顔色が冴えない" },
      { value: "uneven",  label: "部分的にムラがある" }
    ]
  },
  firmness: {
    text: "ハリ・ツヤ不足を感じるのは？",
    options: [
      { value: "morning", label: "朝、肌に元気がない" },
      { value: "even",    label: "夕方、たるみを感じる" },
      { value: "photo",   label: "写真を撮ったとき" },
      { value: "always",  label: "最近ずっと" }
    ]
  }
};

/* Q3〜Q6：全分岐共通の生活・肌状態ヒアリング */
const COMMON_QUESTIONS = [
  {
    id: "q3_afterwash",
    text: "洗顔後の肌は？",
    hint: "ふだんの感覚に近いものを",
    type: "single",
    options: [
      { value: "tight",  label: "つっぱる" },
      { value: "sting",  label: "ヒリヒリする" },
      { value: "oily",   label: "ベタつく" },
      { value: "normal", label: "ふつう" }
    ]
  },
  {
    id: "q4_daychange",
    text: "朝と夕方で肌は変わる？",
    type: "single",
    options: [
      { value: "dry",    label: "乾燥する" },
      { value: "shine",  label: "テカる" },
      { value: "red",    label: "赤くなる" },
      { value: "stable", label: "あまり変わらない" }
    ]
  },
  {
    id: "q5_aftercare",
    text: "スキンケア後の肌は？",
    type: "single",
    options: [
      { value: "sting",  label: "しみることがある" },
      { value: "oily",   label: "ベタつきやすい" },
      { value: "dry",    label: "すぐ乾燥する" },
      { value: "stable", label: "安定している" }
    ]
  },
  {
    id: "q6_pack",
    text: "パックはどれくらい使う？",
    type: "single",
    options: [
      { value: "daily",  label: "毎日" },
      { value: "weekly", label: "週2〜3回" },
      { value: "rare",   label: "たまに使う" },
      { value: "none",   label: "使わない" }
    ]
  }
];

/* Q7：複数選択（最近のケア傾向） */
const Q7 = {
  id: "q7_recentcare",
  text: "最近よくしているケアは？",
  hint: "あてはまるものをすべて選んでください（複数選択可）",
  type: "multi",
  options: [
    { value: "pore",      label: "毛穴・角質ケア" },
    { value: "whitening", label: "美白・透明感ケア" },
    { value: "moisture",  label: "保湿ケア" },
    { value: "acne",      label: "ニキビケア" },
    { value: "sensitive", label: "敏感肌ケア" },
    { value: "aging",     label: "エイジングケア" },
    { value: "none",      label: "特に意識していない" }
  ]
};


/* ============================================================
   2. 結果テンプレート（Q1 の悩みごと）
   ============================================================ */
const RESULTS = {

  redness: {
    lead: "刺激や乾燥に敏感になり、バリア機能がゆらぎやすい状態のサインが出ています。",
    analysis:
      "現在の肌は、乾燥や外的刺激によって、肌を守る力（バリア機能）が低下している可能性があります。" +
      "赤みやヒリつきは、肌内部の水分が逃げやすく、神経が刺激を受けやすくなっているサインです。",
    cause:
      "毛穴・角質ケアや美白などの“攻めるケア”を続けながら、水分保持力が低下している状態かもしれません。" +
      "洗顔時の摩擦・拭き取り・高頻度のパックも、赤みを長引かせる要因になりやすいです。",
    ingredients: [
      { name: "セラミド",       role: "肌の壁のような存在",       target: "乾燥・赤みにおすすめ" },
      { name: "パンテノール",   role: "肌の修復サポーター",       target: "ヒリヒリ・敏感肌向け" },
      { name: "シカ（CICA）",   role: "肌を落ち着かせる鎮静成分", target: "ゆらぎ肌向け" },
      { name: "ナイアシンアミド（低濃度）", role: "バリア機能のサポート", target: "赤み・キメ乱れに" }
    ],
    care: [
      { title: "洗顔",   points: ["洗いすぎ注意（朝はぬるま湯だけでも◯）", "摩擦を減らす（泡で包むように）", "熱いお湯はNG"] },
      { title: "化粧水", points: ["アルコール・香料フリーを選ぶ", "コットンより手のひらでハンドプレス", "鎮静成分（CICA・パンテノール）配合が◯"] },
      { title: "パック", points: ["毎日より週2〜3回に", "鎮静系シートマスクが◯", "長時間放置しない（10〜15分）"] },
      { title: "美容液", points: ["攻めるケアより保湿・鎮静優先", "高濃度ビタミンC・レチノールは一旦お休み", "セラミド・パンテノール配合がおすすめ"] },
      { title: "クリーム", points: ["セラミド配合でバリア機能を立て直す", "夜は少し厚めに塗ってフタをする", "ベタつきが気になる日はジェルクリームでも◯"] }
    ]
  },

  pores: {
    lead: "皮脂と乾燥のバランスが崩れ、毛穴が目立ちやすい状態です。",
    analysis:
      "現在の肌は、水分不足と皮脂のアンバランスによって、毛穴が開いて見えやすくなっている可能性があります。" +
      "“皮脂を抑える”ことばかりに目を向けると、かえって乾燥で皮脂が増える悪循環になりがちです。",
    cause:
      "角質ケアの頻度が高すぎたり、保湿が足りていないことが原因かもしれません。" +
      "乾燥でキメが乱れると、毛穴は実際よりも大きく見えてしまいます。",
    ingredients: [
      { name: "ナイアシンアミド", role: "皮脂とキメを整える",       target: "毛穴・テカリ全般に" },
      { name: "BHA（サリチル酸）", role: "やさしい角質ケア",         target: "詰まり毛穴向け（週1〜2回）" },
      { name: "アゼライン酸",     role: "皮脂と赤みのバランス調整", target: "毛穴＋ゆらぎ肌に" },
      { name: "セラミド",         role: "水分保持で毛穴を引き締め", target: "乾燥毛穴向け" }
    ],
    care: [
      { title: "洗顔",   points: ["W洗顔は必要なときだけ", "ゴシゴシNG、こすらない", "皮脂を取りすぎないアミノ酸系がおすすめ"] },
      { title: "化粧水", points: ["収れん化粧水よりまずは保湿系を", "ナイアシンアミド配合化粧水が◯", "コットンパックは週1〜2回まで"] },
      { title: "パック", points: ["角質パックは週1回まで", "保湿パックと交互に", "毛穴パック（剥がすタイプ）は避ける"] },
      { title: "美容液", points: ["まずは保湿の土台を整える", "ナイアシンアミドを夜だけ取り入れる", "皮脂を抑え込もうとしない"] },
      { title: "クリーム", points: ["軽めのジェルクリームを薄く", "毛穴に詰まりにくいノンコメドジェニック処方を", "省略せず必ず最後にフタをする"] }
    ]
  },

  dryness: {
    lead: "水分・油分ともに不足し、肌内部までうるおいが届きにくい状態です。",
    analysis:
      "現在の肌は、角層の水分量が下がり、油分のフタも足りていない“インナードライ”の可能性があります。" +
      "化粧水だけでは蒸発しやすく、夕方には乾燥が進みやすい状態です。",
    cause:
      "保湿ケアはしていても、油分や保水成分（セラミドなど）が不足していたり、" +
      "クレンジング・洗顔で必要な皮脂まで落としてしまっている可能性があります。",
    ingredients: [
      { name: "セラミド",       role: "肌の水分を抱える壁", target: "全方位の乾燥に" },
      { name: "ヒアルロン酸",   role: "水分のクッション",   target: "うるおい不足に" },
      { name: "スクワラン",     role: "やさしい油分のフタ", target: "夕方の乾燥に" },
      { name: "アミノ酸",       role: "天然保湿因子（NMF）", target: "ごわつき・つっぱりに" }
    ],
    care: [
      { title: "洗顔",   points: ["朝は洗顔料を使わない日があってもOK", "ぬるま湯（32〜34℃）で", "拭くときはタオルで押さえるだけ"] },
      { title: "化粧水", points: ["とろみタイプを2〜3回重ねづけ", "ハンドプレスで角層までしっかり浸透", "拭き取り化粧水は控えめに"] },
      { title: "パック", points: ["保湿シートマスクは週2〜3回", "オーバーナイトマスクで密閉ケア", "シートが乾く前に外す"] },
      { title: "美容液", points: ["セラミド・ヒアルロン酸の保湿系を", "水分→油分の順で重ねる", "ピーリング系は今は休む"] },
      { title: "クリーム", points: ["油分しっかりタイプを選ぶ", "夜は厚めに塗ってOK", "目元・口元は重ね塗りで乾燥対策"] }
    ]
  },

  oily: {
    lead: "皮脂は多めでも、内側は乾いている“隠れ乾燥”の可能性があります。",
    analysis:
      "現在の肌は、水分不足を補おうとして皮脂が過剰に出ている状態かもしれません。" +
      "テカリ＝油分過多と決めつけず、水分量に注目することが大切です。",
    cause:
      "皮脂を取り去る洗顔・あぶらとり紙の使いすぎが、皮脂分泌をさらに増やしている可能性があります。" +
      "また、夜更かしや糖質・脂質の多い食事も皮脂量に影響します。",
    ingredients: [
      { name: "ナイアシンアミド", role: "皮脂と水分のバランス調整", target: "テカリ・毛穴に" },
      { name: "亜鉛PCA",          role: "皮脂分泌をなめらかに",     target: "Tゾーンのテカリに" },
      { name: "ヒアルロン酸",     role: "軽やかな水分補給",         target: "インナードライに" },
      { name: "ティーツリー",     role: "肌をすっきり整える",       target: "ベタつき＋肌荒れに" }
    ],
    care: [
      { title: "洗顔",   points: ["1日2回まで（朝・夜）", "あぶらとり紙より、ティッシュで軽く押さえる", "スクラブ系は週1まで"] },
      { title: "化粧水", points: ["“さっぱり”より“しっかり保湿”を", "収れん化粧水は使いすぎない", "ナイアシンアミド配合がおすすめ"] },
      { title: "パック", points: ["クレイパックは週1回程度", "保湿パックと交互に行う", "毎日するなら鎮静系を選ぶ"] },
      { title: "美容液", points: ["軽いテクスチャーの保湿液を選ぶ", "皮脂コントロール成分は夜だけ", "重ねづけより一品を丁寧に"] },
      { title: "クリーム", points: ["省略しないで必ず塗る（薄く）", "ジェルクリーム・乳液タイプが◯", "Tゾーンは少なめ・Uゾーンはしっかり"] }
    ]
  },

  acne: {
    lead: "皮脂・角質・刺激のバランスが崩れ、肌荒れを起こしやすい状態です。",
    analysis:
      "現在の肌は、毛穴詰まりや炎症が起きやすく、バリア機能も同時に弱っているサインがあります。" +
      "“ニキビを早く治したい”ケアが、逆に刺激になっているケースも少なくありません。",
    cause:
      "皮脂分泌の乱れ、ホルモンバランス、洗いすぎ、合わないスキンケアなど複数の要因が重なっている可能性があります。" +
      "特に乾燥状態でのアクネケアは、悪化させやすいので注意が必要です。",
    ingredients: [
      { name: "サリチル酸（BHA）", role: "毛穴の詰まりをやさしくオフ", target: "白ニキビ・ザラつきに" },
      { name: "ナイアシンアミド",   role: "炎症と皮脂をマイルドに整える", target: "赤ニキビ・跡に" },
      { name: "シカ（CICA）",       role: "肌の鎮静サポート",             target: "炎症・敏感状態に" },
      { name: "セラミド",           role: "バリア機能の立て直し",         target: "繰り返すニキビに" }
    ],
    care: [
      { title: "洗顔",   points: ["殺菌系の洗顔は使いすぎない", "泡で30秒以内にすすぐ", "タオルは清潔に毎日交換"] },
      { title: "化粧水", points: ["アルコール・香料フリーを選ぶ", "ノンコメドジェニック表記が◯", "コットンの摩擦より手で押し込む"] },
      { title: "パック", points: ["炎症がある日は休む", "鎮静系シートマスクのみ", "シートを長時間放置しない"] },
      { title: "美容液", points: ["保湿しながらの肌荒れケアが基本", "ピンポイントで部分用ジェルを使う", "新製品は1つずつ試す"] },
      { title: "クリーム", points: ["油分は控えめ、でも保湿は必ず", "ジェル〜乳液タイプで軽く", "ニキビ部分は薄く、その他はしっかり"] }
    ]
  },

  tone: {
    lead: "ターンオーバーや血行の乱れで、肌のトーンが沈みやすい状態です。",
    analysis:
      "現在の肌は、古い角質の蓄積・乾燥・血行不良などにより、透明感が落ちて見えている可能性があります。" +
      "“美白”だけを足すより、土台のうるおいと巡りを整えることが近道です。",
    cause:
      "睡眠不足、紫外線対策不足、保湿不足、強い摩擦などが重なっていると、くすみは長引きやすくなります。" +
      "また、強いピーリングのしすぎも、かえって肌を疲れさせます。",
    ingredients: [
      { name: "ビタミンC誘導体", role: "透明感のサポーター",   target: "全体のトーンアップに" },
      { name: "ナイアシンアミド", role: "キメ・色ムラを整える", target: "くすみ・毛穴に" },
      { name: "トラネキサム酸",   role: "肌の落ち着きを保つ",   target: "頬の赤み・色ムラに" },
      { name: "アルブチン",       role: "やさしい美白サポート", target: "部分的な色ムラに" }
    ],
    care: [
      { title: "洗顔",   points: ["ぬるま湯で血色を奪わない", "摩擦は最小限に", "朝の洗顔は軽めの洗浄力で"] },
      { title: "化粧水", points: ["朝はビタミンC配合化粧水でトーンUP", "夜は保湿系でうるおいチャージ", "重ねづけでキメをふっくら"] },
      { title: "パック", points: ["ビタミンC系マスクは週2回程度", "保湿マスクと交互に", "夜ふかしの翌日は鎮静優先"] },
      { title: "美容液", points: ["朝：ビタミンC＋UV", "夜：保湿＋角質ケア（穏やかなもの）", "美白系は最低1ヶ月続けて評価する"] },
      { title: "クリーム", points: ["油分でうるおいを閉じ込めてツヤ感UP", "夜はリッチタイプでもOK", "朝は軽めにして日焼け止めを必ず重ねる"] }
    ]
  },

  firmness: {
    lead: "うるおい・弾力サポート成分が不足し、ふっくら感が出にくい状態です。",
    analysis:
      "現在の肌は、コラーゲン・水分量の低下や、表情筋の疲れによって、" +
      "ハリ・ツヤが感じにくくなっている可能性があります。",
    cause:
      "紫外線、乾燥、睡眠不足、強い摩擦などが積み重なると、" +
      "ハリの土台となる成分の働きが追いつかなくなることがあります。" +
      "急に攻めるケアを始めるより、毎日の保湿の質を上げることが大切です。",
    ingredients: [
      { name: "レチノール（低濃度）", role: "ハリ・キメのサポート",   target: "夜のスペシャルケアに（週2〜3回から）" },
      { name: "ペプチド",             role: "ハリ感を後押し",         target: "ふっくら感を出したい肌に" },
      { name: "ビタミンC誘導体",       role: "ツヤと巡りをサポート",   target: "くすみ＋ハリ不足に" },
      { name: "セラミド／スクワラン", role: "うるおいで弾力ベースを",  target: "乾燥小じわが気になる肌に" }
    ],
    care: [
      { title: "洗顔",   points: ["朝晩ともに摩擦ゼロを意識", "クレンジングは長時間こすらない", "ぬるま湯で短時間"] },
      { title: "化粧水", points: ["重ねづけで角層をふっくらと", "ペプチド・アミノ酸配合がおすすめ", "ハンドプレスで体温を伝えて浸透"] },
      { title: "パック", points: ["週2回の保湿パック", "ハリ系マスクは週1回プラス", "シートが乾く前に外す"] },
      { title: "美容液", points: ["レチノールは少量・夜だけ・週2回から", "翌朝は必ず日焼け止めを", "ペプチド系は毎日継続が◯"] },
      { title: "クリーム", points: ["夜はリッチタイプで弾力サポート", "目元・口元は専用クリームでケア", "朝は軽めにして日中の乾燥を防ぐ"] }
    ]
  }
};


/* ============================================================
   3. 状態管理
   ============================================================ */
const state = {
  answers: {},      // { q1_concern: "redness", q3_afterwash: "tight", ... q7_recentcare: ["moisture"] }
  step: 0,          // 0 = Q1
  questions: []     // 動的に組み立てる質問配列
};


/* ============================================================
   4. 画面切り替え
   ============================================================ */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => {
    el.classList.remove("screen-active");
  });
  document.getElementById(id).classList.add("screen-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}


/* ============================================================
   5. 質問配列の組み立て（Q1 → Q2分岐 → Q3-Q6共通 → Q7）
   ・Q1 未回答の段階でも全 7 問分の長さを確保しておく
     （ボタン文言「次へ／結果を見る」の判定を正しくするため）
   ・Q1 を選び直したら Q2 が自動で組み替わる
   ============================================================ */
function buildQuestionList() {
  const concern = state.answers.q1_concern || "redness"; // 未選択時は仮置き
  const q2def   = Q2_BY_CONCERN[concern];

  const q2 = {
    id: "q2_when",
    text: q2def.text,
    hint: "1つだけ選んでください",
    type: "single",
    options: q2def.options
  };

  state.questions = [Q1, q2, ...COMMON_QUESTIONS, Q7];
}


/* ============================================================
   6. 質問の描画
   ============================================================ */
function renderQuestion() {
  const q = state.questions[state.step];
  const total = state.questions.length;

  // ヘッダー
  document.getElementById("stepNow").textContent = state.step + 1;
  document.getElementById("stepAll").textContent = total;
  document.getElementById("progressBar").style.width =
    `${((state.step) / (total - 1)) * 100}%`;

  // 質問本文
  document.getElementById("questionText").textContent = q.text;
  document.getElementById("questionHint").textContent = q.hint || "";

  // 選択肢
  const area = document.getElementById("optionsArea");
  area.innerHTML = "";

  const current = state.answers[q.id];

  q.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";
    btn.textContent = opt.label;
    btn.dataset.value = opt.value;

    // 選択済みの再表示
    if (q.type === "single" && current === opt.value) {
      btn.classList.add("selected");
    }
    if (q.type === "multi" && Array.isArray(current) && current.includes(opt.value)) {
      btn.classList.add("selected");
    }

    btn.addEventListener("click", () => handleSelect(q, opt, btn));
    area.appendChild(btn);
  });

  // 戻るボタンの状態
  document.getElementById("backBtn").disabled = state.step === 0;

  // 次へボタンの状態
  updateNextButton();
}

function handleSelect(q, opt, btn) {
  if (q.type === "single") {
    state.answers[q.id] = opt.value;
    document.querySelectorAll("#optionsArea .option-btn").forEach((b) => {
      b.classList.remove("selected");
    });
    btn.classList.add("selected");

    // Q1（悩み）を選んだ瞬間に、分岐後の質問リストを組み立て直す
    // → これで「次へ」ボタンの文言が「結果を見る」と誤表示されない
    if (q.id === "q1_concern") {
      buildQuestionList();
    }
  } else {
    // multi
    const cur = Array.isArray(state.answers[q.id]) ? state.answers[q.id] : [];
    if (opt.value === "none") {
      // 「特に意識していない」はトグルで単独選択にする
      state.answers[q.id] = cur.includes("none") ? [] : ["none"];
    } else {
      let next = cur.filter((v) => v !== "none");
      if (next.includes(opt.value)) {
        next = next.filter((v) => v !== opt.value);
      } else {
        next.push(opt.value);
      }
      state.answers[q.id] = next;
    }
    // 再描画（複数選択の表示更新を簡単にするため）
    renderQuestion();
  }
  updateNextButton();
}

function updateNextButton() {
  const q = state.questions[state.step];
  const ans = state.answers[q.id];
  const ok = q.type === "single"
    ? !!ans
    : Array.isArray(ans) && ans.length > 0;

  const isLast = state.step === state.questions.length - 1;
  const nextBtn = document.getElementById("nextBtn");
  nextBtn.disabled = !ok;
  nextBtn.textContent = isLast ? "結果を見る" : "次へ →";
}


/* ============================================================
   7. 次へ / 戻る
   ============================================================ */
function goNext() {
  const q = state.questions[state.step];
  const ans = state.answers[q.id];
  if (!ans || (Array.isArray(ans) && ans.length === 0)) return;

  if (state.step < state.questions.length - 1) {
    state.step++;
    renderQuestion();
  } else {
    showResult();
  }
}

function goBack() {
  if (state.step === 0) return;
  state.step--;
  renderQuestion();
}


/* ============================================================
   8. 結果表示
   ============================================================ */
function showResult() {
  const concern = state.answers.q1_concern;
  const r = RESULTS[concern] || RESULTS.dryness;

  document.getElementById("resultLead").textContent  = r.lead;
  document.getElementById("analysisText").textContent = r.analysis;
  document.getElementById("causeText").textContent    = r.cause;

  // 成分カード
  const ig = document.getElementById("ingredientCards");
  ig.innerHTML = "";
  r.ingredients.forEach((it, idx) => {
    const card = document.createElement("div");
    card.className = "ingredient-card";
    card.style.animation = `fadeUp 0.6s ${0.05 * idx}s both`;
    card.innerHTML = `
      <p class="ingredient-name">${it.name}</p>
      <p class="ingredient-role">→ ${it.role}</p>
      <p class="ingredient-target">→ ${it.target}</p>
    `;
    ig.appendChild(card);
  });

  // ケア方法リスト
  const cl = document.getElementById("careList");
  cl.innerHTML = "";
  r.care.forEach((c, idx) => {
    const item = document.createElement("div");
    item.className = "care-item";
    item.style.animation = `fadeUp 0.6s ${0.05 * idx}s both`;
    const lis = c.points.map((p) => `<li>${p}</li>`).join("");
    item.innerHTML = `<h4>■ ${c.title}</h4><ul>${lis}</ul>`;
    cl.appendChild(item);
  });

  showScreen("screen-result");
}


/* ============================================================
   9. 初期化
   ============================================================ */
function resetAll() {
  state.answers = {};
  state.step = 0;
  buildQuestionList(); // 最初から全 7 問分の長さを確保しておく
}

function startQuiz() {
  resetAll();
  renderQuestion();
  showScreen("screen-quiz");
}

/* ============================================================
   10. パスワード認証
   ・正解：0310
   ・成功すると sessionStorage に保存し、同セッション中は省略
   ============================================================ */
const SITE_PASSWORD = "0310";
const GATE_KEY = "skinlab_unlocked";

function setupGate() {
  const form     = document.getElementById("gateForm");
  const input    = document.getElementById("gatePassword");
  const errorEl  = document.getElementById("gateError");
  const gateCard = document.querySelector(".gate-card");

  // すでに同セッションで解錠済みならスキップ
  if (sessionStorage.getItem(GATE_KEY) === "1") {
    showScreen("screen-top");
    return;
  }

  // 開いた瞬間に入力欄へフォーカス
  setTimeout(() => input.focus(), 300);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = input.value.trim();

    if (val === SITE_PASSWORD) {
      sessionStorage.setItem(GATE_KEY, "1");
      errorEl.textContent = "";
      showScreen("screen-top");
    } else {
      errorEl.textContent = "パスワードが違います。";
      gateCard.classList.remove("shake");
      // リフロー強制 → 連続誤入力でもアニメ再生
      void gateCard.offsetWidth;
      gateCard.classList.add("shake");
      input.select();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupGate();
  document.getElementById("startBtn").addEventListener("click", startQuiz);
  document.getElementById("nextBtn").addEventListener("click", goNext);
  document.getElementById("backBtn").addEventListener("click", goBack);
  document.getElementById("retryBtn").addEventListener("click", startQuiz);
  document.getElementById("topBtn").addEventListener("click", () => {
    resetAll();
    showScreen("screen-top");
  });
});
