/* ============================================================
   肌研究所 - Skin Laboratory
   script.js
   ------------------------------------------------------------
   ・トップ画面 → 診断画面 → 結果画面の切り替え
   ・Q1（主な悩み）で結果テンプレートを分岐
   ・Q1・Q7 は複数選択 / Q2〜Q6 は単一選択
   ・回答は state.answers に蓄積
   ============================================================ */


/* ============================================================
   1. データ定義
   ============================================================ */

/* Q1：主な悩み（ここで分岐する・複数選択可） */
const Q1 = {
  id: "q1_concern",
  text: "今、気になることは？",
  hint: "あてはまるものをすべて選んでください（複数選択可）",
  type: "multi",
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

/* 複数選択の質問ID（type 判定のバックアップ） */
const MULTI_QUESTION_IDS = ["q1_concern", "q7_recentcare"];

function isMultiQuestion(q) {
  return q.type === "multi" || MULTI_QUESTION_IDS.includes(q.id);
}
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

/* Q2：複数悩み選択時の共通質問 */
const Q2_GENERIC = {
  text: "気になる症状はいつ感じる？",
  options: [
    { value: "morning", label: "朝起きたとき" },
    { value: "wash",    label: "洗顔後" },
    { value: "even",    label: "夕方〜夜" },
    { value: "always",  label: "一日中" }
  ]
};

/* 悩みラベル（結果表示用） */
const CONCERN_LABELS = {
  redness:  "赤み・ヒリつき",
  pores:    "毛穴",
  dryness:  "乾燥",
  oily:     "テカリ・ベタつき",
  acne:     "ニキビ・肌荒れ",
  tone:     "肌トーン・透明感",
  firmness: "ハリ・ツヤ不足"
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
      {
        name: "セラミド",
        role: "角質層の“壁”を補修し、水分の蒸発を防ぐ",
        detail: "本来、肌の角質層に存在する成分で、うるおいを外に逃がさない“壁”の役割を担います。洗いすぎや刺激で失われたバリアを整え、乾燥による赤みやつっぱりを和らげやすくします。",
        target: "乾燥・赤み・バリア機能がゆらいでいる方に。化粧水〜クリームまで、毎日のケアに取り入れるのがおすすめです。"
      },
      {
        name: "パンテノール",
        role: "肌の修復をサポートし、ヒリつきを和らげる",
        detail: "ビタミンB5由来の成分で、肌内部のうるおい保持を助けながら、ダメージを受けた部分の修復をサポートします。洗顔後のつっぱりや、スキンケア後のヒリヒリ感を和らげる鎮静効果が期待できます。",
        target: "ヒリヒリ・敏感状態の方に。化粧水や美容液、クリームなど幅広いアイテムに配合されています。"
      },
      {
        name: "シカ（CICA）",
        role: "炎症を抑え、ゆらぎ肌を落ち着かせる",
        detail: "ツボクサ（Centella Asiatica）由来の鎮静成分。肌荒れや赤みが出やすいときに、肌を落ち着かせる“鎮火剤”のような役割を果たします。韓国スキンケアでも定番の、敏感肌向け成分です。",
        target: "赤み・ゆらぎ・肌荒れが気になる方に。パックや美容液で集中的に使うのも効果的です。"
      },
      {
        name: "ナイアシンアミド（低濃度）",
        role: "バリア機能を整え、キメをサポート",
        detail: "ビタミンB3由来の成分で、角質層のバリア機能を整えながら、キメや色ムラの改善もサポートします。高濃度は刺激になりやすいため、ゆらぎ肌の方は2〜5%程度の低濃度から始めるのが安心です。",
        target: "赤み＋キメ乱れが気になる方に。まずは夜のケアから、少量ずつ取り入れてみてください。"
      }
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
      {
        name: "ナイアシンアミド",
        role: "皮脂バランスとキメを整え、毛穴の目立ちを軽減",
        detail: "ビタミンB3由来の万能成分。過剰な皮脂分泌を抑えつつ、角質層のバリア機能も整えるため、テカリと乾燥が混在する“混合肌タイプの毛穴”にも向いています。キメが整うと、毛穴が開いて見える印象も和らぎます。",
        target: "毛穴・テカリ・キメ乱れが気になる方に。化粧水や美容液で、夜のケアから始めるのがおすすめです。"
      },
      {
        name: "BHA（サリチル酸）",
        role: "毛穴の奥の詰まりを、やさしく溶かして除去",
        detail: "油溶性の角質ケア成分で、毛穴の奥にたまった皮脂や古い角質を溶かして流します。物理的なスクラブと違い、摩擦なくケアできるのが特徴。ただし使いすぎは乾燥の原因になるため、週1〜2回のペースが目安です。",
        target: "黒ずみ毛穴・詰まり毛穴が気になる方に。洗顔料や美容液、部分用パックなどで取り入れられます。"
      },
      {
        name: "アゼライン酸",
        role: "皮脂・赤み・色ムラを同時に整える",
        detail: "天然由来の成分で、皮脂分泌を抑えながら炎症も和らげる“マルチケア成分”です。毛穴の開きと同時に、頬の赤みや色ムラも気になる方に特におすすめ。刺激が比較的少なく、長く使いやすいのも魅力です。",
        target: "毛穴＋赤み・色ムラが重なっている方に。美容液やクリームで毎晩使うのが効果的です。"
      },
      {
        name: "セラミド",
        role: "水分を保持し、乾燥による毛穴の開きを防ぐ",
        detail: "乾燥すると角質層がふくらまず、毛穴が縦長に開いて見えやすくなります。セラミドで水分を角質層に留めることで、キメが整い、毛穴が目立ちにくい状態を保てます。“乾燥毛穴”の根本ケア成分です。",
        target: "毛穴が目立つ＋乾燥も感じる方に。化粧水〜クリームまで、保湿ライン全体で使うのがおすすめです。"
      }
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
      {
        name: "セラミド",
        role: "角質層の“壁”を補い、水分の蒸発を防ぐ",
        detail: "乾燥肌の基本中の基本。角質層の細胞間に存在し、うるおいを外に逃がさない“壁”の役割を果たします。セラミドが不足すると、化粧水を塗ってもすぐ乾燥してしまう“すぐ乾く肌”になりやすくなります。",
        target: "つっぱり・粉ふき・ごわつきが気になる方に。化粧水・美容液・クリームすべてに配合されたライン使いが効果的です。"
      },
      {
        name: "ヒアルロン酸",
        role: "水分を抱え込み、うるおいの“クッション”になる",
        detail: "1gで約6リットルの水分を保持できる保水成分。角質層に水分を蓄え、肌表面をふっくらと整えます。分子サイズによって浸透の深さが異なるため、複数タイプを配合したアイテムがより効果的です。",
        target: "うるおい不足・内側からの乾燥が気になる方に。化粧水や美容液で、重ねづけがおすすめです。"
      },
      {
        name: "スクワラン",
        role: "やさしい油分で、水分の蒸発を“フタ”する",
        detail: "オリーブなどから抽出される植物性の油分で、人の皮脂に近い成分。ベタつきが少なく、敏感肌にも使いやすいのが特徴。化粧水で補った水分を、油分の膜で閉じ込めて蒸発を防ぎます。",
        target: "夕方の乾燥・粉ふき・つっぱりが気になる方に。美容液やクリームの最終工程で使うのが効果的です。"
      },
      {
        name: "アミノ酸",
        role: "天然保湿因子（NMF）を補い、肌本来の保水力を高める",
        detail: "肌の角質層にはもともと20種類以上のアミノ酸が存在し、天然保湿因子（NMF）の一部を構成しています。外部から補うことで、肌自身が水分を保持する力を高め、洗顔後のつっぱりやごわつきを和らげます。",
        target: "ごわつき・カサつき・洗顔後の不快感が気になる方に。化粧水や洗顔料に配合されたものを選ぶのがおすすめです。"
      }
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
      {
        name: "ナイアシンアミド",
        role: "皮脂と水分のバランスを整え、テカリの根本原因にアプローチ",
        detail: "テカリの原因は“油分過多”だけでなく、水分不足による代償性の皮脂分泌であることが多いです。ナイアシンアミドは皮脂分泌を抑えつつ、角質層のバリア機能も整えるため、テカリと乾燥が同時に起きる“インナードライ”に効果的です。",
        target: "Tゾーンのテカリ＋頬の乾燥が気になる方に。化粧水や美容液で、毎日継続して使うのがおすすめです。"
      },
      {
        name: "亜鉛PCA",
        role: "皮脂分泌を抑え、Tゾーンのベタつきをコントロール",
        detail: "亜鉛と天然保湿因子（PCA）を組み合わせた成分。皮脂の分泌量を抑えながら、必要な水分は保持する“さっぱり保湿”が可能です。テカリが気になる部分だけ、部分使いするのも効果的です。",
        target: "Tゾーン・鼻・おでこのテカリが気になる方に。化粧水やプライマー、部分用美容液で使えます。"
      },
      {
        name: "ヒアルロン酸",
        role: "軽やかに水分を補給し、隠れ乾燥を解消",
        detail: "テカリ肌でも内側は乾燥している“インナードライ”の状態では、水分補給が皮脂分泌を正常化する鍵になります。軽いテクスチャーのヒアルロン酸美容液で、べたつかずに水分を届けましょう。",
        target: "テカリなのに肌内部が乾燥している方に。さっぱりタイプの化粧水・美容液がおすすめです。"
      },
      {
        name: "ティーツリー",
        role: "皮脂・雑菌を整え、肌荒れしにくい環境を作る",
        detail: "オーストラリア原産の植物から抽出される成分。皮脂の酸化や雑菌の増殖を抑え、テカリと同時に起きやすい肌荒れ・ニキビの予防にも役立ちます。ただし、敏感肌の方はパッチテストをしてから使いましょう。",
        target: "テカリ＋肌荒れ・ニキビが気になる方に。化粧水や部分用美容液、トナーパッドなどで使えます。"
      }
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
      {
        name: "サリチル酸（BHA）",
        role: "毛穴の詰まりを溶かし、ニキビの原因をやさしく除去",
        detail: "油溶性の角質ケア成分で、毛穴の奥にたまった皮脂や古い角質を溶かして流します。白ニキビ（面皰）の原因となる詰まりを解消し、新しいニキビの発生を防ぎます。濃度0.5〜2%程度から始めるのが安心です。",
        target: "白ニキビ・黒ニキビ・ザラつきが気になる方に。洗顔料や部分用美容液、パックで週2〜3回使うのが目安です。"
      },
      {
        name: "ナイアシンアミド",
        role: "炎症を抑え、ニキビ跡の色ムラを整える",
        detail: "赤ニキビの炎症を和らげながら、ニキビ跡の色素沈着（茶色い跡）も改善をサポートします。刺激が少なく、敏感肌の方でも使いやすいのが特徴。アクネケアと美白ケアを同時に叶えたい方に最適です。",
        target: "赤ニキビ・ニキビ跡・色ムラが気になる方に。美容液やクリームで毎日継続して使うのがおすすめです。"
      },
      {
        name: "シカ（CICA）",
        role: "炎症を鎮め、荒れている肌を落ち着かせる",
        detail: "ツボクサ由来の鎮静成分。ニキビの炎症期（赤く腫れている状態）に使うことで、肌を落ち着かせ、悪化を防ぎます。韓国のアクネケア製品にも多く配合されており、ニキビケアの定番成分です。",
        target: "炎症性ニキビ・肌荒れ中の方に。パックや美容液で、ニキビ部分を中心に使うのが効果的です。"
      },
      {
        name: "セラミド",
        role: "バリア機能を立て直し、ニキビの繰り返しを防ぐ",
        detail: "ニキビケアで洗いすぎや刺激の強い成分を使い続けると、バリア機能が低下し、ニキビが繰り返しやすくなります。セラミドで肌の“壁”を整えることで、外部刺激から肌を守り、ニキビの再発を防ぎます。",
        target: "ニキビが繰り返す・ケア後に乾燥する方に。化粧水〜クリームまで、保湿ケアとして毎日使いましょう。"
      }
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
      {
        name: "ビタミンC誘導体",
        role: "メラニンの生成を抑え、透明感のある肌トーンへ導く",
        detail: "ビタミンCを安定化させた成分で、メラニンの生成を抑え、既存のシミ・くすみを少しずつ薄くしていきます。純粋なビタミンC（L-アスコルビン酸）より刺激が少なく、毎日使いやすいのが特徴。朝のケアに取り入れると、紫外線対策との相性も◎です。",
        target: "くすみ・全体のトーン低下が気になる方に。朝の化粧水・美容液に配合されたものを選びましょう。"
      },
      {
        name: "ナイアシンアミド",
        role: "キメと色ムラを整え、均一な肌トーンを作る",
        detail: "メラニンの転送を抑え、シミ・くすみの改善をサポートします。同時に皮脂バランスやキメも整えるため、くすみと毛穴・テカリが同時に気になる方にも向いています。2〜5%濃度のものが効果と使いやすさのバランスが良いです。",
        target: "くすみ＋毛穴・キメ乱れが気になる方に。化粧水・美容液で朝晩使えるアイテムがおすすめです。"
      },
      {
        name: "トラネキサム酸",
        role: "メラニンの生成を抑え、色ムラと赤みを和らげる",
        detail: "もともと医療現場でも使われている成分で、メラニンの生成を抑え、シミ・色ムラの改善をサポートします。特に、頬の赤みや肝斑（かんぱん）のような色ムラに効果が期待できます。刺激が少なく、敏感肌の方にも使いやすいです。",
        target: "部分的な色ムラ・頬の赤み・くすみが気になる方に。美容液やクリームで、毎日継続して使いましょう。"
      },
      {
        name: "アルブチン",
        role: "メラニンの生成を穏やかに抑える、やさしい美白成分",
        detail: "熊の果実などに含まれる天然由来の美白成分。ハイドロキノンより刺激が少なく、長期間使いやすいのが特徴。シミ・そばかす・くすみの予防と改善を、ゆっくり丁寧にサポートします。",
        target: "シミ・そばかす・部分的なくすみが気になる方に。美容液やクリームで、夜のケアに取り入れるのがおすすめです。"
      }
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
      {
        name: "レチノール（低濃度）",
        role: "コラーゲン生成を促し、ハリ・キメをサポート",
        detail: "ビタミンA由来の成分で、コラーゲンやエラスチンの生成を促進し、肌のハリ・弾力を改善します。ただし刺激が強いため、0.1〜0.3%程度の低濃度から、週2〜3回の夜使いで始めるのが安全。使う日の翌朝は必ず日焼け止めを。",
        target: "ハリ不足・小じわ・キメの乱れが気になる方に。夜の美容液やクリームで、少しずつ取り入れましょう。"
      },
      {
        name: "ペプチド",
        role: "コラーゲンサポートし、ふっくら感を与える",
        detail: "アミノ酸が連なった成分で、肌内部のコラーゲン生成をサポートし、ハリ・弾力の改善を促します。レチノールより刺激が少なく、毎日使えるのが特徴。目元・口元など、ハリ不足が気になる部分に重点的に使うのも効果的です。",
        target: "たるみ・ふっくら感不足・目元のハリが気になる方に。美容液やアイクリームで毎日使えます。"
      },
      {
        name: "ビタミンC誘導体",
        role: "コラーゲン生成を促し、ツヤと透明感をプラス",
        detail: "コラーゲン生成をサポートしながら、くすみも改善するため、ハリ不足＋トーン低下が同時に気になる方に最適。レチノールとの“ハリケアコンビ”として、朝ビタミンC・夜レチノールの使い分けが効果的です。",
        target: "ハリ不足＋くすみ・透明感低下が気になる方に。朝の化粧水・美容液に取り入れましょう。"
      },
      {
        name: "セラミド／スクワラン",
        role: "うるおいで角質層をふっくらとし、ハリの土台を整える",
        detail: "ハリケアの基本は“保湿”。乾燥した角質層はコラーゲンやエラスチンの働きを妨げます。セラミドで水分を保持し、スクワランで油分のフタをすることで、レチノールやペプチドの効果を最大化する土台を作ります。",
        target: "乾燥小じわ・ハリ不足・夕方のたるみが気になる方に。化粧水〜クリームまで、保湿を徹底しましょう。"
      }
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
function getSelectedConcerns() {
  const ans = state.answers.q1_concern;
  if (Array.isArray(ans) && ans.length > 0) return ans;
  return ["redness"]; // 未選択時は仮置き（質問数・Q2文言の判定用）
}

function buildQuestionList() {
  const concerns = getSelectedConcerns();
  const q2def = concerns.length === 1
    ? Q2_BY_CONCERN[concerns[0]]
    : Q2_GENERIC;

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
    if (!isMultiQuestion(q) && current === opt.value) {
      btn.classList.add("selected");
    }
    if (isMultiQuestion(q) && Array.isArray(current) && current.includes(opt.value)) {
      btn.classList.add("selected");
    }

    area.appendChild(btn);
  });

  // 戻るボタンの状態
  document.getElementById("backBtn").disabled = state.step === 0;

  // 次へボタンの状態
  updateNextButton();
}

