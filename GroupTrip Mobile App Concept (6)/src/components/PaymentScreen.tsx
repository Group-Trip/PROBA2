import { FiArrowLeft, FiCreditCard, FiLock, FiCheckCircle, FiGift, FiUsers, FiPlus, FiMinus } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { api } from "../lib/api";

interface PaymentScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  attraction: any;
}

interface TicketHolder {
  name: string;
  isChild: boolean;
}

export function PaymentScreen({ onNavigate, attraction }: PaymentScreenProps) {
  // Ref do pierwszego inputa w formularzu karty
  const cardholderInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll do formularza płatności gdy ekran się załaduje
  useEffect(() => {
    // Multi-step scroll - najpierw na dół, potem do inputa
    const timer1 = setTimeout(() => {
      // Krok 1: Przewiń na sam dół strony
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'instant' // natychmiast bez animacji
      });
    }, 100);
    
    const timer2 = setTimeout(() => {
      // Krok 2: Przewiń trochę w górę do inputa karty
      if (cardholderInputRef.current) {
        const elementPosition = cardholderInputRef.current.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - 100;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Focus z opóźnieniem
        setTimeout(() => {
          cardholderInputRef.current?.focus();
        }, 400);
      }
    }, 400);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  console.log('💳 PaymentScreen loaded:', {
    groupId: attraction.groupId,
    attractionId: attraction.id,
    isOrganizer: attraction.isOrganizer
  });
  
  // Jeśli organizator tworzy grupę i ma już dane uczestników, użyj ich
  const isOrganizerWithData = attraction.isOrganizer && attraction.members?.[0]?.ticketHolders?.length > 0;
  const initialTickets = isOrganizerWithData 
    ? attraction.members[0].ticketHolders.length 
    : (attraction.isOrganizer && attraction.currentMembers ? attraction.currentMembers : 1);
  
  const initialHolders = isOrganizerWithData
    ? attraction.members[0].ticketHolders
    : Array.from({ length: initialTickets }, () => ({ name: "", isChild: false }));

  const [numberOfTickets, setNumberOfTickets] = useState(initialTickets);
  const [ticketHolders, setTicketHolders] = useState<TicketHolder[]>(initialHolders);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleTicketCountChange = (newCount: number) => {
    if (newCount < 1 || newCount > 10) return;
    
    setNumberOfTickets(newCount);
    
    // Adjust ticket holders array
    if (newCount > ticketHolders.length) {
      const newHolders = [...ticketHolders];
      for (let i = ticketHolders.length; i < newCount; i++) {
        newHolders.push({ name: "", isChild: false });
      }
      setTicketHolders(newHolders);
    } else {
      setTicketHolders(ticketHolders.slice(0, newCount));
    }
  };

  const updateTicketHolder = (index: number, field: 'name' | 'isChild', value: string | boolean) => {
    const newHolders = [...ticketHolders];
    if (field === 'name') {
      newHolders[index].name = value as string;
    } else {
      newHolders[index].isChild = value as boolean;
    }
    setTicketHolders(newHolders);
  };

  const ticketsTotal = attraction.groupPrice * numberOfTickets;
  const total = ticketsTotal;

  const handlePayment = async () => {
    setIsProcessing(true);
    setError("");

    try {
      let updatedGroupData = null;
      
      // First, join the group if it's not the user's own group
      if (!attraction.isOrganizer && attraction.groupId) {
        const joinResponse = await api.joinGroup(attraction.groupId, {
          numberOfTickets,
          ticketHolders
        });
        
        // Get updated group data from the join response
        if (joinResponse.group) {
          updatedGroupData = joinResponse.group;
          console.log('✅ Joined group successfully:', {
            groupId: updatedGroupData.id,
            currentMembers: updatedGroupData.currentMembers,
            numberOfPeople: updatedGroupData.numberOfPeople,
            status: updatedGroupData.status
          });
        }
      }

      // Create booking
      const bookingResponse = await api.createBooking({
        groupId: attraction.groupId || null,
        attractionId: attraction.id,
        attractionName: attraction.name,
        numberOfTickets,
        ticketHolders,
        totalPaid: total,
        date: attraction.date,
        time: attraction.time
      });

      if (bookingResponse.success) {
        onNavigate("confirmation", { 
          ...attraction,
          // Override with updated group data if available
          ...(updatedGroupData && {
            currentMembers: updatedGroupData.currentMembers,
            status: updatedGroupData.status,
            members: updatedGroupData.members
          }),
          numberOfTickets,
          ticketHolders,
          totalPaid: total,
          bookingId: bookingResponse.booking.id
        });
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || "Błąd podczas przetwarzania płatności. Spróbuj ponownie.");
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceed = ticketHolders.every(holder => holder.name.trim() !== "") && 
                      cardholderName.trim() !== "" &&
                      cardNumber.length > 0 &&
                      !isProcessing;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-turquoise-500 text-white p-6">
        <div className="flex items-center mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => onNavigate("group-details", attraction)}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h2 className="ml-4">Płatność</h2>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-8">
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </Card>
        )}

        {/* Number of Tickets */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiUsers className="w-5 h-5 text-blue-600" />
                <h3>Liczba biletów</h3>
              </div>
              <p className="text-sm text-gray-600">{attraction.ticketType}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleTicketCountChange(numberOfTickets - 1)}
                disabled={numberOfTickets <= 1}
              >
                <FiMinus size={16} />
              </Button>
              <span className="flex-1 text-center">{numberOfTickets}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleTicketCountChange(numberOfTickets + 1)}
                disabled={numberOfTickets >= 10}
                className="w-8 h-8 p-0"
              >
                <FiPlus size={16} />
              </Button>
            </div>
          </div>
        </Card>

        {/* Ticket Holders Information */}
        <Card className="p-5">
          <h3 className="mb-4">Dane uczestników</h3>
          <div className="space-y-4">
            {ticketHolders.map((holder, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <p className="text-sm text-gray-600">Bilet #{index + 1}</p>
                <div>
                  <Label htmlFor={`holder-name-${index}`}>Imię i nazwisko</Label>
                  <Input
                    id={`holder-name-${index}`}
                    placeholder="Jan Kowalski"
                    value={holder.name}
                    onChange={(e) => updateTicketHolder(index, 'name', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`child-${index}`}
                    checked={holder.isChild}
                    onCheckedChange={(checked) => updateTicketHolder(index, 'isChild', checked as boolean)}
                  />
                  <label
                    htmlFor={`child-${index}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Dziecko
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Order Summary */}
        <Card className="p-5">
          <h3 className="mb-4">Podsumowanie zamówienia</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">{attraction.name}</span>
              <span>{numberOfTickets} {numberOfTickets === 1 ? 'bilet' : 'bilety'}</span>
            </div>
            {ticketHolders.map((holder, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-500">
                  {holder.name || `Uczestnik ${index + 1}`} {holder.isChild && '(Dziecko)'}
                </span>
                <span className="text-gray-600">
                  {attraction.groupPrice} zł
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between">
              <span>Razem do zapłaty</span>
              <span className="text-blue-600">{total} zł</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Oszczędność na grupie</span>
              <span className="text-green-600">
                -{(attraction.regularPrice - attraction.groupPrice) * numberOfTickets} zł
              </span>
            </div>
          </div>
        </Card>

        {/* Payment Method */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h3>Metoda płatności</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="cardholder-name">Imię i nazwisko posiadacza karty</Label>
              <Input
                ref={cardholderInputRef}
                id="cardholder-name"
                placeholder="Jan Kowalski"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="card">Numer karty</Label>
              <Input
                id="card"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Data ważności</Label>
                <Input
                  id="expiry"
                  placeholder="MM/RR"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  maxLength={5}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={3}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Security Notice */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-blue-900 mb-1">Bezpieczna płatność</p>
              <p className="text-sm text-blue-700">
                Twoje dane są szyfrowane i bezpieczne. Nie przechowujemy danych karty.
              </p>
            </div>
          </div>
        </Card>

        {/* Benefits List */}
        <Card className="p-4 bg-amber-50 border-amber-200">
          <p className="mb-3 text-amber-900">📬 Jak otrzymam bilety?</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                Po płatności otrzymasz potwierdzenie rezerwacji
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                Bilety otrzymasz na email i SMS po zapełnieniu grupy
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                Gwarancja zwrotu jeśli grupa się nie zapełni
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <p className="text-sm text-green-800">
                Bilety cyfrowe z kodami QR na e-mail
              </p>
            </div>
          </div>
        </Card>

        {/* Pay Button */}
        <Button
          onClick={handlePayment}
          disabled={!canProceed}
          className="w-full bg-gradient-to-r from-blue-600 to-turquoise-600 text-white h-14 shadow-lg disabled:opacity-50"
        >
          {isProcessing ? "Przetwarzanie..." : `Zapłać ${total.toFixed(2)} zł`}
        </Button>

        <p className="text-center text-sm text-gray-500">
          Kontynuując, akceptujesz nasz Regulamin i Politykę Prywatności
        </p>
      </div>
    </div>
  );
}