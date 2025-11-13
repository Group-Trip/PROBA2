import { FiArrowLeft, FiUsers, FiClock, FiGift, FiTrendingDown, FiCalendar, FiMapPin, FiTag, FiShare2 } from "react-icons/fi";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { api } from "../lib/api";
import { toast } from "sonner";

interface GroupDetailsProps {
  onNavigate: (screen: string, data?: any) => void;
  attraction: any;
}

export function GroupDetails({ onNavigate, attraction }: GroupDetailsProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });
  const [groupData, setGroupData] = useState(attraction);
  const [isLoading, setIsLoading] = useState(false);
  
  // Auto-scroll to top when group details screen loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Update local state when attraction prop changes
  useEffect(() => {
    console.log('📥 Attraction prop updated:', {
      id: attraction.id || attraction.groupId,
      currentMembers: attraction.currentMembers,
      status: attraction.status
    });
    setGroupData(attraction);
  }, [attraction.id, attraction.groupId, attraction.currentMembers, attraction.status]);
  
  // Get group ID from either groupId or id field
  const groupId = groupData.groupId || groupData.id;
  
  const currentMembers = groupData.currentMembers || 1;
  const minPeople = groupData.minPeople || 15;
  const totalSlots = groupData.numberOfPeople || 15;
  // Progress pokazujemy względem minimum (15 osób)
  const progress = (currentMembers / minPeople) * 100;
  const spotsLeft = Math.max(0, minPeople - currentMembers);
  const isFull = groupData.status === 'full'; // Only truly full when status is 'full'
  
  // Debug: Log current state
  console.log('👥 GroupDetails render:', {
    groupId: groupData.id || groupData.groupId,
    currentMembers,
    totalSlots,
    progress: progress.toFixed(1) + '%',
    spotsLeft,
    isFull,
    status: groupData.status,
    membersCount: groupData.members?.length
  });

  // Get real members from attraction data or use placeholder
  const members = groupData.members?.map((member: any, index: number) => ({
    id: member.userId || index,
    name: member.name,
    initials: member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
    isOrganizer: member.isOrganizer || false,
    numberOfTickets: member.numberOfTickets || 1,
    ticketHolders: member.ticketHolders || []
  })) || [
    { id: 1, name: "Ty", initials: "TY", isOrganizer: groupData.isOrganizer, numberOfTickets: 1, ticketHolders: [] }
  ];

  // Refresh group data when component mounts or groupId changes
  useEffect(() => {
    if (!groupId) return;
    
    const refreshGroupData = async () => {
      try {
        setIsLoading(true);
        const response = await api.getGroup(groupId);
        if (response.group) {
          console.log('🔄 Group data refreshed:', {
            id: response.group.id,
            currentMembers: response.group.currentMembers,
            numberOfPeople: response.group.numberOfPeople,
            status: response.group.status
          });
          // Merge with attraction data to preserve image, location, etc.
          setGroupData(prev => ({
            ...prev,
            ...response.group
          }));
        }
      } catch (error) {
        console.error('Error refreshing group data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    refreshGroupData();
    
    // Refresh every 5 seconds to show live updates
    const interval = setInterval(refreshGroupData, 5000);
    return () => clearInterval(interval);
  }, [groupId]); // Only depend on groupId, not entire groupData

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) hours--;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Sobota, 9 listopada 2025";
    const date = new Date(dateStr + 'T12:00:00');
    const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const months = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 
                    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleShare = async () => {
    try {
      console.log('🔗 Share button clicked!', { groupId, attraction });
      
      const shareUrl = `${window.location.origin}/join/${groupId}`;
      const shareText = `Hej! Dołącz do mojej grupy na ${attraction.name}!\n🎿 Data: ${formatDate(attraction.date)}\n💰 Cena: ${attraction.groupPrice} zł (zamiast ${attraction.regularPrice} zł - ${Math.round((1 - attraction.groupPrice / attraction.regularPrice) * 100)}% taniej!)\n👥 Zostało ${spotsLeft > 0 ? spotsLeft : 0} ${spotsLeft === 1 ? 'miejsce' : spotsLeft <= 4 ? 'miejsca' : 'miejsc'}\n\n`;
      
      console.log('📤 Sharing:', { shareUrl, shareText });

    // Try native share first (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Dołącz do grupy - ${attraction.name}`,
          text: shareText,
          url: shareUrl,
        });
        toast.success("Link udostępniony!");
        return;
      } catch (err: any) {
        // User cancelled share or share failed
        if (err.name === 'AbortError') {
          return; // User cancelled, don't show error
        }
        // Fall through to clipboard on error
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText + shareUrl);
      toast.success("Link skopiowany do schowka!", {
        description: "Wyślij znajomym przez WhatsApp, Messenger lub SMS"
      });
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareText + shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success("Link skopiowany!");
      } catch (e) {
        toast.error("Nie udało się skopiować linku");
      }
      document.body.removeChild(textArea);
    }
    } catch (error) {
      console.error('❌ Unexpected error in handleShareGroup:', error);
      toast.error("Wystąpił błąd: " + (error as Error).message);
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/join/${groupId}`;
      const shareText = `Hej! Dołącz do mojej grupy na ${attraction.name}!\n🎿 Data: ${formatDate(attraction.date)}\n💰 Cena: ${attraction.groupPrice} zł (zamiast ${attraction.regularPrice} zł - ${Math.round((1 - attraction.groupPrice / attraction.regularPrice) * 100)}% taniej!)\n👥 Zostało ${spotsLeft > 0 ? spotsLeft : 0} ${spotsLeft === 1 ? 'miejsce' : spotsLeft <= 4 ? 'miejsca' : 'miejsc'}\n\n`;
      
      console.log('📤 Sharing:', { shareUrl, shareText });

      await navigator.clipboard.writeText(shareText + shareUrl);
      toast.success("Link skopiowany do schowka!", {
        description: "Wyślij znajomym przez WhatsApp, Messenger lub SMS"
      });
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareText + shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success("Link skopiowany!");
      } catch (e) {
        toast.error("Nie udało się skopiować linku");
      }
      document.body.removeChild(textArea);
    }
  };

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Detect if user is in Messenger/Facebook in-app browser
  const isInAppBrowser = /FBAN|FBAV|Instagram|Messenger/i.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* In-app browser warning */}
      {isInAppBrowser && (
        <div className="bg-yellow-500 text-white p-4 text-center text-sm">
          ⚠️ Otwórz tę stronę w przeglądarce Safari lub Chrome dla lepszego działania
        </div>
      )}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-turquoise-500 text-white p-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => onNavigate("welcome")}
        >
          <FiArrowLeft size={24} />
        </Button>
      </div>

      {/* Attraction Image */}
      <div className="relative -mt-8 mx-4">
        <ImageWithFallback
          src={attraction.image}
          alt={attraction.name}
          className="w-full h-56 object-cover rounded-xl shadow-lg"
        />
        {attraction.isOrganizer && (
          <Badge className="absolute top-3 right-3 bg-purple-600 text-white">
            Ty jesteś organizatorem
          </Badge>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Title */}
        <div>
          <h2 className="mb-1">{attraction.name}</h2>
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <FiMapPin size={16} />
            <span>{attraction.location}</span>
          </div>
          <p className="text-sm text-blue-600">{attraction.ticketType}</p>
        </div>

        {/* Date and Time Info */}
        {(attraction.date || attraction.time) && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-900">
                <FiCalendar size={20} className="text-blue-600" />
                <span>{formatDate(attraction.date)}</span>
              </div>
              {attraction.time && (
                <div className="flex items-center gap-2 text-blue-900">
                  <FiClock size={20} className="text-blue-600" />
                  <span>Godzina wejścia: {attraction.time}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Timer Card */}
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiClock size={20} className="text-orange-600" />
              <span className="text-orange-900">Grupa zamyka się za</span>
            </div>
            <div className="text-orange-600">
              {String(timeLeft.hours).padStart(2, "0")}:
              {String(timeLeft.minutes).padStart(2, "0")}:
              {String(timeLeft.seconds).padStart(2, "0")}
            </div>
          </div>
        </Card>

        {/* Progress Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FiUsers size={20} className="text-blue-600" />
              <span>Postęp grupy</span>
            </div>
            <span className="text-blue-600">
              {currentMembers}/{minPeople}
              {currentMembers > minPeople && ` (+${currentMembers - minPeople})`}
            </span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-3 mb-2" />
          <p className="text-sm text-gray-600">
            {spotsLeft > 0 
              ? `Zostało ${spotsLeft} ${spotsLeft === 1 ? 'miejsce' : spotsLeft <= 4 ? 'miejsca' : 'miejsc'} do minimum 15 osób`
              : currentMembers === minPeople 
                ? 'Grupa kompletna! Czeka na potwierdzenie 📞'
                : `Grupa kompletna z ${currentMembers} osobami! Czeka na potwierdzenie 📞`
            }
          </p>
          {spotsLeft > 0 ? (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                📬 Po zapełnieniu grupy nasz zespół potwierdzi dostępność z obiektem, a następnie wyśle bilety na email i SMS
              </p>
            </div>
          ) : (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                📞 Nasz zespół kontaktuje się z obiektem. Bilety zostaną wysłane na Twój email i SMS po potwierdzeniu
              </p>
            </div>
          )}
        </Card>

        {/* Savings Card */}
        <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiTrendingDown size={20} className="text-green-600" />
                <span>Twoja oszczędność</span>
              </div>
              <p className="text-gray-600 text-sm">Cena regularna: {attraction.regularPrice} zł</p>
            </div>
            <div className="text-right">
              <p className="text-green-600 mb-1">{attraction.groupPrice} zł</p>
              <Badge className="bg-green-600 text-white">
                Oszczędzasz {attraction.regularPrice - attraction.groupPrice} zł
              </Badge>
            </div>
          </div>
        </Card>



        {/* Members */}
        <Card className="p-5">
          <h3 className="mb-4">Członkowie grupy ({currentMembers})</h3>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p>{member.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {member.isOrganizer && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                        Organizator
                      </Badge>
                    )}
                    {member.numberOfTickets > 1 && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                        {member.numberOfTickets} biletów
                      </Badge>
                    )}
                  </div>
                  {/* Show ticket holders details for organizer */}
                  {attraction.isOrganizer && member.ticketHolders && member.ticketHolders.length > 0 && (
                    <div className="mt-2 pl-4 space-y-1">
                      {member.ticketHolders.map((holder: any, idx: number) => (
                        <p key={idx} className="text-sm text-gray-600">
                          • {holder.name} {holder.isChild && <span className="text-blue-600">(dziecko)</span>}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Join Button */}
        {!attraction.isOrganizer && (
          <div className="space-y-3">
            <Button
              onClick={() => {
                console.log('🎯 Join group button clicked:', {
                  groupId: groupData.id || groupData.groupId,
                  attractionId: groupData.attractionId
                });
                onNavigate("payment", {
                  ...attraction,
                  groupId: groupData.id || groupData.groupId,
                  id: groupData.attractionId // Restore attraction ID
                });
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-turquoise-600 text-white h-14 shadow-lg"
            >
              Dołącz do grupy - {attraction.groupPrice} zł
            </Button>
            {!isFull && (
              <div className="flex">
                <Button
                  onClick={handleShare}
                  className="flex-1"
                >
                  <FiShare2 className="w-4 h-4 mr-2" />
                  Udostępnij
                </Button>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="flex-1"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Skopiowano!" : "Kopiuj link"}
                </Button>
              </div>
            )}
          </div>
        )}

        {attraction.isOrganizer && !isFull && (
          <div className="space-y-3">
            <Button
              onClick={() => {
                console.log('🎯 Organizer payment button clicked:', {
                  groupId: groupData.id || groupData.groupId,
                  attractionId: groupData.attractionId
                });
                onNavigate("payment", {
                  ...attraction,
                  groupId: groupData.id || groupData.groupId,
                  id: groupData.attractionId // Restore attraction ID
                });
              }}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white h-14 shadow-lg"
            >
              Zapłać za swoje bilety - {attraction.groupPrice * (members.find(m => m.isOrganizer)?.numberOfTickets || currentMembers)} zł
            </Button>
            <Button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white h-12 shadow-lg"
            >
              <FiShare2 size={20} className="mr-2" />
              Zaproś znajomych do grupy
            </Button>
            <p className="text-center text-sm text-gray-600">
              Zaproś znajomych, aby zapełnić grupę
            </p>
          </div>
        )}
      </div>
    </div>
  );
}