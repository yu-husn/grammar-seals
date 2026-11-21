/** One continuous score for all six opening scenes: Eastern Thought. */
export const openingMusicTrack=3;
export const musicCatalog=[
{title:'Ghost Story',file:'/music/town.mp3',isrc:'USUAN1300034',scene:'行跡迷城',reason:'顫音琴、水琴與稀疏打擊樂，營造荒城巡夜的懸疑。'},
{title:'Night of Chaos',file:'/music/mirror.mp3',isrc:'USUAN1300042',scene:'幻象迷宮',reason:'吉他與不安的合成音，配合真假鏡像與迷失感。'},
{title:'Long note One',file:'/music/court.mp3',isrc:'USUAN1100418',scene:'真假審判',reason:'低音與弦樂長音，營造審判庭的壓迫與等待。'},
{title:'Eastern Thought',file:'/music/vault.mp3',isrc:'USUAN1100682',scene:'虛實禁域',reason:'弦樂、金屬與打擊樂的神祕色彩，配合古代寶庫。'},
{title:'Five Armies',file:'/music/boss.mp3',isrc:'USUAN1100875',scene:'無言君決戰',reason:'銅管、弦樂與密集節奏，配合三階段的決戰。'},
{title:'Lotus',file:'/music/gems.mp3',isrc:'USUAN1900019',scene:'靈印寶石陣',reason:'無旋律的世界打擊樂，保留解題空間與消除節奏。'}
].map(m=>({...m,author:'Kevin MacLeod',source:`https://incompetech.com/music/royalty-free/index.html?isrc=${m.isrc}`,license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/'}));
