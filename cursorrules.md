# Kisiselblog Projesi Geliştirme Kuralları

Bu dosya, kişisel blog platformu projesi için geliştirme standartlarını ve kurallarını içerir.

## Proje Yapısı

```
kisiselblog/
├── app/                # Next.js app router yapısı
│   ├── (auth)/         # Kimlik doğrulama ile ilgili sayfalar
│   ├── (blog)/         # Blog ile ilgili sayfalar
│   ├── (marketing)/    # Ana sayfa, hakkımda gibi pazarlama sayfaları
│   ├── admin/          # Admin panel sayfaları
│   ├── api/            # API rotaları
│   └── profile/        # Profil sayfaları
├── components/         # Yeniden kullanılabilir bileşenler
│   ├── auth/           # Kimlik doğrulama bileşenleri
│   ├── blog/           # Blog bileşenleri
│   ├── common/         # Ortak bileşenler (buton, kart vb.)
│   ├── layout/         # Düzen bileşenleri (header, footer)
│   └── ui/             # Temel UI bileşenleri
├── lib/                # Yardımcı fonksiyonlar ve kütüphane kodları
│   ├── supabase/       # Supabase bağlantıları
│   ├── utils/          # Yardımcı fonksiyonlar
│   └── validations/    # Form doğrulama şemaları
├── public/             # Statik dosyalar
└── styles/             # Global stil dosyaları
```

## Kod Standartları

1. **TypeScript Kullanımı**:
   - Her dosya için tip tanımları eksiksiz olmalı
   - `any` kullanımından kaçınılmalı
   - İnterface ve tip tanımları için PascalCase kullanılmalı

2. **Bileşen Yapısı**:
   - Fonksiyonel bileşenler kullanılmalı
   - Props için tip tanımları yapılmalı
   - Her bileşen tek bir sorumluluğa sahip olmalı

3. **Supabase Kullanımı**:
   - Tüm DB işlemleri için lib/supabase altında fonksiyonlar oluşturulmalı
   - Tip güvenliği için her tablo için tip tanımları yapılmalı

4. **Stil Kuralları**:
   - TailwindCSS doğrudan JSX içinde kullanılmalı
   - Karmaşık stillerde @apply direktifi kullanılmalı
   - UI bileşenlerinde Radix UI tercih edilmeli

## İsimlendirme Kuralları

1. **Dosya ve Klasör İsimleri**:
   - Bileşenler: PascalCase (Button.tsx)
   - Sayfalar: kebab-case (blog-post.tsx)
   - Yardımcı dosyalar: camelCase (formatDate.ts)

2. **Bileşen İsimlendirmeleri**:
   - Anlamlı, açıklayıcı isimler kullanılmalı
   - Örnek: UserProfileCard, BlogPostList

3. **Supabase Tabloları**:
   - Çoğul isim kullanılmalı (users, posts, comments)
   - İlişki tabloları için `_` ile bağlanmalı (post_comments)

## Git İş Akışı

1. **Branch Stratejisi**:
   - main: Ana branch, production kodu
   - develop: Geliştirme branch'i
   - feature/xxx: Yeni özellikler için

2. **Commit Mesajları**:
   - Türkçe yazılmalı
   - Anlamlı ve açıklayıcı olmalı
   - Format: `[alan]: yapılan değişiklik` 
   - Örnek: `[Blog]: Yorum sistemi eklendi`

## Test Kuralları

1. **Temel Bileşenler Test Edilmeli**
2. **Kritik Fonksiyonlar İçin Unit Test Yazılmalı**
3. **Supabase İşlemleri İçin Mock Kullanılmalı**

## Tablo Yapısı

1. **users**:
   - id
   - email
   - name
   - avatar_url
   - notification_preference
   - created_at

2. **posts**:
   - id
   - title
   - slug
   - content
   - excerpt
   - author_id
   - cover_image
   - reading_time
   - created_at
   - updated_at
   - published

3. **comments**:
   - id
   - post_id
   - user_id
   - content
   - created_at

4. **categories**:
   - id
   - name
   - slug

5. **post_categories**:
   - post_id
   - category_id

## Öncelikli Görevler

PRD'ye göre öncelikli olarak yapılması gerekenler:
1. Kullanıcı giriş ve kayıt sistemi
2. Kullanıcı profil sayfası ve özellikleri
3. Yorum sistemi
4. Admin paneli ve blog yazısı oluşturma/düzenleme 