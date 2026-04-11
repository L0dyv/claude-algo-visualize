# 交互式可视化页面生成技能

当用户要求生成网页、可视化、动画演示、知识点总结、教学页面、代码执行动画时，加载此技能。

## 定位

生成**完整的交互式 HTML 页面**（单文件）。页面风格是"说人话的教学梳理"——有逻辑流、有叙事感、有图示、有交互。

适用场景包括但不限于：
- 用户提供 PDF/教材，要求生成知识点讲解页面
- 用户提供一个主题（如"队列的操作"），要求生成教学 + 动画页面
- 用户提供代码/算法，要求生成逐步执行动画
- 用户要求对比两个概念、演示某个过程、解释某个原理

---

## ⚠ 铁律（违反任何一条 = 质量不合格）

### 铁律一：正文为主，彩色框为辅

页面内容的 80%+ 应该是 `<p>` 段落和 `<h2>`/`<h3>` 标题。彩色 callout 框（`.info`、`.warn`、`.ok`、`.def`、`.formula`）只是偶尔穿插的旁白，**整页加起来不超过 3-4 个**。

参考 Claude 样板 `heap_overview.html`（428 行，7 个章节）：0 个 `.def`，0 个 `.formula`，总共只有 5 个 `.info` + 2 个 `.ok` + 4 个 `.warn`。定义、公式、性质全部用 `<p>` + `<b>` 写在正文里。

**反面教材**：连续出现 3 个以上 `.def` 框，或者把公式放进 `.formula` 框——这些会让页面变成一堆彩色方块的堆砌，不像教学页面。

### 铁律二：SVG 节点绝对不能重叠 + viewBox 必须留够空间

写 SVG 时（无论静态图还是 JS 动画），必须确保：
- 每个圆形节点的半径（通常 r=22~24）加上文字不会和相邻节点重叠
- **手算坐标时，相邻节点圆心距 ≥ 56px**（2 × 半径 + 间隙）
- 父子节点之间的 y 轴间距 ≥ 60px（给连线和文字留空间）
- 如果空间不够，宁可增大 `viewBox` 的高度，也不能压缩节点间距
- 写完坐标后，在脑中画图验证：每个 (cx, cy) 周围 24px 半径内不能有其他圆心

**viewBox 安全边距**：`viewBox` 的宽高必须比所有内容的边界多出至少 20px。具体检查方法：
- 找出所有节点中最大的 `(y + r)` 值，再加上所有节点下方标注文字的高度（约 20px），viewBox 高度必须 ≥ 此值 + 10px
- 如果节点下方有 `<text>` 标注（如编码、层号），viewBox 底部还要再留 10px
- **经验公式**：viewBox 高度 = max(节点 y + r) + 40

### 铁律三：每个概念/步骤必须配 SVG 图示

页面中讲到任何可视化概念时，必须有对应的 SVG 图：
- 数据结构（树、图、队列、栈等）→ 画结构图
- 操作过程（插入、删除、排序步骤等）→ 画状态图或做动画
- 对比/比较 → 并排 SVG
- 算法执行 → 步骤动画

具体要求：
- **概念讲完 → 紧跟 SVG 图示 → 再接文字说明**，这个节奏不能断
- 静态 SVG 用内联 HTML 写（不需要 JS），颜色用 CSS 变量
- 交互式动画只用来演示"多步骤过程"（如算法执行、构造过程），静态图用来展示"单个状态/概念"
- 整页的静态 SVG 数量应该 ≥ 交互式动画的数量

**反面教材**：一个概念讲解章节只有文字没有图——读者看着纯文字根本无法理解。

### 铁律四：有来源时跟着来源的教学脉络走

如果用户提供了 PDF/教材/笔记，**顺着来源的页面顺序**梳理章节——它先讲什么就先写什么章节，它用什么例子就用什么例子。不要从结论倒推，不要"提炼要点后重新组织"。

