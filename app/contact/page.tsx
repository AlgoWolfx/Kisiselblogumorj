import { Metadata } from 'next';
import { ContactForm } from '@/components/forms/ContactForm';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'İletişim | Kişisel Blog',
  description: 'Benimle iletişime geçin. Sorularınız, yorumlarınız veya iş birliği talepleriniz için bu formu kullanabilirsiniz.',
};

export default function ContactPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1 mb-3 rounded-full bg-blue-600/10 border border-blue-600/30 text-blue-500">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">İletişime Geçin</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">İletişim</h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Sorularınız, geri bildirimleriniz veya iş birliği talepleriniz için aşağıdaki formu kullanabilirsiniz. En kısa sürede size geri dönüş yapacağım.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/3 space-y-6">
          <div className="p-6 bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg">
            <h3 className="text-xl font-bold mb-3">İletişim Bilgileri</h3>
            <ul className="space-y-4">
              <li>
                <p className="text-sm text-gray-400 mb-1">E-posta</p>
                <a href="mailto:dryigitx.x@gmail.com" className="text-blue-500 hover:text-blue-400 transition-colors">
                  dryigitx.x@gmail.com
                </a>
              </li>
              <li>
                <p className="text-sm text-gray-400 mb-1">Sosyal Medya</p>
                <div className="flex space-x-3">
                  <a href="https://x.com/GeraltxG" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors">
                    Twitter
                  </a>
                  <a href="https://github.com/GeraltXeth" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors">
                    GitHub
                  </a>
                  <a href="https://linkedin.com/in/username" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors">
                    LinkedIn
                  </a>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="p-6 bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Yanıt Süresi</h3>
            <p className="text-gray-400">
              Genellikle tüm mesajlara 1-2 iş günü içinde yanıt vermeye çalışıyorum. İş birliği talepleri için daha detaylı bir değerlendirme gerekebilir.
            </p>
          </div>
        </div>
        
        <div className="w-full md:w-2/3">
          <ContactForm />
        </div>
      </div>
    </div>
  );
} 