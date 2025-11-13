import { FiUsers as Users, FiTag as Tag, FiUser as User } from "react-icons/fi";
import { Button } from "./ui/button";
import { QuickBookingFlow } from "./QuickBookingFlow";

interface WelcomeScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

export function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-turquoise-500 to-turquoise-400 flex flex-col items-center justify-center p-6 relative">
      {/* Profile Button - Top Right */}
      <div className="absolute top-6 right-6">
        <Button
          onClick={() => onNavigate("profile")}
          size="icon"
          className="bg-white/20 hover:bg-white/30 border-2 border-white/40 text-white w-12 h-12 rounded-full shadow-lg"
        >
          <User size={24} />
        </Button>
      </div>

      <div className="flex flex-col items-center space-y-8">
        {/* Logo */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <Users className="w-16 h-16 text-blue-500" />
            <Tag className="w-16 h-16 text-turquoise-500" />
          </div>
        </div>

        {/* App Name */}
        <div className="text-center">
          <h1 className="text-white mb-2">GroupTrip</h1>
          <p className="text-white/90">Razem taniej, razem więcej</p>
        </div>

        {/* CTA Buttons */}
        <div className="w-full max-w-sm space-y-4 mt-8">
          <Button
            onClick={() => onNavigate("create-group")}
            className="w-full bg-white text-blue-600 hover:bg-white/90 h-14 shadow-lg"
          >
            <Tag className="w-5 h-5 mr-2" />
            Utwórz Grupę
          </Button>
          <Button
            onClick={() => onNavigate("join-group")}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 h-14 shadow-lg"
          >
            <Users className="w-5 h-5 mr-2" />
            Dołącz do Grupy
          </Button>
          <Button
            onClick={() => onNavigate("profile")}
            variant="outline"
            className="w-full bg-white/10 text-white border-white/30 hover:bg-white/20 h-12"
          >
            <User className="w-5 h-5 mr-2" />
            Moje Konto
          </Button>
        </div>

        {/* Quick Booking - Attractions */}
        <div className="w-full max-w-sm mt-8">
          <QuickBookingFlow onNavigate={onNavigate} />
        </div>

        {/* Benefits */}
        <div className="space-y-4 mt-12 text-center text-white max-w-sm">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="mb-1">🎟️</div>
              <p className="text-sm">Zniżki grupowe</p>
            </div>
            <div>
              <div className="mb-1">💰</div>
              <p className="text-sm">Niższe ceny</p>
            </div>
            <div>
              <div className="mb-1">🤝</div>
              <p className="text-sm">Nowi znajomi</p>
            </div>
          </div>
          <div className="pt-4 border-t border-white/20">
            <p className="text-sm text-white/80">
              📬 Bilety wysyłane na email i SMS po potwierdzeniu z obiektem
            </p>
          </div>
        </div>

        {/* Admin Access (Demo only - in production would be separate login) */}
        <div className="mt-8">
          <Button
            onClick={() => onNavigate("admin")}
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10 text-xs"
          >
            Panel Pracownika
          </Button>
        </div>
      </div>
    </div>
  );
}