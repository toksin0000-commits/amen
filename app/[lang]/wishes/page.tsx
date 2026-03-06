import { getDictionary } from '@/lib/getDictionary';
import WishesClientWrapper from './WishesClientWrapper';

export default async function WishesPage({ params }: { params: Promise<{ lang: 'cs' | 'en' | 'ur' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <WishesClientWrapper dict={dict} lang={lang} />;
}