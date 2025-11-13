import { useState } from "react";
import { FiCalendar as Calendar, FiChevronRight as ChevronRight, FiUsers as Users, FiX as X } from "react-icons/fi";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { SimpleCalendar } from "./SimpleCalendar";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { attractions } from "../lib/attractions";
import { api } from "../lib/api";

interface QuickBookingFlowProps {
  onNavigate: (screen: string, params?: any) => void;
}

export function QuickBookingFlow({ onNavigate }: QuickBookingFlowProps) {
  const [selectedAttraction, setSelectedAttraction] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [existingGroups, setExistingGroups] = useState<any[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  // Helper function to format date in local timezone (not UTC)
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAttractionSelect = (attractionId: number) => {
    setSelectedAttraction(attractionId);
    setSelectedDate(undefined);
    setExistingGroups([]);
  };

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date || !selectedAttraction) return;
    
    setSelectedDate(date);
    setIsLoadingGroups(true);

    try {
      // Fetch all groups for this attraction and date
      const response = await api.getGroups();
      const dateStr = formatDateToString(date);
      
      const filtered = response.groups.filter((group: any) => 
        group.attractionId === selectedAttraction && 
        group.date === dateStr &&
        group.status !== 'cancelled'
      );

      setExistingGroups(filtered);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setExistingGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const handleCreateNewGroup = () => {
    if (!selectedAttraction || !selectedDate) return;

    const attraction = attractions.find(a => a.id === selectedAttraction);
    if (!attraction) return;

    // Navigate to create group with pre-filled data
    onNavigate("create-group", {
      attractionId: selectedAttraction,
      attractionName: attraction.name,
      preSelectedDate: formatDateToString(selectedDate)
    });
  };

  const handleJoinGroup = (groupId: string) => {
    onNavigate("join-group", { groupId });
  };

  const handleClose = () => {
    setSelectedAttraction(null);
    setSelectedDate(undefined);
    setExistingGroups([]);
  };

  const selectedAttractionData = selectedAttraction 
    ? attractions.find(a => a.id === selectedAttraction)
    : null;

  // Get emoji for category
  const getCategoryEmoji = (category: string) => {
    if (category.includes("Termy")) return "♨️";
    if (category.includes("Wyciąg")) return "🎿";
    return "🎟️";
  };

  return (
    <div className="space-y-3">
      {!selectedAttraction ? (
        <div>
          <h3 className="mb-3 text-center text-white/90 text-sm">lub wybierz szybką rezerwację:</h3>
          
          {/* Attractions Grid */}
          <div className="grid grid-cols-3 gap-3">
            {attractions.map((attraction) => (
              <Card
                key={attraction.id}
                className="p-3 cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-white/95 backdrop-blur"
                onClick={() => handleAttractionSelect(attraction.id)}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-full h-14 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={attraction.image}
                      alt={attraction.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xl">{getCategoryEmoji(attraction.category)}</div>
                  <p className="text-xs leading-tight line-clamp-2">{attraction.name}</p>
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                    {attraction.groupPrice} zł
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Date Selection & Groups */
        <div>
          <Card className="p-4 bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCategoryEmoji(selectedAttractionData?.category || "")}</span>
                <div>
                  <p className="font-medium text-gray-900">{selectedAttractionData?.name}</p>
                  <p className="text-xs text-gray-500">{selectedAttractionData?.location}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleClose}
              >
                <X size={16} />
              </Button>
            </div>

            {!selectedDate ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">Wybierz datę wyjazdu:</p>
                <p className="text-xs text-blue-600 mb-3">⏰ Rezerwacje dostępne od jutra</p>
                <div className="flex justify-center">
                  <SimpleCalendar
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      // Block today and past dates - allow only from tomorrow onwards
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      tomorrow.setHours(0, 0, 0, 0);
                      return date < tomorrow;
                    }}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium text-gray-900">
                      {selectedDate.toLocaleDateString('pl-PL', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setSelectedDate(undefined)}
                  >
                    Zmień
                  </Button>
                </div>

                {isLoadingGroups ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-500">Sprawdzam dostępne grupy...</p>
                  </div>
                ) : existingGroups.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-2">
                      Znaleziono {existingGroups.length} {existingGroups.length === 1 ? 'grupę' : 'grupy'}:
                    </p>
                    {existingGroups.map((group) => (
                      <Card key={group.id} className="p-3 bg-blue-50 border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Users className="w-4 h-4 text-blue-600" />
                              <p className="text-sm font-medium text-gray-900">
                                {group.currentMembers}/{group.minPeople || 15} osób
                                {group.currentMembers > (group.minPeople || 15) && ` (+${group.currentMembers - (group.minPeople || 15)})`}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">
                              Godzina: {group.time}
                            </p>
                            {group.status === 'full' && (
                              <Badge className="bg-orange-100 text-orange-700 text-xs mt-1">
                                Pełna - weryfikacja
                              </Badge>
                            )}
                            {group.ticketsSentAt && (
                              <Badge className="bg-green-100 text-green-700 text-xs mt-1">
                                Bilety wysłane
                              </Badge>
                            )}
                          </div>
                          {group.status === 'open' && (
                            <Button
                              size="sm"
                              className="h-8"
                              onClick={() => handleJoinGroup(group.id)}
                            >
                              Dołącz
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                    
                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleCreateNewGroup}
                      >
                        Lub utwórz nową grupę
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Brak grup na ten dzień
                      </p>
                      <p className="text-xs text-gray-500">
                        Bądź pierwszy i zaproś znajomych!
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleCreateNewGroup}
                    >
                      Utwórz nową grupę
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}