如果没有提供来源（纯主题/算法请求），则按**自然教学顺序**组织：
1. 先讲"这是什么"（定义/背景）
2. 再讲"怎么工作"（原理/步骤，配图）
3. 然后讲"实际例子"（手动模拟，配动画）
4. 最后总结（核心要点、易错点）

---

## 输入类型与工作流

### 类型 A：PDF / 教材 → 知识点讲解页面

1. 读入 PDF，**顺着 PDF 的页面顺序**梳理章节
2. PDF 从哪个概念开始讲 → 第一个章节；接着讲什么 → 第二个章节
3. 有哪些图/例子 → 对应嵌入到相关章节
4. 最后有"知识回顾"/"考点" → 最后的总结章节
5. 章节编号用 `<h2 id="sN">`，页面开头用 `.toc` 列出目录

### 类型 B：主题描述 → 教学 + 可视化页面

用户说"给我做个队列的动画"或"解释一下快排"之类。

1. 根据主题规划章节（按自然教学顺序）
2. 每个关键概念配静态 SVG
3. 核心操作配交互式动画（如：入队/出队、分区过程）
4. 如果涉及代码，用 `<pre>` 展示，配合逐步执行动画

### 类型 C：代码 / 算法 → 逐步执行动画

用户给了一段代码或指定一个算法，要求可视化执行过程。

1. 先用 `<pre>` 展示完整代码
2. 设计 steps 数组，每一步反映数据的完整状态
3. 每步只做一件事（比较/交换/移动）
4. 配文字说明当前行在做什么
5. 用数组视图（`.aw`/`.ar`/`.ac`）或树视图（SVG）展示

### 类型 D：概念对比 / 原理解释

用户要求对比两个概念或解释某个原理。

1. 用 `.compare` 并排展示
2. 每个概念配 SVG 图示
3. 共同点和差异用 `<p>` + `<b>` 说明
4. 如有流程差异，配动画对比

---

## CSS 骨架（固定不变）

将以下 CSS 块原样放入 `<style>` 标签，不做修改：

