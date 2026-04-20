// ============================================================
// 工具函数（所有动画场景都必须嵌入）
// ============================================================
function treePos(n){var pos=[];if(!n)return pos;for(var i=0;i<n;i++){var lv=Math.floor(Math.log2(i+1)),idx=i-(Math.pow(2,lv)-1),cnt=Math.pow(2,lv),H=Math.min(60,220/Math.ceil(Math.log2(n+1))),span=600,gap=span/cnt;pos.push({x:50+gap*(idx+.5),y:40+lv*H})}return pos}
function mkDots(el,t,c){el.innerHTML='';for(var i=0;i<t;i++){var d=document.createElement('div');d.className='dot'+(i===c?' on':'');el.appendChild(d)}}
function D(i){return i+1}


// ============================================================
// 代码高亮辅助（当动画需要与代码联动时嵌入）
// 用法：在 render 函数末尾调用 hlLines('codeId', s.line)
// ============================================================
function hlLines(id,line){
  var ls=document.getElementById(id).children;
  for(var i=0;i<ls.length;i++) ls[i].classList.toggle('on',i===line);
}


// ============================================================
// 模板 A：数组 + 完全二叉树（堆、堆排序等）
// 使用场景：堆的 push/pop、建堆、堆排序——任何"数组 + 完全二叉树双视角"的演示
// 需要：全局 steps 数组；DOM 里有 svgId / arrId / capId / pbId / nbId / dotsId
//
// ⚠ 使用前必须自行定义 clsFn(i) —— 根据 step 状态返回数组单元格的 CSS 类后缀。
//    参考实现：
//       function clsFn(i){
//         var s=steps[cur];
//         if(s.swap&&(s.swap[0]===i||s.swap[1]===i))return' sw';
//         if(s.focus===i)return' hl';
//         if(s.lk&&s.lk.indexOf(i)>=0)return' lk';
//         return'';
//       }
// ============================================================
var steps=[/* ... 你的 steps 数据 ... */], cur=0;
function render(){
  var s=steps[cur], n=s.vals.length, pos=treePos(n), sg='';
  for(var i=0;i<n;i++){[2*i+1,2*i+2].forEach(function(ch){
    if(ch<n) sg+='<line x1="'+pos[i].x+'" y1="'+(pos[i].y+24)+'" x2="'+pos[ch].x+'" y2="'+(pos[ch].y-24)+'" stroke="var(--bd2)" stroke-width="0.5"/>';
  })}
  if(s.swap){var a=s.swap[0],b=s.swap[1];sg+='<text x="'+((pos[a].x+pos[b].x)/2-16)+'" y="'+((pos[a].y+pos[b].y)/2)+'" font-size="16" fill="var(--or)" font-family="var(--sans)">⇅</text>'}
  for(var i=0;i<n;i++){
    var c=(function(i){
      if(s.swap&&(s.swap[0]===i||s.swap[1]===i))return{f:'var(--orb)',s:'var(--or)',t:'var(--or)'};
      if(s.focus===i)return{f:'var(--blb)',s:'var(--bl)',t:'var(--bl)'};
      return{f:'var(--bg2)',s:'var(--bd2)',t:'var(--tx)'};
    })(i);
    sg+='<circle cx="'+pos[i].x+'" cy="'+pos[i].y+'" r="24" fill="'+c.f+'" stroke="'+c.s+'" stroke-width="1.2"/>';
    sg+='<text x="'+pos[i].x+'" y="'+pos[i].y+'" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="500" fill="'+c.t+'" font-family="var(--sans)">'+s.vals[i]+'</text>';
    sg+='<text x="'+pos[i].x+'" y="'+(pos[i].y+34)+'" text-anchor="middle" font-size="10" fill="var(--tx3)" font-family="var(--mono)">['+D(i)+']</text>';
  }
  document.getElementById('xx-svg').innerHTML=sg;
  var ae=document.getElementById('xx-arr');ae.innerHTML='';
  for(var i=0;i<n;i++){var cl=document.createElement('div');cl.className='ac'+clsFn(i);cl.innerHTML=s.vals[i]+'<span class="ci">'+D(i)+'</span>';ae.appendChild(cl)}
  document.getElementById('xx-cap').innerHTML=s.cap;
  document.getElementById('xx-pb').disabled=cur===0;
  document.getElementById('xx-nb').disabled=cur===steps.length-1;
  mkDots(document.getElementById('xx-dots'),steps.length,cur);
  // 若动画联动代码，取消下一行注释并把 'xx-code' 换成你的 code-panel id：
  // hlLines('xx-code', s.line);
}
function go(d){var n=cur+d;if(n>=0&&n<steps.length){cur=n;render()}}
render();


