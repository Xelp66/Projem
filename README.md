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
