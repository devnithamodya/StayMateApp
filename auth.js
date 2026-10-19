ready.then(()=>{
 const form=document.querySelector('#auth-form'),message=document.querySelector('#auth-message');
 document.querySelectorAll('.input-group').forEach((group,i)=>{const input=group.querySelector('input,select'),label=group.querySelector('label');if(input&&label){input.id=input.id||'field-'+i;label.htmlFor=input.id;}});
 document.querySelector('#toggle-password')?.addEventListener('click',e=>{const p=form.elements.password;p.type=p.type==='password'?'text':'password';e.currentTarget.setAttribute('aria-label',p.type==='password'?'Show password':'Hide password');});
 document.querySelector('#forgot')?.addEventListener('click',e=>{e.preventDefault();message.textContent='This local demo cannot send reset emails. Use a demo account below, or create another account with a different email.';});
 document.querySelectorAll('[data-demo]').forEach(b=>b.addEventListener('click',()=>{const u=db.users.find(u=>u.id===b.dataset.demo);if(u.blocked){message.textContent='This demo account is blocked. Sign in as Admin to unblock it.';return;}signIn(u);location.href='index.html';}));
 form.addEventListener('submit',async e=>{e.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;message.textContent='';try{
  const d=Object.fromEntries(new FormData(form));const email=d.email.trim().toLowerCase();
  if(form.elements.confirm){
   if(d.password!==d.confirm)throw Error('Passwords do not match.');
   if(!d.name.trim())throw Error('Please enter your full name.');
   if(db.users.some(u=>u.email===email))throw Error('An account with this email already exists. Please sign in.');
   const salt=uid();const u={id:uid(),name:d.name.trim(),email,phone:d.phonenum||'',role:d.role,salt,hash:await digest(d.password,salt),blocked:false,created:today()};
   db.users.push(u);save();signIn(u);
  }else{const u=db.users.find(u=>u.email===email);if(!u||await digest(d.password,u.salt)!==u.hash)throw Error('Email or password is incorrect.');if(u.blocked)throw Error('This account is blocked. Contact the demo administrator.');signIn(u,!!d.remember);}
  location.href='index.html';
 }catch(err){message.textContent=err.message;}finally{button.disabled=false;}});
}).catch(()=>{document.querySelector('#auth-message').textContent='Browser storage is unavailable. Open this app using the included local server.';});
