import {useEffect,useRef} from 'react';

export default function UsageLicense({onClose}:{onClose:()=>void}){
 const close=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;close.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose()}};window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus()}},[onClose]);
 return <div className="overlay"><section className="panel usage-license" role="dialog" aria-modal="true" aria-labelledby="usage-license-heading">
  <header className="section-head"><h2 id="usage-license-heading">使用及授權</h2><button ref={close} onClick={onClose} aria-label="關閉使用及授權">關閉</button></header>
  <p className="usage-owner">長億高中｜簡鈺珣作品</p>
  <p className="usage-welcome">歡迎直接遊玩、用於課堂學習，並分享本遊戲網址。</p>
  <h3>網站流量統計</h3>
  <p>本站使用<a href="https://www.busuanzi.cc/doc.php" target="_blank" rel="noreferrer">不蒜子</a>累計本遊戲網址的使用人次與瀏覽次數。人次為去重估算，並非精確學生人數；共用網路、不同裝置及阻擋統計的設定都可能影響數字。新版啟用後開始累計，無法回溯先前流量。</p>
  <p>統計服務會收到連線IP及固定的公開遊戲網址；本遊戲不向它傳送姓名、成績、答題紀錄、網址查詢參數或來源頁面。統計不受重新計分影響，也不影響遊戲進度。</p>
  <h3>原創內容，權利保留</h3>
  <p>本作品中由創作者依法享有權利的原創劇情、文字、美術、程式表達及具創作性的選擇編排，均保留相關權利。公開提供遊玩，不代表授予整套搬移、另行發布或任意改作的權利。</p>
  <h3>複製、改作與商用，請先取得授權</h3>
  <p>除依法或依有效授權可利用的情形外，未經權利人事先同意，不得重製、改作、散布或重新上架上述受保護內容，也不得將其用於販售、付費產品或其他商業利用。</p>
  <h3>使用AI、改名或標示來源，不等於取得授權</h3>
  <p>本頁未授權將受保護的原創內容用於AI模型訓練，或擷取後以AI重繪、改寫、重建並另行發布。標示來源或使用AI，不會自動取得原創內容的利用授權。</p>
  <h3>尊重署名，避免冒用</h3>
  <p>經授權利用時，應依約保留作品名稱與創作者署名；不得將他人的原創成果冒稱為自己創作，或使人誤認獲得創作者、學校背書。</p>
  <details className="usage-exceptions"><summary>第三方素材與法定使用範圍</summary>
   <p>音樂、字型、開源套件、歷屆試題及其他第三方內容，依其各自授權或法令利用，本頁不限制原授權已允許的使用。</p>
   <p>本聲明不排除合理使用、公有領域內容、獨立創作及其他依法得利用的情形，也不將玩法概念或一般教學方法擴張為專有權利。著作權範圍依實際原創性、人類創意投入及相關法令認定。</p>
   <p>GitHub平台條款所允許的瀏覽與fork等利用，依其條款辦理；原始碼公開不等於授予任意重新發布或商業利用的授權。</p>
   <nav aria-label="授權參考資料"><a href="https://github.com/yu-husn/grammar-seals/blob/codex/publish-game/THIRD_PARTY_NOTICES.md" target="_blank" rel="noreferrer">第三方授權聲明</a><a href="https://www.tipo.gov.tw/tw/copyright/694-17731.html" target="_blank" rel="noreferrer">著作權保護範圍</a><a href="https://www.tipo.gov.tw/tw/copyright/692-99917.html" target="_blank" rel="noreferrer">AI創作與權利</a><a href="https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository" target="_blank" rel="noreferrer">GitHub授權說明</a></nav>
  </details>
  <p className="usage-scope">本說明僅適用創作者依法可主張的權利；其他利用請先取得權利人明確授權。更新：2026年11月22日。</p>
 </section></div>;
}
