require('dotenv').config();

console.log('Çevre değişkenleri kontrolü:');
console.log('-------------------------');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'TANIMLANMAMIŞ');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '******** (TANIMLANMIŞ)' : 'TANIMLANMAMIŞ');
console.log('-------------------------');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('HATA: Bazı gerekli çevre değişkenleri eksik!');
  process.exit(1);
} else {
  console.log('Tüm çevre değişkenleri mevcut. Her şey yolunda!');
} 