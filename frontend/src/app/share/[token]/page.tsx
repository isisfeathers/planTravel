import { notFound } from 'next/navigation';
import SharePageClient from './SharePageClient';

export function generateStaticParams() {
  return [
    { token: 'demo' },
    { token: 'share-token' },
    { token: 'sample-share-token' },
    { token: 'mock-share-token' },
  ];
}

export default function SharePage({ params }: { params: { token: string } }) {
  if (!params.token) notFound();
  return <SharePageClient params={params} />;
}