```css
:root{--bg:#fff;--bg2:#f5f5f4;--tx:#1a1a1a;--tx2:#6b6b6b;--tx3:#9a9a9a;--bd:rgba(0,0,0,.12);--bd2:rgba(0,0,0,.25);--bl:#378ADD;--blb:#E6F1FB;--blt:#0C447C;--gn:#1D9E75;--gnb:#E1F5EE;--gnt:#085041;--rd:#E24B4A;--rdb:#FCEBEB;--rdt:#791F1F;--or:#D08B1A;--orb:#FDF3E0;--gy:#B4B2A9;--gyb:#F1EFE8;--tl:#0F6E56;--tlb:#E1F5EE;--pp:#534AB7;--ppb:#EEEDFE;--mono:'SF Mono','Cascadia Code','Consolas',monospace;--sans:system-ui,-apple-system,sans-serif}
@media(prefers-color-scheme:dark){:root{--bg:#1a1a1a;--bg2:#2c2c2a;--tx:#e8e8e8;--tx2:#9a9a9a;--tx3:#6b6b6b;--bd:rgba(255,255,255,.12);--bd2:rgba(255,255,255,.25);--bl:#85B7EB;--blb:#0C447C;--blt:#B5D4F4;--gn:#5DCAA5;--gnb:#085041;--gnt:#9FE1CB;--rd:#F09595;--rdb:#501313;--rdt:#F7C1C1;--or:#E8B84D;--orb:#5C3D00;--gy:#888780;--gyb:#444441;--tl:#5DCAA5;--tlb:#085041;--pp:#AFA9EC;--ppb:#26215C}}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--sans);background:var(--bg);color:var(--tx);display:flex;justify-content:center;padding:32px 16px;line-height:1.7}
.c{max-width:740px;width:100%}
h1{font-size:22px;font-weight:500;margin-bottom:4px}
h2{font-size:17px;font-weight:500;margin:36px 0 12px;padding-bottom:6px;border-bottom:1px solid var(--bd)}
h3{font-size:15px;font-weight:500;margin:20px 0 8px}
.sub{font-size:13px;color:var(--tx2);margin-bottom:28px}
p{font-size:14px;color:var(--tx2);margin-bottom:10px}
p b{font-weight:500;color:var(--tx)}
s{color:var(--tx3);text-decoration:line-through}
code{font-family:var(--mono);font-size:12px;background:var(--bg2);padding:1px 5px;border-radius:4px}
pre{background:var(--bg2);border:1px solid var(--bd);border-radius:8px;padding:14px 16px;overflow-x:auto;margin:10px 0 16px;font-family:var(--mono);font-size:12px;line-height:1.6;color:var(--tx)}
table{width:100%;border-collapse:collapse;font-size:13px;margin:12px 0}
th{text-align:left;padding:8px 10px;background:var(--bg2);border:1px solid var(--bd);font-weight:500}
td{padding:8px 10px;border:1px solid var(--bd);color:var(--tx2)}
.info{border-left:3px solid var(--bl);padding:10px 14px;background:var(--blb);border-radius:0 8px 8px 0;margin:14px 0;font-size:13px;color:var(--tx)}
.ok{border-left:3px solid var(--gn);padding:10px 14px;background:var(--gnb);border-radius:0 8px 8px 0;margin:14px 0;font-size:13px;color:var(--tx)}
.warn{border-left:3px solid var(--or);padding:10px 14px;background:var(--orb);border-radius:0 8px 8px 0;margin:14px 0;font-size:13px;color:var(--tx)}
.toc{background:var(--bg2);border:1px solid var(--bd);border-radius:10px;padding:16px 20px;margin:16px 0 28px}
.toc-t{font-size:14px;font-weight:500;margin-bottom:8px}
.toc a{display:block;font-size:13px;color:var(--bl);text-decoration:none;padding:3px 0}
.toc a:hover{text-decoration:underline}
.compare{display:flex;gap:16px;margin:16px 0;flex-wrap:wrap}
.compare>div{flex:1;min-width:200px;border:1px solid var(--bd);border-radius:12px;padding:16px;background:var(--bg)}
.compare h4{font-size:14px;font-weight:600;margin-bottom:8px}
ul.prop{font-size:13px;color:var(--tx2);margin:8px 0 8px 20px;line-height:2}
ul.prop li::marker{color:var(--bl)}
.sb{display:flex;align-items:flex-start;gap:10px;margin:8px 0}
.sn{flex-shrink:0;width:24px;height:24px;border-radius:50%;background:var(--blb);color:var(--bl);font-size:13px;font-weight:500;display:flex;align-items:center;justify-content:center;margin-top:1px}
.st{font-size:14px;color:var(--tx2)}
.st b{font-weight:500;color:var(--tx)}
hr{border:none;border-top:1px solid var(--bd);margin:28px 0}
.w{border:1px solid var(--bd);border-radius:12px;padding:20px;margin:20px 0;background:var(--bg)}
.tabs{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}
.tab{padding:6px 14px;border-radius:8px;font-size:13px;font-weight:500;border:1px solid var(--bd);background:var(--bg2);color:var(--tx2);cursor:pointer;font-family:var(--sans)}
.tab:hover{opacity:.8}
.tab.on{background:var(--blb);color:var(--bl);border-color:var(--bl)}
.ctrl{display:flex;align-items:center;gap:12px;margin:10px 0}
.btn{padding:6px 16px;border:1px solid var(--bd);border-radius:8px;background:var(--bg2);color:var(--tx);cursor:pointer;font-size:13px;font-family:var(--sans)}
.btn:hover{opacity:.8}
.btn:disabled{opacity:.3;cursor:default}
.dots{display:flex;gap:6px;align-items:center}
.dot{width:8px;height:8px;border-radius:50%;background:var(--bd2);transition:background .2s}
.dot.on{background:var(--bl)}
.cap{font-size:13px;color:var(--tx2);line-height:1.7;min-height:50px;margin-top:8px}
.cap b{font-weight:500;color:var(--tx)}
.cap code{font-family:var(--mono);font-size:12px;background:var(--bg2);padding:1px 5px;border-radius:4px}
.albl{font-size:11px;color:var(--tx3);margin-bottom:18px}
.aw{margin:8px 0 4px;overflow-x:auto;overflow-y:visible;padding-bottom:20px}
.ar{display:flex;gap:0}
.ac{width:44px;height:36px;border:1px solid var(--bd);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;font-family:var(--mono);background:var(--bg2);color:var(--tx);flex-shrink:0;position:relative}
.ac .ci{position:absolute;bottom:-14px;font-size:10px;color:var(--tx3);font-weight:400}
.ac.hl{background:var(--blb);color:var(--bl);border-color:var(--bl)}
.ac.nw{background:var(--gnb);color:var(--gn);border-color:var(--gn)}
.ac.sw{background:var(--orb);color:var(--or);border-color:var(--or)}
.ac.pp{background:var(--rdb);color:var(--rd);border-color:var(--rd)}
.ac.ok{background:var(--gnb);color:var(--gn);border-color:var(--gn)}
.ac.lk{background:var(--gnb);color:var(--gn);border-color:var(--gn)}
.ac.dim{opacity:.25}
.hidden{display:none}
```

