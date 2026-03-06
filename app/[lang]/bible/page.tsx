import { use } from 'react';
import BibleView from './BibleView';
import type { Lang } from './useBible';

export default function BiblePage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = use(params);
  return <BibleView lang={lang} />;
}