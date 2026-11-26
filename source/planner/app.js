"use strict";
(() => {
const $ = id => document.getElementById(id);
const config = window.PLANNER_CONFIG || {};
const fields = ["goals", "wins", "lessons", "nextSteps"];
let client, user = null, demo = false, rows = [], sample = [], review = null, edit = null;
let week = monday(new Date()), busy = false, reviewDirty = false, taskDirty = false, loadId = 0;
function publicKeyOkay(key) {
 if (typeof key !== "string") return false;
 if (key.startsWith("sb_publishable_")) return true;
 try { return JSON.parse(atob(key.split(".")[1].replaceAll("-","+").replaceAll("_","/"))).role === "anon"; } catch { return false; }
}
const validConfig = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(config.supabaseUrl || "") &&
  publicKeyOkay(config.supabasePublishableKey);
function localDay(d) { return [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-"); }
function parseDay(s) { const d = new Date(s + "T12:00:00"); if(!/^\d{4}-\d{2}-\d{2}$/.test(s) || !Number.isFinite(d.getTime()) || localDay(d)!==s) throw new Error("日期无效"); return d; }
function addDays(s,n) { const d=parseDay(s); d.setDate(d.getDate()+n); return localDay(d); }
function monday(d) { const x=new Date(d); x.setDate(x.getDate()-(x.getDay()+6)%7); return localDay(x); }
function notify(message, error=false) { $("status").textContent=message; $("status").classList.toggle("error",error); }
function errorText(e) {
 if(e?.code==="23505") return "这条记录已在另一台设备创建。请先导出当前内容，再同步最新记录。";
 if(e?.code==="42501") return "云端访问规则尚未配置正确，请先完成数据库初始化。";
 if(e?.code==="42P01" || e?.code==="PGRST205") return "尚未创建云端数据表，请先执行数据库初始化文件。";
 if(/Invalid login credentials/i.test(e?.message||"")) return "邮箱或密码不正确，请确认云端项目已创建这个账号。";
 if(/fetch|network|Failed to load/i.test(e?.message||"")) return "网络连接失败，当前编辑仍保留在页面中，请联网后重试。";
 return e?.message || "操作失败，请稍后重试。";
}
async function action(fn) {
 if(busy) return;
 busy=true; setBusy(true);
 try { await fn(); } catch(e) { notify(errorText(e),true); if($("task-dialog").open) $("task-error").textContent=errorText(e); }
 finally {busy=false;setBusy(false);}
}
function setBusy(value) {
 document.querySelectorAll("button").forEach(b=>b.disabled=value);
 $("jump").disabled=value; $("show-archived").disabled=value;
 $("review-form").querySelectorAll("textarea").forEach(e=>e.disabled=value);
 $("task-form").querySelectorAll("input,textarea,select").forEach(e=>e.disabled=value);
 if(!validConfig) $("login-button").disabled=true;
}
function discard() { return !(reviewDirty||taskDirty) || confirm("有尚未保存的修改，确定放弃这些修改吗？可先取消并保存或导出本周。"); }
function selectTab(which) {
 const isReview=which==="review";
 $("plan-panel").hidden=isReview; $("review-panel").hidden=!isReview;
 $("plan-tab").classList.toggle("selected",!isReview); $("review-tab").classList.toggle("selected",isReview);
 $("plan-tab").setAttribute("aria-pressed",String(!isReview)); $("review-tab").setAttribute("aria-pressed",String(isReview));
 history.replaceState(null,"",isReview?"#review":"#plan");
}
function element(tag,text,className) { const e=document.createElement(tag); if(text!==undefined)e.textContent=text;if(className)e.className=className;return e; }
function reviewValues() { return Object.fromEntries(fields.map(k=>[k,$(k).value])); }
function render() {
 $("week-label").textContent=week.replaceAll("-",".")+" — "+addDays(week,6).slice(5).replace("-", ".");
 $("week-sub").textContent=week===monday(new Date())?"本周 · 周一至周日":"历史 / 未来周次 · 周一至周日";
 $("jump").value=week;
 const tasks=rows.filter(r=>r.kind==="task"&&!r.is_deleted);
 const done=tasks.filter(r=>r.data.done).length, pct=tasks.length?Math.round(done/tasks.length*100):0;
 $("total").textContent=tasks.length; $("done").textContent=done; $("percent").textContent=pct+"%";$("progress").value=pct;
 $("progress-copy").textContent=tasks.length?done===tasks.length?"这一周的行动已全部完成。":"已完成 "+done+" / "+tasks.length+"，按自己的节奏继续。":"给这一周一个清晰的开始。";
 $("days").replaceChildren();
 for(let i=0;i<7;i++){
   const day=addDays(week,i), card=element("section",undefined,"day card"+(day===localDay(new Date())?" today":""));
   const head=element("div",undefined,"day-head");head.append(element("h3",["周一","周二","周三","周四","周五","周六","周日"][i]+(day===localDay(new Date())?" · 今天":"")),element("span",day.slice(5).replace("-"," / "))); card.append(head);
   const list=rows.filter(r=>r.kind==="task"&&r.day===day&&( $("show-archived").checked ? r.is_deleted : !r.is_deleted)).sort((a,b)=>Number(a.data.done)-Number(b.data.done)||Number(b.data.priority==="high")-Number(a.data.priority==="high")||a.id.localeCompare(b.id));
   if(!list.length)card.append(element("p",$("show-archived").checked?"没有已移除的任务":"留一点空间，安排一件重要的小事。","empty"));
   list.forEach(r=>{
     const task=element("div",undefined,"task"+(r.data.done?" complete":""));
     if(!r.is_deleted){
       const check=element("input");check.type="checkbox";check.checked=!!r.data.done;check.setAttribute("aria-label","标记完成："+r.data.title);
       check.onchange=()=>{const value=check.checked;check.checked=!!r.data.done;action(async()=>{await write(r,{data:{...r.data,done:value}});render();notify(demo?"体验：完成状态已更新":"完成状态已保存到云端");});};
       task.append(check);
     }
     const body=element("div",undefined,"task-body"), title=element("span",r.data.title,"task-title");body.append(title);
     if(r.data.priority==="high")body.append(element("span","重要","badge"));
     if(r.data.notes)body.append(element("p",r.data.notes,"task-notes"));
     const controls=element("div",undefined,"task-actions");
     if(!r.is_deleted){const b=element("button","编辑");b.onclick=()=>openTask(r);controls.append(b);}
     const archive=element("button",r.is_deleted?"恢复":"移除");archive.onclick=()=>action(async()=>{await write(r,{is_deleted:!r.is_deleted});render();notify(demo?"体验：任务状态已更新":r.is_deleted?"任务已恢复":"任务已移除，可勾选「查看已移除」恢复");});controls.append(archive);
     body.append(controls);task.append(body);card.append(task);
   });$("days").append(card);
 }
}
function fillReview() {
 review=rows.find(r=>r.kind==="review"&&!r.is_deleted)||null;
 fields.forEach(k=>$(k).value=review?.data?.[k]||"");
 reviewDirty=false;
 $("review-state").textContent=review?(demo?"体验周结":"上次保存："+new Date(review.updated_at).toLocaleString()):"本周还没有周结";
}
async function fetchRows(targetWeek) {
 let all=[];
 for(let start=0;;start+=500){
   const result=await client.from("planner_entries").select("*").eq("user_id",user.id).gte("day",targetWeek).lte("day",addDays(targetWeek,6)).order("id").range(start,start+499);
   if(result.error)throw result.error;
   all.push(...result.data);if(result.data.length<500)break;
 }
 return all;
}
async function load(targetWeek=week) {
 const token=++loadId;
 const result=demo?sample.filter(r=>r.day>=targetWeek&&r.day<=addDays(targetWeek,6)):await fetchRows(targetWeek);
 if(token!==loadId || !user)return;
 week=targetWeek;rows=result;render();fillReview();
 notify(demo?"体验模式 · 未连接云端":"已读取云端记录 · "+new Date().toLocaleTimeString());
}
async function write(existing,patch) {
 if(!user)throw new Error("请先登录");
 let saved;
 if(demo){
   saved=existing?{...existing,...patch,version:existing.version+1,updated_at:new Date().toISOString()}:{id:crypto.randomUUID(),user_id:"demo",version:1,is_deleted:false,updated_at:new Date().toISOString(),...patch};
   sample=existing?sample.map(r=>r.id===existing.id?saved:r):[...sample,saved];
 }else{
   const query=existing?client.from("planner_entries").update(patch).eq("id",existing.id).eq("user_id",user.id).eq("version",existing.version):client.from("planner_entries").insert({...patch,user_id:user.id});
   const result=await query.select().maybeSingle();
   if(result.error)throw result.error;
   if(!result.data)throw new Error("这条记录已在另一台设备更新。你的编辑仍在页面中，请先复制或导出，再点击「同步最新」后重试。");
   saved=result.data;
 }
 rows=existing?rows.map(r=>r.id===existing.id?saved:r):[...rows,saved];
 rows=rows.filter(r=>r.day>=week&&r.day<=addDays(week,6));
 return saved;
}
function openTask(r=null) {
 if(busy)return;
 edit=r;taskDirty=false;$("task-heading").textContent=r?"编辑任务":"添加任务";$("task-title").value=r?.data.title||"";
 const today=localDay(new Date());$("task-day").value=r?.day||(today>=week&&today<=addDays(week,6)?today:week);
 $("task-notes").value=r?.data.notes||"";$("task-priority").value=r?.data.priority||"normal";$("task-error").textContent="";
 $("task-dialog").showModal();$("task-title").focus();
}
async function enter() {
 $("welcome").hidden=true;$("workspace").hidden=false;$("demo-note").hidden=!demo;
 $("account").textContent=demo?"体验空间 · 数据不会保存到云端":user.email;
 $("logout").textContent=demo?"结束体验":"退出登录";
 selectTab(location.hash==="#review"?"review":"plan");
 rows=[];render();fillReview();await load();
}
function leave() {
 ++loadId;user=null;rows=[];sample=[];review=null;reviewDirty=false;taskDirty=false;edit=null;
 fields.forEach(k=>$(k).value="");$("days").replaceChildren();$("password").value="";$("account").textContent="";
 $("task-dialog").close();$("task-form").reset();$("workspace").hidden=true;$("welcome").hidden=false;
 demo=false;notify("已退出，页面中的私人记录已清除。");
}
$("plan-tab").onclick=()=>selectTab("plan");$("review-tab").onclick=()=>selectTab("review");
$("add-task").onclick=()=>openTask();
$("show-archived").onchange=render;
$("task-form").addEventListener("input",()=>taskDirty=true);
$("close-dialog").onclick=()=>{if(!taskDirty||confirm("放弃尚未保存的任务修改？")){$("task-dialog").close();taskDirty=false;}};
$("task-dialog").addEventListener("cancel",e=>{if(busy || (taskDirty&&!confirm("放弃尚未保存的任务修改？")))e.preventDefault();else taskDirty=false;});
$("task-form").onsubmit=e=>{e.preventDefault();action(async()=>{
 const title=$("task-title").value.trim();if(!title)throw new Error("请填写任务名称");
 const day=$("task-day").value;parseDay(day);
 await write(edit,{kind:"task",day,data:{title,notes:$("task-notes").value,priority:$("task-priority").value,done:edit?.data.done||false}});
 taskDirty=false;$("task-dialog").close();render();notify(demo?"体验：任务已更新":day<week||day>addDays(week,6)?"任务已保存到所选日期，切换周次可查看。":"任务已保存到云端");
});};
$("review-form").addEventListener("input",()=>{reviewDirty=true;$("review-state").textContent="有未保存的修改";});
$("review-form").onsubmit=e=>{e.preventDefault();action(async()=>{review=await write(review,{kind:"review",day:week,data:reviewValues()});reviewDirty=false;$("review-state").textContent=demo?"体验内容已更新":"已保存："+new Date(review.updated_at).toLocaleString();notify(demo?"体验：周结已更新":"周结已保存到云端，其他设备点击「同步最新」即可读取。");});};
async function navigate(target) {if(!discard()){$("jump").value=week;return;}await action(()=>load(target));$("jump").value=week;}
$("prev").onclick=()=>navigate(addDays(week,-7));$("next").onclick=()=>navigate(addDays(week,7));$("today").onclick=()=>navigate(monday(new Date()));
$("jump").onchange=()=>{try{navigate(monday(parseDay($("jump").value)));}catch(e){notify(errorText(e),true);$("jump").value=week;}};
$("refresh").onclick=()=>{if(discard())action(()=>load());};
$("login-form").onsubmit=e=>{e.preventDefault();action(async()=>{
 if(!client)throw new Error("云端尚未连接");
 const {data,error}=await client.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
 $("password").value="";if(error)throw error;demo=false;user=data.user;await enter();
});};
$("demo").onclick=()=>action(async()=>{demo=true;user={id:"demo"};week=monday(new Date());sample=[{id:"demo-task",user_id:"demo",kind:"task",day:week,data:{title:"为本周安排一件重要的小事",notes:"这是体验任务，可以编辑或移除。",priority:"high",done:false},version:1,is_deleted:false,updated_at:new Date().toISOString()}];await enter();});
$("logout").onclick=()=>{if(!discard())return;action(async()=>{if(!demo&&client){const {error}=await client.auth.signOut({scope:"local"});if(error)throw error;}leave();});};
$("export").onclick=()=>{
 const tasks=rows.filter(r=>r.kind==="task"&&!r.is_deleted), values=reviewValues();
 const text=["# "+week+" 至 "+addDays(week,6)+" 计划与周结",demo?"\n> 界面体验数据":"\n> 包含当前页面尚未保存的周结修改","\n## 日程计划",...tasks.map(r=>"- ["+(r.data.done?"x":" ")+"] "+r.day+" "+r.data.title+(r.data.notes?"\n  "+r.data.notes.replaceAll("\n","\n  "):"")),...fields.flatMap((k,i)=>["\n## "+["本周目标","完成与收获","问题与反思","下周行动"][i],values[k]||"（未填写）"])].join("\n");
 const url=URL.createObjectURL(new Blob([text],{type:"text/markdown;charset=utf-8"})), a=document.createElement("a");a.href=url;a.download=week+"-周结.md";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 notify("已导出本周 Markdown 文件（含未保存的周结内容）。");
};
window.addEventListener("beforeunload",e=>{if(reviewDirty||taskDirty||busy){e.preventDefault();e.returnValue="";}});
window.addEventListener("offline",()=>notify("当前离线：编辑会留在页面中，联网后请点击保存。",true));
window.addEventListener("online",()=>{if(user&&!demo)notify("网络已恢复。请保存当前修改，或同步云端最新记录。");});
async function init() {
 $("setup-note").hidden=validConfig;setBusy(false);
 if(!validConfig)return;
 try{
   const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.8/+esm");
   client=createClient(config.supabaseUrl,config.supabasePublishableKey,{auth:{storageKey:"sunrise-planner-auth",persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
   const {data,error}=await client.auth.getSession();if(error)throw error;
   if(data.session){user=data.session.user;await action(()=>enter());}
   client.auth.onAuthStateChange((event)=>{if(event==="SIGNED_OUT"&&!demo&&user){leave();notify("登录已失效或已退出，请重新登录。",true);}});
 }catch(e){notify("云端连接失败："+errorText(e),true);}
}
init();
})();
