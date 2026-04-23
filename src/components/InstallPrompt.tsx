import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  // DINONAKTIFKAN SEMENTARA - Fitur install PWA dimatikan
  return null;

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed the prompt before
    const hasDismissed = localStorage.getItem('install-prompt-dismissed');
    if (hasDismissed) {
      const dismissedDate = new Date(hasDismissed);
      const now = new Date();
      const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      // Show again after 3 days
      if (daysSinceDismissed < 3) return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setIsVisible(false);
      localStorage.setItem('app-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show custom prompt after 3 seconds on ALL mobile devices
    const timer = setTimeout(() => {
      if (!isInstalled) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          setIsVisible(true);
        }
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [isInstalled, deferredPrompt]);

  const handleInstall = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (!deferredPrompt) {
      if (isIOS) {
        // iOS Safari instructions
        alert('Untuk menginstall aplikasi AISHA:\n\n1. Tap tombol Share (📤) di bawah\n2. Scroll dan pilih "Add to Home Screen"\n3. Tap "Add"');
      } else if (isAndroid) {
        // Android Chrome instructions
        alert('Untuk menginstall aplikasi AISHA:\n\n1. Tap menu Chrome (⋮) di pojok kanan atas\n2. Pilih "Tambahkan ke layar utama"\n3. Tap "Install"');
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('install-prompt-dismissed', new Date().toISOString());
  };

  if (!isVisible || isInstalled) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="bg-white rounded-xl shadow-2xl border border-red-200 p-4 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="bg-red-100 p-2 rounded-full shrink-0">
            <Smartphone className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900">
              Download Aplikasi Absensi
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {isIOS 
                ? 'Install aplikasi untuk akses lebih cepat. Tap Share → Add to Home Screen'
                : 'Install aplikasi Quran Friend di home screen untuk akses offline dan notifikasi'
              }
            </p>
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleInstall}
              >
                <Download className="w-4 h-4 mr-1" />
                {isIOS ? 'Cara Install' : 'Install Sekarang'}
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                className="px-2"
                onClick={handleDismiss}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
