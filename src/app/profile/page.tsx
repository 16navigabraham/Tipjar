import { UserProfile } from '@/components/user-profile';
import { Header } from '@/components/layout/header';

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <UserProfile />
      </main>
    </div>
  );
}
