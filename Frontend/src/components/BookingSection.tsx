import {
  Calendar,
  CheckCircle,
  Download,
  Home,
  MapPin,
  Star,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { errorText } from '../api';
import { Accommodation, BookingRecord } from '../types';
import { AccommodationsGridSkeleton } from './Skeletons';

interface BookingSectionProps {
  accommodations: Accommodation[];
  isDarkMode: boolean;
  onAddBooking: (booking: BookingRecord) => Promise<BookingRecord>;
  userBookings: BookingRecord[];
  isLoading?: boolean;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  accommodations,
  isDarkMode,
  onAddBooking,
  userBookings,
  isLoading = false
}) => {
  const [today] = useState(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [activeStayModal, setActiveStayModal] = useState<Accommodation | null>(null);

  // Booking Form State
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [checkIn, setCheckIn] = useState(() => new Date(Date.now() + 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }));
  const [checkOut, setCheckOut] = useState(() => new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }));
  const [guestsCount, setGuestsCount] = useState(2);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [confirmedVoucher, setConfirmedVoucher] = useState<BookingRecord | null>(null);

  const filteredStays = accommodations.filter(stay => {
    if (filterType === 'all') return true;
    return stay.type === filterType;
  });

  const calculateTotal = (stay: Accommodation) => {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diffTime = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
    const nights = isNaN(diffTime) ? 1 : diffTime;
    return (stay.pricePerNight ?? 0) * nights;
  };

  const handleCompleteBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStayModal || submitting || activeStayModal.bookingMode === 'reference-only' || activeStayModal.pricePerNight === null || activeStayModal.maxGuests === null) return;
    if (!guestName.trim() || !guestEmail.includes('@') || !phone.trim()) { setError('Enter your name, email and phone number.'); return; }
    if (checkIn < today || checkOut <= checkIn || guestsCount < 1 || guestsCount > activeStayModal.maxGuests) { setError('Choose future dates with check-out after check-in and a guest count within room capacity.'); return; }
    setError(null); setSubmitting(true);

    const total = calculateTotal(activeStayModal);
    const newBooking: BookingRecord = {
      id: 'pending-server-confirmation',
      accommodationId: activeStayModal.id,
      accommodationName: activeStayModal.name,
      guestName: guestName || "Island Explorer",
      guestEmail: guestEmail || "traveler@example.com",
      phone: phone || "+63 917 123 4567",
      checkIn,
      checkOut,
      guestsCount,
      roomType: selectedRoom || activeStayModal.roomTypes[0] || "Standard Room",
      totalAmount: total,
      status: "CONFIRMED",
      createdAt: new Date().toISOString()
    };

    try { const saved = await onAddBooking(newBooking); setConfirmedVoucher(saved); setActiveStayModal(null); }
    catch (error) { setError(errorText(error)); }
    finally { setSubmitting(false); }
  };

  const generateGoogleCalendarUrl = (b: BookingRecord) => {
    const title = encodeURIComponent(`Homestay Reservation: ${b.accommodationName}`);
    const details = encodeURIComponent(`Booking Reference: ${b.id}\nGuest: ${b.guestName}\nRoom: ${b.roomType}\nConcepcion, Romblon Tourism.`);
    const location = encodeURIComponent(`${b.accommodationName}, Concepcion, Romblon`);
    const dates = `${b.checkIn.replace(/-/g, '')}/${b.checkOut.replace(/-/g, '')}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40 backdrop-blur-md">
              <Home className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Local Accommodations & Homestays</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Explore documented Sibale lodgings. Check the source date and confirm current operation, rates and availability locally.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none sm:flex-wrap max-w-full">
          {[
            { id: 'all', label: 'All Stays' },
            { id: 'resort', label: 'Eco-Resorts 🏝️' },
            { id: 'homestay', label: 'Family Homestays 🏡' },
            { id: 'cottage', label: 'Cliff Cottages 🛖' },
            { id: 'inn', label: 'Town Inns 🏨' },
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setFilterType(type.id)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer backdrop-blur-md whitespace-nowrap shrink-0 ${filterType === type.id
                  ? 'bg-teal-500 text-slate-950 shadow-[0_0_15px_rgba(46,196,182,0.4)]'
                  : 'bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 border border-slate-300 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/15'
                }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {userBookings.length > 0 && <div className="p-5 rounded-3xl bg-teal-500/10 border border-teal-500/30 space-y-3"><h3 className="font-bold">Your saved reservations</h3>{userBookings.map(booking => <button key={booking.id} onClick={() => setConfirmedVoucher(booking)} className="block text-left text-xs underline">{booking.accommodationName} · {booking.checkIn} to {booking.checkOut} · {booking.status}</button>)}</div>}
      {/* Confirmed Booking Voucher Banner Alert if just booked */}
      {confirmedVoucher && (
        <div className="p-6 rounded-3xl bg-teal-500/15 border border-teal-500/40 text-slate-900 dark:text-white backdrop-blur-2xl shadow-2xl relative space-y-4">
          <button
            onClick={() => setConfirmedVoucher(null)}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-teal-300 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(46,196,182,0.4)]">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-teal-800 dark:text-teal-300 font-extrabold uppercase tracking-widest">
                Instant Reservation Confirmed
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Booking Reference: {confirmedVoucher.id}</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-100/90 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Property</span>
              <span className="font-bold text-teal-800 dark:text-teal-300">{confirmedVoucher.accommodationName}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Dates</span>
              <span className="font-bold text-slate-900 dark:text-white">{confirmedVoucher.checkIn} to {confirmedVoucher.checkOut}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Guest</span>
              <span className="font-bold text-slate-900 dark:text-white">{confirmedVoucher.guestName}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Total Amount</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">₱{confirmedVoucher.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={generateGoogleCalendarUrl(confirmedVoucher)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(46,196,182,0.4)] cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Add to Google Calendar</span>
            </a>

            <button
              onClick={() => { const url = URL.createObjectURL(new Blob([JSON.stringify(confirmedVoucher, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = `voucher-${confirmedVoucher.id}.json`; link.click(); URL.revokeObjectURL(url); }}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-2 border border-slate-300 dark:bg-white/10 dark:hover:bg-white/20 dark:text-slate-100 dark:border-white/20 backdrop-blur-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Booking Voucher</span>
            </button>
          </div>
        </div>
      )}

      {/* Accommodations Grid or Skeleton Loading State */}
      {isLoading ? (
        <AccommodationsGridSkeleton count={4} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStays.map((stay) => (
              <div
                key={stay.id}
                className="group rounded-3xl border border-slate-200/90 dark:border-white/15 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/60 hover:shadow-xl flex flex-col justify-between text-slate-900 dark:text-white shadow-sm"
              >
                <div>
                  {/* Image & Price Overlay */}
                  <div className="relative h-60 overflow-hidden bg-slate-900/40">
                    <img
                      src={stay.image}
                      alt={stay.image === "/assets/photo-unavailable.svg" ? "Property photo not verified" : stay.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#061e2c]/90 via-transparent to-black/20" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-teal-500 text-slate-950 shadow-sm">
                        {stay.bookingMode === "reference-only" ? "Documented lodging" : stay.type}
                      </span>
                      {stay.isFeatured && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-slate-950">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-teal-500/40 text-teal-300 font-black text-sm">
                      {stay.pricePerNight === null ? "Rates unconfirmed" : <>₱{stay.pricePerNight.toLocaleString()} <span className="text-[11px] font-normal text-slate-300">/ night</span></>}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-300 leading-snug">{stay.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span>{stay.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-white/10 backdrop-blur-md text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200 dark:border-white/15">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{stay.reviewCount ? stay.rating : 'No reviews yet'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {stay.description}
                    </p>
                    {stay.evidenceLabel && <p className="text-xs font-bold text-teal-800 dark:text-teal-200">{stay.evidenceLabel}</p>}
                    {stay.verificationNote && <p className="text-xs text-slate-600 dark:text-slate-300">{stay.verificationNote}</p>}
                    {stay.sources?.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="block text-xs underline text-teal-700 dark:text-teal-300">{source.title}</a>)}
                    {stay.verifiedAt && <p className="text-[11px] text-slate-500 dark:text-slate-400">Source checked {stay.verifiedAt}.</p>}

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {stay.amenities.map((a, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 dark:bg-white/10 dark:text-teal-200 dark:border-white/15 backdrop-blur-sm"
                        >
                          ✓ {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0 border-t border-slate-200 dark:border-white/10 mt-4 flex items-center justify-between">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    <span>{stay.contactPhone ? `Contact: ${stay.contactPhone}` : "Contact unconfirmed"}</span>
                  </div>

                  <button
                    disabled={stay.bookingMode === "reference-only" || stay.pricePerNight === null || stay.maxGuests === null}
                    onClick={() => {
                      setActiveStayModal(stay);
                      setSelectedRoom(stay.roomTypes[0] || "Standard Room");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs shadow-[0_0_15px_rgba(46,196,182,0.4)] cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {stay.bookingMode === "reference-only" ? "Booking not enabled" : "Book Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredStays.length === 0 && (
            <div className="p-12 text-center rounded-3xl border border-dashed text-slate-400">
              <Home className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold">No accommodations match your filter.</p>
              <p className="text-xs mt-1">Try switching to "All Stays".</p>
            </div>
          )}
        </>
      )}

      {/* Booking Form Modal */}
      {activeStayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
          <div className={`relative w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden my-8 backdrop-blur-2xl ${isDarkMode ? 'bg-[#061e2c]/90 border-white/20 text-slate-100' : 'bg-white/85 border-white/40 text-slate-800'
            }`}>
            <button
              onClick={() => setActiveStayModal(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/70 border border-white/10 text-white hover:bg-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 border-b border-slate-200 dark:border-white/10">
              <span className="text-xs font-black text-teal-700 dark:text-teal-400 uppercase tracking-widest">
                Reserving Accommodation
              </span>
              <h3 className="text-xl font-black mt-0.5 text-slate-900 dark:text-white">{activeStayModal.name}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {activeStayModal.location} • ₱{activeStayModal.pricePerNight} / night
              </p>
            </div>

            <form onSubmit={handleCompleteBooking} className="p-6 space-y-4">
              {error && <p role="alert" className="p-3 rounded-xl bg-rose-100 text-rose-900">{error}</p>}
              <label className="block text-xs font-bold">Email address<input type="email" required value={guestEmail} onChange={event => setGuestEmail(event.target.value)} className="mt-2 block w-full p-3 rounded-xl border border-slate-300 dark:bg-slate-800" /></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">Full Guest Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Santos"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 text-slate-900 placeholder:text-slate-400 dark:bg-white/10 dark:text-white focus:outline-none focus:border-teal-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+63 917 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 text-slate-900 placeholder:text-slate-400 dark:bg-white/10 dark:text-white focus:outline-none focus:border-teal-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">Check-in Date *</label>
                  <input
                    type="date" min={today}
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 text-slate-900 dark:bg-white/10 dark:text-white focus:outline-none focus:border-teal-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">Check-out Date *</label>
                  <input
                    type="date" min={today}
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 text-slate-900 dark:bg-white/10 dark:text-white focus:outline-none focus:border-teal-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">Room Option *</label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-teal-500 text-xs"
                  >
                    {activeStayModal.roomTypes.map((r, i) => (
                      <option key={i} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">Guests Count</label>
                  <select
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-teal-500 text-xs"
                  >
                    {Array.from({ length: (activeStayModal.maxGuests ?? 0) }, (_, index) => index + 1).map(n => (
                      <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Summary Calculation Box */}
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-xs space-y-1 backdrop-blur-md">
                <div className="flex justify-between">
                  <span className="text-teal-800 dark:text-teal-300 font-medium">Rate ({activeStayModal.name}):</span>
                  <span className="font-bold text-slate-900 dark:text-white">₱{activeStayModal.pricePerNight} / night</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-teal-900 dark:text-teal-200 pt-1 border-t border-slate-200 dark:border-white/10">
                  <span>Estimated Total:</span>
                  <span className="text-amber-600 dark:text-amber-300">₱{calculateTotal(activeStayModal).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStayModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit" disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(46,196,182,0.4)] cursor-pointer transition-all"
                >
                  Confirm & Issue Digital Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
