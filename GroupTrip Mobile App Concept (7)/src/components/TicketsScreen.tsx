import { useState, useEffect } from "react";
import { FiArrowLeft as ArrowLeft, FiDownload as Download, FiShare2 as Share2, FiTag as TicketIcon, FiCalendar as Calendar, FiMapPin as MapPin, FiClock as Clock, FiUser as User } from "react-icons/fi";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { api } from "../lib/api";

interface TicketsScreenProps {
  onNavigate: (screen: string) => void;
  groupId?: string;
}

export function TicketsScreen({ onNavigate, groupId }: TicketsScreenProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Auto-scroll to top when tickets screen loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    loadTickets();
  }, [groupId]);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      let response;
      if (groupId) {
        response = await api.getGroupTickets(groupId);
      } else {
        response = await api.getUserTickets();
        // Also load user's groups to show helpful message
        const groupsResponse = await api.getAllUserGroups();
        setUserGroups(groupsResponse.groups || []);
      }
      
      setTickets(response.tickets || []);
    } catch (err: any) {
      console.error('Error loading tickets:', err);
      setError(err.message || 'Nie udało się załadować biletów');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const months = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 
                    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const renderQRCode = (qrData: string) => {
    // Simple QR code pattern
    return (
      <svg
        width="180"
        height="180"
        viewBox="0 0 200 200"
        className="bg-white"
      >
        <rect width="200" height="200" fill="white" />
        <g fill="black">
          {/* Corners */}
          <rect x="10" y="10" width="50" height="50" />
          <rect x="20" y="20" width="30" height="30" fill="white" />
          <rect x="140" y="10" width="50" height="50" />
          <rect x="150" y="20" width="30" height="30" fill="white" />
          <rect x="10" y="140" width="50" height="50" />
          <rect x="20" y="150" width="30" height="30" fill="white" />
          
          {/* Dynamic pattern based on QR data */}
          {qrData.split('').map((char, i) => {
            const code = char.charCodeAt(0);
            return (
              <rect
                key={i}
                x={70 + (i % 6) * 20}
                y={70 + Math.floor(i / 6) * 20}
                width="10"
                height="10"
                opacity={code % 2 === 0 ? 1 : 0}
              />
            );
          })}
        </g>
      </svg>
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
            onClick={() => onNavigate("profile")}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h2 className="ml-4">Moje Bilety</h2>
        </div>
        <p className="text-white/90">
          {groupId ? 'Bilety dla wybranej grupy' : 'Wszystkie Twoje bilety'}
        </p>
      </div>

      <div className="p-4 space-y-4 pb-8">
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </Card>
        )}

        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">Ładowanie biletów...</p>
          </Card>
        ) : tickets.length === 0 ? (
          <Card className="p-8 text-center">
            <TicketIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            {userGroups.length > 0 ? (
              <>
                <p className="text-gray-600 mb-2">Bilety jeszcze niedostępne</p>
                <p className="text-sm text-gray-500 mb-4">
                  Masz {userGroups.length} {userGroups.length === 1 ? 'grupę' : userGroups.length <= 4 ? 'grupy' : 'grup'}. 
                  Bilety pojawią się tutaj po zapełnieniu grupy i potwierdzeniu przez pracownika.
                </p>
                <Button
                  onClick={() => onNavigate("profile")}
                  variant="outline"
                  className="mt-2"
                >
                  Zobacz swoje grupy
                </Button>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-2">Brak dostępnych biletów</p>
                <p className="text-sm text-gray-500 mb-4">
                  Nie należysz jeszcze do żadnej grupy
                </p>
                <Button
                  onClick={() => onNavigate("join-group")}
                  className="mt-2"
                >
                  Przeglądaj grupy
                </Button>
              </>
            )}
          </Card>
        ) : (
          <>
            {/* Info banner */}
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-start gap-2">
                <TicketIcon className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-green-900 mb-1">
                    ✅ Masz {tickets.length} {tickets.length === 1 ? 'bilet' : tickets.length <= 4 ? 'bilety' : 'biletów'}
                  </p>
                  <p className="text-sm text-green-700">
                    Pokaż kod QR przy wejściu
                  </p>
                </div>
              </div>
            </Card>

            {/* Tickets */}
            {tickets.map((ticket, index) => (
              <Card key={ticket.ticketId} className="overflow-hidden">
                {/* Ticket Header */}
                <div className="bg-gradient-to-r from-blue-500 to-turquoise-500 text-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white">Bilet #{index + 1}</h3>
                    <Badge className="bg-white text-blue-600">
                      {ticket.ticketId}
                    </Badge>
                  </div>
                  <p className="text-white/90">{ticket.attractionName}</p>
                  <p className="text-sm text-white/80">{ticket.location}</p>
                </div>

                {/* QR Code */}
                <div className="p-6 bg-white flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-3">
                    {renderQRCode(ticket.qrCode)}
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    Kod biletu: {ticket.ticketId}
                  </p>
                  <p className="text-xs text-gray-400">
                    Wygenerowano: {new Date(ticket.generatedAt).toLocaleString('pl-PL')}
                  </p>
                </div>

                <Separator />

                {/* Ticket Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Uczestnik</p>
                      <p className="flex items-center gap-2">
                        {ticket.holderName}
                        {ticket.isChild && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                            Dziecko
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Data wizyty</p>
                      <p>{formatDate(ticket.date)}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Godzina wejścia</p>
                      <p>{ticket.time}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Lokalizacja</p>
                      <p>{ticket.location}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Pobierz bilet PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Udostępnij
                  </Button>
                </div>
              </Card>
            ))}

            {/* Important Info */}
            <Card className="p-4 bg-amber-50 border-amber-200">
              <p className="text-amber-900 mb-2">⚠️ Ważne informacje</p>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>Pokaż kod QR przy wejściu</li>
                <li>Bilety są ważne tylko w podanym dniu i godzinie</li>
                <li>Każdy bilet jest unikalny i jednorazowy</li>
                <li>Zachowaj bilety w telefonie lub wydrukuj</li>
              </ul>
            </Card>
          </>
        )}

        {/* Back Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onNavigate("profile")}
        >
          Powrót do profilu
        </Button>
      </div>
    </div>
  );
}