---

## JS 工具函数（固定不变）

将以下函数原样放入 `<script>` 标签：

```javascript
function treePos(n){var pos=[];if(!n)return pos;for(var i=0;i<n;i++){var lv=Math.floor(Math.log2(i+1)),idx=i-(Math.pow(2,lv)-1),cnt=Math.pow(2,lv),H=Math.min(60,220/Math.ceil(Math.log2(n+1))),span=600,gap=span/cnt;pos.push({x:50+gap*(idx+.5),y:40+lv*H})}return pos}
function mkDots(el,t,c){el.innerHTML='';for(var i=0;i<t;i++){var d=document.createElement('div');d.className='dot'+(i===c?' on':'');el.appendChild(d)}}
function D(i){return i+1}
```

---

## 正文写法

### `<p>` 为主

**90% 的内容用 `<p>` 段落写**，不要用彩色框。定义、公式、性质全部放在 `<p>` 中用 `<b>` 加粗关键词：

```html
<h2 id="s1">1. 带权路径长度</h2>
<p>先搞清楚三个层层递进的概念。</p>
<p><b>结点的权</b>：有某种现实含义的数值（如：表示结点的重要性、字符出现的频次等）。</p>
<p><b>结点的带权路径长度</b>：从树的根到该结点的路径长度（经过的边数）与该结点上权值的<b>乘积</b>。</p>
```

注意：
- 没有 `.def` 框，没有 `.formula` 框，全是 `<p>` 段落
- 公式直接写在 `<p>` 里，不用特殊容器
- 关键术语用 `<b>` 加粗

### 彩色 callout 框 — 极其克制地使用

callout 框只在以下情况出现，**整页总共不超过 3-4 个**：
- `.info`：讲完一个概念后，补充一个容易忽略的要点
- `.warn`：一个极其容易犯的错
- `.ok`：一个章节讲完后的核心结论

**不要用 callout 框来写定义、公式、性质**——这些是正文内容，用 `<p>` 写。

### 静态 SVG 图示

概念讲完后紧跟 SVG 图示。SVG 坐标规划规则：
- `viewBox` 宽度通常 `0 0 700 200`（宽 700），高度按需调整
- 圆形节点半径 r=22，**相邻节点圆心距 ≥ 56px**
- 父子层 y 间距 ≥ 60px
- 颜色用 CSS 变量（`var(--gnb)` 等），支持深色模式
- **viewBox 高度 = max(节点 y + r) + 40**（留出标注文字空间）

```html
<svg width="100%" viewBox="0 0 700 200">
<circle cx="175" cy="58" r="22" fill="var(--gnb)" stroke="var(--gn)" stroke-width="1"/>
<text x="175" y="58" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="500" fill="var(--gn)" font-family="var(--sans)">1</text>
</svg>
```

### 表格 — 克制使用

