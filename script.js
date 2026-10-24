(function(){
var K='attendance-tracker-v3',ST={P:'Present',A:'Absent',L:'Late',E:'On leave'};
var db={students:[],att:{},th:75};
try{var s=localStorage.getItem(K);if(s)db=JSON.parse(s);}catch(e){}
if(!db.students||!db.students.length){
 var names=['Arun Kumar','Divya Sri','Karthik Raja','Lakshmi Priya','Mohammed Faiz','Nithya Sree','Praveen Raj','Swathi Reddy','Rufaya Nasrin','Shifana'];
 db={students:names.map(function(n,i){return{id:'S'+(101+i),name:n,dept:i%2?'BCA':'BSc CS'}}),att:{},th:75};
 for(var d=1;d<=5;d++){var dt=new Date();dt.setDate(dt.getDate()-d);var k=iso(dt);db.att[k]={};
 db.students.forEach(function(st,i){db.att[k][st.id]=((i*3+d*7)%10<2)?'A':((i+d)%9==0?'L':'P')});}
}
function fmtD(d){return d?d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4):''}
function iso(d){return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)}
function save(){try{localStorage.setItem(K,JSON.stringify(db))}catch(e){}}
var $=function(i){return document.getElementById(i)},editing=null;
function h(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e}
$('date').value=iso(new Date());$('th').value=db.th;
function stat(id){var a=0,c=0,rows=[];
 Object.keys(db.att).sort().forEach(function(d){var v=db.att[d][id];if(!v)return;rows.push([d,v]);if(v!=='E'){c++;if(v==='P'||v==='L')a++}});
 return{p:c?Math.round(a/c*100):null,rows:rows}}
function mark(id,v){var d=$('date').value;if(!d)return;db.att[d]=db.att[d]||{};
 if(db.att[d][id]===v)delete db.att[d][id];else db.att[d][id]=v; // one entry per student per date
 save();render()}
function render(){
 var d=$('date').value;$('dlab').textContent=d?fmtD(d):'Pick a date';
 var rec=db.att[d]||{},q=$('q').value.trim().toLowerCase(),fd=$('fd').value,fs=$('fs').value,list=$('list');
 var depts=[];db.students.forEach(function(s){if(s.dept&&depts.indexOf(s.dept)<0)depts.push(s.dept)});
 var cur=$('fd').value;$('fd').innerHTML='<option value="">All departments</option>';$('dl').innerHTML='';
 depts.forEach(function(x){var o=h('option','',x);o.value=x;$('fd').appendChild(o);var o2=h('option');o2.value=x;$('dl').appendChild(o2)});$('fd').value=cur;
 list.innerHTML='';var shown=db.students.filter(function(s){var p=stat(s.id).p,r=rec[s.id];
 if(q&&s.name.toLowerCase().indexOf(q)<0&&s.id.toLowerCase().indexOf(q)<0)return false;
 if(fd&&s.dept!==fd)return false;
 if(fs==='U')return !r; if(fs==='LOW')return p!==null&&p<db.th; if(fs)return r===fs;return true});
 if(!db.students.length)list.appendChild(h('div','empty','No students yet. Add one above.'));
 else if(!shown.length)list.appendChild(h('div','empty','No students match these filters.'));
 shown.forEach(function(s){var p=stat(s.id).p,low=p!==null&&p<db.th,row=h('div','stu'+(low?' low-row':''));
 row.appendChild(h('div','av',s.name.charAt(0).toUpperCase()));
 var info=h('div','info');info.appendChild(h('div','nm',s.name));info.appendChild(h('div','rl',s.id+(s.dept?' · '+s.dept:'')));row.appendChild(info);
 row.appendChild(h('div','pc'+(low?' low':''),p===null?'–':p+'%'));
 var tg=h('div','tog');Object.keys(ST).forEach(function(v){var b=h('button',v+(rec[s.id]===v?' on':''),v);b.title=ST[v];b.setAttribute('aria-label',ST[v]+': '+s.name);b.setAttribute('aria-pressed',rec[s.id]===v);b.onclick=function(){mark(s.id,v)};tg.appendChild(b)});row.appendChild(tg);
 var hb=h('button','mini','History');hb.onclick=function(){hist(s)};
 var eb=h('button','mini','Edit');eb.onclick=function(){edit(s)};
 var db2=h('button','mini','Delete');db2.onclick=function(){if(db2.dataset.s){db.students=db.students.filter(function(x){return x.id!==s.id});Object.keys(db.att).forEach(function(k){delete db.att[k][s.id]});save();render()}else{db2.dataset.s=1;db2.textContent='Sure?'}};
 row.append(hb,eb,db2);list.appendChild(row)});
 var P=0,A=0;db.students.forEach(function(s){if(rec[s.id]==='P'||rec[s.id]==='L')P++;if(rec[s.id]==='A')A++});
 $('sT').textContent=db.students.length;$('sP').textContent=P;$('sA').textContent=A;
 var tot=0,ok=0;db.students.forEach(function(s){var r=rec[s.id];if(r&&r!=='E'){tot++;if(r==='P'||r==='L')ok++}});
 $('sO').textContent=tot?Math.round(ok/tot*100)+'%':'–'}
