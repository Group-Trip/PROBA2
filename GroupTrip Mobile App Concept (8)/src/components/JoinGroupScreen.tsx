import { FiArrowLeft, FiUsers, FiCalendar, FiClock, FiMapPin, FiTrendingDown } from "react-icons/fi";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { attractions } from "../lib/attractions";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { api } from "../lib/api";

interface JoinGroupScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  initialGroupId?: string;
}

interface Group {
  id: string;
  attractionId: number;
  attractionName: string;
  location: string;
  category: string;
  date: string;
  time: string;
  currentMembers: number;
  numberOfPeople: number;
  organizerName: string;
  groupPrice: number;
  regularPrice: number;
}

export function JoinGroupScreen({ onNavigate, initialGroupId }: JoinGroupScreenProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Auto-scroll to top when join group screen loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDeepLinkGroup = async (groupId: string) => {
    try {
      console.log('🔗 Deep link - fetching group:', groupId);
      const response = await api.getGroup(groupId);
      if (response.group) {
        const group = response.group;
        const attraction = attractions.find(a => a.id === group.attractionId);
        if (attraction) {
          console.log('✅ Deep link - navigating to group details');
          onNavigate("group-details", {
            ...attraction,
            ...group,
            groupId: group.id,
            attractionId: group.attractionId,
            isOrganizer: false
          });
        }
      }
    } catch (err) {
      console.error('Deep link error:', err);
      // If group not found, just show all groups
    }
  };

  useEffect(() => {
    fetchGroups();
    
    // If initialGroupId is provided (from deep link), auto-navigate to that group
    if (initialGroupId) {
      handleDeepLinkGroup(initialGroupId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const response = await api.getGroups();
      const fetchedGroups = response.groups || [];
      console.log(`📋 Fetched ${fetchedGroups.length} groups in JoinGroupScreen:`, fetchedGroups.map((g: Group) => ({
        id: g.id,
        attractionName: g.attractionName,
        currentMembers: g.currentMembers,
        numberOfPeople: g.numberOfPeople
      })));
      setGroups(fetchedGroups);
    } catch (err: any) {
      console.error('Fetch groups error:', err);
      setError(err.message || "Błąd ładowania grup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGroup = (group: Group) => {
    const attraction = attractions.find(a => a.id === group.attractionId);
    if (attraction) {
      console.log('📍 Navigating to group details:', {
        groupId: group.id,
        attractionId: group.attractionId,
        currentMembers: group.currentMembers,
        numberOfPeople: group.numberOfPeople,
        status: group.status
      });
      onNavigate("group-details", {
        ...attraction,
        ...group,
        groupId: group.id,        // Explicitly set groupId
        attractionId: group.attractionId,  // Keep original attraction ID
        isOrganizer: false
      });
    }
  };

  const formatDate = (dateStr: string) => {
    // Parse date in local timezone by adding time component
    const date = new Date(dateStr + 'T12:00:00');
    const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const months = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 
                    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const renderGroupCard = (group: Group, badgeColor?: string, badgeText?: string) => {
    const attraction = attractions.find(a => a.id === group.attractionId);
    if (!attraction) return null;
    
    const minPeople = group.minPeople || 15;
    const spotsLeft = Math.max(0, minPeople - group.currentMembers);
    const progress = (group.currentMembers / minPeople) * 100;

    return (
      <Card 
        key={group.id} 
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => handleJoinGroup(group)}
      >
        <div className="relative">
          <ImageWithFallback
            src={attraction.image}
            alt={attraction.name}
            className="w-full h-32 object-cover"
          />
          <Badge className={badgeColor || "absolute top-2 right-2 bg-white text-blue-600"}>
            {badgeText || (spotsLeft > 0 
              ? `${spotsLeft} ${spotsLeft === 1 ? 'miejsce' : spotsLeft <= 4 ? 'miejsca' : 'miejsc'}` 
              : 'Kompletna!')
            }
          </Badge>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="mb-1">{attraction.name}</h3>
              <p className="text-sm text-gray-600">{attraction.location}</p>
              <p className="text-xs text-blue-600 mt-1">{attraction.ticketType}</p>
            </div>
          </div>

          {/* Date and Time */}
          <div className="flex gap-4 mb-3 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(group.date)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{group.time}</span>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Postęp grupy</span>
              <span className="text-blue-600">
                {group.currentMembers}/{minPeople}
                {group.currentMembers > minPeople && ` (+${group.currentMembers - minPeople})`}
              </span>
            </div>
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all ${badgeColor?.includes('orange') ? 'bg-orange-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Savings and Organizer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <span className="text-green-600 text-sm">
                Oszczędzasz {attraction.regularPrice - attraction.groupPrice} zł
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Org: {group.organizerName}
            </Badge>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-turquoise-500 text-white p-6 pb-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => onNavigate("welcome")}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h2 className="ml-4">Dołącz do Grupy</h2>
        </div>
        <p className="text-white/90">Znajdź grupę i zaoszczędź na bilecie</p>
      </div>

      <div className="p-4 space-y-4 pb-8">
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </Card>
        )}

        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">Ładowanie dostępnych grup...</p>
          </Card>
        ) : groups.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600 mb-2">Brak dostępnych grup</p>
            <p className="text-sm text-gray-500">Utwórz pierwszą grupę i zaproś znajomych!</p>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="all">Wszystkie</TabsTrigger>
              <TabsTrigger value="soon">Wkrótce</TabsTrigger>
              <TabsTrigger value="filling">Zapełniają się</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3 mt-4">
              {groups.map((group) => renderGroupCard(group))}
            </TabsContent>

            <TabsContent value="soon" className="space-y-3 mt-4">
              {groups
                .filter(g => {
                  const date = new Date(g.date + 'T12:00:00');
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const diff = date.getTime() - today.getTime();
                  const days = diff / (1000 * 60 * 60 * 24);
                  // Show only groups from TOMORROW onwards (days >= 1), not today
                  return days <= 7 && days >= 1;
                })
                .map((group) => renderGroupCard(group))}
            </TabsContent>

            <TabsContent value="filling" className="space-y-3 mt-4">
              {groups
                .filter(g => (g.currentMembers / g.numberOfPeople) >= 0.6)
                .map((group) => renderGroupCard(
                  group, 
                  "absolute top-2 right-2 bg-orange-500 text-white",
                  "Prawie pełna!"
                ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}