**整页最多 1-2 个表格**，只在确实适合并列对比时使用。不要用表格来罗列步骤——步骤用 `<p>` 或编号步骤（`.sb`）写。

### 代码展示

用 `<pre>` 标签展示代码：

```html
<pre>void HeadAdjust(int A[], int k, int len) {
    A[0] = A[k];
    for (int i = 2*k; i &lt;= len; i *= 2) {
        ...
    }
}</pre>
```

### 编号步骤

用 `.sb` + `.sn` 展示带编号的步骤：

```html
<div class="sb"><div class="sn">1</div><div class="st">找到变量名：<code>a</code></div></div>
<div class="sb"><div class="sn">2</div><div class="st">往右看：<code>[3]</code> → a 是一个<b>长度为 3 的数组</b></div></div>
```

### 概念对比

用 `.compare` 并排展示两个概念：

```html
<div class="compare">
  <div>
    <h4>方式 A</h4>
    <p>说明...</p>
  </div>
  <div>
    <h4>方式 B</h4>
    <p>说明...</p>
  </div>
</div>
```

### 总结章节

每个页面最后有一个总结章节，用 `<p>` 回顾核心脉络，最多加一个 `.ok` 做最终结论。

---

## 交互式动画

### 颜色约定

| CSS 类 | 语义 | 何时使用 |
|---|---|---|
| `hl` / 蓝 | 当前关注 | 正在操作的节点 |
| `sw` / 橙 | 交换中 | 两个元素正在交换 |
| `nw` / 绿 | 新元素/成功 | 新插入、比较通过 |
| `pp` / 红 | 问题/删除 | 需要调整、违规 |
| `ok` / 绿 | 已完成 | 已确认满足条件 |
| `lk` / 绿 | 已锁定 | 已排好的末尾 |
| `dim` | 不参与 | 被忽略的元素 |

### steps 数据设计

每个动画场景的 steps 是一个数组。每个 step 包含当前完整状态：

**数组/堆类动画**（完全二叉树 + 数组双视角）：
```
{
  vals: [...],      // 当前数组状态
  cap: "...",       // 说明文字（支持 <b> <code>）
  focus: number,    // 当前关注下标（-1=无）
  swap: [a, b],     // 交换对（null=无）
  lk: [...],        // 已锁定的下标
  hn: number,       // 堆大小（当数组比堆大时）
}
```

**通用树/图动画**（自定义坐标）：
```
{
  cap: "...",
  nodes: [{v:"值", x, y, cf, cs, ct}],   // 节点列表 + 颜色
  edges: [{x1, y1, x2, y2, l?"0/1"}]      // 边列表（可选标签）
}
```

**原则**：每步只做一件事（比较 or 交换）；状态反映操作后的结果。

### 渲染函数模板

完全二叉树用 `treePos()` 算坐标。非标准树结构（如哈夫曼森林合并、图等）需手动规划坐标——**务必遵守铁律二的间距要求**。

#### 模板 A：数组 + 完全二叉树（堆、排序等）

```javascript
var steps=[...], cur=0;
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
  document.getElementById('svgId').innerHTML=sg;
  var ae=document.getElementById('arrId');ae.innerHTML='';
  for(var i=0;i<n;i++){var cl=document.createElement('div');cl.className='ac'+clsFn(i);cl.innerHTML=s.vals[i]+'<span class="ci">'+D(i)+'</span>';ae.appendChild(cl)}
  document.getElementById('capId').innerHTML=s.cap;
  document.getElementById('pbId').disabled=cur===0;
  document.getElementById('nbId').disabled=cur===steps.length-1;
  mkDots(document.getElementById('dotsId'),steps.length,cur);
}
function go(d){var n=cur+d;if(n>=0&&n<steps.length){cur=n;render()}}
render();
```

#### 模板 B：自定义坐标树（哈夫曼、BST 等）

```javascript
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
```

#### 模板 C：纯数组动画（排序、队列、栈等）