// ============================================================
// 模板 B：自定义坐标树（哈夫曼森林、BST、图等）
// 使用场景：节点坐标无法由层序位置推出时——务必遵守铁律二的间距要求
// steps[i].nodes 每项: {v, x, y, cf, cs, ct}   // 值 + 坐标 + 填充/描边/文字色
// steps[i].edges 每项: {x1, y1, x2, y2, l?}    // 边（可选标签 l）
//
// ⚠ 与模板 A/C 不同，本模板只提供 renderStep() 纯函数，不自带 cur/go/初始渲染。
//    使用时需要自己写驱动层，例如：
//       var cur=0;
//       function doRender(){renderStep('xx-svg','xx-cap','xx-pb','xx-nb','xx-dots',steps,cur)}
//       function go(d){var n=cur+d;if(n>=0&&n<steps.length){cur=n;doRender()}}
//       doRender();
//    若还需联动数组视图或代码高亮，在 doRender 里自行追加对应更新逻辑。
// ============================================================
var R=24;
function renderStep(svgId,capId,pbId,nbId,dotsId,steps,cur){
  var s=steps[cur],svg=document.getElementById(svgId),g='';
  s.edges.forEach(function(e){
    g+='<line x1="'+e.x1+'" y1="'+(e.y1+R)+'" x2="'+e.x2+'" y2="'+(e.y2-R)+'" stroke="var(--bd2)" stroke-width="0.5"/>';
    if(e.l!=null){var mx=(e.x1+e.x2)/2,my=(e.y1+R+e.y2-R)/2;g+='<text x="'+(mx-10)+'" y="'+my+'" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="var(--bl)" font-family="var(--mono)">'+e.l+'</text>'}
  });
  s.nodes.forEach(function(n){
    g+='<circle cx="'+n.x+'" cy="'+n.y+'" r="'+R+'" fill="'+n.cf+'" stroke="'+n.cs+'" stroke-width="1.2"/>';
    g+='<text x="'+n.x+'" y="'+n.y+'" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="'+n.ct+'" font-family="var(--sans)">'+n.v+'</text>';
  });
  svg.innerHTML=g;
  document.getElementById(capId).innerHTML=s.cap;
  document.getElementById(pbId).disabled=cur===0;
  document.getElementById(nbId).disabled=cur===steps.length-1;
  mkDots(document.getElementById(dotsId),steps.length,cur);
}


// ============================================================
// 模板 C：纯数组动画（简单排序、队列、栈）
// 使用场景：没有树形结构、只需数组条状视图的场景
// ============================================================
var steps=[/* ... 你的 steps 数据 ... */], cur=0;
function render(){
  var s=steps[cur], n=s.vals.length, ae=document.getElementById('xx-arr');ae.innerHTML='';
  for(var i=0;i<n;i++){
    var cl=document.createElement('div');cl.className='ac';
    if(s.swap&&(s.swap[0]===i||s.swap[1]===i))cl.classList.add('sw');
    else if(s.focus===i)cl.classList.add('hl');
    else if(s.lk&&s.lk.indexOf(i)>=0)cl.classList.add('lk');
    cl.innerHTML=s.vals[i]+'<span class="ci">'+D(i)+'</span>';ae.appendChild(cl);
  }
  document.getElementById('xx-cap').innerHTML=s.cap;
  document.getElementById('xx-pb').disabled=cur===0;
  document.getElementById('xx-nb').disabled=cur===steps.length-1;
  mkDots(document.getElementById('xx-dots'),steps.length,cur);
}
function go(d){var n=cur+d;if(n>=0&&n<steps.length){cur=n;render()}}
render();


// ============================================================
// 键盘导航（所有动画页面都应加这段）
// ============================================================
document.addEventListener('keydown',function(e){
  if(e.key==='ArrowLeft') go(-1);
  if(e.key==='ArrowRight') go(1);
});
