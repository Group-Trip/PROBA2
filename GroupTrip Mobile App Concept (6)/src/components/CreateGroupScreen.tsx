import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Clock, Users, MapPin, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { attractions } from "../lib/attractions";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { api } from "../lib/api";

interface CreateGroupScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  initialData?: {
    attractionId?: number;
    attractionName?: string;
    preSelectedDate?: string;
  };
}

interface TicketHolder {
  name: string;
  isChild: boolean;
}

export function CreateGroupScreen({ onNavigate, initialData }: CreateGroupScreenProps) {
  const [selectedAttractionId, setSelectedAttractionId] = useState<string>(
    initialData?.attractionId?.toString() || ""
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    initialData?.preSelectedDate || ""
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [numberOfTickets, setNumberOfTickets] = useState<string>("");
  const [ticketHolders, setTicketHolders] = useState<TicketHolder[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  // Auto-scroll to top when create group screen loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const TOTAL_SLOTS = 15; // Stała liczba miejsc w każdej grupie
  const selectedAttraction = attractions.find(a => a.id.toString() === selectedAttractionId);
  const totalOccupiedSpots = parseInt(numberOfTickets || "0");

  const handleTicketCountChange = (newCount: string) => {
    setNumberOfTickets(newCount);
    const count = parseInt(newCount);
    
    // Adjust ticket holders array
    if (count > ticketHolders.length) {
      const newHolders = [...ticketHolders];
      for (let i = ticketHolders.length; i < count; i++) {
        newHolders.push({ name: "", isChild: false });
      }
      setTicketHolders(newHolders);
    } else {
      setTicketHolders(ticketHolders.slice(0, count));
    }
  };

  const updateTicketHolder = (index: number, field: keyof TicketHolder, value: string | boolean) => {
    const updated = [...ticketHolders];
    updated[index] = { ...updated[index], [field]: value };
    setTicketHolders(updated);
  };

  const handleCreate = async () => {
    if (!selectedAttraction || !selectedDate || !selectedTime || numberOfTickets === "") return;
    
    // Walidacja - wszystkie bilety muszą mieć imiona
    const allNamesProvided = ticketHolders.every(holder => holder.name.trim() !== "");
    if (!allNamesProvided) {
      setError("Proszę podać imiona wszystkich uczestników");
      return;
    }
    
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError("Musisz być zalogowany aby utworzyć grupę. Zaloguj się ponownie.");
      console.error('❌ No access token found - user not logged in');
      return;
    }
    
    console.log('✅ User is logged in, creating group...');
    setIsCreating(true);
    setError("");

    try {
      const occupiedSpots = totalOccupiedSpots;

      const groupData = {
        attractionId: selectedAttraction.id,
        attractionName: selectedAttraction.name,
        location: selectedAttraction.location,
        category: selectedAttraction.category,
        date: selectedDate,
        time: selectedTime,
        numberOfPeople: TOTAL_SLOTS,
        currentMembers: occupiedSpots,
        ticketHolders: ticketHolders,
        groupPrice: selectedAttraction.groupPrice,
        regularPrice: selectedAttraction.regularPrice,
        minPeople: selectedAttraction.minPeople,
      };

      console.log('🚀 Creating group with data:', groupData);
      const response = await api.createGroup(groupData);

      if (response.success) {
        console.log('✅ Group created successfully:', {
          groupId: response.group.id,
          attractionId: response.group.attractionId,
          currentMembers: response.group.currentMembers,
          numberOfPeople: response.group.numberOfPeople,
          status: response.group.status
        });
        
        // Navigate to group details with the full group data from server
        onNavigate("group-details", {
          ...selectedAttraction,
          ...response.group,
          groupId: response.group.id,         // Group ID
          attractionId: response.group.attractionId, // Keep original attraction ID
          isOrganizer: true,
        });
      }
    } catch (err: any) {
      console.error('❌ Create group error:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      let errorMessage = err.message || "Błąd tworzenia grupy. Spróbuj ponownie.";
      
      // Check for common errors
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        errorMessage = "Sesja wygasła. Zaloguj się ponownie.";
      } else if (errorMessage.includes('Missing required fields')) {
        errorMessage = "Brakuje wymaganych danych. Wypełnij wszystkie pola.";
      }
      
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const canCreate = selectedAttractionId && selectedDate && selectedTime && numberOfTickets !== "" && 
                    ticketHolders.every(holder => holder.name.trim() !== "") && !isCreating;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-turquoise-500 text-white p-6">
        <div className="flex items-center mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => onNavigate("welcome")}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h2 className="ml-4">Utwórz Nową Grupę</h2>
        </div>
        <p className="text-white/90 mt-2">Zorganizuj wspólny wyjazd i oszczędzajcie razem!</p>
      </div>

      <div className="p-4 space-y-4 pb-8">
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </Card>
        )}

        {/* Organizer Info Card */}
        <Card className="p-4 bg-gradient-to-r from-blue-500 to-turquoise-500 text-white">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <p className="mb-1">Jak to działa?</p>
              <p className="text-sm text-white/90">
                ⏰ Bilety dostępne od <strong>jutra</strong> i na kolejne dni<br/>
                1. Wybierz atrakcję i datę<br/>
                2. Podaj ile biletów kupujesz (grupa zawsze ma 15 miejsc)<br/>
                3. Wpisz dane wszystkich uczestników<br/>
                4. Reszta miejsc będzie czekać na innych uczestników
              </p>
            </div>
          </div>
        </Card>

        {/* Attraction Selection */}
        <Card className="p-5">
          <Label className="mb-3 block">Wybierz atrakcję</Label>
          <Select 
            value={selectedAttractionId} 
            onValueChange={setSelectedAttractionId}
            disabled={!!initialData?.attractionId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Wybierz park lub atrakcję" />
            </SelectTrigger>
            <SelectContent>
              {attractions.map((attraction) => (
                <SelectItem key={attraction.id} value={attraction.id.toString()}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{attraction.name} - {attraction.location}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {initialData?.attractionId && (
            <p className="text-xs text-gray-500 mt-2">
              ✓ Wybrano z szybkiej rezerwacji
            </p>
          )}
        </Card>

        {/* Selected Attraction Preview */}
        {selectedAttraction && (
          <Card className="overflow-hidden">
            <ImageWithFallback
              src={selectedAttraction.image}
              alt={selectedAttraction.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="mb-1">{selectedAttraction.name}</h3>
              <p className="text-xs text-blue-600 mb-2">{selectedAttraction.ticketType}</p>
              <p className="text-gray-600 text-sm mb-3">{selectedAttraction.description}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <p className="text-gray-400 line-through text-sm">
                    {selectedAttraction.regularPrice} zł
                  </p>
                  <p className="text-blue-600">{selectedAttraction.groupPrice} zł/osoba</p>
                </div>
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  Oszczędność {selectedAttraction.regularPrice - selectedAttraction.groupPrice} zł
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Date Selection */}
        <Card className="p-5">
          <Label htmlFor="date" className="mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Wybierz datę wyjazdu
          </Label>
          <Select 
            value={selectedDate} 
            onValueChange={setSelectedDate}
            disabled={!!initialData?.preSelectedDate}
          >
            <SelectTrigger id="date" className="w-full">
              <SelectValue placeholder="Wybierz datę" />
            </SelectTrigger>
            <SelectContent>
              {/* If date is pre-selected from quick booking, show it first */}
              {initialData?.preSelectedDate && !["2025-11-07", "2025-11-08", "2025-11-09", "2025-11-10", "2025-11-11", "2025-11-12", "2025-11-13", "2025-11-14", "2025-11-15", "2025-11-16", "2025-11-17", "2025-11-18", "2025-11-19", "2025-11-20"].includes(initialData.preSelectedDate) && (
                <SelectItem value={initialData.preSelectedDate}>
                  {new Date(initialData.preSelectedDate + 'T12:00:00').toLocaleDateString('pl-PL', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </SelectItem>
              )}
              {/* Dates starting from TOMORROW (7 Nov 2025) for next 2 weeks */}
              <SelectItem value="2025-11-07">Piątek, 7 listopada 2025</SelectItem>
              <SelectItem value="2025-11-08">Sobota, 8 listopada 2025</SelectItem>
              <SelectItem value="2025-11-09">Niedziela, 9 listopada 2025</SelectItem>
              <SelectItem value="2025-11-10">Poniedziałek, 10 listopada 2025</SelectItem>
              <SelectItem value="2025-11-11">Wtorek, 11 listopada 2025</SelectItem>
              <SelectItem value="2025-11-12">Środa, 12 listopada 2025</SelectItem>
              <SelectItem value="2025-11-13">Czwartek, 13 listopada 2025</SelectItem>
              <SelectItem value="2025-11-14">Piątek, 14 listopada 2025</SelectItem>
              <SelectItem value="2025-11-15">Sobota, 15 listopada 2025</SelectItem>
              <SelectItem value="2025-11-16">Niedziela, 16 listopada 2025</SelectItem>
              <SelectItem value="2025-11-17">Poniedziałek, 17 listopada 2025</SelectItem>
              <SelectItem value="2025-11-18">Wtorek, 18 listopada 2025</SelectItem>
              <SelectItem value="2025-11-19">Środa, 19 listopada 2025</SelectItem>
              <SelectItem value="2025-11-20">Czwartek, 20 listopada 2025</SelectItem>
            </SelectContent>
          </Select>
          {initialData?.preSelectedDate && (
            <p className="text-xs text-gray-500 mt-2">
              ✓ Data wybrana z szybkiej rezerwacji
            </p>
          )}
        </Card>

        {/* Time Selection */}
        <Card className="p-5">
          <Label htmlFor="time" className="mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Godzina wejścia
          </Label>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger id="time" className="w-full">
              <SelectValue placeholder="Wybierz godzinę" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="09:00">09:00</SelectItem>
              <SelectItem value="10:00">10:00</SelectItem>
              <SelectItem value="11:00">11:00</SelectItem>
              <SelectItem value="12:00">12:00</SelectItem>
              <SelectItem value="13:00">13:00</SelectItem>
              <SelectItem value="14:00">14:00</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        {/* Number of People */}
        {/* Group size info */}
        <Card className="p-5 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-600 rounded-full p-2">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-purple-900">Wielkość grupy</p>
              <p className="text-sm text-purple-700">Minimum 15 osób (może być więcej)</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 mt-3">
            <p className="text-center text-sm text-gray-600">
              Grupa startuje z minimum <span className="text-purple-600">15 osób</span>, ale może się elastycznie rozszerzyć jeśli ktoś rezerwuje więcej biletów na raz
            </p>
          </div>
        </Card>

        {/* Number of Tickets */}
        <Card className="p-5">
          <Label htmlFor="tickets" className="mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Ile biletów kupujesz?
          </Label>
        </Card>

        {/* Ticket Holders Information */}
        {numberOfTickets !== "" && ticketHolders.length > 0 && (
          <Card className="p-5">
            <Label className="mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Dane uczestników ({ticketHolders.length} {ticketHolders.length === 1 ? 'osoba' : ticketHolders.length <= 4 ? 'osoby' : 'osób'})
            </Label>
            <div className="space-y-4">
              {ticketHolders.map((holder, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <p className="text-sm text-gray-600">Uczestnik {index + 1}</p>
                  <div>
                    <Label htmlFor={`name-${index}`} className="text-sm mb-1">
                      Imię i nazwisko
                    </Label>
                    <Input
                      id={`name-${index}`}
                      value={holder.name}
                      onChange={(e) => updateTicketHolder(index, "name", e.target.value)}
                      placeholder="Np. Jan Kowalski"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`child-${index}`}
                      checked={holder.isChild}
                      onCheckedChange={(checked) => updateTicketHolder(index, "isChild", checked as boolean)}
                    />
                    <Label
                      htmlFor={`child-${index}`}
                      className="text-sm cursor-pointer"
                    >
                      To jest dziecko (dla celów organizacyjnych)
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Create Button */}
        <Button
          onClick={handleCreate}
          disabled={!canCreate}
          className="w-full bg-gradient-to-r from-blue-600 to-turquoise-600 text-white h-14 shadow-lg disabled:opacity-50"
        >
          {isCreating ? "Tworzenie grupy..." : "Utwórz grupę"}
        </Button>
      </div>
    </div>
  );
}