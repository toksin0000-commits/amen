'use client';

import { useWishes } from './useWishes';
import WishesDisplay from './WishesDisplay';

export default function WishesClientWrapper({ dict, lang }: { dict: any; lang: string }) {
  const wishesData = useWishes(dict, lang);
  
  return <WishesDisplay {...wishesData} dict={dict} lang={lang} />;
}