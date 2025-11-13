import { FiArrowLeft, FiTag, FiGift, FiTrendingUp, FiSettings, FiLogOut, FiAward, FiCalendar } from "react-icons/fi";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { auth } from "../lib/auth";
import { api } from "../lib/api";
import { attractions } from "../lib/attractions";
import { FiShield } from "react-icons/fi";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [createdGroups, setCreatedGroups] = useState<any[]>([]);
  const [allUserGroups, setAllUserGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const user = auth.getCurrentUser();

  // Auto-scroll to top when profile screen loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const [bookingsData, groupsData, allGroupsData] = await Promise.all([
        api.getUserBookings(),
        api.getUserGroups(),
        api.getAllUserGroups()
      ]);
      setBookings(bookingsData.bookings || []);
      setCreatedGroups(groupsData.groups || []);
      setAllUserGroups(allGroupsData.groups || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      onNavigate("auth");
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUpgradeToStaff = async () => {
    try {
      setIsUpgrading(true);
      const token = localStorage.getItem('access_token') || publicAnonKey;
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-72f8f261/upgrade-claudia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upgrade to staff');
      }

      alert('✅ ' + data.message);
      
      // Reload the page to refresh user data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error upgrading to staff:', error);
      alert('❌ Błąd: ' + (error.message || 'Nie udało się uzyskać uprawnień pracownika'));
    } finally {
      setIsUpgrading(false);
    }
  };

  const totalSaved = bookings.reduce((sum, booking) => {
    const attraction = attractions.find(a => a.id === booking.attractionId);
    if (attraction) {
      return sum + ((attraction.regularPrice - attraction.groupPrice) * booking.numberOfTickets);
    }
    return sum;
  }, 0);

  const tripsCompleted = bookings.length;
  const groupsOrganized = createdGroups.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-turquoise-500 text-white p-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => onNavigate("welcome")}
          >
            <FiArrowLeft size={24} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleSettingsClick}
          >
            <Settings className="w-6 h-6" />
          </Button>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center">
          <Avatar className="w-24 h-24 mb-3 border-4 border-white shadow-lg">
            <AvatarFallback className="bg-white text-blue-600 text-2xl">
              {user?.user_metadata?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'GU'}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-white mb-1">{user?.user_metadata?.name || 'Użytkownik'}</h2>
          <p className="text-white/80">{user?.email}</p>
        </div>
      </div>

      <div className="px-4 -mt-16 space-y-4 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <div className="flex flex-col items-center">
              <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-gray-900 mb-1">{totalSaved} zł</p>
              <p className="text-xs text-gray-500">Oszczędzone</p>
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="flex flex-col items-center">
              <Ticket className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-gray-900 mb-1">{tripsCompleted}</p>
              <p className="text-xs text-gray-500">Wycieczki</p>
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="flex flex-col items-center">
              <Crown className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-gray-900 mb-1">{groupsOrganized}</p>
              <p className="text-xs text-gray-500">Zorganizowane</p>
            </div>
          </Card>
        </div>

        {/* Rewards Card */}
        <Card className="p-5 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6" />
              <h3 className="text-white">Nagrody</h3>
            </div>
            <Badge className="bg-white text-purple-600">Poziom 2</Badge>
          </div>
          <p className="text-white/90 text-sm mb-3">
            Zdobyłeś 320 punktów! Jeszcze 80 do odblokowania poziomu 3.
          </p>
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div className="bg-white h-full" style={{ width: '80%' }} />
          </div>
        </Card>

        {/* User Groups */}
        <div>
          <h3 className="mb-3 px-1">Twoje grupy</h3>
          {isLoading ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">Ładowanie...</p>
            </Card>
          ) : allUserGroups.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600 mb-2">Brak grup</p>
              <p className="text-sm text-gray-500">Dołącz do grupy lub utwórz swoją!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {allUserGroups.map((group) => {
                const attraction = attractions.find(a => a.id === group.attractionId);
                if (!attraction) return null;
                
                const formatDate = (dateStr: string) => {
                  const date = new Date(dateStr + 'T12:00:00');
                  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
                };

                const isOrganizer = group.organizerId === user?.id;
                const myMember = group.members.find((m: any) => m.userId === user?.id);
                const myTicketsCount = myMember?.numberOfTickets || 0;

                // Check if tickets were sent
                const ticketsSent = group.ticketsSentAt != null;

                return (
                  <Card key={group.id} className="overflow-hidden">
                    <div className="flex gap-3 p-3">
                      <ImageWithFallback
                        src={attraction.image}
                        alt={attraction.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div className="pr-2">
                            <p>{attraction.name}</p>
                            <p className="text-sm text-gray-500">{attraction.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <p className="text-sm text-gray-500">{formatDate(group.date)} · {group.time}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 flex-wrap">
                            {isOrganizer && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                                👑 Organizator
                              </Badge>
                            )}
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                              {myTicketsCount} {myTicketsCount === 1 ? 'miejsce' : myTicketsCount <= 4 ? 'miejsca' : 'miejsc'}
                            </Badge>
                            {ticketsSent ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                ✅ Bilety wysłane
                              </Badge>
                            ) : group.status === 'full' ? (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                                📞 Weryfikacja z obiektem
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                                ⏳ {group.currentMembers}/{group.numberOfPeople}
                              </Badge>
                            )}
                          </div>
                          {ticketsSent && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigate('tickets', { groupId: group.id });
                              }}
                            >
                              Zobacz
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Achievements */}
        <Card className="p-5">
          <h3 className="mb-4">Osiągnięcia</h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-3xl mb-1">🎯</div>
              <p className="text-xs text-gray-600">Pierwsza wycieczka</p>
            </div>
            <div>
              <div className="text-3xl mb-1">👥</div>
              <p className="text-xs text-gray-600">Gwiazda grup</p>
            </div>
            <div>
              <div className="text-3xl mb-1">💰</div>
              <p className="text-xs text-gray-600">Mistrz oszczędzania</p>
            </div>
            <div className="opacity-40">
              <div className="text-3xl mb-1">🏆</div>
              <p className="text-xs text-gray-600">Legenda</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            variant="outline"
            className="w-full justify-start h-12"
            onClick={() => onNavigate("tickets")}
          >
            <Ticket className="w-5 h-5 mr-3" />
            Wszystkie moje bilety
          </Button>
          
          {/* Staff Panel - Only visible for staff users */}
          {auth.isStaff() && (
            <>
              <Separator />
              <Button
                variant="outline"
                className="w-full justify-start h-12 border-purple-200 bg-purple-50 hover:bg-purple-100"
                onClick={() => onNavigate("admin")}
              >
                <Shield className="w-5 h-5 mr-3 text-purple-600" />
                <span className="text-purple-700">Panel Pracownika</span>
              </Button>
            </>
          )}

          {/* Upgrade button - only for claudia.wolna@op.pl who isn't staff yet */}
          {!auth.isStaff() && user?.email?.toLowerCase() === 'claudia.wolna@op.pl' && (
            <>
              <Separator />
              <Button
                variant="outline"
                className="w-full justify-start h-12 border-green-200 bg-green-50 hover:bg-green-100"
                onClick={handleUpgradeToStaff}
                disabled={isUpgrading}
              >
                <Shield className="w-5 h-5 mr-3 text-green-600" />
                <span className="text-green-700">
                  {isUpgrading ? 'Aktualizacja konta...' : '🔑 Aktywuj uprawnienia pracownika'}
                </span>
              </Button>
            </>
          )}
          
          <Separator />
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Wyloguj się
          </Button>
        </div>
      </div>
    </div>
  );
}