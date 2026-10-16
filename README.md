# Çevre İzin ve GFB Yönetim Sistemi

**Canlı web uygulaması:** https://cevre-izin-gfb.vercel.app

Tek işletmeye bağlı tesislerin çevre izin/GFB başvuru senaryolarını, ölçüm planlarını ve yetkili laboratuvar maliyetlerini karşılaştırmak için Türkçe, tek sayfalık web uygulaması.

## Kullanım

1. Canlı web adresini açın.
2. Başlangıçta **DEMO** senaryosu tüm tesislerin örnek maliyetlerini gösterir. Gerçek ilk GFB başvurusunun kapsamı henüz belirlenmediği için **GFB-01** boş başlar.
3. Tesisleri seçin veya yeni tesis ve analiz parametreleri ekleyin.
4. GFB başvuru senaryolarını kaydedin, kopyalayın ve karşılaştırın.
5. KDV dahil/hariç ve ihtiyatlı ulaşım giderlerini inceleyin.
6. Tarayıcıdaki kayıtlarınızı korumak için düzenli olarak JSON yedeği indirin.

## Kapsam

- Su/atıksu arıtma ve deşarj grupları: D-01 (50UGH, 00UGM, 00UGW, 00UGV) ve D-02 (00UXA, 10UXA, 00UGD, 00UQU)
- Hava tarafı: 00UTH (2 dış baca gövdesinde toplam 5 bağımsız egzoz çıkışı), 00UEJ, 02UEK, 01UEK ve UBN jeneratör grubu
- Ortak imisyon ölçümleri: PM10, çöken toz, aktif VOC, merkaptan ve modelleme
- GFB plan hedefi: Ocak 2027; ölçüm ilk dönemi Mart 2027, ikinci dönem Nisan 2027

## Referans ve önemli sınırlamalar

- Hesaplar **2026 Bakanlık yetkili laboratuvar asgari fiyat tarifesi** üzerinden hazırlanmıştır. Bunlar Mart/Nisan **2027** için kesin güncel fiyatlar değildir; ilgili yılın tarifesiyle güncellenmelidir.
- Tek işletmeye bağlı tesislerin farklı planlama paketlerinde gösterilmesi bunların **hukuken ayrı GFB başvurusu yapabileceği** anlamına gelmez. Nihai izin kapsamı ve değişiklik gereklilikleri yetkili idare tarafından belirlenir.
- İlk sürüm statik HTML/JavaScript'tir. Sunucu veritabanı, kullanıcı hesabı ve yetki yönetimi içermez. **Veriler yalnızca kullandığınız tarayıcıdaki localStorage'da tutulur.** Gizli/kişisel bilgileri bu sürüme girmeyin ve düzenli JSON yedekleyin.
- Ortak ölçüm giderlerinin paylaşımı, kaynak/nokta tarifesi eşleştirmeleri, UBN muafiyet varsayımı ve laboratuvarın ulaşım paylaşımı yetkili laboratuvar veya idare ile doğrulanmalıdır.
- Devlet çevre izin harçları henüz maliyet modelinin dışında tutulmuştur.

## Dağıtım

GitHub `main` dalı Vercel'deki `cevre-izin-gfb` projesine bağlıdır. Kök dizindeki `index.html` bağımsız, harici JavaScript/CSS paketi gerektirmeyen uygulamadır. Statik proje olduğu için npm kurulumu gerektirmez.

**Durum:** Çalışan ilk web sürümü. Kalıcı veritabanı, kimlik doğrulama, mevzuat doğrulama iş akışı ve rapor dışa aktarma özellikleri sonraki geliştirme aşamalarıdır.


## Yeni başvuru sihirbazı (ilk ekran)

Uygulama artık ilk açılışta **Başvuru Yol Haritası** sayfasını gösterir:

1. **Tesis seçimi:** D-01 / D-02 su kaynakları, 00UTH, depolama alanları ve UBN dahil mevcut kayıtlardan istediklerini seç.
2. **Başvuru tarihi:** GFB için planlanan tarihi gir; işletmenin Ek-1/Ek-2 sınıfını ve hava/atıksu/derin deniz izin konusunu (biliniyorsa) seç. Gerçek GFB düzenlenme tarihini daha sonra gir.
3. **Şematik iş akışı:** İl Müdürlüğü uygunluk yazısı, EK-3A/B GFB belgeleri, GFB döner sermaye ücreti, GFB sonrası laboratuvar ölçümleri, EK-3C çevre izin başvurusu ve nihai belge bedellerini adım adım incele; tamamlanan görevleri işaretle.
4. **Ek koşullar:** SAİS, SEÖS, arıtma/deşarj proje onayları, Sıfır Atık, ÇED ve 00UQU test yetkilendirmesi koşullu olarak gösterilir.
5. **Yasal süreler:** İl Müdürlüğü uygunluk yazısı için mevzuattaki azami değerlendirme süresi; GFB başvurusu için 30 gün/eksiklik halinde ek süreç; GFB gerçek düzenlenme tarihinden sonra çevre izin başvurusu için 180 gün, belge süresi bir yıl.

**Fiyatlar:** Bakanlığın 2026 döner sermaye listesi GFB Ek-1 39.650 TL / Ek-2 13.500 TL (KDV dahil); Hava Emisyonu Ek-1 107.300 TL / Ek-2 39.650 TL; Atıksu veya Derin Deniz Deşarjı Ek-1 84.000 TL / Ek-2 34.650 TL. Bir işletmeye ilişkin izin konusu ve Ek sınıfı doğrulanmadan toplam "kesin bedel" değildir. Ocak–Nisan 2027 işlemleri için 2027 tarifesi gerekecektir.

Resmî kaynaklar:
- [Çevre İzin ve Lisans Yönetmeliği](https://www.lexpera.com.tr/mevzuat/yonetmelikler/cevre-izin-ve-lisans-yonetmeligi)
- [Bakanlık EK-3B gerekli belgeler](https://webdosya.csb.gov.tr/db/samsun/icerikler/ek-3-b-20211224085547.pdf)
- [Bakanlık 2026 Döner Sermaye Birim Fiyat Listesi](https://webdosya.csb.gov.tr/v2/canakkale/2026/03/2026-Birim-Fiyat-Listesi-20260102-20260303154736.pdf)
- [Bakanlık SAİS Tebliğ değişikliği duyurusu](https://ced.csb.gov.tr/haberler/surekli-atiksu-izleme-sistemleri-tebliginde-degisiklik-yapilmasina-dair-teblig-16-temmuz-2019-tarih-ve-30833-sayili-resmi-gazete-de-yayimlandi-.-240259)

**Teknik not:** Dinamik ana ekran, önceki hesaplama motorunun üstüne eklenen `journey.js` ve `journey.css` dosyalarıyla çalışır. Değişikliklerden sonra tarayıcıda sert yenileme (Ctrl+F5) gerekebilir. GitHub Actions altındaki `tests/smoke.cjs` başlangıç ekranı ve hesap tutarlılığı kontrolü için eklenmiştir.
