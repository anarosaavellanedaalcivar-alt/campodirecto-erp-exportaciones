const STORAGE_KEY = "campodirecto_exports_v1";
let exportsData = loadData();
const $ = id => document.getElementById(id);
const money = (n, currency="USD") => {
  try { return new Intl.NumberFormat("es-EC",{style:"currency",currency,maximumFractionDigits:2}).format(Number(n)||0); }
  catch { return `${Number(n||0).toFixed(2)} ${currency}`; }
};
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function loadData(){ try { const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); return Array.isArray(raw)?raw:[]; } catch { return []; } }
function saveData(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(exportsData)); }
function getCosts(record){ return ["packagingCost","localCost","freightCost","insuranceCost","otherCost"].reduce((sum,key)=>sum+Number(record[key]||0),0); }
function getCommercial(record){ return Number(record.quantity||0)*Number(record.unitPrice||0); }
function toast(message){ const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600); }
function currentFormCosts(){ return ["packaging-cost","local-cost","freight-cost","insurance-cost","other-cost"].reduce((sum,id)=>sum+Number($(id).value||0),0); }
function updateCalculator(){
 const qty=Number($("quantity").value||0), price=Number($("unit-price").value||0), commercial=qty*price, costs=currentFormCosts();
 const currency=$("currency").value;
 $("calculated-value").textContent=money(commercial,currency);
 $("summary-commercial").textContent=money(commercial,currency);
 $("summary-costs").textContent=money(costs,currency);
 $("summary-margin").textContent=money(commercial-costs,currency);
}
["quantity","unit-price","currency","packaging-cost","local-cost","freight-cost","insurance-cost","other-cost"].forEach(id=>$(id).addEventListener("input",updateCalculator));
function statusClass(status){if(status==="En tránsito")return"transit";if(status==="Entregada")return"done";if(status==="Cancelada")return"cancel";return"";}
function render(){
 const total=exportsData.reduce((s,r)=>s+getCommercial(r),0);
 $("metric-operations").textContent=exportsData.length;
 $("metric-value").textContent=money(total);
 $("metric-transit").textContent=exportsData.filter(r=>r.status==="En tránsito").length;
 $("metric-countries").textContent=new Set(exportsData.map(r=>r.country)).size;
 const statuses=["Planificada","Documentación","En preparación","En tránsito","Entregada","Cancelada"];
 $("status-summary").innerHTML=statuses.map(s=>`<div class="status-item"><span>${s}</span><b>${exportsData.filter(r=>r.status===s).length}</b></div>`).join("");
 $("report-total").textContent=money(total);
 $("report-costs").textContent=money(exportsData.reduce((s,r)=>s+getCosts(r),0));
 $("report-delivered").textContent=exportsData.filter(r=>r.status==="Entregada").length;
 const counts={};exportsData.forEach(r=>counts[r.product]=(counts[r.product]||0)+1);
 $("report-product").textContent=Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0]||"—";
 renderTable();
}
function renderTable(){
 const query=$("search").value.trim().toLowerCase(), status=$("status-filter").value;
 const rows=exportsData.filter(r=>(!status||r.status===status)&&[r.reference,r.product,r.buyer,r.country].some(v=>String(v).toLowerCase().includes(query)));
 $("exports-table").innerHTML=rows.map(r=>`<tr>
 <td><b>${escapeHTML(r.reference)}</b><span class="sub-cell">${escapeHTML(r.incoterm)} · ${escapeHTML(r.currency)}</span></td>
 <td>${escapeHTML(r.product)}<span class="sub-cell">${Number(r.quantity).toLocaleString("es-EC")} ${escapeHTML(r.unit)}</span></td>
 <td>${escapeHTML(r.buyer)}<span class="sub-cell">${escapeHTML(r.country)}</span></td>
 <td>${escapeHTML(r.date||"—")}</td><td><b>${money(getCommercial(r),r.currency)}</b></td>
 <td><span class="status-pill ${statusClass(r.status)}">${escapeHTML(r.status)}</span></td>
 <td><div class="row-actions"><button class="small-btn" data-action="view" data-id="${r.id}">Ver</button><button class="small-btn" data-action="delete" data-id="${r.id}">Eliminar</button></div></td></tr>`).join("");
 $("empty-state").style.display=rows.length?"none":"block";
}
function formValue(id){return $(id).value.trim();}
function readForm(){
 const docs=[...document.querySelectorAll('input[name="doc"]:checked')].map(x=>x.value);
 return {id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),reference:formValue("reference"),date:formValue("date"),product:formValue("product"),description:formValue("description"),buyer:formValue("buyer"),country:formValue("country"),contact:formValue("contact"),currency:formValue("currency"),quantity:Number(formValue("quantity")),unit:formValue("unit"),unitPrice:Number(formValue("unit-price")),incoterm:formValue("incoterm"),transport:formValue("transport"),originCountry:formValue("origin-country"),origin:formValue("origin"),destination:formValue("destination"),departure:formValue("departure"),arrival:formValue("arrival"),carrier:formValue("carrier"),tracking:formValue("tracking"),packagingCost:Number(formValue("packaging-cost")||0),localCost:Number(formValue("local-cost")||0),freightCost:Number(formValue("freight-cost")||0),insuranceCost:Number(formValue("insurance-cost")||0),otherCost:Number(formValue("other-cost")||0),status:formValue("status"),documents:docs,notes:formValue("notes"),createdAt:new Date().toISOString()};
}
$("export-form").addEventListener("submit",e=>{
 e.preventDefault();const record=readForm();
 if(exportsData.some(r=>r.reference.toLowerCase()===record.reference.toLowerCase())){toast("Ya existe una operación con esa referencia.");$("reference").focus();return;}
 if(record.arrival&&record.departure&&record.arrival<record.departure){toast("La llegada estimada no puede ser anterior a la salida.");return;}
 exportsData.unshift(record);saveData();render();e.target.reset();$("origin-country").value="Ecuador";updateCalculator();toast("Exportación registrada correctamente.");location.hash="#exports";
});
$("search").addEventListener("input",renderTable);$("status-filter").addEventListener("change",renderTable);
$("exports-table").addEventListener("click",e=>{
 const btn=e.target.closest("button[data-action]");if(!btn)return;
 const record=exportsData.find(r=>r.id===btn.dataset.id);if(!record)return;
 if(btn.dataset.action==="delete"){
  if(!confirm(`¿Eliminar la exportación ${record.reference}?`))return;
  exportsData=exportsData.filter(r=>r.id!==record.id);saveData();render();toast("Operación eliminada.");return;
 }
 const fields=[["Referencia",record.reference],["Fecha",record.date],["Producto",record.product],["Cantidad",`${record.quantity} ${record.unit}`],["Comprador",record.buyer],["Destino",record.country],["Contacto",record.contact],["Incoterm",record.incoterm],["Valor comercial",money(getCommercial(record),record.currency)],["Transporte",record.transport],["Origen",record.origin],["Destino logístico",record.destination],["Salida estimada",record.departure],["Llegada estimada",record.arrival],["Transportista",record.carrier],["Seguimiento",record.tracking],["Estado",record.status],["Costos registrados",money(getCosts(record),record.currency)],["Documentos marcados",(record.documents||[]).join(", ")||"Ninguno"],["Observaciones",record.notes||"—"]];
 $("detail-content").innerHTML=`<div class="detail-grid">${fields.map(([k,v])=>`<div><small>${escapeHTML(k)}</small><b>${escapeHTML(v||"—")}</b></div>`).join("")}</div>`;
 $("detail-dialog").showModal();
});
$("close-dialog").addEventListener("click",()=>$("detail-dialog").close());
$("detail-dialog").addEventListener("click",e=>{if(e.target===$("detail-dialog"))$("detail-dialog").close();});
$("export-csv").addEventListener("click",()=>{
 if(!exportsData.length){toast("No hay registros para descargar.");return;}
 const headers=["Referencia","Fecha","Producto","Descripción","Comprador","País destino","Contacto","Moneda","Cantidad","Unidad","Precio unitario","Incoterm","Transporte","País origen","Lugar salida","Lugar destino","Salida estimada","Llegada estimada","Transportista","Seguimiento","Embalaje","Transporte interno","Flete internacional","Seguro","Otros gastos","Costos totales","Valor comercial","Estado","Documentos","Observaciones"];
 const values=r=>[r.reference,r.date,r.product,r.description,r.buyer,r.country,r.contact,r.currency,r.quantity,r.unit,r.unitPrice,r.incoterm,r.transport,r.originCountry,r.origin,r.destination,r.departure,r.arrival,r.carrier,r.tracking,r.packagingCost,r.localCost,r.freightCost,r.insuranceCost,r.otherCost,getCosts(r),getCommercial(r),r.status,(r.documents||[]).join("; "),r.notes];
 const csv=[headers,...exportsData.map(values)].map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");
 const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="campodirecto-exportaciones.csv";a.click();URL.revokeObjectURL(url);toast("Reporte CSV descargado.");
});
$("date").value=new Date().toISOString().slice(0,10);
updateCalculator();render();
