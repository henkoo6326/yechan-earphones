// Reference order is stable. Names are fictional game character labels.
const base=(import.meta.env?.BASE_URL??'/')+'assets/cast/';
const rows=[
 ['yuna','서유나','골목의 버스킹 가수','pink-singer',[-4.6,1],'#e484a7',1.80],
 ['sora','한소라','곱슬머리 카페 스태프','curly-maid',[4.6,-6],'#b78571',1.78],
 ['haeun','윤하은','짧은 머리 카페 스태프','short-maid',[-4.5,-12],'#8e95b5',1.74],
 ['minseo','최민서','단발머리 카페 스태프','bob-maid',[4.5,10],'#c391b6',1.70],
 ['chaerin','이채린','긴 웨이브 카페 스태프','long-maid',[4.5,-19],'#c89569',1.78],
 ['jiwon','박지원','올림머리 카페 스태프','bun-maid',[-4.5,19],'#7baaa1',1.76],
 ['sujin','정수진','긴 검은 머리 카페 스태프','straight-maid',[-4.4,-4],'#9294ad',1.80],
 ['haru','하루','노란 원피스의 산책 친구','yellow-dress',[4.4,17],'#dfb43d',1.84]
];
const greetings=[
 '노래 한 곡 듣고 가실래요? …어머, 이어폰이 많이 엉켰네요!',
 '카페 쉬는 시간이라 잠깐 나왔어요. 무슨 일이에요?',
 '안녕하세요! 손에 든 건 이어폰이에요?',
 '혼자 끙끙대지 말고 말해봐요. 무슨 고민이에요?',
 '오늘은 날씨가 좋아서 골목을 걷고 있었어요. 안녕하세요!',
 '천천히 걸으니까 평소에 못 보던 것들이 보이네요. 무슨 일이세요?',
 '혹시 저한테 하실 말씀이 있어요?',
 '오늘은 노란색이 잘 어울리는 날이죠? 그 줄은 왜 그렇게 엉켰어요?'
];
export const CAST=rows.map(([id,name,role,slug,position,color,height],i)=>({
 id,name,role,position,color,height:height*2.54,rotation:0,model:base+slug+'.glb',portrait:base+`portrait-${i+1}.png`,
 hair:i===1||i===4?'#70402a':'#29242b',outfit:i===0?'#ee76a4':i===7?'#ffd74b':'#29272d',
 greeting:greetings[i],help:'잠깐만요, 여기를 빼고… 됐다! 매듭 하나 풀었어요. 남은 것도 잘 풀리면 좋겠네요.',
 reject:'앗, 지금은 조금 바빠서요. 미안해요! 다음에 만나면 다시 이야기해요.'
}));
