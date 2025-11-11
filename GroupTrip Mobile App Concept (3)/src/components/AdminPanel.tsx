import { useState, useEffect } from "react";
import { FiArrowLeft, FiSend, FiUsers, FiCalendar, FiMapPin, FiAlertCircle, FiCopy, FiFileText, FiShield } from "react-icons/fi";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { api } from "../lib/api";
import { auth } from "../lib/auth";

interface AdminPanelProps {
  onNavigate: (screen: string) => void;
}

export function AdminPanel({ onNavigate }: AdminPanelProps) {
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingTickets, setSendingTickets] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user is staff
  const isStaff = auth.isStaff();

  // Auto-scroll to top when admin panel loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!isStaff) {
      setError('Brak dostępu - tylko dla pracowników');
      setIsLoading(false);
      return;
    }
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // Get all full groups (staff endpoint)
      const response = await api.getAllFullGroups();
      
      setGroups(response.groups || []);
    } catch (err: any) {
      console.error('Error loading groups:', err);
      setError(err.message || 'Nie udało się załadować grup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTickets = async (groupId: string) => {
    if (!confirm('Czy na pewno chcesz wysłać bilety do wszystkich uczestników tej grupy? Upewnij się, że potwierdziłeś dostępność z obiektem.')) {
      return;
    }

    try {
      setSendingTickets(groupId);
      setError("");
      
      const response = await api.sendGroupTickets(groupId);
      
      if (response.success) {
        alert('✅ Bilety zostały wysłane do wszystkich uczestników!');
        // Reload groups
        await loadGroups();
      }
    } catch (err: any) {
      console.error('Error sending tickets:', err);
      setError(err.message || 'Nie udało się wysłać biletów');
    } finally {
      setSendingTickets(null);
    }
  };

  const handleCopyParticipantsList = (group: any) => {
    const allTicketHolders = group.members.flatMap((m: any) => m.ticketHolders || []);
    const children = allTicketHolders.filter((h: any) => h.isChild).length;
    const adults = allTicketHolders.length - children;
    
    let text = `🎫 REZERWACJA GRUPOWA - ${group.attractionName}\n`;
    text += `📍 ${group.location}\n`;
    text += `📅 Data: ${formatDate(group.date)} o ${group.time}\n`;
    text += `👥 Liczba osób: ${group.currentMembers} (${adults} dorosłych, ${children} dzieci)\n`;
    text += `🆔 ID Grupy: ${group.id}\n\n`;
    text += `📝 LISTA UCZESTNIKÓW:\n\n`;
    
    group.members.forEach((member: any, idx: number) => {
      text += `${idx + 1}. ${member.name} (${member.email})\n`;
      text += `   Bilety: ${member.numberOfTickets}\n`;
      if (member.ticketHolders && member.ticketHolders.length > 0) {
        member.ticketHolders.forEach((holder: any, holderIdx: number) => {
          text += `   ${String.fromCharCode(97 + holderIdx)}. ${holder.name}${holder.isChild ? ' (dziecko)' : ''}\n`;
        });
      }
      text += '\n';
    });
    
    // Use fallback method for better compatibility
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        alert('✅ Lista uczestników skopiowana do schowka!');
      } else {
        throw new Error('Copy command failed');
      }
    } catch (err) {
      console.error('Copy error:', err);
      alert('❌ Nie udało się skopiować listy');
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const handleDeleteAllGroups = async () => {
    if (!confirm('⚠️ UWAGA: To usunie WSZYSTKIE grupy z systemu. Czy na pewno chcesz kontynuować?')) {
      return;
    }

    if (!confirm('Czy jesteś absolutnie pewien? Ta operacja jest nieodwracalna!')) {
      return;
    }

    try {
      setIsDeleting(true);
      setError("");
      
      const response = await api.deleteAllGroups();
      
      if (response.success) {
        alert(`✅ ${response.message}`);
        // Reload groups
        await loadGroups();
      }
    } catch (err: any) {
      console.error('Error deleting groups:', err);
      setError(err.message || 'Nie udało się usunąć grup');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pl-PL', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const hasTicketsSent = (group: any) => {
    return group.ticketsSentAt != null;
  };

  const pendingGroups = groups.filter(g => !hasTicketsSent(g));
  const completedGroups = groups.filter(g => hasTicketsSent(g));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 pb-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => onNavigate("welcome")}
          >
            <FiArrowLeft className="w-6 h-6" />
          </Button>
          <h2 className="ml-4">Panel Pracownika GroupTrip</h2>
        </div>
        <p className="text-white/90">
          Potwierdzaj dostępność z obiektami i wysyłaj bilety
        </p>
      </div>

      <div className="p-4 space-y-4 pb-8">
        {!isStaff ? (
          <Card className="p-8 text-center">
            <FiShield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-red-700 mb-2">Brak dostępu</h3>
            <p className="text-gray-600 mb-4">
              Ten panel jest dostępny tylko dla pracowników GroupTrip.
            </p>
            <Button
              onClick={() => onNavigate("welcome")}
              variant="outline"
            >
              Powrót do strony głównej
            </Button>
          </Card>
        ) : (
          <>
            {error && (
              <Alert variant="destructive">
                <FiAlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Instructions */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h3 className="text-blue-900 mb-2">📋 Instrukcje dla pracowników</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Sprawdź grupy które się zapełniły (15/15 osób)</li>
                <li>Zadzwoń do obiektu (termy/wyciągu) i potwierdź dostępność na daną datę i godzinę</li>
                <li>Sprawdź listę wszystkich uczestników i liczbę biletów</li>
            <li>Po potwierdzeniu kliknij "Wyślij bilety"</li>
            <li>System automatycznie wyśle bilety z kodami QR na email i SMS wszystkich uczestników</li>
          </ol>
        </Card>

        {/* Admin Actions */}
        <Card className="p-4 bg-red-50 border-red-200">
          <h3 className="text-red-900 mb-2">⚠️ Akcje administratora</h3>
          <p className="text-sm text-red-700 mb-3">
            Usuń wszystkie grupy z systemu (użyj tylko w celach testowych)
          </p>
          <Button
            variant="destructive"
            onClick={handleDeleteAllGroups}
            disabled={isDeleting || isLoading}
            className="w-full"
          >
            {isDeleting ? 'Usuwanie...' : 'Usuń wszystkie grupy'}
          </Button>
        </Card>

        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">Ładowanie grup...</p>
          </Card>
        ) : groups.length === 0 ? (
          <Card className="p-8 text-center">
            <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">Brak zapełnionych grup</p>
            <p className="text-sm text-gray-500">
              Gdy grupa się zapełni, pojawi się tutaj
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-orange-50 border-orange-200">
                <p className="text-2xl text-orange-900 mb-1">{pendingGroups.length}</p>
                <p className="text-sm text-orange-700">Czeka na weryfikację</p>
              </Card>
              <Card className="p-4 bg-green-50 border-green-200">
                <p className="text-2xl text-green-900 mb-1">{completedGroups.length}</p>
                <p className="text-sm text-green-700">Bilety wysłane</p>
              </Card>
            </div>

            <h3 className="px-1 pt-2">
              Wszystkie zapełnione grupy ({groups.length})
            </h3>

            {groups.map((group) => {
              const ticketsSent = hasTicketsSent(group);
              
              return (
                <Card key={group.id} className="overflow-hidden">
                  {/* Group Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-turquoise-500 text-white p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white">{group.attractionName}</h3>
                      {ticketsSent ? (
                        <Badge className="bg-green-500 text-white">
                          ✅ Wysłano
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500 text-white">
                          📞 Czeka
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-white/80">{group.location}</p>
                  </div>

                  {/* Group Details */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <FiCalendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Data wizyty</p>
                        <p>{formatDate(group.date)} · {group.time}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-3">
                      <FiUsers className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Uczestnicy</p>
                        <p>
                          {group.currentMembers} osób
                          {group.currentMembers > (group.minPeople || 15) && ` (min. ${group.minPeople || 15})`}
                        </p>
                        {(() => {
                          const allTicketHolders = group.members.flatMap((m: any) => m.ticketHolders || []);
                          const children = allTicketHolders.filter((h: any) => h.isChild).length;
                          const adults = allTicketHolders.length - children;
                          if (allTicketHolders.length > 0) {
                            return (
                              <p className="text-xs text-gray-500 mt-1">
                                ({adults} dorosłych, {children} dzieci)
                              </p>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-3">
                      <FiMapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">ID Grupy</p>
                        <p className="text-xs font-mono">{group.id.substring(0, 8)}...</p>
                      </div>
                    </div>

                    {ticketsSent && (
                      <>
                        <Separator />
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            ✅ Bilety wysłane: {new Date(group.ticketsSentAt).toLocaleString('pl-PL')}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Members List with All Ticket Holders */}
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-500 mb-3">
                      📝 Wszyscy uczestnicy z imiennymi biletami ({group.currentMembers}):
                    </p>
                    <div className="space-y-3">
                      {group.members.map((member: any, memberIndex: number) => (
                        <div key={memberIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Member Header */}
                          <div className="flex items-center justify-between p-3 bg-gray-100">
                            <div className="flex-1">
                              <p className="text-sm">
                                <strong>{member.name}</strong> {member.isOrganizer && '👑 Organizator'}
                              </p>
                              <p className="text-xs text-gray-600">{member.email}</p>
                            </div>
                            <Badge variant="secondary" className="text-xs ml-2">
                              {member.numberOfTickets} {member.numberOfTickets === 1 ? 'bilet' : 'biletów'}
                            </Badge>
                          </div>
                          
                          {/* Ticket Holders for this member */}
                          {member.ticketHolders && member.ticketHolders.length > 0 && (
                            <div className="p-3 bg-white space-y-2">
                              <p className="text-xs text-gray-500 mb-2">Bilety na nazwiska:</p>
                              {member.ticketHolders.map((holder: any, holderIndex: number) => (
                                <div key={holderIndex} className="flex items-center justify-between py-1.5 px-2 bg-blue-50 rounded text-sm">
                                  <span>
                                    {holderIndex + 1}. <strong>{holder.name}</strong>
                                  </span>
                                  {holder.isChild && (
                                    <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                                      Dziecko
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {!ticketsSent && (
                    <div className="p-4 pt-0 space-y-2">
                      <Button
                        onClick={() => handleCopyParticipantsList(group)}
                        variant="outline"
                        className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <FiFileText className="w-4 h-4 mr-2" />
                        Skopiuj listę uczestników
                      </Button>
                      
                      <Button
                        onClick={() => handleSendTickets(group.id)}
                        disabled={sendingTickets === group.id}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        {sendingTickets === group.id ? (
                          'Wysyłanie...'
                        ) : (
                          <>
                            <FiSend className="w-4 h-4 mr-2" />
                            Wyślij bilety ({group.currentMembers} uczestników)
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-center text-gray-500 mt-2">
                        ⚠️ Kliknij tylko po telefonicznym potwierdzeniu dostępności z obiektem
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

            {/* Back Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onNavigate("profile")}
            >
              Powrót do profilu
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
