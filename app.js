'use strict';

const $ = (s, root = document) => root.querySelector(s);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => '₹' + Number(value || 0).toLocaleString('en-IN');
const time = date => new Date(date).toLocaleTimeString('en-IN', {hour:'numeric',minute:'2-digit',timeZone:'Asia/Kolkata'});
const shortDate = date => new Date(date.length === 10 ? date+'T12:00:00+05:30' : date).toLocaleDateString('en-IN',{day:'numeric',month:'short',timeZone:'Asia/Kolkata'});
const range = slot => `${time(slot.starts_at)} – ${time(slot.ends_at)}`;
const paths = {
 discover:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 bag:'<path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 arrow:'<path d="M4 12h15m-5-5 5 5-5 5"/>',
 bell:'<path d="M6 9a6 6 0 0 1 12 0c0 7 2 7 2 8H4c0-1 2-1 2-8Z"/><path d="M10 21h4"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
 leaf:'<path d="M20 3S7 1 4 9s6 13 11 7 5-13 5-13Z"/><path d="m4 21 11-13"/>',
 spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 5h2m4 0h2"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 shop:'<path d="M3 10 5 3h14l2 7M4 10v11h16V10M9 21v-7h6v7"/><path d="M3 10c0 4 5 4 5 0 0 4 8 4 8 0 0 4 5 4 5 0"/>',
 chart:'<path d="M4 3v18h17M9 17v-5m5 5V7m5 10v-8"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3 2.5L12 13v1m0 3h.01"/>',
 logout:'<path d="M9 4H4v16h5m6-12 4 4-4 4M9 12h11"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 edit:'<path d="m15 4 5 5M4 20l1-6L16 3l5 5-11 11-6 1Z"/>',
 refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 7a8 8 0 0 1 13.5-1l1 6M4 12l1 6a8 8 0 0 0 13.5-1"/>',
 chevron:'<path d="m9 5 7 7-7 7"/>',
 shield:'<path d="m12 3 8 3v6c0 6-8 10-8 10S4 18 4 12V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
 heart:'<path d="M20 5c-4-4-8 1-8 1S8 1 4 5s0 9 8 15c8-6 12-11 8-15Z"/>',
 food:'<path d="M4 3v6c0 3 6 3 6 0V3M7 3v18m13 0V3c-5 0-5 11 0 11"/>',
 plus:'<path d="M12 5v14M5 12h14"/>'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.spark}</svg>`;

function art(type='bowl') {
 let shape='';
 if(type==='bowl'||type==='salad') {
  const rice = Array.from({length:34},(_,i)=>`<ellipse cx="${72+(i*31)%150}" cy="${76+(i*23)%113}" rx="4" ry="1.8" fill="${i%2?'#e0ca9c':'#fff5dc'}" transform="rotate(${i*31} ${72+(i*31)%150} ${76+(i*23)%113})"/>`).join('');
  const greens = Array.from({length:14},(_,i)=>`<ellipse cx="${85+(i*17)%53}" cy="${70+(i*29)%100}" rx="17" ry="10" fill="${['#6c8b35','#85a747','#466d38'][i%3]}" transform="rotate(${i*33} ${85+(i*17)%53} ${70+(i*29)%100})"/>`).join('');
  const paneer = Array.from({length:8},(_,i)=>`<g transform="translate(${148+(i*29)%47} ${80+(i*37)%83}) rotate(${i*21-22})"><rect width="23" height="22" rx="5" fill="#b8642e"/><rect x="0" y="-2" width="23" height="19" rx="4" fill="${i%2?'#e9a13e':'#f4b54e'}"/><path d="m5 3 8 2m1 5 5 1" stroke="#b87832" stroke-width="2" stroke-linecap="round"/></g>`).join('');
  shape=`<ellipse cx="151" cy="217" rx="99" ry="15" fill="#6c56271a"/><circle cx="150" cy="134" r="105" fill="#e1d6b9"/><circle cx="150" cy="128" r="105" fill="#fcfaf0"/><circle cx="150" cy="128" r="91" fill="#e3d6b9"/><circle cx="150" cy="128" r="86" fill="#efe1bf"/>${rice}${greens}${type==='bowl'?paneer:'<path d="M148 60q55 4 60 41-35 3-60-41" fill="#9dba65"/><path d="M151 68q50 10 48 30" fill="none" stroke="#bfd18e" stroke-width="4"/>'}<g fill="#d75e3c"><circle cx="118" cy="178" r="12"/><circle cx="100" cy="166" r="11"/><circle cx="138" cy="182" r="10"/></g><g fill="#ef9870"><path d="m111 172 6 13 5-12Z"/><path d="m96 160 4 11 5-8Z"/></g><g fill="none" stroke="#b36d92" stroke-width="4"><ellipse cx="151" cy="151" rx="19" ry="10" transform="rotate(-40 151 151)"/><ellipse cx="147" cy="163" rx="16" ry="8" transform="rotate(-40 147 163)"/></g><path d="M197 157a28 28 0 0 1-25 31l-2-28Z" fill="#c4d771" stroke="#edf0be" stroke-width="5"/><path d="m171 162 21 9m-21-9 11 21" stroke="#edf0be" stroke-width="2"/><g fill="#3f7341"><ellipse cx="149" cy="101" rx="13" ry="5" transform="rotate(-30 149 101)"/><ellipse cx="141" cy="94" rx="12" ry="5" transform="rotate(35 141 94)"/></g><g fill="#72492b"><circle cx="158" cy="118" r="1.5"/><circle cx="182" cy="101" r="1"/><circle cx="173" cy="147" r="1.5"/></g>`;
 } else if(type==='burger') {
  shape='<ellipse cx="150" cy="216" rx="96" ry="14" fill="#714b2020"/><path d="M58 167h183v20c-5 33-173 33-181 0Z" fill="#c57a34"/><path d="M58 166h183v14c-4 21-178 22-183 0Z" fill="#ecac55"/><path d="M60 154q8-12 20 0 13-17 28-1 12-17 28-2 15-13 27 0 17-14 30 0 20-14 32 1l14 13q-15 15-29 2-16 17-32 2-16 13-33 0-18 16-33 0-14 17-29 0-13 12-24-4Z" fill="#6b8e3f"/><rect x="54" y="133" width="191" height="25" rx="12" fill="#634533"/><path d="m58 132 31-9 117 4 34 5-27 15-30-2-24 18-29-18-31 9Z" fill="#f2bc41"/><path d="M60 118q89-16 177 0l-3 13q-82 13-170-1Z" fill="#d56742"/><path d="M64 112c-1-89 170-91 172 0q-83 31-172 0Z" fill="#df9448"/><path d="M64 107c5-82 164-82 172 0q-83 31-172 0Z" fill="#efb45d"/><path d="M87 73c31-32 90-37 127 1" stroke="#f8cd87" stroke-width="8" stroke-linecap="round" fill="none"/>'+Array.from({length:16},(_,i)=>`<ellipse cx="${91+(i*23)%119}" cy="${65+(i*17)%46}" rx="3.8" ry="1.5" fill="#ffe4ae" transform="rotate(${i*29} ${91+(i*23)%119} ${65+(i*17)%46})"/>`).join('');
 } else if(type==='coffee') {
  shape='<ellipse cx="151" cy="218" rx="69" ry="11" fill="#37452b17"/><path d="m105 76 12 130q36 16 69 0l12-130" fill="#d5b181"/><path d="m109 94 10 108q33 14 65 0l10-108" fill="#e8cca6"/><path d="m112 132 6 64q38 18 68 0l5-64Z" fill="#bc926b"/><path d="M113 134q18 15 38 3 17-12 39-3" stroke="#f2d8ad" stroke-width="8" fill="none"/><path d="m151 82 24-63" stroke="#5b6b51" stroke-width="9"/><path d="m151 82 24-63" stroke="#8c9d72" stroke-width="4"/><ellipse cx="151" cy="78" rx="48" ry="11" fill="#96724e"/><ellipse cx="151" cy="76" rx="48" ry="11" fill="#ebd3ad"/><ellipse cx="151" cy="75" rx="42" ry="8" fill="#9a754e"/><g fill="#dfc7a3" stroke="#f2dfbe" stroke-width="1"><rect x="121" y="69" width="16" height="12" rx="3" transform="rotate(-8 121 69)"/><rect x="148" y="70" width="15" height="12" rx="3" transform="rotate(10 148 70)"/><rect x="169" y="69" width="13" height="10" rx="3"/></g><path d="m124 96 7 103" stroke="#fff7df" stroke-width="4" opacity=".4"/><rect x="111" y="130" width="81" height="45" rx="4" fill="#faf7e8"/><circle cx="151" cy="152" r="15" fill="#76865c"/><path d="M151 142c-10 7-9 16 0 20 8-5 10-13 0-20Z" fill="#f8f0d5"/><path d="m151 144-2 15" stroke="#76865c" stroke-width="1.5"/><path d="M72 170q-27-23-14-41 27 9 14 41" fill="#7e975d"/><path d="m72 170-15-30" stroke="#a4b789" stroke-width="2"/>';
 } else {
  shape='<ellipse cx="150" cy="220" rx="88" ry="10" fill="#785a2c18"/><g transform="rotate(-23 150 140)"><path d="M86 68q65-25 124 0l-18 132q-38 26-82 0Z" fill="#d6ad6e"/><path d="M91 74q61-19 113 0l-17 122q-36 19-72 0Z" fill="#f0d2a0"/><path d="m96 101 98 55-6 38q-38 20-73 0Z" fill="#fbf0d8"/><path d="M94 89q24-31 44-8 26-29 63 4l4-16q-60-31-115 0Z" fill="#688d41"/><g fill="#bd663c"><ellipse cx="117" cy="67" rx="12" ry="8"/><ellipse cx="161" cy="68" rx="13" ry="9"/></g><g fill="#dba654"><ellipse cx="140" cy="71" rx="11" ry="8"/><ellipse cx="184" cy="73" rx="12" ry="9"/></g><path d="m117 82 65-9m-44 6 41 5" stroke="#c28a9b" stroke-width="5"/><path d="m106 101 15 7m23 16 22 13m-43-22 10 7" stroke="#caa06e" stroke-width="3" stroke-linecap="round"/><path d="m137 159 29 14" stroke="#b5bf92" stroke-width="3"/><path d="m147 158 3 15 10-9" stroke="#7f9360" fill="none" stroke-width="2"/></g>';
 }
 return `<svg class="food-art" viewBox="0 0 300 260" aria-hidden="true">${shape}</svg>`;
}

function readCart(){try{const c=JSON.parse(localStorage.getItem('ql-cart'));return c && Number.isInteger(c.outlet) && Array.isArray(c.items) && c.items.every(i=>Number.isInteger(i.id)&&Number.isInteger(i.quantity)&&i.quantity>0&&i.quantity<=10)?c:{outlet:null,items:[]};}catch{return {outlet:null,items:[]};}}
const S = {user:null,csrf:null,catalog:[],orders:[],stats:null,cart:readCart(),category:'All spots',search:'',menuCategory:'All items',veg:false,slots:[],recommended:null,selected:null,pickupMode:'now',pickupDate:'',note:'',checkoutKey:null,today:'',route:'discover',dashboardFilter:'active',busy:false,loading:false,authReturn:null,menuRoute:null};
let routeVersion=0, toastTimer;
const outlet = id => S.catalog.find(o=>o.id===Number(id));
const menuItem = id => S.catalog.flatMap(o=>o.menu).find(m=>m.id===Number(id));
const cartCount = () => S.cart.items.reduce((n,i)=>n+i.quantity,0);
const cartTotal = () => S.cart.items.reduce((n,i)=>n+(menuItem(i.id)?.price||0)*i.quantity,0);
const saveCart = () => {try{localStorage.setItem('ql-cart',JSON.stringify(S.cart));}catch{}S.checkoutKey=null;};
function toast(message,error=false){const t=$('#toast');t.textContent=message;t.className='show'+(error?' error':'');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.className='',4500);}
async function api(path,options={}) {
 const config={...options,headers:{'Content-Type':'application/json',...(S.csrf?{'X-CSRF-Token':S.csrf}:{}),...options.headers}};
 if(options.body) config.body=JSON.stringify(options.body);
 let res;try{res=await fetch('/api'+path,config);}catch{throw new Error('Cannot reach QueueLess. Check that the local server is running.');}
 let data;try{data=await res.json();}catch{throw new Error('The server returned an unexpected response. Please refresh.');}
 if(!res.ok) throw new Error(data.error||'Something went wrong. Please try again.');
 return data;
}
function rush(o){const kind=!o.rush_available?'closed':o.rush_percent<=30?'low':o.rush_percent<=70?'moderate':'high';return `<span class="rush ${kind}">${!o.is_open?'Paused':!o.rush_available?'Next day pickup':kind==='low'?'Low rush':kind==='moderate'?'Moderate rush':'High rush'}</span>`;}
function button(label,action,cls='',extra=''){return `<button class="btn ${cls}" data-action="${action}" ${extra}>${label}</button>`;}
function empty(title,text,action='discover',label='Explore outlets',symbol='bag'){return `<div class="empty-state">${icon(symbol)}<h2>${title}</h2><p>${text}</p>${button(label,action)}</div>`;}
function go(route){if(location.hash==='#'+route) loadRoute();else location.hash=route;}
function userNav(){
 if(S.user?.role==='outlet') return [['dashboard','shop','Order board'],['manage-menu','food','My menu'],['capacity','clock','Pickup slots'],['reports','chart','Reports'],['discover','discover','Discover']];
 if(S.user?.role==='admin') return [['dashboard','chart','Overview'],['outlets','shop','Outlets'],['orders','bag','All orders'],['people','user','People'],['discover','discover','Discover']];
 return [['discover','discover','Discover'],['orders','bag','My orders'],['how-it-works','clock','How it works']];
}
function shell(body){
 const active=S.orders.filter(o=>!['completed','cancelled'].includes(o.status)).length;
 const role=S.user?.role||'student';
 return `<div class="shell"><aside class="sidebar"><a href="#discover" class="brand"><span class="brand-mark">q.</span>QueueLess</a><div class="brand-sub">Good food. No wait.</div><div class="nav-label">${role==='student'?'Your campus':role+' workspace'}</div><nav class="nav" aria-label="Main navigation">${userNav().map(([route,ic,label])=>`<a href="#${route}" class="${S.route.split('/')[0]===route?'active':''}" ${S.route===route?'aria-current="page"':''}>${icon(ic)}${label}${route==='orders'&&active?`<span class="count">${active}</span>`:''}</a>`).join('')}</nav><div class="sidebar-bottom"><div class="campus-note">${icon('leaf')}<strong>A little less waiting.</strong><p>A little more time for<br>the things you love.</p></div><button class="nav-button" data-action="help">${icon(helpName())}Help & getting started</button><button class="nav-button" data-action="account">${icon('user')}${S.user?'Switch account':'Sign in'}</button><div class="sidebar-footer">Made for your campus. ♡</div></div></aside><div class="main-wrap"><header class="topbar"><a class="brand mobile-brand" href="#discover"><span class="brand-mark">q.</span>QueueLess</a><div class="top-location">${icon('pin')}Campus Central <span>/ Food & good company</span></div><div class="top-right"><span class="top-status live-dot">Campus pickup · 8 AM – 10 PM</span><button class="icon-button notify-button" aria-label="View order updates" data-action="orders">${icon('bell')}${active?'<i class="notification-count"></i>':''}</button><button class="profile" data-action="account" aria-label="Account and sign in"><span class="avatar">${S.user?esc(S.user.name.slice(0,1).toUpperCase()):icon('user')}</span><span><strong>${S.user?esc(S.user.name.split(' ')[0]):'Hello, foodie'}</strong><small>${S.user?esc(S.user.role):'Sign in to order'}</small></span></button></div></header><main class="content" id="main">${body}<footer class="page-footer"><span>© ${new Date().getFullYear()} QueueLess · A better kind of campus break.</span><span>${icon('heart')} Cooked on campus. Picked up by you.</span></footer></main></div></div>`;
}
function helpName(){return 'help';}
function render(){
 const r=S.route.split('/')[0]; let body='';
 if(S.loading) body='<div class="loading">Getting everything ready…</div>';
 else if(r==='discover') body=browse();
 else if(r==='outlet') body=menuPage(Number(S.route.split('/')[1]));
 else if(r==='checkout') body=checkout();
 else if(r==='orders') body=ordersPage();
 else if(r==='how-it-works') body=howPage();
 else if(['dashboard','manage-menu','capacity','reports','outlets','people'].includes(r)) body=staffPage(r);
 else body=empty('A small detour.','That page does not exist. Let’s head back to the food.');
 $('#app').innerHTML=shell(body);
}
function browse(){return `<div class="greeting"><div><div class="eyebrow">Your campus, served fresh</div><h1>Hey ${S.user?esc(S.user.name.split(' ')[0]):'there'}, what sounds good?</h1><p>A great meal is just a study break away.</p></div><span class="date-tag">${icon('calendar')}${new Date(S.today+'T12:00:00+05:30').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'long'})}</span></div><section class="hero"><div class="hero-text"><div class="eyebrow">Less waiting. More living.</div><h2>Good food.<br><em>Zero queue.</em></h2><p>Your campus favourites, ready on your schedule. Order ahead. Pick up. Carry on.</p>${button('Find your next bite '+icon('arrow'),'explore')}</div><div class="hero-art">${art('bowl')}<span class="hero-spark">✳</span><div class="floating-label"><span class="check-icon">${icon('check')}</span><span><strong>Your slot. Your pace.</strong><small>A better way to take a break.</small></span></div><span class="hero-stamp">FRESHLY MADE, ON CAMPUS</span></div></section><div class="steps-strip"><div class="mini-step"><span>01</span><div><strong>Find your flavour</strong><small>Explore your campus outlets</small></div></div><div class="mini-step"><span>02</span><div><strong>Pick your time</strong><small>Book a less crowded slot</small></div></div><div class="mini-step"><span>03</span><div><strong>Grab & go</strong><small>Your break belongs to you</small></div></div></div><section id="outlets-section"><div class="section-head"><div><h2>Good spots. Great food.</h2><p>${S.catalog.length} campus favourites, all in one place.</p></div><label class="search">${icon('search')}<input id="outlet-search" type="search" aria-label="Search outlets or dishes" placeholder="Find an outlet or your favourite dish" value="${esc(S.search)}"></label></div><div class="filter-row">${['All spots','Indian','Burgers','Café','Healthy'].map(c=>`<button class="chip ${S.category===c?'active':''}" data-action="filter" data-value="${c}" aria-pressed="${S.category===c}">${c==='All spots'?icon('discover'):c==='Healthy'?icon('leaf'):''}${c}</button>`).join('')}<span class="filter-trailing">${icon('pin')}All within your campus</span></div><div id="outlet-results">${outletCards()}</div></section><aside class="rush-explainer"><div class="left">${icon('spark')}<div><strong>A smarter break starts with a quieter slot.</strong><p>Rush levels show bookings in the next pickup window. Choose a little breathing room.</p></div></div><div class="legend"><span><i></i>Low · ≤30%</span><span><i></i>Moderate · ≤70%</span><span><i></i>High · &gt;70%</span></div></aside>`;}
function outletCards(){
 const q=S.search.toLowerCase();
 const matches=S.catalog.filter(o=>(S.category==='All spots'||o.category===S.category)&&(!q||[o.name,o.category,...o.menu.map(m=>m.name)].join(' ').toLowerCase().includes(q)));
 return matches.length?`<div class="outlet-grid">${matches.map(o=>`<a href="#outlet/${o.id}" class="outlet-card"><div class="card-art art-${esc(o.art)}"><span class="category-badge">${esc(o.category)}</span>${art(o.art)}</div><div class="card-body"><h3>${esc(o.name)}</h3><p>${esc(o.location)}</p><div class="card-meta">${rush(o)}<span class="time-meta">${icon('clock')}${o.prep_minutes} min prep</span></div></div></a>`).join('')}</div>`:empty('No bites found.','Try another dish, outlet name or category.','reset-search','Show all outlets','search');
}
function qtyControl(id,qty){return `<div class="quantity"><button data-action="minus" data-id="${id}" aria-label="Remove one ${esc(menuItem(id)?.name)}">−</button><strong>${qty}</strong><button data-action="add" data-id="${id}" aria-label="Add one ${esc(menuItem(id)?.name)}" ${cartCount()>=10?'disabled':''}>+</button></div>`;}
function menuPage(id){
 const o=outlet(id);if(!o)return empty('Outlet not found.','Choose another outlet from the campus list.');
 const cats=['All items',...new Set(o.menu.map(m=>m.category))];
 const items=o.menu.filter(m=>(S.menuCategory==='All items'||m.category===S.menuCategory)&&(!S.veg||m.veg));
 return `<div class="breadcrumb"><a href="#discover">Discover</a>${icon('chevron')}<span>${esc(o.name)}</span></div><section class="menu-banner"><div><span class="eyebrow">${esc(o.category)} · Made on campus</span><h1>${esc(o.name)}</h1><p>${esc(o.tagline)}</p><div class="inline-info">${rush(o)}<span>${icon('clock')}${o.prep_minutes} min preparation</span><span>${icon('pin')}${esc(o.location)}</span></div></div><div class="banner-art">${art(o.art)}</div></section>${!o.is_open?'<div class="error-box">This outlet is taking a break. Its menu is available to browse; ordering will resume when the outlet reopens.</div>':''}<div class="menu-layout"><div><div class="section-head" style="margin-top:0"><h2>The menu</h2><button class="chip ${S.veg?'active':''}" data-action="veg" aria-pressed="${S.veg}">${icon('leaf')}Veg only</button><button class="btn soft mobile-cart" data-action="scroll-cart" role="button" tabindex="0">${icon('bag')}Cart (${cartCount()})</button></div><div class="filter-row">${cats.map(c=>`<button class="chip ${S.menuCategory===c?'active':''}" data-action="menu-filter" data-value="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="menu-grid">${items.map(m=>{const qty=S.cart.items.find(i=>i.id===m.id)?.quantity||0;return `<article class="menu-card"><div class="card-art art-${esc(m.art)}">${art(m.art)}</div><div class="menu-details"><span class="veg-mark ${m.veg?'':'nonveg'}" aria-label="${m.veg?'Vegetarian':'Non-vegetarian'}"></span><h3>${esc(m.name)}</h3><p>${esc(m.description)}</p><div class="menu-bottom"><span class="price">${money(m.price)}</span>${!m.available?'<span class="muted small">Sold out</span>':qty?qtyControl(m.id,qty):button('ADD +','add','soft small-btn',`data-id="${m.id}" ${!o.is_open?'disabled':''}`)}</div></div></article>`;}).join('')}</div>${!items.length?'<p class="muted">No items match this filter.</p>':''}</div>${cartPanel()}</div>`;
}
function cartLines(){return `<div class="cart-lines">${S.cart.items.map(i=>{const m=menuItem(i.id);return `<div class="cart-line"><div><strong>${esc(m?.name||'Unavailable item')}</strong><small>${money(m?.price)} each</small></div>${qtyControl(i.id,i.quantity)}</div>`;}).join('')}</div>`;}
function totals(){return `<div class="cart-totals"><div><span>Subtotal</span><span>${money(cartTotal())}</span></div><div><span>Pickup fee</span><span style="color:var(--green)">On us</span></div><div class="total"><span>Total</span><span>${money(cartTotal())}</span></div></div>`;}
function cartPanel(isCheckout=false){
 const o=outlet(S.cart.outlet), slot=S.slots.find(s=>s.id===S.selected);
 return `<aside class="cart-panel" id="cart-panel"><h2>${isCheckout?'Your order':'Your little food break'}</h2><p>${S.cart.items.length?esc(o?.name||'Campus pickup'):'Something good belongs here.'}</p>${S.cart.items.length?`${isCheckout&&slot?`<div class="pickup-summary"><small>${icon('clock')} PICKUP · ${shortDate(slot.starts_at)}</small><strong>${range(slot)}</strong><small>${esc(o?.location)}</small></div>`:''}${cartLines()}${totals()}${isCheckout?button(S.busy?'Booking your slot…':'Confirm pickup · '+money(cartTotal())+' '+icon('arrow'),'place-order','full',`${!S.selected||S.busy?'disabled':''}`):button('Choose pickup time '+icon('arrow'),'checkout','full')}<p class="cart-note">${icon('shield')}Pay at the outlet. No online payment.</p>`:`<div class="cart-empty">${icon('bag')}<p>Add something delicious.<br>We’ll save you a spot.</p></div>`}</aside>`;
}
function checkout(){
 if(!S.cart.items.length)return empty('Your cart is taking a break.','Add a few favourites before choosing a pickup slot.');
 if(!S.user)return empty('One quick hello before your meal.','Sign in to reserve your pickup slot and track your order.','login-checkout','Sign in to continue','user');
 if(S.user.role!=='student')return empty('Student ordering','Switch to a student account to place your own pickup order.','login-checkout','Switch account','user');
 const o=outlet(S.cart.outlet);
 const maxDate=new Date(S.today+'T12:00:00+05:30');maxDate.setDate(maxDate.getDate()+7);const maxISO=maxDate.toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});
 return `<div class="breadcrumb"><a href="#outlet/${o.id}">${esc(o.name)}</a>${icon('chevron')}<span>Your pickup</span></div><div class="title-row"><div><h1>Make time for a good bite.</h1><p>Choose your window. We’ll take care of the food.</p></div></div><div class="checkout-layout"><div><section class="panel"><h2>Your time, your choice.</h2><p class="panel-sub">Each window is 15 minutes. Capacity is shared by everyone ordering from this outlet.</p><div class="segmented"><button class="${S.pickupMode==='now'?'active':''}" data-action="pickup-mode" data-value="now">${icon('clock')} Order now</button><button class="${S.pickupMode==='schedule'?'active':''}" data-action="pickup-mode" data-value="schedule">${icon('calendar')} Schedule ahead</button></div>${S.pickupMode==='schedule'?`<label class="field"><span>Pickup date</span><input type="date" id="pickup-date" min="${S.today}" max="${maxISO}" value="${S.pickupDate}" required></label>`:`<div class="helper">${icon('spark')}Order now reserves the earliest available window after preparation time. You can choose another slot below.</div>`}<div class="slots-grid">${S.slots.map(s=>`<button class="slot ${S.selected===s.id?'selected':''}" data-action="select-slot" data-id="${s.id}" ${!s.available?'disabled':''} aria-pressed="${S.selected===s.id}">${S.recommended===s.id?'<span class="recommended">Suggested</span>':''}<strong>${range(s)}</strong><small>${!s.available?(s.remaining?'Outlet paused':'Full · try another'):s.remaining+' of '+s.capacity+' places left'}</small></button>`).join('')}</div>${!S.slots.length?`<div class="error-box">No pickup windows remain for this date. ${button('Choose another date','schedule-mode','text')}</div>`:''}<div class="helper">${icon('leaf')}We suggest the least crowded option among the next four available windows. All times are campus time (IST).</div></section><section class="panel"><h2>A note for the kitchen</h2><p class="panel-sub">Optional preferences, for example “less spicy”. For allergies, speak directly with the outlet.</p><label class="field"><span class="sr-only">Kitchen note</span><textarea id="order-note" maxlength="250" placeholder="Anything you’d like the kitchen to know?">${esc(S.note)}</textarea></label></section></div>${cartPanel(true)}</div>`;
}
function orderCard(o,staff=false){
 const current=['pending','preparing','ready','completed'].indexOf(o.status);
 const next={pending:['Start preparing','preparing'],preparing:['Mark ready','ready'],ready:['Complete pickup','completed']}[o.status];
 return `<article class="order-card"><div class="order-header"><div><span class="order-id">${esc(o.id)}</span><h3>${esc(staff?o.student_name:o.outlet_name)}</h3><span class="muted small">${shortDate(o.starts_at)} · ${range(o)}</span></div><span class="status-badge ${o.status}">${o.status}</span></div><div class="order-items">${o.items.map(i=>`${i.quantity} × ${esc(i.name)}`).join(' · ')}${o.note?`<div class="small muted">Kitchen note: ${esc(o.note)}</div>`:''}</div>${o.status==='ready'&&!staff?`<div class="ready-banner">Your food is ready! Show <strong>${esc(o.id)}</strong> at ${esc(o.outlet_name)}.</div>`:''}${!staff&&current>=0?`<div class="progress-track">${['Pending','Preparing','Ready','Picked up'].map((label,i)=>`<div class="progress-step ${i<=current?'done':''} ${i===current?'current':''}">${label}</div>`).join('')}</div>`:''}<div class="order-bottom"><p><strong>${money(o.total)}</strong> · ${o.status==='completed'?'Pay-at-pickup order':'Pay at pickup'}${!staff?`<br>${esc(o.location)}`:''}</p>${staff&&next?button(next[0],'advance','small-btn',`data-id="${o.id}" data-value="${next[1]}"`):S.user?.role==='student'&&o.status==='pending'?button('Cancel order','cancel-order','text',`data-id="${o.id}"`):''}</div></article>`;
}
function ordersPage(){
 if(!S.user)return empty('Your next great break starts here.','Sign in to see your orders, pickup times and kitchen updates.','account','Sign in','bag');
 const completed=['completed','cancelled'];
 const list=S.orders.filter(o=>S.dashboardFilter==='all'||(S.dashboardFilter==='active'?!completed.includes(o.status):completed.includes(o.status)));
 return `<div class="title-row"><div><h1>${S.user.role==='student'?'Your orders. Zero guesswork.':'All campus orders'}</h1><p>Follow each meal from the kitchen to your hands.</p></div><span class="live-indicator"><span class="live-dot">Updates every 10 seconds</span><button class="refresh-btn" data-action="refresh">${icon('refresh')}Refresh</button></span></div><div class="sub-tabs">${[['active','In progress'],['history','Past orders'],['all','All orders']].map(([v,l])=>`<button class="${S.dashboardFilter===v?'active':''}" data-action="order-filter" data-value="${v}">${l}</button>`).join('')}</div>${list.length?`<div class="orders-list">${list.map(o=>orderCard(o,S.user.role!=='student')).join('')}</div>`:empty('A little room for something delicious.',S.dashboardFilter==='active'?'No orders in progress. Your next meal is waiting to be discovered.':'Your completed and cancelled orders will appear here.')}`;
}
function statsRow(){const s=S.stats||{};return `<div class="dashboard-stats">${[['Today’s orders',s.total_orders||0,'By pickup date'],['In progress',s.active_orders||0,'Pending, preparing & ready'],['Completed',s.completed_orders||0,'Picked up on campus'],['Completed order value',money(s.revenue),'Pay-at-pickup orders']].map(([l,n,d])=>`<div class="stat"><p>${l}</p><strong>${n}</strong><small>${d}</small></div>`).join('')}</div>`;}
function chart(){const hours=Array.from({length:14},(_,i)=>String(i+8).padStart(2,'0'));const max=Math.max(1,...(S.stats?.hourly||[]).map(h=>h.count));return `<section class="panel"><h2>When campus gets hungry</h2><p class="panel-sub">Today’s bookings by pickup hour · cancelled orders excluded</p><div class="bar-chart">${hours.map(h=>{const n=S.stats?.hourly.find(x=>x.hour===h)?.count||0;return `<div class="bar-col"><span>${n||''}</span><div class="bar" style="height:${Math.max(2,n/max*110)}px" title="${h}:00 — ${n} orders"></div><small>${Number(h)>12?Number(h)-12:h}${Number(h)>=12?'p':'a'}</small></div>`;}).join('')}</div>${!S.stats?.hourly.length?'<p class="small muted" style="margin:20px 0 0">Bookings will bring this chart to life.</p>':''}</section>`;}
function staffPage(r){
 if(!S.user||S.user.role==='student')return empty('The kitchen workspace','Sign in with an outlet or admin account to manage campus food.','account','Choose an account','shop');
 const admin=S.user.role==='admin';
 if(['people','outlets'].includes(r)&&!admin)return empty('Admin workspace','This page is available to campus administrators.','account','Switch account','shield');
 if(r==='dashboard') {
  if(admin)return `<div class="title-row"><div><div class="eyebrow">Campus administration</div><h1>A campus running smoothly.</h1><p>${S.stats?.outlet_count||0} outlets accepting orders · ${shortDate(S.today)}</p></div>${button(icon('refresh')+' Refresh','refresh','secondary')}</div>${statsRow()}${chart()}<div class="section-head"><h2>Your campus at a glance</h2><a href="#outlets" class="btn text">Manage outlets ${icon('arrow')}</a></div><div class="outlet-grid">${S.catalog.map(o=>`<div class="outlet-card"><div class="card-body"><h3>${esc(o.name)}</h3><p>${o.capacity} orders per 15-minute slot</p>${rush(o)}<div style="margin-top:12px">${button('Manage','edit-outlet','text',`data-id="${o.id}"`)}</div></div></div>`).join('')}</div>`;
  const o=outlet(S.user.outlet_id);return `<div class="title-row"><div><div class="eyebrow">Kitchen workspace</div><h1>${esc(o?.name)}</h1><p>Your live order board. One good meal at a time.</p></div><div class="manage-actions">${rush(o)}${button(o.is_open?'Pause orders':'Resume orders','toggle-outlet','secondary',`data-id="${o.id}"`)}</div></div>${statsRow()}<div class="section-head"><h2>On the pass</h2><span class="live-indicator"><span class="live-dot">Live · every 10 sec</span><button class="refresh-btn" data-action="refresh">${icon('refresh')}Refresh</button></span></div><div class="board">${['pending','preparing','ready'].map(status=>{const orders=S.orders.filter(o=>o.status===status).sort((a,b)=>a.starts_at.localeCompare(b.starts_at));return `<section class="board-col"><h3>${status[0].toUpperCase()+status.slice(1)}<span>${orders.length} orders</span></h3>${orders.length?orders.map(o=>orderCard(o,true)).join(''):'<div class="empty-col">All clear here.</div>'}</section>`;}).join('')}</div>`;
 }
 if(r==='reports')return `<div class="title-row"><div><h1>Every break tells a story.</h1><p>Today’s pickup and order summary · ${shortDate(S.today)}</p></div>${button(icon('refresh')+' Refresh','refresh','secondary')}</div>${statsRow()}${chart()}`;
 if(r==='people')return `<div class="title-row"><div><h1>Your campus community.</h1><p>${S.stats?.users?.length||0} accounts · role-based access</p></div></div><section class="panel table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>${(S.stats?.users||[]).map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td><span class="status-badge completed">${esc(u.role)}</span></td><td>${shortDate(u.created_at)}</td></tr>`).join('')}</tbody></table></section>`;
 if(r==='outlets')return `<div class="title-row"><div><h1>Every outlet, in sync.</h1><p>Manage opening status, menus and upcoming pickup capacity.</p></div></div><section class="panel">${S.catalog.map(o=>`<div class="manage-row"><div><strong>${esc(o.name)}</strong><small>${esc(o.location)} · ${o.capacity} orders / slot</small></div><div class="manage-actions">${rush(o)}<a class="btn secondary small-btn" href="#manage-menu/${o.id}">Menu</a>${button('Manage','edit-outlet','small-btn',`data-id="${o.id}"`)}</div></div>`).join('')}</section>`;
 if(r==='manage-menu') {
  const id=admin?Number(S.route.split('/')[1]||1):S.user.outlet_id;const o=outlet(id);if(!o)return empty('Outlet not found.','Choose an outlet to manage.');
  return `<div class="title-row"><div><h1>A menu worth coming back for.</h1><p>${esc(o.name)} · ${o.menu.length} items · prices in INR</p></div>${button(icon('plus')+' Add item','new-item','',`data-id="${o.id}"`)}</div><section class="panel">${o.menu.map(m=>`<div class="manage-row"><div><strong><span class="veg-mark ${m.veg?'':'nonveg'}"></span> ${esc(m.name)}</strong><small>${esc(m.category)} · ${m.available?'Available':'Sold out'}</small></div><div class="manage-actions"><span class="price">${money(m.price)}</span><button class="toggle ${m.available?'on':''}" data-action="toggle-item" data-id="${m.id}" aria-label="${m.available?'Mark unavailable':'Make available'}: ${esc(m.name)}" aria-pressed="${Boolean(m.available)}"></button>${button(icon('edit'),'edit-item','secondary small-btn',`data-id="${m.id}" aria-label="Edit ${esc(m.name)}"`)}</div></div>`).join('')}</section>`;
 }
 if(r==='capacity') {
  const o=outlet(S.user.outlet_id||1);
  return `<div class="title-row"><div><h1>A little breathing room.</h1><p>Control how many orders your kitchen accepts in each 15-minute window.</p></div>${button('Default capacity: '+o.capacity,'edit-outlet','secondary',`data-id="${o.id}"`)}</div><section class="panel"><label class="field"><span>Pickup date</span><input type="date" id="capacity-date" min="${S.today}" value="${S.pickupDate}" max="${datePlus(7)}"></label><div class="helper">${icon('shield')}Already booked orders keep their place. Capacity cannot be reduced below the number of bookings.</div><div class="table-wrap"><table><thead><tr><th>Pickup window</th><th>Booked</th><th>Capacity</th><th></th></tr></thead><tbody>${S.slots.map(s=>`<tr><td>${range(s)}</td><td>${s.booked} / ${s.capacity}</td><td><input class="input" type="number" min="${Math.max(1,s.booked)}" max="50" value="${s.capacity}" id="slot-cap-${s.id}" aria-label="Capacity for ${range(s)}"></td><td>${button('Save','save-slot','secondary small-btn',`data-id="${s.id}"`)}</td></tr>`).join('')}</tbody></table></div>${!S.slots.length?'<p class="muted small" style="margin-top:20px">No upcoming slots for this date. Choose a later day.</p>':''}</section>`;
 }
 return '';
}
function datePlus(days){const d=new Date(S.today+'T12:00:00+05:30');d.setUTCDate(d.getUTCDate()+days);return d.toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});}
function howPage(){return `<div class="title-row"><div><div class="eyebrow">Less waiting. More living.</div><h1>Good food fits your timetable.</h1><p>A simple way to give your break back to you.</p></div></div><div class="how-grid">${[['1','Find your flavour','Browse campus outlets, compare their rush levels and build your cart. Each order is from one outlet.'],['2','Reserve a little time','Choose the first available pickup window or schedule up to seven days ahead. Your place is reserved when you confirm.'],['3','Pick up & carry on','Track the kitchen’s progress, wait for Ready and show your order number at the outlet. Pay when you pick up.']].map(([n,t,d])=>`<section class="panel"><span class="number">${n}</span><h2>${t}</h2><p>${d}</p></section>`).join('')}</div><section class="panel"><h2>A few good things to know</h2>${[['How does the rush score work?','It is the number of booked orders divided by the capacity of the next pickup window. Up to 30% is low, over 30% to 70% is moderate, and above 70% is high. Completed orders still count toward their original window; cancelled orders release capacity.'],['What happens if a slot fills up?','The server checks capacity when your order is confirmed. If someone books the final place first, you will be asked to choose another slot. Adding items to a cart does not reserve a slot.'],['Can I cancel an order?','Yes, while it is Pending. As soon as preparation starts, cancellation is no longer available. Contact the outlet for other changes.'],['Is online payment required?','No. This college project uses pay at pickup. Confirmed totals are saved with the order and do not change if menu prices change later.'],['How do I try the outlet and admin dashboards?','Open the account menu and choose a demo role. Place a student order first, then switch to the matching outlet account to prepare it and mark it ready. All accounts use the same local database.']].map(([q,a])=>`<details class="faq"><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>${button('Let’s find something good '+icon('arrow'),'discover')}`;}

function showModal(content){const m=$('#modal');m.innerHTML=`<button class="icon-button modal-close" data-action="close-modal" aria-label="Close dialog">${icon('close')}</button>${content}`;if(!m.open)m.showModal();}
function authModal(register=false){
 showModal(`<div class="brand auth-logo"><span class="brand-mark">q.</span>QueueLess</div><h2 class="auth-heading">${register?'Your campus break starts here.':S.user?'Pick your campus perspective.':'Welcome to your better break.'}</h2><p class="auth-sub">${S.user?'Switch between student, outlet and admin demos.':'Sign in to order ahead and skip the wait.'}</p><form id="auth-form" data-register="${register}">${register?'<label class="field"><span>Your name</span><input name="name" autocomplete="name" minlength="2" maxlength="60" required placeholder="Aarav Sharma"></label>':''}<label class="field"><span>Email address</span><input name="email" type="email" autocomplete="email" required placeholder="you@college.edu"></label><label class="field"><span>Password</span><input name="password" type="password" autocomplete="${register?'new-password':'current-password'}" minlength="${register?8:1}" maxlength="128" required placeholder="${register?'At least 8 characters':'Enter your password'}"></label><p class="form-error" id="form-error" role="alert"></p><button class="btn full" type="submit">${register?'Create student account':'Sign in'} ${icon('arrow')}</button></form><p class="auth-switch">${register?'Already registered?':'New to QueueLess?'} <button data-action="${register?'auth-login':'auth-register'}">${register?'Sign in':'Create an account'}</button></p><div class="divider">OR EXPLORE THE DEMO</div><div class="demo-buttons"><button class="demo-button" data-action="demo" data-role="student">${icon('user')}Student</button><button class="demo-button" data-action="demo-outlet">${icon('shop')}Outlet team</button><button class="demo-button" data-action="demo" data-role="admin">${icon('chart')}Admin</button></div><p class="small muted" style="font-size:10px;margin:14px 0 0;text-align:center">Demo data is shared by accounts on this computer.</p>${S.user?button('Sign out','logout','text full','style="margin-top:12px"'):''}`);
}
function outletDemoModal(){showModal(`<h2 class="auth-heading">Which kitchen?</h2><p class="auth-sub">Open the dashboard for a campus outlet.</p>${S.catalog.map(o=>`<div class="manage-row"><div><strong>${esc(o.name)}</strong><small>${esc(o.category)}</small></div>${button('Open','demo','small-btn',`data-role="outlet" data-id="${o.id}"`)}</div>`).join('')}`);}
function editMenuModal(mid,outletId){const m=mid?menuItem(mid):null;showModal(`<h2 class="auth-heading">${m?'A fresh update.':'Something new on the menu.'}</h2><p class="auth-sub">${esc(outlet(m?.outlet_id||outletId)?.name)}</p><form id="menu-form" data-id="${mid||''}" data-outlet="${m?.outlet_id||outletId}"><label class="field"><span>Item name</span><input name="name" value="${esc(m?.name||'')}" maxlength="70" required></label><label class="field"><span>Description</span><textarea name="description" maxlength="240" required>${esc(m?.description||'')}</textarea></label><div class="field-row"><label class="field"><span>Price (₹)</span><input name="price" type="number" min="1" max="5000" step="1" value="${m?.price||99}" required></label><label class="field"><span>Category</span><input name="category" maxlength="30" value="${esc(m?.category||'Specials')}" required></label></div><label class="checkbox-row"><input name="veg" type="checkbox" ${!m||m.veg?'checked':''}>Vegetarian</label><label class="checkbox-row"><input name="available" type="checkbox" ${!m||m.available?'checked':''}>Available to order</label><p class="form-error" id="form-error" role="alert"></p><button type="submit" class="btn full">Save menu item</button></form>`);}
function editOutletModal(id){const o=outlet(id);showModal(`<h2 class="auth-heading">${esc(o.name)}</h2><p class="auth-sub">Give your kitchen the space to do its best work.</p><form id="outlet-form" data-id="${id}"><label class="field"><span>Orders per 15-minute slot</span><input name="capacity" type="number" min="1" max="50" value="${o.capacity}" required><small>This sets the default and updates all upcoming slots, including any custom capacities.</small></label><label class="checkbox-row"><input type="checkbox" name="is_open" ${o.is_open?'checked':''}>Accept new orders</label><div class="helper">${icon('shield')}Capacity cannot go below bookings already accepted. Pausing does not cancel existing orders.</div><p class="form-error" id="form-error" role="alert"></p><button type="submit" class="btn full">Save outlet settings</button></form>`);}
async function authenticate(email,password,registration){
 const result=await api(registration?'/register':'/login',{method:'POST',body:registration||{email,password}});
 S.user=result.user;S.csrf=result.csrf;S.orders=[];S.stats=null;S.dashboardFilter='active';
 if(S.user.role!=='student'){S.cart={outlet:null,items:[]};saveCart();}
 $('#modal').close();toast(`Welcome, ${S.user.name.split(' ')[0]}.`);
 const target=S.authReturn&&S.user.role==='student'?S.authReturn:S.user.role==='student'?'discover':'dashboard';S.authReturn=null;
 go(target);
}
async function loadCatalog(){const data=await api('/catalog');S.catalog=data.outlets;S.today=data.today;if(!S.pickupDate||S.pickupDate<S.today)S.pickupDate=S.today;}
async function loadSlots(capacity=false){
 const id=capacity?S.user?.outlet_id||1:S.cart.outlet;if(!id)return;
 const data=await api(`/slots?outlet_id=${id}&date=${encodeURIComponent(S.pickupDate)}`);S.slots=data.slots;S.recommended=data.recommended_id;
 if(!S.slots.some(s=>s.id===S.selected&&s.available)) S.selected=S.pickupMode==='now'?S.slots.find(s=>s.available)?.id||null:S.recommended;
}
async function loadRoute(){
 const version=++routeVersion;S.route=location.hash.slice(1)||'discover';
 if(!['outlet','manage-menu'].includes(S.route.split('/')[0]))S.menuCategory='All items';
 if(S.route.startsWith('outlet/')&&S.menuRoute!==S.route){S.menuCategory='All items';S.menuRoute=S.route;}
 try{
  const jobs=[];
  if(S.user)jobs.push(api('/orders').then(d=>{S.orders=d.orders;}));
  if(S.user&&S.user.role!=='student')jobs.push(api('/stats').then(d=>{S.stats=d;}));
  if(S.route==='checkout'&&S.cart.items.length&&S.user?.role==='student')jobs.push(loadSlots());
  if(S.route==='capacity'&&S.user?.role!=='student'&&S.user)jobs.push(loadSlots(true));
  if(jobs.length){S.loading=true;render();await Promise.all(jobs);}if(version!==routeVersion)return;
  S.loading=false;render();window.scrollTo({top:0,behavior:'instant'});
 }catch(e){if(version!==routeVersion)return;S.loading=false;render();toast(e.message,true);}
}
async function refresh(silent=false){
 await loadCatalog();if(S.user){S.orders=(await api('/orders')).orders;if(S.user.role!=='student')S.stats=await api('/stats');}
 if(S.route==='capacity')await loadSlots(true);if(S.route==='checkout')await loadSlots();render();if(!silent)toast('All caught up.');
}
function addItem(id,replace=false){
 const item=menuItem(id);if(!item||!item.available||!outlet(item.outlet_id)?.is_open)return;
 if(S.user&&S.user.role!=='student'){toast('Switch to a student account to place an order.');authModal();return;}
 if(S.cart.items.length&&S.cart.outlet!==item.outlet_id&&!replace){showModal(`<h2 class="auth-heading">A different kind of craving?</h2><p class="auth-sub">Each order comes from one outlet. Start a new cart at ${esc(outlet(item.outlet_id).name)} and replace the current items?</p>${button('Start a new cart','replace-cart','full',`data-id="${id}"`)}${button('Keep my current cart','close-modal','secondary full','style="margin-top:10px"')}`);return;}
 if(replace){S.cart={outlet:item.outlet_id,items:[]};$('#modal').close();}
 if(cartCount()>=10){toast('Up to 10 items fit in one pickup order.',true);return;}
 S.cart.outlet=item.outlet_id;const line=S.cart.items.find(i=>i.id===id);if(line)line.quantity++;else S.cart.items.push({id,quantity:1});saveCart();render();
}

document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-action]');if(!b||b.disabled)return;const action=b.dataset.action,id=Number(b.dataset.id),value=b.dataset.value;
 try{
  if(action==='discover')go('discover');
  else if(action==='help')go('how-it-works');
  else if(action==='orders')go(S.user?.role==='outlet'?'dashboard':'orders');
  else if(action==='account'||action==='auth-login')authModal();
  else if(action==='auth-register')authModal(true);
  else if(action==='close-modal')$('#modal').close();
  else if(action==='explore')$('#outlets-section').scrollIntoView({behavior:'smooth'});
  else if(action==='scroll-cart')$('#cart-panel').scrollIntoView({behavior:'smooth'});
  else if(action==='filter'){S.category=value;render();}
  else if(action==='reset-search'){S.search='';S.category='All spots';render();}
  else if(action==='menu-filter'){S.menuCategory=value;render();}
  else if(action==='veg'){S.veg=!S.veg;render();}
  else if(action==='add'||action==='replace-cart')addItem(id,action==='replace-cart');
  else if(action==='minus'){const line=S.cart.items.find(i=>i.id===id);if(line){line.quantity--;S.cart.items=S.cart.items.filter(i=>i.quantity>0);if(!S.cart.items.length)S.cart.outlet=null;saveCart();render();}}
  else if(action==='checkout'){S.pickupDate=S.today;S.pickupMode='now';S.selected=null;S.note='';go('checkout');if(!S.user){S.authReturn='checkout';authModal();}}
  else if(action==='login-checkout'){S.authReturn='checkout';authModal();}
  else if(action==='demo-outlet')outletDemoModal();
  else if(action==='demo'){b.disabled=true;const role=b.dataset.role;const email=role==='outlet'&&id>1?`outlet${id}@queueless.demo`:`${role}@queueless.demo`;await authenticate(email,'Campus@123');}
  else if(action==='logout'){await api('/logout',{method:'POST',body:{}});S.user=null;S.csrf=null;S.orders=[];S.stats=null;S.cart={outlet:null,items:[]};saveCart();$('#modal').close();go('discover');toast('You’re signed out.');}
  else if(action==='select-slot'){S.selected=id;S.checkoutKey=null;render();}
  else if(action==='schedule-mode'||action==='pickup-mode'){S.pickupMode=action==='schedule-mode'?'schedule':value;if(S.pickupMode==='now')S.pickupDate=S.today;S.selected=null;await loadSlots();render();}
  else if(action==='order-filter'){S.dashboardFilter=value;render();}
  else if(action==='refresh'){b.disabled=true;await refresh();}
  else if(action==='place-order'){
   if(S.busy)return;S.busy=true;S.checkoutKey=S.checkoutKey||crypto.randomUUID();render();
   try{const order=await api('/orders',{method:'POST',body:{slot_id:S.selected,items:S.cart.items,note:S.note,request_key:S.checkoutKey}});S.cart={outlet:null,items:[]};saveCart();S.note='';S.dashboardFilter='active';await loadCatalog();go('orders');toast(`You’re booked! ${order.id} · ${time(order.starts_at)}`);}
   catch(err){await loadSlots();render();throw err;}finally{S.busy=false;render();}
  }
  else if(action==='cancel-order'){showModal(`<h2 class="auth-heading">Cancel this food break?</h2><p class="auth-sub">Your pending order ${esc(b.dataset.id)} will be cancelled and its pickup place released.</p>${button('Yes, cancel order','confirm-cancel','danger full',`data-order="${esc(b.dataset.id)}"`)}${button('Keep my order','close-modal','secondary full','style="margin-top:10px"')}`);}
  else if(action==='confirm-cancel'){b.disabled=true;await api('/orders/'+encodeURIComponent(b.dataset.order),{method:'PATCH',body:{status:'cancelled'}});$('#modal').close();await refresh(true);toast('Order cancelled. Your pickup place has been released.');}
  else if(action==='advance'){b.disabled=true;await api('/orders/'+encodeURIComponent(b.dataset.id),{method:'PATCH',body:{status:value}});await refresh(true);toast(value==='ready'?'Ready for pickup. The student’s order tracker has been updated.':'Order updated.');}
  else if(action==='toggle-item'){b.disabled=true;await api('/menu/'+id,{method:'PATCH',body:{available:!menuItem(id).available}});await loadCatalog();render();toast('Menu availability updated.');}
  else if(action==='edit-item')editMenuModal(id);
  else if(action==='new-item')editMenuModal(null,id);
  else if(action==='edit-outlet')editOutletModal(id);
  else if(action==='toggle-outlet'){b.disabled=true;await api('/outlets/'+id,{method:'PATCH',body:{is_open:!outlet(id).is_open}});await loadCatalog();render();toast('Outlet status updated.');}
  else if(action==='save-slot'){b.disabled=true;const capacity=Number($('#slot-cap-'+id).value);await api('/slots/'+id,{method:'PATCH',body:{capacity}});await loadSlots(true);render();toast('Slot capacity saved.');}
 }catch(err){b.disabled=false;const error=$('#form-error');if(error&&$('#modal').open)error.textContent=err.message;else toast(err.message,true);}
});
document.addEventListener('input',e=>{if(e.target.id==='outlet-search'){S.search=e.target.value;$('#outlet-results').innerHTML=outletCards();}if(e.target.id==='order-note'){S.note=e.target.value;S.checkoutKey=null;}});
document.addEventListener('change',async e=>{if(['pickup-date','capacity-date'].includes(e.target.id)){S.pickupDate=e.target.value;S.selected=null;S.checkoutKey=null;try{await loadSlots(e.target.id==='capacity-date');render();}catch(err){toast(err.message,true);}}});
document.addEventListener('submit',async e=>{
 const form=e.target;if(!['auth-form','menu-form','outlet-form'].includes(form.id))return;e.preventDefault();const submit=$('button[type="submit"]',form);submit.disabled=true;const data=new FormData(form);const error=$('#form-error');if(error)error.textContent='';
 try{
  if(form.id==='auth-form'){const body=Object.fromEntries(data);await authenticate(body.email,body.password,form.dataset.register==='true'?body:null);}
  else if(form.id==='menu-form'){const body={name:data.get('name'),description:data.get('description'),price:Number(data.get('price')),category:data.get('category'),veg:data.has('veg'),available:data.has('available'),outlet_id:Number(form.dataset.outlet)};await api('/menu'+(form.dataset.id?'/'+form.dataset.id:''),{method:form.dataset.id?'PATCH':'POST',body});$('#modal').close();await loadCatalog();render();toast('The menu is looking good. Changes saved.');}
  else{await api('/outlets/'+form.dataset.id,{method:'PATCH',body:{capacity:Number(data.get('capacity')),is_open:data.has('is_open')}});$('#modal').close();await refresh(true);toast('Outlet settings saved.');}
 }catch(err){if(error)error.textContent=err.message;else toast(err.message,true);}finally{submit.disabled=false;}
});
window.addEventListener('hashchange',loadRoute);
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
async function poll(){
 if(document.hidden||S.busy||$('#modal').open)return;
 try{
  const session=await api('/session');
  if(session.user?.id!==S.user?.id){S.user=session.user;S.csrf=session.csrf;S.orders=[];S.stats=null;toast('Your account session changed.');await loadRoute();return;}
  if(['discover'].includes(S.route)||S.route.startsWith('outlet/')){
   const previous=JSON.stringify(S.catalog);await loadCatalog();
   if(previous!==JSON.stringify(S.catalog)){
    if(document.activeElement?.id==='outlet-search')$('#outlet-results').innerHTML=outletCards();
    else render();
   }
  }
  if(!S.user)return;
  const data=await api('/orders');const changed=JSON.stringify(data.orders)!==JSON.stringify(S.orders);const old=new Map(S.orders.map(o=>[o.id,o.status]));
  for(const o of data.orders)if(old.has(o.id)&&old.get(o.id)!==o.status&&S.user.role==='student')toast(o.status==='ready'?`Your order ${o.id} is ready. Time for a good break!`:`${o.id} is now ${o.status}.`);
  S.orders=data.orders;
  if(['orders','dashboard','reports'].includes(S.route)&&changed){if(S.user.role!=='student')S.stats=await api('/stats');render();}
 }catch{/* Keep the current view intact if a background refresh fails. */}
}
async function init(){try{const [session]=await Promise.all([api('/session'),loadCatalog()]);S.user=session.user;S.csrf=session.csrf;await loadRoute();setInterval(poll,10000);}catch(err){$('#app').innerHTML=`<div class="content">${empty('The kitchen is still warming up.',esc(err.message),'retry','Try again','refresh')}</div>`;document.addEventListener('click',e=>{if(e.target.closest('[data-action="retry"]'))location.reload();},{once:true});}}
init();
