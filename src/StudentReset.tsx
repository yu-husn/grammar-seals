import {useRef,useState} from 'react';
import {useGame} from './store';
import './student-reset.css';

export default function StudentReset(){
 const dialog=useRef<HTMLDialogElement>(null),[notice,setNotice]=useState('');
 const confirm=()=>{if(useGame.getState().phase!=='menu')return;useGame.getState().resetForNextStudent();dialog.current?.close();setNotice('已重新計分：0分，請下一位學生開始冒險。')};
 return <section className="student-reset-entry" aria-label="下一位學生">
  <button type="button" className="student-reset-button" aria-haspopup="dialog" onClick={()=>dialog.current?.showModal()}>重新計分</button>
  <p role="status" aria-atomic="true">{notice||'下一位學生使用前，請先重新計分。'}</p>
  <dialog ref={dialog} className="panel student-reset-dialog" role="alertdialog" aria-modal="true" aria-labelledby="student-reset-heading" aria-describedby="student-reset-description">
   <h2 id="student-reset-heading">重新計分？</h2>
   <p id="student-reset-description">清除上一位學生的成績、作答紀錄、道具、補給積分與通關進度，從行跡迷城重新開始。教師題庫與遊戲設定會保留。</p>
   <div className="student-reset-actions"><button autoFocus type="button" onClick={()=>dialog.current?.close()}>取消</button><button type="button" className="primary" onClick={confirm}>確認重新計分</button></div>
  </dialog>
 </section>;
}
