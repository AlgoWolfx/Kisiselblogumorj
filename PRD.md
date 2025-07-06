🎯 Proje Açıklaması
Bu proje, kişisel bir blog platformu oluşturmak amacıyla geliştirilmiştir. Proje; modern bir kullanıcı deneyimi, yönetilebilir içerik sistemi ve kullanıcı odaklı özellikler sunmayı hedefler. Next.js 13+, TailwindCSS, Supabase ve TypeScript gibi teknolojiler kullanılarak geliştirilecektir.





✅ 1. Aşama – Kullanıcı Sistemi, Profil ve Blog Okuyucu Tarafı
✅ Kullanıcı Giriş ve Kayıt
✅ Supabase Auth ile e-posta + şifre tabanlı kullanıcı kaydı ve girişi

✅ JWT token doğrulaması ve oturum yönetimi

✅ Login/Logout kontrolü

✅ Giriş yapmayan kullanıcılar yorum yapamaz

✅ Kullanıcı Profili
✅ 👨‍💻 Profil Sayfası
✅ Her kullanıcı için /profile sayfası

✅ Kullanıcı yalnızca kendi profiline erişebilecek (JWT ile token doğrulama)

✅ 🖼️ Profil Fotoğrafı
✅ Kullanıcılar kendi profil fotoğraflarını yükleyebilecek

✅ Görseller Supabase Storage üzerinde saklanacak

✅ 🔔 Bildirim Ayarı
✅ Kullanıcılar yeni bir blog yazısı yayınlandığında e-posta almak isteyip istemediklerini belirleyebilecek

✅ Bu tercih Supabase veritabanına kaydedilecek

❌ Yeni yazı yayınlandığında tercihine göre otomatik e-posta gönderimi yapılacak

✅ 💬 Yorum Sistemi
✅ Blog yazılarına kullanıcılar yorum yapabilecek

✅ Yorumlar Supabase veritabanına kaydedilecek



✅ 📄 Temel Sayfalar
✅ Ana Sayfa (Blog öne çıkanları vs.)

✅ Blog Liste Sayfası

✅ Blog Detay Sayfası (/blog/[slug])

✅ Hakkımda Sayfası

✅ İletişim Sayfası

❌ Gizlilik Politikası

❌ Çerez bildirimi (banner olarak)

✅ 404 Sayfası (özel tasarımlı)

✅ 🔎 İlave Özellikler
✅ Arama fonksiyonu (başlık, içerik, kategori bazlı)

✅ Okunma süresi tahmini

✅ İlgili yazılar önerisi

❌ Sosyal medya paylaşım butonları

✅ ⚠️ Kaldırılan Özellikler
✅ MDX veya dosya tabanlı içerik sistemi tamamen kaldırıldı

✅ İçerikler yalnızca Supabase veritabanı üzerinden yönetilecek

✅ 🛠️ 2. Aşama – Admin Panel
✅ 🧑‍�� Panel Özellikleri
❌ /admin sayfası üzerinden erişilir
❌ Ana router'dan izole yapı (özgün sade tasarım, ayrı stil)
❌ Admin kimlik doğrulaması gerektirir
❌ 📂 Yönetilebilir Alanlar
❌ Tüm blog yazılarını görme, silme ve düzenleme
❌ Yeni blog yazısı oluşturma
❌ Admin panelinden yorumlar yönetilebilecek (silme vs.)
❌ Blog yazılarına görsel ekleme (Supabase Storage entegrasyonu)
❌ Hakkımda sayfasını güncelleme
❌ Yorumları silme
❌ İletişim mesajlarını görüntüleme
❌ ✍️ Zengin Metin Editörü
❌ Blog içerikleri zengin metin editörü ile oluşturulacak
❌ Görsel yükleme ve içerik içine medya ekleme desteği olacak

❌ 📌 3. Aşama – Performans, SEO, Güvenlik ve Analitik
❌ 🚀 Performans ve SEO
✅ Görsel optimizasyon (next/image)

❌ Lazy loading ve SSR optimizasyonları

❌ Meta tag ve Open Graph desteği

❌ Sitemap ve robots.txt dosyaları

✅ 🔒 Güvenlik
✅ Form validasyonu (Zod)

❌ XSS koruması

✅ Kimlik doğrulama ve oturum kontrolü (middleware, redirect)

❌ 📊 Analitik ve İzleme
❌ Sayfa görüntülenme sayısı (post bazlı tracking)

❌ Basit kullanıcı etkileşimi takibi (tıklama, okuma vs.)

✅ 🧱 Teknik Gereksinimler
✅ Next.js 13+ (App Router)

✅ React 18+

✅ TypeScript

✅ TailwindCSS

✅ Supabase (Auth, DB, Storage)

✅ PostgreSQL (Supabase içindeki)

✅ Radix UI

✅ Framer Motion

✅ Zod

❌ Mail (email servis - örn. Resend, Mailgun vs.)

🧑‍💻 Mevcut Durum (Tamamlananlar)
Next.js proje çatısı kuruldu ✅

Tailwind ve tema sistemi eklendi ✅

Dark mode (next-themes) ✅

Temel sayfalar ve router yapısı kuruldu ✅

Supabase bağlantısı sağlandı ✅

Static blog örnek verileri test edildi ✅

Blog kartları, listeleme ve detay sayfası hazırlandı ✅

İlgili yazılar öneri yapısı hazırlandı ✅

Arama fonksiyonu geliştirildi ✅

İletişim formu hazırlandı ✅

Responsive navbar, footer, hero bileşenleri ✅

Animasyonlar (Framer Motion) ✅

Kullanıcı girişi (Supabase Auth) tamamlandı ✅

Profil sayfası ve avatar yükleme eklendi ✅

Bildirim tercihleri eklendi ✅

Yorum sistemi eklendi ✅

Form validasyonu (Zod) eklendi ✅