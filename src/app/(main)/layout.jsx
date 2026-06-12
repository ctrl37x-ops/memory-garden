import CelebrationOverlay from '@/components/main/CelebrationOverlay';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {children}
      <CelebrationOverlay />
    </div>
  );
}
