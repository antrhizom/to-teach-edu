import { Suspense } from 'react';
import LoginPageContent from './LoginPageContent';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Lädt...</div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
