import { FiCheckCircle, FiDownload, FiShare2, FiCalendar, FiMapPin, FiClock, FiUsers, FiTag } from "react-icons/fi";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { api } from "../lib/api";

interface ConfirmationScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  attraction: any;
}

export function ConfirmationScreen({ onNavigate, attraction }: ConfirmationScreenProps) {
  const [groupData, setGroupData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const numberOfTickets = attraction.numberOfTickets || 1;
  const ticketHolders = attraction.ticketHolders || [{ name: "Uczestnik", isChild: false }];
  const totalPaid = attraction.totalPaid;
  
  // Calculate total savings
  const regularTotal = attraction.regularPrice * numberOfTickets;
  const totalSavings = regularTotal - (totalPaid || (attraction.groupPrice * numberOfTickets));
  
  // Check if group is full
  const isFull = groupData?.status === 'full' || groupData?.currentMembers >= groupData?.numberOfPeople;

  // Auto-scroll to top when confirmation screen loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Load group data if groupId exists
  useEffect(() => {
    const loadGroupData = async () => {
      if (attraction.groupId) {
        try {
          setIsLoading(true);
          const response = await api.getGroup(attraction.groupId);
          if (response.group) {
            console.log('✅ Group data loaded:', {
              id: response.group.id,
              currentMembers: response.group.currentMembers,
              numberOfPeople: response.group.numberOfPeople,
              status: response.group.status,
              isFull: response.group.currentMembers >= response.group.numberOfPeople
            });
            setGroupData(response.group);
          }
        } catch (error) {
          console.error('Error loading group data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadGroupData();
    
    // Refresh every 3 seconds to check if group became full
    const interval = setInterval(loadGroupData, 3000);
    return () => clearInterval(interval);
  }, [attraction.groupId]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "9 listopada 2025";
    const date = new Date(dateStr + 'T12:00:00');
    const months = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 
                    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="p-6 space-y-6 pb-8">
        {/* Success Icon */}
        <div className="flex flex-col items-center text-center pt-8">
          <div className="bg-green-500 rounded-full p-4 mb-4">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-green-900 mb-2">Płatność zakończona!</h1>
          <p className="text-green-700">
            Rezerwacja na {attraction.name} potwierdzona
          </p>
          <p className="text-green-600 text-sm mt-1">
            {numberOfTickets} × {attraction.ticketType}
          </p>
        </div>

        {/* Savings Highlight */}
        <Card className="p-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center">
          <p className="text-white/90 mb-2">Twoja oszczędność</p>
          <p className="text-4xl mb-1">{totalSavings.toFixed(0)} zł</p>
          <p className="text-white/80 text-sm">
            {numberOfTickets > 1 
              ? `na ${numberOfTickets} biletach`
              : `zamiast ${attraction.regularPrice} zł płacisz tylko ${attraction.groupPrice} zł`
            }
          </p>
        </Card>

        {/* Ticket Holders */}
        {numberOfTickets > 1 && (
          <Card className="p-5">
            <h3 className="mb-4">Uczestnicy ({numberOfTickets})</h3>
            <div className="space-y-2">
              {ticketHolders.map((holder: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <span>{holder.name}</span>
                  </div>
                  {holder.isChild && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                      Dziecko
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Reservation Status */}
        {isFull ? (
          <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="flex flex-col items-center text-center">
              <div className="bg-amber-500 rounded-full p-3 mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-amber-900 mb-2">🎉 Grupa zapełniona!</h3>
              <p className="text-sm text-amber-700 mb-4">
                Nasz zespół kontaktuje się z obiektem aby potwierdzić dostępność. {numberOfTickets === 1 ? 'Twój bilet' : `Twoje ${numberOfTickets} bilety`} zostanie wysłany na email i SMS po potwierdzeniu
              </p>
              <div className="w-full bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Numer rezerwacji</p>
                <p className="text-lg text-gray-900 tracking-wider">GT-{attraction.bookingId || Math.floor(Math.random() * 100000).toString().padStart(5, '0')}</p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-turquoise-50 border-blue-200">
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 rounded-full p-3 mb-4">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-blue-900 mb-2">Czekamy na zapełnienie grupy</h3>
              <p className="text-sm text-blue-700 mb-4">
                {numberOfTickets === 1 ? 'Twój bilet' : `Twoje ${numberOfTickets} bilety`} zostanie wysłany na email i SMS, gdy grupa się zapełni
              </p>
              <div className="w-full bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Numer rezerwacji</p>
                <p className="text-lg text-gray-900 tracking-wider">GT-{attraction.bookingId || Math.floor(Math.random() * 100000).toString().padStart(5, '0')}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Ticket Details */}
        <Card className="p-5">
          <h3 className="mb-4">Szczegóły biletu</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Atrakcja</p>
                <p>{attraction.name}</p>
                <p className="text-sm text-gray-600">{attraction.location}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Data wizyty</p>
                <p>{formatDate(attraction.date)}</p>
              </div>
            </div>
            <Separator />
            {attraction.time && (
              <>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Godzina wejścia</p>
                    <p>{attraction.time}</p>
                  </div>
                </div>
                <Separator />
              </>
            )}
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">
                  {numberOfTickets === 1 ? 'Wielkość grupy' : 'Bilety / Wielkość grupy'}
                </p>
                <p>
                  {numberOfTickets > 1 && `${numberOfTickets} bilety / `}
                  {attraction.requiredMembers || attraction.minPeople} osób
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-turquoise-600 hover:from-blue-700 hover:to-turquoise-700 h-12">
            <Share2 className="w-5 h-5 mr-2" />
            Udostępnij link do grupy
          </Button>
        </div>

        {/* Next Steps */}
        <Card className="p-4 bg-amber-50 border-amber-200">
          <p className="text-amber-900 mb-2">📬 Kiedy otrzymam bilety?</p>
          <div className="space-y-2 text-sm text-amber-800">
            <p>
              ✅ <strong>Krok 1:</strong> Rezerwacja potwierdzona - jesteś tutaj!
            </p>
            {!isFull ? (
              <>
                <p>
                  ⏳ <strong>Krok 2:</strong> Czekamy aż grupa się zapełni ({attraction.minPeople || 15} osób)
                </p>
                <p>
                  📞 <strong>Krok 3:</strong> Nasz zespół potwierdzi dostępność z obiektem
                </p>
                <p>
                  📧 <strong>Krok 4:</strong> Otrzymasz {numberOfTickets === 1 ? 'bilet' : 'bilety'} na email i SMS
                </p>
              </>
            ) : (
              <>
                <p>
                  ✅ <strong>Krok 2:</strong> Grupa zapełniona - ukończone!
                </p>
                <p>
                  📞 <strong>Krok 3:</strong> Nasz zespół kontaktuje się z obiektem - w toku
                </p>
                <p>
                  📧 <strong>Krok 4:</strong> Otrzymasz {numberOfTickets === 1 ? 'bilet' : 'bilety'} na email i SMS po potwierdzeniu
                </p>
              </>
            )}
          </div>
          {!isFull && (
            <div className="mt-3 pt-3 border-t border-amber-200">
              <p className="text-sm text-amber-700">
                💡 Zachęć znajomych do dołączenia, aby szybciej otrzymać bilety!
              </p>
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="space-y-2 pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onNavigate("profile")}
          >
            Zobacz moje rezerwacje
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onNavigate("join-group")}
          >
            Przeglądaj więcej grup
          </Button>
        </div>
      </div>
    </div>
  );
}
