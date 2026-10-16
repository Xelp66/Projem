
/* GFB application journey. Uses the existing client-side inventory and laboratory calculator. */
(function(){
  "use strict";
  const JFEE2026={
    gfb:{"1":{net:33041.67,gross:39650},"2":{net:11250,gross:13500}},
    air:{"1":{net:89416.67,gross:107300},"2":{net:33041.67,gross:39650}},
    water:{"1":{net:70000,gross:84000},"2":{net:28875,gross:34650}}
  };
  const LINKS={
    regulation:"https://www.lexpera.com.tr/mevzuat/yonetmelikler/cevre-izin-ve-lisans-yonetmeligi",
    fees:"https://webdosya.csb.gov.tr/v2/canakkale/2026/03/2026-Birim-Fiyat-Listesi-20260102-20260303154736.pdf",
    doc:"https://webdosya.csb.gov.tr/db/samsun/icerikler/ek-3-b-20211224085547.pdf",
    ministry:"https://ced.csb.gov.tr/cevre-izin-ve-lisans-82206",
    sais:"https://ced.csb.gov.tr/haberler/surekli-atiksu-izleme-sistemleri-tebliginde-degisiklik-yapilmasina-dair-teblig-16-temmuz-2019-tarih-ve-30833-sayili-resmi-gazete-de-yayimlandi-.-240259",
    seos:"https://mevzuat.wiki/surekli-emisyon-olcum-sistemleri-tebligi"
  };
  const clean=e;
  const format=money;
  let journeyStep=0;
  db.journey=db.journey||{};
  icon.journey="◆";
  nav.unshift(["journey","Başvuru Yol Haritası"]);
  page="journey";
  const priorScreen=screen;
  screen=function(){return page==="journey"?journeyScreen():priorScreen();};
  function jstate(){
    const id=active().id;
    if(!db.journey)db.journey={};
    if(!db.journey[id])db.journey[id]={applicationDate:"",issuedDate:"",ek:"",waterPermit:"",saisFlow:"",notes:"",checks:{}};
    const v=db.journey[id];v.checks=v.checks||{};
    return v;
  }
  function html(s){return String(s==null?"":s);}
  function jumpText(t){return clean(html(t));}
  function trDate(date){
    if(!date)return "Belirlenmedi";
    const v=/^\d{4}-\d{2}-\d{2}$/.test(date)?date:"";
    if(!v)return "Belirlenmedi";
    const d=new Date(v+"T12:00:00");
    if(!Number.isFinite(d.getTime()))return "Belirlenmedi";
    return new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"long",year:"numeric"}).format(d);
  }
  function plusDay(date,n){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date||""))return "";
    const [y,m,d]=date.split("-").map(Number),dt=new Date(Date.UTC(y,m-1,d));
    dt.setUTCDate(dt.getUTCDate()+n);
    return dt.toISOString().slice(0,10);
  }
  function plusYear(date,n){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date||""))return "";
    const [y,m,d]=date.split("-").map(Number);const dt=new Date(Date.UTC(y+n,m-1,d));
    return dt.toISOString().slice(0,10);
  }
  function link(label,url){return '<a class="jref" href="'+clean(url)+'" target="_blank" rel="noopener noreferrer">'+clean(label)+' ↗</a>';}
  function jHeader(){
    return '<div class="journey-header"><span class="journey-kicker">ÇEVRE İZİN KARAR DESTEK PLATFORMU</span><h1>GFB Başvuru Yol Haritası</h1><p>Tesisleri seç, başvuru tarihini belirle ve uygunluk yazısından nihai çevre iznine kadar tüm aşamaları, belgeleri, ücretleri ve teknik gereksinimleri tek ekranda incele.</p></div>'+
      '<div class="step-row">'+
      [ ["1","Tesisleri seç"],["2","Tarihi ve kapsamı belirle"],["3","Süreç ve bütçe raporu"] ].map((v,i)=>'<div class="step-pill '+(journeyStep===i?"active":journeyStep>i?"done":"")+'"><span>'+(journeyStep>i?"✓":v[0])+'</span>'+v[1]+'</div>').join("")+'</div>';
  }
  function jStatus(txt,kind){return '<span class="jstatus '+(kind||"")+'">'+clean(txt)+'</span>';}
  function jButton(label,action,cls){return '<button type="button" class="jbtn '+(cls||"")+'" data-jaction="'+clean(action)+'">'+label+'</button>';}
  function jSelect(key,choices,val){
    return '<select class="jselect" data-jfield="'+clean(key)+'">'+choices.map(o=>'<option value="'+clean(o[0])+'" '+(String(o[0])===String(val)?"selected":"")+'>'+clean(o[1])+'</option>').join("")+'</select>';
  }
  function jField(label,field,help){
    return '<div class="jfield"><label>'+label+'</label>'+field+(help?'<small>'+help+'</small>':"")+'</div>';
  }
  function currentFacilities(){const chosen=new Set(active().selected);return db.facilities.filter(f=>chosen.has(f.id));}
  function byKind(){const chosen=currentFacilities();return {water:chosen.filter(x=>x.kind==="water"),air:chosen.filter(x=>x.kind==="stack"||x.kind==="ambient"),units:chosen};}
  function hasWater(){return active().scope!=="air"&&byKind().water.length>0;}
  function hasAir(){return active().scope!=="water"&&byKind().air.length>0;}
  function stepOne(){
    const chosen=new Set(active().selected);
    let body='<div class="journey-panel"><div class="jheading-row"><div><h2>01 · Başvuru için tesisleri seç</h2><div class="journey-muted">Seçimler sadece bu senaryoya uygulanır. Mevcut tesisleri daha sonra değiştirebilir veya yeni tesis ekleyebilirsin.</div></div>'+jStatus(chosen.size+" seçili","verified")+'</div>';
    body+='<div class="jbar" style="border:0;margin-top:4px;padding-top:10px"><div class="jtabs">'+jButton("Tümünü seç","all","ghost")+jButton("Seçimi temizle","clear")+'</div><label class="jfield" style="min-width:230px"><span style="font-size:12px;font-weight:700">Kayıtlı senaryo</span>'+jSelect("scenario",db.scenarios.map(s=>[s.id,s.name]),active().id)+'</label></div>';
    for(const [kind,title] of [["water","Su ve deşarj tesisleri"],["stack","Baca emisyonu"],["ambient","Ortak ortam hava ölçümleri"],["exception","Diğer / koşullu değerlendirme"]]){
      const list=db.facilities.filter(f=>f.kind===kind);
      if(!list.length)continue;
      body+='<div class="jsection-cap">'+clean(title)+'</div><div class="jfac-grid">';
      for(const f of list){
        body+='<label class="jfac"><input type="checkbox" data-jfacility="'+clean(f.id)+'" '+(chosen.has(f.id)?"checked":"")+'><span><em>'+clean(f.id)+' · '+clean(f.group||"")+'</em><b>'+clean(f.name)+'</b><small>'+clean(f.note||"")+'</small></span></label>';
      }
      body+='</div>';
    }
    body+='<div class="jnotice blue"><b>Tek işletme kuralı:</b> Aynı işletmedeki tesisleri ayrı seçmen, ayrı çevre izin veya GFB düzenlenebileceği anlamına gelmez. Başvuru kapsamı ve kademeli başvuru imkânı yetkili idare tarafından doğrulanmalıdır.</div>';
    body+='<div class="jbar"><div class="journey-muted">'+chosen.size+' tesis/kaynak seçili · '+clean(active().name)+'</div><div class="jtabs">'+jButton("＋ Yeni tesis ekle","new-facility")+jButton("Başvuru tarihine geç →","next1","primary")+'</div></div></div>';
    return body;
  }
  function stepTwo(){
    const v=jstate();const group=byKind();
    let body='<div class="journey-panel"><div class="jheading-row"><div><h2>02 · Başvuru tarihi ve izin kapsamı</h2><p class="journey-muted">'+group.units.length+' tesis seçildi. Tarihi gir; sistem belge hazırlıkları ile yasal süreleri ayrı ayrı gösterecek.</p></div>'+jButton("← Tesisleri değiştir","back1")+'</div>';
    body+='<div class="jform">';
    body+=jField("Planlanan GFB başvuru tarihi",'<input type="date" class="jinput" data-jfield="applicationDate" value="'+clean(v.applicationDate||"")+'">',"Ocak 2027 hedefiniz var; gerçek gün kesin değilse tahmini bir tarih seçebilir ve daha sonra değiştirebilirsin.");
    body+=jField("İşletmenin ÇİLY Ek listesi",jSelect("ek",[["","Henüz belirlenmedi"],["1","Ek-1"],["2","Ek-2"]],v.ek),"Ek sınıfı tesis kodundan otomatik tahmin edilmez. Aynı işletmede Ek-1 faaliyeti varsa başvuru Ek-1 olarak değerlendirilir.");
    body+=jField("Başvuru izin kapsamı",jSelect("scope",[["both","Hava ve deşarj birlikte"],["water","Yalnız su/deşarj"],["air","Yalnız hava emisyonu"]],active().scope||"both"),"Seçim, mevzuata uygunluğun otomatik onayı değildir. Yanlış veya eksik izin konusu iade sebebidir.");
    body+=jField("Denize deşarj izin türü",jSelect("waterPermit",[["","Henüz teyit edilmedi"],["water","Atıksu deşarjı"],["sea","Derin deniz deşarjı"]],v.waterPermit),"Denize boşaltım her zaman 'derin deniz deşarjı' değildir; onaylı proje ve ilgili mevzuatla belirlenmelidir.");
    body+=jField("SAİS için ilgili tesisin kurulu debisi (m³/gün)",'<input type="number" min="0" step="1" class="jinput" placeholder="Bilinmiyor" data-jfield="saisFlow" value="'+clean(v.saisFlow||"")+'">',"Bu alan tek bir ilgili tesis/hat içindir; farklı tesislerin debilerini otomatik toplamayız.");
    body+=jField("Gerçek GFB düzenlenme tarihi (varsa)",'<input type="date" class="jinput" data-jfield="issuedDate" value="'+clean(v.issuedDate||"")+'">',"180 günlük çevre izni başvuru süresi yalnızca GFB'nin gerçekten düzenlendiği tarihten hesaplanır.");
    body+='</div><div class="jnotice"><b>Fiyat yılı uyarısı:</b> Bakanlığın 2026 belge ve laboratuvar tarifeleri referans alınır. Ocak 2027 başvurusu ve Mart–Nisan 2027 analizleri için o tarihte geçerli güncel tarifeler esas alınmalıdır.</div>';
    body+='<div class="jbar"><span class="journey-muted">Değişiklikler tarayıcıya kaydedilir.</span>'+jButton("Şematik yol haritasını oluştur →","next2","primary")+'</div></div>';
    return body;
  }
  function checklist(items,v){return '<ul class="jchecklist">'+items.map((t,i)=>'<li><input type="checkbox" data-jcheck="'+clean(t[0])+'" id="jck-'+clean(t[0])+'" '+(v.checks[t[0]]?"checked":"")+'><label for="jck-'+clean(t[0])+'">'+clean(t[1])+'</label></li>').join("")+'</ul>';}
  function block(num,title,desc,items,extra,source,status){
    const v=jstate(),checks=(items||[]).filter(x=>v.checks[x[0]]).length,all=items?.length||0;
    return '<div class="jstage"><div class="jmarker">'+num+'</div><div class="jstage-body"><div class="jstage-head"><div><h3>'+title+'</h3><p>'+desc+'</p></div>'+jStatus(all?checks+'/'+all+' kontrol edildi':status||"İnceleme gerekli",all&&checks===all?"verified":"")+'</div>'+(items?.length?checklist(items,v):"")+(extra||"")+(source?link("Mevzuat / dayanak",source):"")+'</div></div>';
  }
  function legalAssessment(){
    const v=jstate(),f=byKind(),flow=v.saisFlow===""||v.saisFlow==null?null:Number(v.saisFlow);
    let rows=[];
    if(hasWater()){
      const state=flow==null?"Gerekli veri eksik":flow>=5000?"Eşik sağlanıyor; kapsamı değerlendir":"Kapasite eşiğinin altında; yine de idare teyidi";
      rows.push('<div class="jquestion"><b>SAİS – Sürekli Atıksu İzleme:</b> '+clean(state)+'. Tebliğde ilgili tesis türleri için kurulu kapasite eşiği 5.000 m³/gün. Her çıkış hattının kapsamı, tesis kurulu debisi ve idare kararı ayrıca incelenir. SAİS sistem onayı, fizibilite, kurulum/devreye alma ve uygunluk evreleri ayrı iş kalemleridir. '+link("Bakanlık SAİS açıklaması",LINKS.sais)+'</div>');
      rows.push('<div class="jquestion"><b>Deşarj ve arıtma projeleri:</b> Arıtma tesisi proje onayı veya muafiyet, deşarjın sınıflandırılması, D-01/D-02 ortak hatlarının durumları ve gerektiğinde derin deniz deşarj proje onayı İl Müdürlüğü uygunluk yazısı hazırlığında teyit edilecek.</div>');
      if(f.units.some(x=>x.id==="00UQU"))rows.push('<div class="jquestion"><b>00UQU özel durumu:</b> 01.09.2026 tarihindeki test deşarj yetkilendirmesi kalıcı çevre izni değildir. Test izin belgesinin kapsamı ve süreleri kontrol edilmeli.</div>');
    }
    if(hasAir()){
      rows.push('<div class="jquestion"><b>SEÖS – Sürekli Emisyon Ölçüm Sistemi:</b> Yükümlülük ilgili emisyon kaynağının tabi olduğu mevzuat, nominal <i>yakıt ısıl girdisi</i> (MWth), çalışma koşulları ve yetkili merci değerlendirmesiyle belirlenir. 00UTH için bilinen 84,60 MW <i>faydalı ısıl çıkış</i> gücünü otomatik olarak MWth kabul etmiyoruz. SEÖS kurulumu, fizibilite/uygunluk, KGS2 ve yıllık test gereklilikleri kapsam teyidine bağlı. '+link("SEÖS Tebliği",LINKS.seos)+'</div>');
      if(f.units.some(x=>x.id==="UBN"))rows.push('<div class="jquestion"><b>UBN jeneratörleri:</b> Üç jeneratörün toplam yıllık 500 saatin altında çalışması planlama varsayımıdır. Bu veri otomatik yasal emisyon muafiyeti anlamına gelmez; işletim logları, nominal ısıl güç ve idare görüşü gerekir.</div>');
      if(f.air.some(x=>x.kind==="ambient"))rows.push('<div class="jquestion"><b>Ortam hava ölçümleri:</b> 15 PM10 (1 tur), 15 çöken toz (2 aylık dönem), 20 aktif VOC (2 tur), 20 merkaptan (1 tur); üç depolama tesisi için ortak plan. Nokta/kaynak tarifesi, merkaptan fiyat birimi ve modelleme kapsamı yetkili laboratuvarla doğrulanmalı.</div>');
    }
    rows.push('<div class="jquestion"><b>Sıfır Atık, ÇED, kapasite:</b> Sıfır Atık Temel Seviye Belgesi ya da muafiyet, ÇED kararı/kapsam dışı görüşü ve kapasite raporu/alternatif belgeleri doğrulanmadan İl Müdürlüğü uygunluk yazısı tamamlandı kabul edilmeyecek.</div>');
    return rows.join("");
  }
  function feeBreakdown(){
    const v=jstate(),wantWater=hasWater(),wantAir=hasAir(),rows=[];
    const ek=v.ek,fee=JFEE2026;
    let net=0,gross=0,unknown=0;
    function push(label,item,note){
      if(!item){unknown++;rows.push('<tr><td>'+clean(label)+'<div class="journey-muted">'+clean(note||"")+'</div></td><td>Belirsiz</td><td>Belirsiz</td></tr>');return;}
      net+=item.net;gross+=item.gross;
      rows.push('<tr><td>'+clean(label)+'<div class="journey-muted">'+clean(note||"")+'</div></td><td>'+format(item.net)+'</td><td>'+format(item.gross)+'</td></tr>');
    }
    push("GFB belge bedeli",ek?fee.gfb[ek]:null,"İşletme/başvuru kapsamında tek belge bedeli; tesis başına çarpılmaz.");
    if(wantAir)push("Nihai izin – Hava Emisyonu",ek?fee.air[ek]:null,"GFB'den sonraki çevre izin aşaması.");
    if(wantWater)push("Nihai izin – "+(v.waterPermit==="water"?"Atıksu Deşarjı":v.waterPermit==="sea"?"Derin Deniz Deşarjı":"deşarj konusu teyit bekliyor"),ek&&v.waterPermit?fee.water[ek]:null,"Deşarj konusu kesinleştikten sonra yalnızca ilgili izin bedeli hesaplanır.");
    const footer='<tr class="sum"><td>Hesaplanabilen tutar · '+(unknown?unknown+" kalem belirsiz":"referans toplam")+'</td><td>'+format(net)+'</td><td>'+format(gross)+'</td></tr>';
    return {net,gross,unknown,table:'<table class="jfee"><thead><tr><th>Bakanlık döner sermaye bedeli</th><th>KDV hariç</th><th>KDV dahil</th></tr></thead><tbody>'+rows.join("")+footer+'</tbody></table>'};
  }
  function stepThree(){
    const v=jstate(),scenario=active(),c=calc(),f=byKind(),fee=feeBreakdown();
    const deadline=v.issuedDate?trDate(plusDay(v.issuedDate,180)):"Gerçek GFB düzenlenme tarihi bekleniyor";
    let html='<div class="journey-panel" style="padding:18px 23px"><div class="jheading-row"><div><h2>03 · '+clean(scenario.name)+'</h2><div class="journey-muted">'+f.units.length+' tesis/kaynak · GFB başvuru hedefi: <b>'+trDate(v.applicationDate)+'</b> · GFB düzenlenme: '+trDate(v.issuedDate)+'</div></div><div class="jtabs">'+jButton("← Tarih ve kapsam","back2")+jButton("Yazdır / PDF","print","primary")+'</div></div></div>';
    html+='<div class="jkpis"><div class="jkpi"><div class="hint">Seçili tesis/kaynak</div><strong>'+f.units.length+'</strong><small>Bir işletme altında değerlendirilecek</small></div><div class="jkpi"><div class="hint">Laboratuvar – 2026 baz</div><strong>'+format(c.lab)+'</strong><small>Ölçüm/analiz, devlet harçları hariç</small></div><div class="jkpi"><div class="hint">Devlet belge bedelleri</div><strong>'+ (fee.unknown?"Kısmi":format(fee.gross))+'</strong><small>'+ (fee.unknown?fee.unknown+" belirsiz kalem; bilinen tutar "+format(fee.gross):"2026 KDV dahil toplam")+'</small></div><div class="jkpi tint"><div class="hint">GFB sonrası izin başvurusu</div><strong style="font-size:16px">'+ (v.issuedDate?deadline:"180 gün")+'</strong><small>Süre yalnızca GFB'nin gerçek düzenlenme tarihinden başlar.</small></div></div>';
    if(v.applicationDate){
      const delayed=f.units.filter(x=>x.date&&x.date>v.applicationDate);
      if(delayed.length)html+='<div class="jnotice"><b>Başvuru öncesi hazırlık kontrolü:</b> '+delayed.map(x=>clean(x.id)).join(", ")+' için kayıtlı ilk işletme/plan tarihi başvuru hedefinden sonradır. İlgili tesislerin fiziksel uygunluk ve işletme koşulları teyit edilmelidir.</div>';
    }
    html+='<div class="jnotice"><b>Yasal planlama uyarısı:</b> Aynı işletme içindeki faaliyetlerin ve tüm gerekli izin konularının birlikte değerlendirilmesi gerekir (ÇİLY m.6/2). Bu rapor senaryo/ön maliyet çalışmasıdır; ayrı GFB hak veya yükümlülüğü belirlemez. Bakanlık uygunluk yazısı olmadan başvuru eksiksiz kabul edilemez.</div>';
    html+='<div class="journey-panel"><div class="jheading-row"><h2>Başvurudan izin belgesine şematik süreç</h2><span class="jmini">Tüm iş adımları takip edilebilir</span></div>';
    html+='<div class="jflow">';
    html+=block("01","Kapsam ve Ek sınıfı değerlendirmesi","GFB konularını, aynı işletmedeki tüm ilgili tesisleri ve yetkili mercii belirle.",[
      ["eligibility","ÇİLY Ek-1 / Ek-2 sınıflandırması ve faaliyete özgü bentler doğrulandı"],
      ["scope","İzin konuları (hava, atıksu/derin deniz) Bakanlık/İl Müdürlüğü ile teyit edildi"],
      ["stage","Tesislerin kademeli devreye alınması için resmî uygunluk görüşü alındı"]
    ],'<p>Ek-1 için Bakanlık, Ek-2 için İl Müdürlüğü yetkilidir. Aynı işletmede Ek-1 ve Ek-2 faaliyetleri birlikteyse Ek-1 değerlendirmesi gündeme gelir.</p>',LINKS.regulation);
    html+=block("02","Ön teknik koşullar ve İl Müdürlüğü uygunluk yazısı","GFB'den önce fiziksel şartların sağlanması için saha incelemesi ve teknik evrak.",[
      ["ced","ÇED kararı veya kapsam dışı görüş belgesi"],
      ["capacity","Kapasite raporu / eşdeğer belge / muafiyet belgesi"],
      ["projects","Arıtma ve deşarj proje onayları veya muafiyet yazıları kontrol edildi"],
      ["zerowaste","Sıfır Atık Temel Seviye belgesi veya muafiyet"],
      ["sais","SAİS yükümlülüğü ve varsa sistem kurulum/onay durumu teyit edildi"],
      ["seos","SEÖS yükümlülüğü ve varsa sistem kurulum/onay durumu teyit edildi"],
      ["uygunluk","İl Müdürlüğü uygunluk yazısı düzenlendi"]
    ],'<p>Yönetmelikte uygunluk yazısının yerinde inceleme sonrasında başvurudan itibaren en geç 2 ay içinde düzenlenmesi ve bir yıl geçerli olması tanımlanır. Bu, GFB'nin kesin çıkış tarihi değildir.</p>',LINKS.regulation);
    html+=block("03","GFB dosyasını hazırla · EK-3A ve EK-3B","E-izin sistemi üzerinden yetkili çevre birimi/danışman tarafından elektronik imzalı başvuru.",[
      ["trade","Ticaret Sicil Gazetesi hazırlandı"],
      ["process","İş akım şeması, proses özeti, vaziyet planı ve emisyon kaynakları hazırlandı"],
      ["gfbdoc","EK-3A başvuru formu ve EK-3B ekleri tamamlandı"],
      ["govportal","Başvuru e-izin sisteminde elektronik/mobil imza ile gönderildi"]
    ],'<p>Ortak belgeler arasında ÇED, ticaret sicili, kapasite ve iş akım/proses özeti bulunur. Hava veya deşarj izin konuları için İl Müdürlüğü uygunluk yazısı da istenir.</p>',LINKS.doc);
    html+=block("04","GFB belge bedelini öde ve değerlendirmeyi izle","2026 referans bedeli Ek sınıfına göre hesaplanır; 2027 tarifesi yayımlandığında güncelle.",[
      ["gfpay","GFB döner sermaye ödemesi yapıldı; dekont kaydedildi"],
      ["review","GFB değerlendirmesi ve varsa eksiklik bildirimleri takip edildi"]
    ],'<p>Yönetmelik m.8: GFB dosyası için 30 takvim günü değerlendirme; eksiklik bildirimi halinde 60 gün tamamlama, tamamlandıktan sonra 20 gün değerlendirme. Bu süreler otomatik onay garantisi değildir.</p>',LINKS.regulation);
    html+=block("05","GFB düzenlenmesi ve çalışma süresi","İzin öncesi geçici belge; düzenlenme tarihi gerçek belge üzerinden kaydedilir.",[
      ["gfbissued","GFB belgesi alındı; düzenlenme tarihi girildi"],
      ["conditions","GFB kapsamı ve işletme koşulları kontrol edildi"]
    ],'<p>GFB bir yıl geçerlidir. <b>EK-3C çevre izni başvuru süresi: '+clean(deadline)+'</b>.</p>',LINKS.regulation);
    const waterDesc=hasWater()?"D-01 / D-02: "+c.waterPoints+" planlanan numune noktası; 2 saatlik/24 saatlik kompozit, saha parametreleri, AKM, BOİ, KOİ, balık biyoanaliz vb.":"Bu senaryoda deşarj analizi seçili değil.";
    const airDesc=hasAir()?"00UTH için beş baca çıkışı (seçiliyse), depolama tesisleri için ortak imisyon kampanyası (seçiliyse).":"Bu senaryoda hava ölçümü seçili değil.";
    html+=block("06","GFB sonrası yetkili laboratuvar ölçümleri","Mart 2027 ilk dönem, Nisan 2027 ikinci VOC/çöken toz dönemi planlama varsayımıdır.",[
      ["labauthority","Yetkili laboratuvarın bütün parametrelerde kapsamı teyit edildi"],
      ["sample","Numune alma ve ölçüm programı yetkili merci ile koordine edildi"],
      ["reports","MELBES/e-izin ölçüm-analiz raporları ve numune sonuçları alındı"]
    ],'<p>'+clean(waterDesc)+'</p><p>'+clean(airDesc)+'</p><p><b>2026 asgari laboratuvar referans gideri: '+format(c.lab)+'</b>. Ulaşım senaryosu: '+format(c.travel)+' (2.000 km tek yön ihtiyatlı varsayımı mevcutsa). KDV dahil yol+laboratuvar: '+format(c.gross)+'.</p><p>Ölçüm parametreleri Bakanlık veya yetkili merci tarafından değiştirilebilir; nihai kapsam mevzuat ve resmî değerlendirmeyle kesinleşir.</p>',LINKS.ministry);
    html+=block("07","Çevre İzin başvurusu · EK-3C","GFB gerçek tarihinden itibaren 180 takvim günü içinde ölçüm/analiz sonuçları ile başvur.",[
      ["ek3c","EK-3C bilgi, belge, raporları tamamlandı"],
      ["permission","Hava emisyonu ve/veya deşarj izni konu bazlı raporları sisteme yüklendi"],
      ["finalfee","Nihai çevre izin konusu belge bedelleri yatırıldı"],
      ["finalsubmit","Nihai çevre izin başvurusu e-izin üzerinden yapıldı"]
    ],'<p>İzin dosyası m.9 uyarınca 60 gün içinde değerlendirilir; eksiklik bildirimi sonrası tamamlanma süresi 90 gün olabilir. Belge şartları ve GFB süresi ayrıca gözetilir.</p>',LINKS.regulation);
    html+=block("08","Çevre İzin Belgesi, işletim ve değişiklik takibi","Uygun bulunan izin belgeye bağlanır; tesislerin yeni faaliyete geçmesi veya kapasite/yakıt değişiklikleri ayrıca değerlendirilir.",[
      ["finalissued","Nihai çevre izin belgesi alındı"],
      ["revisions","Yeni tesis, kapasite, yakıt veya izin konusu değişiklikleri için güncelleme/yenileme kontrolü yapıldı"]
    ],'<p>Çevre izin ve lisans belgesinin genel geçerlilik süresi 5 yıldır. İşletmedeki değişiklikler m.11 çerçevesinde yeniden başvuru veya güncelleme gerektirebilir.</p>',LINKS.regulation);
    html+='</div></div>';
    html+='<div class="journey-panel"><div class="jheading-row"><h2>Teknik ek yükümlülükler – kontrol listesi</h2>'+jStatus("Koşullu değerlendirme","review")+'</div><div class="jquestions">'+legalAssessment()+'</div></div>';
    html+='<div class="journey-panel"><h2>Bakanlık devlet belge bedelleri · 2026 referans</h2><p class="journey-muted">Bu tablo yalnızca GFB ve çevre izin konularına ait döner sermaye tutarlarıdır. Laboratuvar bedelleriyle karıştırılmaz, tesis başına çoğaltılmaz. Sınıf/konu belirsizse toplam kesinleşmez.</p>'+fee.table+'<div class="jnotice blue"><b>Fiyat yılı:</b> Başvuru hedefin 2027 olduğu için 2026 tutarları kesin ödeme tutarı değildir. İlgili tarihteki resmî tarife ve ödeme ekranı esas alınmalıdır. SAİS/SEÖS satın alma, proje hazırlama/onay, danışmanlık ve muhtemel başka başvuru giderleri bu toplamda yok.</div>'+link("2026 Bakanlık döner sermaye fiyat listesi",LINKS.fees)+'</div>';
    html+='<div class="journey-panel"><h2>Ölçüm/analiz giderleri · 2026 referans</h2><p class="journey-muted">Senaryoda seçili tesislerin ölçümlerine göre önceki hesap motorundan canlı gelir. Ortak ölçümler üç tesise ayrı ayrı yazılmaz.</p><table class="jfee"><thead><tr><th>Gider</th><th>KDV hariç</th><th>Bilgi</th></tr></thead><tbody>'+[
    ["Su numuneleri ve analizler",c.waterSamples+c.waterAnalyses+c.waterBase+c.waterReport,"Numune alma, analiz, raporlama"],
    ["Baca emisyon ölçümleri",c.stackMeasurements+c.stackBase+c.stackReport,"Beş bağımsız çıkış (seçim varsa)"],
    ["Ortam hava ve modelleme",c.ambientMeasures+c.ambientModels+c.ambientBase+c.ambientReport,"Ortak kampanya (seçim varsa)"],
    ["Özel ek parametreler",c.extra,"Kullanıcı tarafından eklenen kalemler"],
    ["Ulaşım (ihtiyatlı)",c.travel,"Mesafe ve ekip organizasyonu teyit bekliyor"]
    ].map(r=>'<tr><td>'+clean(r[0])+'</td><td>'+format(r[1])+'</td><td>'+clean(r[2])+'</td></tr>').join("")+'<tr class="sum"><td>Laboratuvar + ulaşım toplam</td><td>'+format(c.total)+'</td><td>KDV dahil '+format(c.gross)+'</td></tr></tbody></table>'+
      '<div class="jbar">'+jButton("Ayrıntılı ölçümler","measurements")+jButton("Senaryoyu karşılaştır","compare")+jButton("Yeni tesis ekle","new-facility")+jButton("Yazdır / PDF","print","primary")+'</div></div>';
    html+='<div class="journey-panel"><h2>Resmî kaynaklar</h2><p class="journey-muted">Görüntülenen süreç ÇİLY m.4–11, EK-3A/B/C, SAİS Tebliği ve 2026 fiyat listelerine dayanır. Yetkili idarenin güncel değerlendirmesi esastır.</p><div class="jsources">'+
      [['Çevre İzin ve Lisans Yönetmeliği',LINKS.regulation],['Bakanlık GFB EK-3B belge listesi',LINKS.doc],['2026 Döner Sermaye Tarifesi',LINKS.fees],['Bakanlık SAİS Bilgilendirmesi',LINKS.sais],['SEÖS Tebliği',LINKS.seos],['Bakanlık çevre izin sayfası',LINKS.ministry]].map(l=>'<a href="'+clean(l[1])+'" target="_blank" rel="noopener">'+clean(l[0])+' ↗</a>').join("")+'</div></div>';
    html+='<div class="jbar">'+jButton("← Tesislere dön","back1")+jButton("Yeni senaryo oluştur","new-scenario")+jButton("JSON yedek indir","backup","ghost")+'</div>';
    return html;
  }
  function journeyScreen(){
    return '<section class="journey-wrap">'+jHeader()+(journeyStep===0?stepOne():journeyStep===1?stepTwo():stepThree())+'</section>';
  }
  function jsave(){save();}
  document.addEventListener("click",function(ev){
    if(page!=="journey")return;
    const el=ev.target.closest("[data-jaction]");if(!el)return;
    ev.stopImmediatePropagation();
    const act=el.dataset.jaction;
    if(act==="all"){active().selected=db.facilities.map(f=>f.id);jsave();}
    if(act==="clear"){active().selected=[];jsave();}
    if(act==="next1"){if(!active().selected.length){alert("Devam etmek için en az bir tesis seç.");return;}journeyStep=1;render();}
    if(act==="back1"){journeyStep=0;render();}
    if(act==="next2"){if(!jstate().applicationDate){alert("GFB için planlanan başvuru tarihini seç.");return;}journeyStep=2;render();}
    if(act==="back2"){journeyStep=1;render();}
    if(act==="print"){window.print();}
    if(act==="backup"){handleAction("export-backup");}
    if(act==="compare"){page="scenarios";render();}
    if(act==="measurements"){page="measurements";render();}
    if(act==="new-facility"){page="facilities";modal={type:"new-facility"};render();}
    if(act==="new-scenario"){page="scenarios";modal={type:"new-scenario"};render();}
  },true);
  document.addEventListener("change",function(ev){
    if(page!=="journey")return;
    const t=ev.target;
    if(t.dataset.jfacility){
      ev.stopImmediatePropagation();const sel=new Set(active().selected);
      if(t.checked)sel.add(t.dataset.jfacility);else sel.delete(t.dataset.jfacility);
      active().selected=Array.from(sel);jsave();return;
    }
    if(t.dataset.jcheck){
      ev.stopImmediatePropagation();jstate().checks[t.dataset.jcheck]=!!t.checked;jsave();return;
    }
    if(t.dataset.jfield){
      ev.stopImmediatePropagation();const field=t.dataset.jfield;
      if(field==="scenario"){db.active=t.value;journeyStep=0;jsave();return;}
      if(field==="scope"){active().scope=t.value;jsave();return;}
      jstate()[field]=t.value;jsave();
    }
  },true);
  render();
})();