function syncMultiSelectionUI(q) {
  const selected = Array.isArray(state.answers[q.id]) ? state.answers[q.id] : [];
  document.querySelectorAll("#optionsArea .option-btn").forEach((el) => {
    el.classList.toggle("selected", selected.includes(el.dataset.value));
  });
}

function handleSelect(q, opt, btn) {
  if (!isMultiQuestion(q)) {
    state.answers[q.id] = opt.value;
    document.querySelectorAll("#optionsArea .option-btn").forEach((b) => {
      b.classList.remove("selected");
    });
    btn.classList.add("selected");
  } else {
    const cur = Array.isArray(state.answers[q.id]) ? state.answers[q.id] : [];

    if (opt.value === "none") {
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

    if (q.id === "q1_concern") {
      buildQuestionList();
    }

    // 画面全体を再描画せず選択状態だけ更新（スマホでも安定）
    syncMultiSelectionUI(q);
  }

  updateNextButton();
}

function updateNextButton() {
  const q = state.questions[state.step];
  const ans = state.answers[q.id];
  const ok = isMultiQuestion(q)
    ? Array.isArray(ans) && ans.length > 0
    : !!ans;

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

/* 成分を名前で重複排除 */
function dedupeIngredients(items) {
  const seen = new Set();
  return items.filter((it) => {
    if (seen.has(it.name)) return false;
    seen.add(it.name);
    return true;
  });
}

/* ケア方法を工程ごとに統合（洗顔→化粧水→…の順） */
function mergeCare(careArrays) {
  const order = ["洗顔", "化粧水", "パック", "美容液", "クリーム"];
  const map = new Map();

  careArrays.flat().forEach((item) => {
    if (!map.has(item.title)) map.set(item.title, new Set());
    item.points.forEach((p) => map.get(item.title).add(p));
  });

  return order
    .filter((title) => map.has(title))
    .map((title) => ({
      title,
      points: Array.from(map.get(title)).slice(0, 3)
    }));
}

/* 複数悩みの結果を統合 */
function buildCombinedResult(concerns) {
  const valid = concerns.filter((c) => RESULTS[c]);
  if (valid.length === 0) return RESULTS.dryness;
  if (valid.length === 1) return RESULTS[valid[0]];

  const parts = valid.map((c) => RESULTS[c]);
  const labels = valid.map((c) => CONCERN_LABELS[c]).join("・");

  return {
    lead:
      `「${labels}」など、複数の悩みが重なっている可能性があります。` +
      "今の肌に合うケアを、優先順位を意識して整えていきましょう。",
    analysis: parts.map((r) => r.analysis).join("\n\n"),
    cause: parts.map((r) => r.cause).join("\n\n"),
    ingredients: dedupeIngredients(parts.flatMap((r) => r.ingredients)).slice(0, 6),
    care: mergeCare(parts.map((r) => r.care))
  };
}

function showResult() {
  const concerns = Array.isArray(state.answers.q1_concern)
    ? state.answers.q1_concern
    : [state.answers.q1_concern].filter(Boolean);
  const r = buildCombinedResult(concerns);

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
      <p class="ingredient-role">${it.role}</p>
      <p class="ingredient-detail">${it.detail || ""}</p>
      <p class="ingredient-target">${it.target}</p>
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

function setupOptionsArea() {
  const area = document.getElementById("optionsArea");
  area.addEventListener("click", (e) => {
    const btn = e.target.closest(".option-btn");
    if (!btn) return;

    e.preventDefault();

    const q = state.questions[state.step];
    if (!q) return;

    const opt = q.options.find((o) => o.value === btn.dataset.value);
    if (opt) handleSelect(q, opt, btn);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupGate();
  setupOptionsArea();
  document.getElementById("startBtn").addEventListener("click", startQuiz);
  document.getElementById("nextBtn").addEventListener("click", goNext);
  document.getElementById("backBtn").addEventListener("click", goBack);
  document.getElementById("retryBtn").addEventListener("click", startQuiz);
  document.getElementById("topBtn").addEventListener("click", () => {
    resetAll();
    showScreen("screen-top");
  });
  document.getElementById("printBtn").addEventListener("click", () => {
    window.print();
  });
});
