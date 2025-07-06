import { ProfileSection } from '@/components/about/ProfileSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hakkında | Kişisel Blog',
  description: 'Kişisel blog hakkında bilgiler ve yazar profili.',
};

export default function AboutPage() {
  return (
    <div className="container px-4 mx-auto max-w-5xl my-12">
      <h1 className="font-sans text-4xl font-bold mb-12 text-center">Hakkımda</h1>
      <div className="max-w-3xl mx-auto">
        <ProfileSection />
      </div>
    </div>
  );
}