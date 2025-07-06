-- Blog yazıları için gerekli tabloları oluştur
DO $$
BEGIN
  -- Kategoriler tablosu
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'categories'
  ) THEN
    CREATE TABLE categories (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT
    );

    -- Kategorilere örnek veri ekle
    INSERT INTO categories (name, slug, description) VALUES
      ('Development', 'development', 'Web ve yazılım geliştirme ile ilgili yazılar'),
      ('Accessibility', 'accessibility', 'Web erişilebilirliği ile ilgili yazılar'),
      ('UI/UX', 'ui-ux', 'Kullanıcı arayüzü ve deneyimi ile ilgili yazılar'),
      ('Performance', 'performance', 'Web performansı ile ilgili yazılar');
  END IF;

  -- Blog yazıları tablosu
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'blog_posts'
  ) THEN
    CREATE TABLE blog_posts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT,
      content TEXT NOT NULL,
      cover_image TEXT,
      published BOOLEAN DEFAULT false,
      published_at TIMESTAMP WITH TIME ZONE,
      read_time INTEGER DEFAULT 5,
      author_id UUID REFERENCES auth.users(id)
    );
    
    -- RLS Ayarları
    ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
    
    -- Herkes yayınlanmış yazıları okuyabilir
    CREATE POLICY "Yayınlanmış blog yazılarını herkes okuyabilir" ON blog_posts
      FOR SELECT USING (published = true);
  END IF;

  -- Blog yazıları - kategoriler ilişki tablosu
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'post_categories'
  ) THEN
    CREATE TABLE post_categories (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
      category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
      UNIQUE (post_id, category_id)
    );
  END IF;

  -- Tags tablosu
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'tags'
  ) THEN
    CREATE TABLE tags (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE
    );

    -- Örnek etiketler
    INSERT INTO tags (name, slug) VALUES
      ('JavaScript', 'javascript'),
      ('React', 'react'),
      ('CSS', 'css'),
      ('NextJS', 'nextjs'),
      ('TailwindCSS', 'tailwindcss'),
      ('Supabase', 'supabase'),
      ('Performance', 'performance'),
      ('A11y', 'a11y');
  END IF;

  -- Blog yazıları - etiketler ilişki tablosu
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'post_tags'
  ) THEN
    CREATE TABLE post_tags (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
      tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
      UNIQUE (post_id, tag_id)
    );
  END IF;
END
$$;

-- Örnek bir kullanıcı ve blog yazısı ekleme
DO $$
DECLARE
  v_user_id UUID;
  v_post_id UUID;
  v_category_id UUID;
  v_dev_category_id UUID;
  v_tag_id_nextjs UUID;
  v_tag_id_tailwind UUID;
BEGIN
  -- Eğer hiç kullanıcı yoksa örnek bir kullanıcı oluştur
  IF NOT EXISTS (SELECT FROM auth.users LIMIT 1) THEN
    -- Burada gerçek kullanıcı eklenmez, sadece mevcut kullanıcı kontrol edilir
    RAISE NOTICE 'Auth kullanıcısı oluşturulmadı. Supabase Auth UI üzerinden bir kullanıcı oluşturun.';
  END IF;

  -- Mevcut ilk kullanıcıyı al
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Kullanıcı bulunamadı. Örnek blog yazısı eklenemedi.';
    RETURN;
  END IF;

  -- Gelişmitme kategorisini al
  SELECT id INTO v_dev_category_id FROM categories WHERE slug = 'development' LIMIT 1;

  -- NextJS ve TailwindCSS etiketlerini al
  SELECT id INTO v_tag_id_nextjs FROM tags WHERE slug = 'nextjs' LIMIT 1;
  SELECT id INTO v_tag_id_tailwind FROM tags WHERE slug = 'tailwindcss' LIMIT 1;

  -- Örnek blog yazısını ekle (eğer yoksa)
  IF NOT EXISTS (SELECT FROM blog_posts WHERE slug = 'getting-started-with-nextjs-and-tailwindcss') THEN
    INSERT INTO blog_posts (
      title, 
      slug, 
      excerpt, 
      content, 
      cover_image, 
      published, 
      published_at, 
      read_time, 
      author_id
    ) VALUES (
      'Getting Started with Next.js and TailwindCSS', 
      'getting-started-with-nextjs-and-tailwindcss', 
      'Learn how to set up a new project with Next.js 13 and TailwindCSS to create beautiful, responsive websites.',
      '<p>Next.js has become one of the most popular React frameworks for building modern web applications. When combined with TailwindCSS, it provides a powerful toolkit for creating beautiful, responsive interfaces with minimal effort.</p>
      <h2>Setting Up Your Project</h2>
      <p>To get started, you'll need to create a new Next.js project and install TailwindCSS:</p>
      <pre><code>npx create-next-app@latest my-blog
cd my-blog
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p</code></pre>
      <p>Next, you'll need to configure Tailwind by updating the <code>tailwind.config.js</code> file:</p>
      <pre><code>module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}</code></pre>
      <h2>Creating Your First Component</h2>
      <p>With your setup complete, you can start building components using TailwindCSS utility classes:</p>
      <pre><code>export function Button({ children }) {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
      {children}
    </button>
  );
}</code></pre>
      <p>This is just the beginning of what you can do with Next.js and TailwindCSS. Explore the documentation to learn more about advanced features and techniques.</p>',
      'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      true,
      NOW(),
      5,
      v_user_id
    ) RETURNING id INTO v_post_id;

    -- Blog yazısı-kategori ilişkisini ekle
    IF v_post_id IS NOT NULL AND v_dev_category_id IS NOT NULL THEN
      INSERT INTO post_categories (post_id, category_id) 
      VALUES (v_post_id, v_dev_category_id);
    END IF;

    -- Blog yazısı-etiket ilişkilerini ekle
    IF v_post_id IS NOT NULL THEN
      IF v_tag_id_nextjs IS NOT NULL THEN
        INSERT INTO post_tags (post_id, tag_id) 
        VALUES (v_post_id, v_tag_id_nextjs);
      END IF;
      
      IF v_tag_id_tailwind IS NOT NULL THEN
        INSERT INTO post_tags (post_id, tag_id) 
        VALUES (v_post_id, v_tag_id_tailwind);
      END IF;
    END IF;
  END IF;
END
$$; 