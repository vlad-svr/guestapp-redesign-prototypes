/* Realistic mock data for the prototype — vocabulary mirrors @chekin/core statuses. */
window.MOCK = {
  user: { name: 'Marta Ferreira', email: 'marta@solmarproperties.com', company: 'Solmar Properties', initials: 'MF' },

  properties: [
    { id: 'h1', name: 'Casa Azulejo', location: 'Lisbon, Portugal', type: 'Apartment', rooms: 3, setup: 100, connections: ['Police (SEF)', 'Tourist tax'], status: 'active', bookings30d: 14, av: 1 },
    { id: 'h2', name: 'Villa Miramar', location: 'Barcelona, Spain', type: 'Villa', rooms: 5, setup: 100, connections: ['Police (Mossos)', 'Stats (INE)', 'Smart lock'], status: 'active', bookings30d: 9, av: 2 },
    { id: 'h3', name: 'Loft Chiado 21', location: 'Lisbon, Portugal', type: 'Loft', rooms: 1, setup: 80, connections: ['Tourist tax'], status: 'active', bookings30d: 11, av: 3, setupMissing: 'Identity verification off' },
    { id: 'h4', name: 'Trastevere Suites', location: 'Rome, Italy', type: 'Apartment', rooms: 2, setup: 55, connections: ['Police (Alloggiati)'], status: 'attention', bookings30d: 7, av: 4, setupMissing: 'Police credentials invalid' },
    { id: 'h5', name: 'Alpine Chalet Bruck', location: 'Salzburg, Austria', type: 'Chalet', rooms: 4, setup: 90, connections: ['Feratel card', 'Stats'], status: 'active', bookings30d: 4, av: 5 },
    { id: 'h6', name: 'Marina Bay 804', location: 'Valencia, Spain', type: 'Apartment', rooms: 2, setup: 30, connections: [], status: 'draft', bookings30d: 0, av: 6, setupMissing: 'Setup incomplete — 3 steps left' }
  ],

  reservations: [
    { id: 'r1', property: 'Casa Azulejo', guest: 'Jonas Weber', guests: 2, registered: 2, checkIn: 'Jul 17', checkOut: 'Jul 21', nights: 4, status: 'complete', source: 'Booking.com', ref: 'BK-88213', checkinOnline: 'complete', iv: 'complete', police: 'complete', payment: 'paid', av: 1, tags: ['Arriving today'] },
    { id: 'r2', property: 'Villa Miramar', guest: 'Amélie Rousseau', guests: 4, registered: 1, checkIn: 'Jul 17', checkOut: 'Jul 24', nights: 7, status: 'action', source: 'Airbnb', ref: 'HM3QZ8', checkinOnline: 'pending', iv: 'pending', police: 'pending', payment: 'paid', av: 2, tags: ['Arriving today'], issue: '3 of 4 guests not registered' },
    { id: 'r3', property: 'Trastevere Suites', guest: 'Liam O’Connor', guests: 2, registered: 2, checkIn: 'Jul 17', checkOut: 'Jul 19', nights: 2, status: 'error', source: 'Direct', ref: 'DIR-2291', checkinOnline: 'complete', iv: 'complete', police: 'error', payment: 'paid', av: 3, tags: ['Arriving today'], issue: 'Police submission failed — credentials rejected' },
    { id: 'r4', property: 'Loft Chiado 21', guest: 'Sofia Ricci', guests: 1, registered: 1, checkIn: 'Jul 18', checkOut: 'Jul 22', nights: 4, status: 'progress', source: 'Booking.com', ref: 'BK-88317', checkinOnline: 'sent', iv: 'in_progress', police: 'pending', payment: 'paid', av: 4 },
    { id: 'r5', property: 'Alpine Chalet Bruck', guest: 'Novak family', guests: 6, registered: 6, checkIn: 'Jul 18', checkOut: 'Jul 25', nights: 7, status: 'complete', source: 'Vrbo', ref: 'VR-5501', checkinOnline: 'complete', iv: 'complete', police: 'complete', payment: 'paid', av: 5 },
    { id: 'r6', property: 'Villa Miramar', guest: 'Chen Wei', guests: 3, registered: 0, checkIn: 'Jul 19', checkOut: 'Jul 21', nights: 2, status: 'action', source: 'Airbnb', ref: 'HMKW21', checkinOnline: 'pending', iv: 'not_started', police: 'pending', payment: 'unpaid', av: 6, issue: 'Booking unpaid · check-in not started' },
    { id: 'r7', property: 'Casa Azulejo', guest: 'Emma Johansson', guests: 2, registered: 2, checkIn: 'Jul 20', checkOut: 'Jul 27', nights: 7, status: 'progress', source: 'Booking.com', ref: 'BK-88420', checkinOnline: 'sent', iv: 'complete', police: 'pending', payment: 'paid', av: 2 },
    { id: 'r8', property: 'Marina Bay 804', guest: 'Igor Petrov', guests: 2, registered: 0, checkIn: 'Jul 22', checkOut: 'Jul 26', nights: 4, status: 'action', source: 'Direct', ref: 'DIR-2308', checkinOnline: 'not_sent', iv: 'not_started', police: 'pending', payment: 'pending', av: 3, issue: 'Property setup incomplete — check-in link cannot be sent' },
    { id: 'r9', property: 'Trastevere Suites', guest: 'Hannah Becker', guests: 2, registered: 2, checkIn: 'Jul 14', checkOut: 'Jul 17', nights: 3, status: 'complete', source: 'Airbnb', ref: 'HMPL77', checkinOnline: 'complete', iv: 'complete', police: 'complete', payment: 'paid', av: 4, tags: ['Departing today'] },
    { id: 'r10', property: 'Loft Chiado 21', guest: 'Carlos Mendes', guests: 1, registered: 1, checkIn: 'Jul 12', checkOut: 'Jul 17', nights: 5, status: 'complete', source: 'Booking.com', ref: 'BK-88101', checkinOnline: 'complete', iv: 'excluded', police: 'complete', payment: 'paid', av: 5, tags: ['Departing today'] }
  ],

  extraReservations: [
    ['Priya Nair', 'Villa Miramar', 2, 2, 'Jul 21', 'Jul 25', 4, 'Booking.com', 'progress'],
    ['Tomás Silva', 'Casa Azulejo', 3, 3, 'Jul 21', 'Jul 23', 2, 'Direct', 'complete'],
    ['Yuki Tanaka', 'Loft Chiado 21', 1, 0, 'Jul 22', 'Jul 28', 6, 'Airbnb', 'progress'],
    ['Nora Lindqvist', 'Alpine Chalet Bruck', 4, 4, 'Jul 23', 'Jul 30', 7, 'Vrbo', 'complete'],
    ['Marco Bianchi', 'Trastevere Suites', 2, 1, 'Jul 23', 'Jul 26', 3, 'Booking.com', 'progress'],
    ['Claire Fontaine', 'Villa Miramar', 5, 0, 'Jul 24', 'Jul 27', 3, 'Expedia', 'progress'],
    ['Diego Herrera', 'Casa Azulejo', 2, 2, 'Jul 25', 'Aug 1', 7, 'Booking.com', 'complete'],
    ['Anna Fischer', 'Marina Bay 804', 2, 0, 'Jul 26', 'Jul 29', 3, 'Airbnb', 'progress'],
    ['Oliver Smith', 'Loft Chiado 21', 1, 1, 'Jul 27', 'Jul 31', 4, 'Direct', 'complete'],
    ['Fatima El Amrani', 'Villa Miramar', 3, 0, 'Jul 28', 'Aug 4', 7, 'Booking.com', 'progress'],
    ['Jan Kowalski', 'Alpine Chalet Bruck', 6, 2, 'Jul 29', 'Aug 2', 4, 'Vrbo', 'progress'],
    ['Isabella Rossi', 'Trastevere Suites', 2, 0, 'Jul 30', 'Aug 3', 4, 'Expedia', 'progress'],
    ['Lucas Moreau', 'Casa Azulejo', 2, 0, 'Aug 1', 'Aug 5', 4, 'Booking.com', 'progress'],
    ['Emma Johansson', 'Villa Miramar', 4, 0, 'Aug 3', 'Aug 10', 7, 'Airbnb', 'progress'],
    ['Pedro Alves', 'Loft Chiado 21', 1, 0, 'Aug 5', 'Aug 8', 3, 'Direct', 'progress'],
    ['Greta Müller', 'Casa Azulejo', 2, 2, 'Jul 10', 'Jul 14', 4, 'Booking.com', 'complete'],
    ['Sean Murphy', 'Villa Miramar', 3, 3, 'Jul 8', 'Jul 12', 4, 'Airbnb', 'complete'],
    ['Aiko Sato', 'Alpine Chalet Bruck', 2, 2, 'Jul 11', 'Jul 16', 5, 'Vrbo', 'complete']
  ],

  tasks: [
    { id: 't1', kind: 'error', title: 'Police submission failed', detail: 'Trastevere Suites · Liam O’Connor — Alloggiati credentials rejected', action: 'Fix credentials', href: 'property-detail.html#sec-compliance' },
    { id: 't2', kind: 'warning', title: '3 guests not registered', detail: 'Villa Miramar · Amélie Rousseau — arriving today', action: 'Resend check-in link', href: 'reservation-detail.html' },
    { id: 't3', kind: 'warning', title: 'Booking unpaid', detail: 'Villa Miramar · Chen Wei — arrives in 2 days', action: 'Request payment', href: 'reservations.html' },
    { id: 't4', kind: 'info', title: 'Finish property setup', detail: 'Marina Bay 804 — 3 steps left before it can accept check-ins', action: 'Continue setup', href: 'property-detail.html' }
  ]
};

(function () {
  var refPrefix = { 'Booking.com': 'BK-', Airbnb: 'HM', Vrbo: 'VR-', Direct: 'DIR-', Expedia: 'EXP-' };
  MOCK.extraReservations.forEach(function (t, i) {
    var complete = t[8] === 'complete';
    MOCK.reservations.push({
      id: 'r' + (11 + i),
      guest: t[0], property: t[1], guests: t[2], registered: t[3],
      checkIn: t[4], checkOut: t[5], nights: t[6],
      status: t[8], source: t[7],
      ref: refPrefix[t[7]] + (88500 + i * 37),
      checkinOnline: complete ? 'complete' : t[3] > 0 ? 'sent' : 'pending',
      iv: complete ? 'complete' : t[3] > 0 ? 'in_progress' : 'not_started',
      police: complete ? 'complete' : 'pending',
      payment: 'paid',
      av: (i % 6) + 1
    });
  });
  delete MOCK.extraReservations;
})();
