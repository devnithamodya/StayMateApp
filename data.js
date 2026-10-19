/* StayMate browser-local model. No real authentication, identity checks or payments. */
const DB_KEY='staymate-demo-v1';
const uid=()=>crypto.randomUUID();
const today=()=>new Date().toISOString();
async function digest(password,salt){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+password));return Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');}
async function seed(){
 const users=await Promise.all([['user','Nethmi Perera','student@staymate.demo'],['owner','Amal Silva','owner@staymate.demo'],['admin','StayMate Admin','admin@staymate.demo']].map(async([id,name,email])=>({id,name,email,role:id,phone:'',businessName:id==='owner'?'Amal Homes':'',address:'',university:id==='user'?'University of Colombo':'',salt:id,hash:await digest('Demo1234!',id),blocked:false,created:today()})));
 const properties=[
 ['p1','Bright studio near campus','Colombo','Nugegoda',28000,'Studio','Any','A quiet, light-filled studio with a private bathroom, study area and easy access to buses. Water and Wi-Fi included.','12 Sample Lane',6.8649,79.8997,'lavender'],
 ['p2','A room with a greener view','Kandy','Peradeniya',18000,'Single room','Female','A comfortable room in a peaceful shared home near the university. Shared kitchen, garden and a dedicated study desk.','8 Example Garden Road',7.2699,80.5938,'sage'],
 ['p3','Room to share, space to study','Galle','Karapitiya',14000,'Shared room','Male','An affordable shared room with two beds, good ventilation and nearby shops. Monthly rent is per person.','24 Sample Hospital Road',6.0676,80.2266,'peach'],
 ['p4','Your own little city retreat','Colombo','Dehiwala',32000,'Annex','Any','A self-contained annex with a compact kitchen and private entrance. Ideal for students who prefer independent living.','5 Example Coast Road',6.8513,79.8658,'blue']
 ].map(([id,title,district,city,price,roomtype,gender,description,address,latitude,longitude,theme])=>({id,title,district,city,price,roomtype,gender,description,address,latitude,longitude,theme,ownerId:'owner',availability:'Available',status:'Approved',images:[],verified:id==='p1',verification:id==='p1'?'Verified':'Not requested',boostUntil:id==='p1'?new Date(Date.now()+7*86400000).toISOString():null,created:today(),updated:today()}));
 return {users,properties,favorites:[],reviews:[],payments:[],roomTypes:['Single room','Shared room','Studio','Annex']};
}
let db;
const ready=(async()=>{const raw=localStorage.getItem(DB_KEY);db=raw?JSON.parse(raw):await seed();if(!raw)save();return db;})();
function save(){localStorage.setItem(DB_KEY,JSON.stringify(db));}
function currentUser(){const id=sessionStorage.getItem('staymate-session')||localStorage.getItem('staymate-session');return db.users.find(u=>u.id===id&&!u.blocked)||null;}
function signIn(user,remember=false){sessionStorage.setItem('staymate-session',user.id);if(remember)localStorage.setItem('staymate-session',user.id);else localStorage.removeItem('staymate-session');}
function signOut(){sessionStorage.removeItem('staymate-session');localStorage.removeItem('staymate-session');}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function money(n){return 'LKR '+Number(n).toLocaleString('en-LK');}
function boosted(p){return p.boostUntil&&new Date(p.boostUntil)>new Date();}
function approved(p){return p.status==='Approved'&&!db.users.find(u=>u.id===p.ownerId)?.blocked;}
function removeProperty(id){db.properties=db.properties.filter(p=>p.id!==id);db.favorites=db.favorites.filter(f=>f.propertyId!==id);db.reviews=db.reviews.filter(r=>r.propertyId!==id);save();}
