
'use client';

import { Header } from '@/components/layout/header';
import { FindCreatorForm } from '@/components/find-creator-form';


export default function TipPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 mt-8">
        <FindCreatorForm />
      </main>
    </div>
  );
}