```javascript
var steps=[...], cur=0;
function render(){
  var s=steps[cur], n=s.vals.length, ae=document.getElementById('arrId');ae.innerHTML='';
  for(var i=0;i<n;i++){
    var cl=document.createElement('div');cl.className='ac';
    if(s.swap&&(s.swap[0]===i||s.swap[1]===i))cl.classList.add('sw');
    else if(s.focus===i)cl.classList.add('hl');
    else if(s.lk&&s.lk.indexOf(i)>=0)cl.classList.add('lk');
    cl.innerHTML=s.vals[i]+'<span class="ci">'+D(i)+'</span>';ae.appendChild(cl);
  }
  document.getElementById('capId').innerHTML=s.cap;
  document.getElementById('pbId').disabled=cur===0;
  document.getElementById('nbId').disabled=cur===steps.length-1;
  mkDots(document.getElementById('dotsId'),steps.length,cur);
}
function go(d){var n=cur+d;if(n>=0&&n<steps.length){cur=n;render()}}
render();
```

### 动画 HTML 结构

带 SVG 树 + 数组的完整结构：

```html
<div class="w">
  <svg id="xx-svg" width="100%" viewBox="0 0 700 260"></svg>
  <div class="albl">数组视角：</div>
  <div class="aw"><div class="ar" id="xx-arr"></div></div>
  <div class="ctrl">
    <button class="btn" id="xx-pb" onclick="go(-1)">上一步</button>
    <div class="dots" id="xx-dots"></div>
    <button class="btn" id="xx-nb" onclick="go(1)">下一步</button>
  </div>
  <div class="cap" id="xx-cap"></div>
</div>
```

只有数组的简化结构：

```html
<div class="w">
  <div class="aw"><div class="ar" id="xx-arr"></div></div>
  <div class="ctrl">
    <button class="btn" id="xx-pb" onclick="go(-1)">上一步</button>
    <div class="dots" id="xx-dots"></div>
    <button class="btn" id="xx-nb" onclick="go(1)">下一步</button>
  </div>
  <div class="cap" id="xx-cap"></div>
</div>
```

### 键盘导航

```javascript
document.addEventListener('keydown',function(e){
  if(e.key==='ArrowLeft') go(-1);
  if(e.key==='ArrowRight') go(1);
});
```

---

## 完整页面结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>标题</title>
  <style>/* CSS 骨架 */</style>
</head>
<body>
<div class="c">
  <h1>标题</h1>
  <p class="sub">一句话概括</p>
  <div class="toc">...</div>

  <!-- 各章节 -->
  <h2 id="s1">1. ...</h2>
  <p>正文段落为主...</p>
  <svg>图示...</svg>

  <h2 id="s2">2. ...</h2>
  <p>正文...</p>
  <div class="w">交互动画...</div>

  <h2 id="sN">N. 总结</h2>
  <p>回顾...</p>
</div>
<script>/* JS 工具函数 + steps + render */</script>
</body>
</html>
```

---

## 常见陷阱

1. **缺少图示**：讲到可视化概念必须有 SVG 图，概念讲解后紧跟图示，不能只有纯文字
2. **SVG 节点重叠**：相邻圆心距 ≥ 56px，父子 y 间距 ≥ 60px，不够就加大 viewBox
3. **viewBox 裁切**：viewBox 高度 = max(节点 y + r) + 40，务必验证所有 step
4. **彩色框泛滥**：不要用 `.def`/`.formula` 框写定义和公式，用 `<p>` + `<b>`。callout 框整页 ≤ 4 个
5. **表格泛滥**：整页 ≤ 2 个表格，不要用表格罗列步骤
6. **脱离来源脉络**：有 PDF 时跟着 PDF 的教学顺序走，不要自己重新组织
7. **SVG 颜色硬编码**：SVG 中必须用 CSS 变量
8. **公式显示**：不引入 LaTeX，用 Unicode 字符（Σ、×、≥、≤、⌊⌋）
9. **只有动画没有静态图**：静态 SVG 用来解释概念，交互动画用来演示过程，两者都要有
