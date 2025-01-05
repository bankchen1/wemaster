export const subjectData = [
  {
    name: 'Music',
    nameZh: '音乐',
    nameJa: '音楽',
    nameKo: '음악',
    code: 'MUS',
    description: 'Music education and performance',
    children: [
      {
        name: 'Musical Instruments',
        nameZh: '乐器',
        nameJa: '楽器',
        nameKo: '악기',
        code: 'MUS-INS',
        children: [
          {
            name: 'Piano',
            nameZh: '钢琴',
            nameJa: 'ピアノ',
            nameKo: '피아노',
            code: 'MUS-INS-PIA'
          },
          {
            name: 'Guitar',
            nameZh: '吉他',
            nameJa: 'ギター',
            nameKo: '기타',
            code: 'MUS-INS-GUI'
          },
          {
            name: 'Violin',
            nameZh: '小提琴',
            nameJa: 'バイオリン',
            nameKo: '바이올린',
            code: 'MUS-INS-VIO'
          }
        ]
      },
      {
        name: 'Music Theory',
        nameZh: '乐理',
        nameJa: '音楽理論',
        nameKo: '음악 이론',
        code: 'MUS-THE',
        children: [
          {
            name: 'Basic Theory',
            nameZh: '基础乐理',
            nameJa: '基礎理論',
            nameKo: '기초 이론',
            code: 'MUS-THE-BAS'
          },
          {
            name: 'Composition',
            nameZh: '作曲',
            nameJa: '作曲',
            nameKo: '작곡',
            code: 'MUS-THE-COM'
          }
        ]
      }
    ]
  },
  {
    name: 'Language',
    nameZh: '语言',
    nameJa: '言語',
    nameKo: '언어',
    code: 'LANG',
    description: 'Language learning and linguistics',
    children: [
      {
        name: 'English',
        nameZh: '英语',
        nameJa: '英語',
        nameKo: '영어',
        code: 'LANG-ENG',
        children: [
          {
            name: 'Business English',
            nameZh: '商务英语',
            nameJa: 'ビジネス英語',
            nameKo: '비즈니스 영어',
            code: 'LANG-ENG-BUS'
          },
          {
            name: 'Academic English',
            nameZh: '学术英语',
            nameJa: 'アカデミック英語',
            nameKo: '학술 영어',
            code: 'LANG-ENG-ACA'
          }
        ]
      },
      {
        name: 'Chinese',
        nameZh: '中文',
        nameJa: '中国語',
        nameKo: '중국어',
        code: 'LANG-CHI',
        children: [
          {
            name: 'Mandarin',
            nameZh: '普通话',
            nameJa: '標準中国語',
            nameKo: '표준 중국어',
            code: 'LANG-CHI-MAN'
          },
          {
            name: 'Business Chinese',
            nameZh: '商务中文',
            nameJa: 'ビジネス中国語',
            nameKo: '비즈니스 중국어',
            code: 'LANG-CHI-BUS'
          }
        ]
      }
    ]
  },
  {
    name: 'Mathematics',
    nameZh: '数学',
    nameJa: '数学',
    nameKo: '수학',
    code: 'MATH',
    description: 'Mathematics and its applications',
    children: [
      {
        name: 'Pure Mathematics',
        nameZh: '纯数学',
        nameJa: '純粋数学',
        nameKo: '순수 수학',
        code: 'MATH-PURE',
        children: [
          {
            name: 'Calculus',
            nameZh: '微积分',
            nameJa: '微積分',
            nameKo: '미적분',
            code: 'MATH-PURE-CAL'
          },
          {
            name: 'Linear Algebra',
            nameZh: '线性代数',
            nameJa: '線形代数',
            nameKo: '선형대수',
            code: 'MATH-PURE-LIN'
          }
        ]
      }
    ]
  }
  // ... 其他主要科目的数据结构类似
]