function hist(s){var st=stat(s.id);$('dt').textContent=s.name;var b=$('db');b.innerHTML='';
 b.appendChild(h('div','rl',s.id+(s.dept?' · '+s.dept:'')+' · '+(st.p===null?'No records':st.p+'% attendance')));
 var bar=h('div','bar'),i=h('i');i.style.width=(st.p||0)+'%';bar.appendChild(i);b.appendChild(bar);
 if(!st.rows.length)b.appendChild(h('div','empty','No attendance marked yet.'));
 st.rows.slice().reverse().forEach(function(r){var x=h('div','h');x.appendChild(h('span','',fmtD(r[0])));x.appendChild(h('span','tag '+r[1],ST[r[1]]));b.appendChild(x)});
 $('dlg').showModal()}
function edit(s){editing=s.id;$('sid').value=s.id;$('nm').value=s.name;$('dp').value=s.dept||'';$('fh').textContent='Edit student';$('save').textContent='Save changes';$('cancel').hidden=false;window.scrollTo({top:0,behavior:'smooth'});$('nm').focus()}
function reset(){editing=null;$('sid').value=$('nm').value=$('dp').value='';$('fh').textContent='Add student';$('save').textContent='Add student';$('cancel').hidden=true}
function fm(t,e){var m=$('fmsg');m.textContent=t;m.className='msg'+(e?' err':'')}
$('save').onclick=function(){var id=$('sid').value.trim(),n=$('nm').value.trim(),dp=$('dp').value.trim();
 if(!id||!n){fm('Student ID and name are both required.',1);return}
 if(db.students.some(function(s){return s.id===id&&s.id!==editing})){fm('That student ID already exists.',1);return}
 if(editing){var s=db.students.filter(function(x){return x.id===editing})[0];
 if(id!==editing)Object.keys(db.att).forEach(function(k){if(db.att[k][editing]){db.att[k][id]=db.att[k][editing];delete db.att[k][editing]}});
 s.id=id;s.name=n;s.dept=dp;fm(n+' updated.')}
 else{db.students.push({id:id,name:n,dept:dp});fm(n+' added.')}
 reset();save();render()};
$('cancel').onclick=function(){reset();fm('')};
$('allP').onclick=function(){var d=$('date').value;if(!d)return;db.att[d]=db.att[d]||{};db.students.forEach(function(s){db.att[d][s.id]='P'});save();render()};
$('th').onchange=function(){var v=parseInt($('th').value,10);if(v>=1&&v<=100){db.th=v;save();render()}};
['date','q','fd','fs'].forEach(function(i){$(i).oninput=render;$(i).onchange=render});
$('dx').onclick=function(){$('dlg').close()};
var sl=$('slider'),dots=$('dots'),n=sl.children.length;
for(var i=0;i<n;i++){var dd=h('i');dots.appendChild(dd)}
function dot(){var k=Math.round(sl.scrollLeft/sl.clientWidth);Array.prototype.forEach.call(dots.children,function(x,j){x.className=j===k?'on':''})}
sl.addEventListener('scroll',dot);dot();
sl.addEventListener('keydown',function(e){if(e.key==='ArrowRight')sl.scrollBy({left:sl.clientWidth,behavior:'smooth'});if(e.key==='ArrowLeft')sl.scrollBy({left:-sl.clientWidth,behavior:'smooth'})});
var user=false;['pointerdown','touchstart','keydown','wheel'].forEach(function(ev){sl.addEventListener(ev,function(){user=true},{passive:true})});
if(!navigator.webdriver&&!matchMedia('(prefers-reduced-motion:reduce)').matches){setInterval(function(){if(user)return;var k=(Math.round(sl.scrollLeft/sl.clientWidth)+1)%n;sl.scrollTo({left:k*sl.clientWidth,behavior:'smooth'})},4500)}
render();
})();
