import React, { Suspense } from 'react';
import AksesMateriClient from './AksesMateriClient';
import { INITIAL_MATERIALS } from '@/lib/mock-data';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return INITIAL_MATERIALS.map((m) => ({
    id: m.id,
  }));
}

export default async function AksesMateriPage({ params }: PageProps) {
  const resolved = await params;
  return (
    <Suspense fallback={<div className="p-16 text-center text-slate-400">Memuat materi pembelajaran...</div>}>
      <AksesMateriClient materialId={resolved.id} />
    </Suspense>
  );
}
