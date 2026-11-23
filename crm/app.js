const $ = (id) => document.getElementById(id);
const STORE = "campodirecto_crm_v1";
const initial = {
  clients: [
    {id:1,name:"Comercial Andina",type:"Distribuidor",location:"Quito, Ecuador",email:"compras@comercialandina.ec",phone:"099 000 0000",status:"Activo"},
    {id:2,name:"Agroexportadora del Norte",type:"Exportador",location:"Tulcán, Ecuador",email:"contacto@agronorte.ec",phone:"098 000 0000",status:"Activo"},
    {id:3,name:"Mercados del Valle",type:"Comprador",location:"Ibarra, Ecuador",email:"ventas@mercadosvalle.ec",phone:"097 000 0000",status:"Pendiente"}
  ],
  producers: [
    {id:1,name:"Productores San Gabriel",location:"Montúfar, Carchi",products:"Papa, fréjol, arveja",phone:""},
    {id:2,name:"Asociación Tierra Fértil",location:"Tulcán, Carchi",products:"Cebada, trigo, haba",phone:""},
    {id:3,name:"Finca El Porvenir",location:"Mira, Carchi",products:"Tomate de árbol, maíz",phone:""}
  ],
  opportunities: [
    {id:1,title:"Abastecimiento de papa",client:"Comercial Andina",product:"Papa",stage:"En negociación",value:1250},
    {id:2,title:"Compra de fréjol",client:"Mercados del Valle",product:"Fréjol",stage:"Contacto inicial",value:780},
    {id:3,title:"Oferta de trigo",client:"Agroexportadora del Norte",product:"Trigo",stage:"Propuesta enviada",value:2100}
  ],
  quotes:[]
};
let data;
try { data = JSON.parse(localStorage.getItem(STORE)) || initial; } catch { data = initial; }
const save = () => localStorage.setItem(STORE, JSON.stringify(data));
const money = n => new Intl.NumberFormat("es-EC",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number(n)||0);
const safe = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(message){const t=$("toast");t.textContent=message;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)}
function switchView(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${name}`));
  document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  const active=document.querySelector(`.nav-link[data-view="${name}"]`);
  $("breadcrumbCurrent").textContent=active?active.textContent.trim():"Panel general";
  $("sidebar").classList.remove("open"); render();
}
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.goto)));
$("mobileMenu").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
function render(){
  $("metricClients").textContent=data.clients.length;
  $("metricProducers").textContent=data.producers.length;
  $("metricOpportunities").textContent=data.opportunities.length;
  $("metricValue").textContent=money(data.opportunities.reduce((s,o)=>s+Number(o.value||0),0));
  $("clientNavCount").textContent=data.clients.length;
  renderClients(); renderProducers(); renderOpportunities(); renderQuotes(); renderRecent();
}
function renderRecent(){
  $("recentOpportunities").innerHTML=data.opportunities.slice(0,4).map(o=>`<tr><td><span class="table-primary">${safe(o.title)}</span><span class="table-secondary">${safe(o.product)}</span></td><td>${safe(o.client)}</td><td><span class="status ${o.stage==="Cerrada"?"closed":o.stage==="Contacto inicial"?"pending":""}">${safe(o.stage)}</span></td><td><strong>${money(o.value)}</strong></td></tr>`).join("") || `<tr><td colspan="4">Todavía no hay oportunidades.</td></tr>`;
}
function renderClients(){
  const q=($("clientSearch")?.value||"").toLowerCase();
  const rows=data.clients.filter(c=>[c.name,c.type,c.location,c.email].join(" ").toLowerCase().includes(q));
  $("clientCount").textContent=`${rows.length} contactos`;
  $("clientsTable").innerHTML=rows.map(c=>`<tr><td><span class="table-primary">${safe(c.name)}</span><span class="table-secondary">${safe(c.email)}</span></td><td>${safe(c.type)}</td><td>${safe(c.location)}</td><td>${safe(c.phone||"—")}</td><td><span class="status ${c.status==="Pendiente"?"pending":""}">${safe(c.status)}</span></td><td><button class="text-button" data-delete-client="${c.id}">Eliminar</button></td></tr>`).join("");
  $("clientsEmpty").classList.toggle("show",rows.length===0);
  $("clientsTable").parentElement.style.display=rows.length?"":"none";
  document.querySelectorAll("[data-delete-client]").forEach(b=>b.addEventListener("click",()=>{if(confirm("¿Eliminar este contacto?")){data.clients=data.clients.filter(c=>c.id!==Number(b.dataset.deleteClient));save();render();toast("Contacto eliminado");}}));
}
function renderProducers(){
  $("producerGrid").innerHTML=data.producers.map(p=>`<article class="producer-card"><div class="metric-icon lime">♧</div><h3>${safe(p.name)}</h3><p>⌖ ${safe(p.location)}</p>${p.products.split(",").map(x=>`<span class="crop">${safe(x.trim())}</span>`).join("")}</article>`).join("") || `<div class="panel" style="padding:25px">Todavía no hay productores registrados.</div>`;
}
function renderOpportunities(){
  const stages=["Contacto inicial","En negociación","Propuesta enviada","Cerrada"];
  $("pipelineSummary").innerHTML=stages.map(s=>`<div class="pipeline-box"><span>${s}</span><strong>${data.opportunities.filter(o=>o.stage===s).length}</strong></div>`).join("");
  $("opportunitiesTable").innerHTML=data.opportunities.map(o=>`<tr><td><span class="table-primary">${safe(o.title)}</span></td><td>${safe(o.client)}</td><td>${safe(o.product)}</td><td><span class="status ${o.stage==="Contacto inicial"?"pending":o.stage==="Cerrada"?"closed":""}">${safe(o.stage)}</span></td><td><strong>${money(o.value)}</strong></td></tr>`).join("");
  $("opportunitiesEmpty").classList.toggle("show",data.opportunities.length===0);
  $("opportunitiesTable").parentElement.style.display=data.opportunities.length?"":"none";
}
function renderQuotes(){
  $("quotesTable").innerHTML=data.quotes.map(q=>`<tr><td>${safe(q.client)}</td><td>${safe(q.product)}</td><td>${safe(q.quantity)}</td><td><strong>${money(q.value)}</strong></td><td>${safe(q.date)}</td></tr>`).join("");
}
$("clientSearch").addEventListener("input",renderClients);
let currentType="";
function openModal(type){
  currentType=type;
  const config={
    client:{title:"Registrar cliente",fields:[["name","Nombre o empresa","text",true],["type","Tipo de cliente","select",true,["Comprador","Distribuidor","Exportador","Importador","Consumidor"]],["location","Ciudad / país","text",true],["email","Correo electrónico","email",false],["phone","Teléfono","text",false],["status","Estado","select",true,["Activo","Pendiente"]]]},
    producer:{title:"Registrar productor",fields:[["name","Nombre del productor o asociación","text",true],["location","Ubicación","text",true],["products","Productos agrícolas (separados por coma)","text",true],["phone","Teléfono","text",false]]},
    opportunity:{title:"Nueva oportunidad",fields:[["title","Nombre de la oportunidad","text",true],["client","Cliente","select",true,data.clients.map(c=>c.name)],["product","Producto agrícola","text",true],["stage","Etapa comercial","select",true,["Contacto inicial","En negociación","Propuesta enviada","Cerrada"]],["value","Valor estimado en USD","number",true]]},
    quote:{title:"Registrar cotización",fields:[["client","Cliente","select",true,data.clients.map(c=>c.name)],["product","Producto","text",true],["quantity","Cantidad / unidad","text",true],["value","Valor total en USD","number",true]]}
  };
  const c=config[type]; $("modalTitle").textContent=c.title;
  $("formFields").innerHTML=c.fields.map(([name,label,inputType,required,options])=>{
    let input=inputType==="select"?`<select name="${name}" ${required?"required":""}>${(options||[]).map(o=>`<option value="${safe(o)}">${safe(o)}</option>`).join("")}</select>`:`<input name="${name}" type="${inputType}" ${required?"required":""} ${inputType==="number"?'min="0" step="0.01"':""} placeholder="${label}">`;
    return `<div class="field ${name==="products"||name==="title"?"full":""}"><label>${label}${required?" *":""}</label>${input}</div>`;
  }).join("");
  $("modalBackdrop").classList.add("show");
}
function closeModal(){$("modalBackdrop").classList.remove("show")}
["addClient","addClientTop","quickClient","emptyAddClient"].forEach(id=>$(id).addEventListener("click",()=>openModal("client")));
$("addProducer").addEventListener("click",()=>openModal("producer"));
["addOpportunity","emptyAddOpportunity"].forEach(id=>$(id).addEventListener("click",()=>openModal("opportunity")));
["addQuote","quoteStart"].forEach(id=>$(id).addEventListener("click",()=>openModal("quote")));
$("closeModal").addEventListener("click",closeModal); $("cancelModal").addEventListener("click",closeModal);
$("modalBackdrop").addEventListener("click",e=>{if(e.target===$("modalBackdrop"))closeModal()});
$("recordForm").addEventListener("submit",e=>{
  e.preventDefault(); const obj=Object.fromEntries(new FormData(e.target).entries()); const id=Date.now();
  if(currentType==="client")data.clients.unshift({id,...obj});
  if(currentType==="producer")data.producers.unshift({id,...obj});
  if(currentType==="opportunity")data.opportunities.unshift({...obj,id,value:Number(obj.value)});
  if(currentType==="quote")data.quotes.unshift({...obj,id,value:Number(obj.value),date:new Date().toLocaleDateString("es-EC")});
  save(); closeModal(); e.target.reset(); render(); toast("Registro guardado correctamente");
});
render();