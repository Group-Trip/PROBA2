import { useState, useEffect, useRef, Component, ReactNode } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { AuthScreen } from "./components/AuthScreen";
import { CreateGroupScreen } from "./components/CreateGroupScreen";
import { JoinGroupScreen } from "./components/JoinGroupScreen";
import { GroupDetails } from "./components/GroupDetails";
import { PaymentScreen } from "./components/PaymentScreen";
import { ConfirmationScreen } from "./components/ConfirmationScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { TicketsScreen } from "./components/TicketsScreen";
import { AdminPanel } from "./components/AdminPanel";
import { auth } from "./lib/auth";
import { Toaster } from "./components/ui/sonner";

// Error Boundary for iOS Safari compatibility
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-red-600 mb-4">Coś poszło nie tak</h2>
            <p className="text-gray-600 mb-4">
              Wystąpił błąd podczas ładowania aplikacji. Spróbuj odświeżyć stronę.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Odśwież stronę
            </button>
            {this.state.error && (
              <details className="mt-4 text-xs text-gray-500">
                <summary>Szczegóły techniczne</summary>
                <pre className="mt-2 overflow-auto">{this.state.error.toString()}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("auth");
  const [selectedAttraction, setSelectedAttraction] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pendingDeepLinkRef = useRef<string | null>(null);

  useEffect(() => {
    // Check for deep link first (even before auth)
    const path = window.location.pathname;
    const joinMatch = path.match(/\/join\/([^\/]+)/);
    
    if (joinMatch) {
      const groupId = joinMatch[1];
      console.log('🔗 Deep link detected:', groupId);
      pendingDeepLinkRef.current = groupId;
    }
    
    // Check if user is already logged in
    const checkAuth = async () => {
      console.log('🔍 Starting auth check...');
      try {
        // iOS Safari fix: Check if localStorage is available
        if (typeof window === 'undefined' || !window.localStorage) {
          console.warn('localStorage not available');
          setCurrentScreen("auth");
          return;
        }
        
        console.log('📡 Calling auth.getSession()...');
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 5000)
        );
        
        const session = await Promise.race([
          auth.getSession(),
          timeoutPromise
        ]).catch(err => {
          console.error('Auth session error:', err);
          return null;
        });
        
        console.log('✅ Auth session result:', session ? 'logged in' : 'not logged in');
        
        if (session) {
          setIsAuthenticated(true);
          
          // If there's a pending deep link, navigate to it
          if (pendingDeepLinkRef.current) {
            console.log('🔗 Processing deep link for logged in user:', pendingDeepLinkRef.current);
            // Clear the URL immediately to prevent loops
            window.history.replaceState({}, '', '/');
            setSelectedAttraction({ groupId: pendingDeepLinkRef.current });
            setCurrentScreen("join-group");
            pendingDeepLinkRef.current = null;
          } else {
            setCurrentScreen("welcome");
          }
        } else {
          // User not logged in - show auth screen
          console.log('🔗 User not logged in, showing auth screen');
          setCurrentScreen("auth");
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setCurrentScreen("auth");
      }
    };
    checkAuth();
  }, []);

  const handleNavigate = (screen: string, data?: any) => {
    setCurrentScreen(screen);
    if (data) {
      setSelectedAttraction(data);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    
    // If there's a pending deep link after auth, navigate to it
    if (pendingDeepLinkRef.current) {
      console.log('🔗 Auth success - processing pending deep link:', pendingDeepLinkRef.current);
      // Clear the URL immediately to prevent loops
      window.history.replaceState({}, '', '/');
      setSelectedAttraction({ groupId: pendingDeepLinkRef.current });
      setCurrentScreen("join-group");
      pendingDeepLinkRef.current = null;
    } else {
      setCurrentScreen("welcome");
    }
  };

  return (
    <ErrorBoundary>
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl">
        {currentScreen === "auth" && (
          <AuthScreen onNavigate={handleNavigate} onAuthSuccess={handleAuthSuccess} />
        )}
        {currentScreen === "welcome" && (
          <WelcomeScreen onNavigate={handleNavigate} />
        )}
        {currentScreen === "create-group" && (
          <CreateGroupScreen 
            onNavigate={handleNavigate} 
            initialData={selectedAttraction}
          />
        )}
        {currentScreen === "join-group" && (
          <JoinGroupScreen 
            onNavigate={handleNavigate}
            initialGroupId={selectedAttraction?.groupId}
          />
        )}
        {currentScreen === "group-details" && selectedAttraction && (
          <GroupDetails onNavigate={handleNavigate} attraction={selectedAttraction} />
        )}
        {currentScreen === "payment" && selectedAttraction && (
          <PaymentScreen onNavigate={handleNavigate} attraction={selectedAttraction} />
        )}
        {currentScreen === "confirmation" && selectedAttraction && (
          <ConfirmationScreen onNavigate={handleNavigate} attraction={selectedAttraction} />
        )}
        {currentScreen === "profile" && (
          <ProfileScreen onNavigate={handleNavigate} />
        )}
        {currentScreen === "tickets" && (
          <TicketsScreen onNavigate={handleNavigate} groupId={selectedAttraction?.groupId} />
        )}
        {currentScreen === "admin" && (
          <AdminPanel onNavigate={handleNavigate} />
        )}
      </div>
      <Toaster />
    </ErrorBoundary>
  );
}
