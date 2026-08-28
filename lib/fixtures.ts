import type { ScreenshotAnalysis } from '@/types/analysis';

export type ExampleId = 'event' | 'bill' | 'message' | 'trip';

export interface ExampleFixture {
  id: ExampleId;
  shortLabel: string;
  imageCount: number;
  imageLabels: string[];
  analysis: ScreenshotAnalysis;
}

export const exampleFixtures: Record<ExampleId, ExampleFixture> = {
  event: {
    id: 'event',
    shortLabel: 'Try an event',
    imageCount: 1,
    imageLabels: ['Event flyer'],
    analysis: {
      contentType: 'event',
      title: 'DevFest DC 2026',
      summary: 'DevFest DC is taking place at Fuse at Mason Square in Arlington, Virginia.',
      whatMatters: 'You need to arrive at 9:30 AM at Fuse at Mason Square.',
      whySaved: {
        reason: 'You probably saved this to remember when and where DevFest starts.',
        confidence: 0.94,
      },
      urgency: { level: 'now', score: 94, reason: 'Check-in begins tomorrow morning.' },
      plan: [
        { task: 'Add DevFest DC to your calendar', dueDate: null, priority: 'high', source: 'suggested' },
        { task: 'Arrive for check-in by 9:30 AM', dueDate: '2026-08-28T09:30:00', priority: 'high', source: 'explicit' },
        { task: 'Plan the trip to Mason Square', dueDate: null, priority: 'medium', source: 'suggested' },
      ],
      thread: null,
      visualEntities: [
        { type: 'date', label: 'August 28, 2026', sourceImageIndex: 0, box: { x: 0.08, y: 0.57, width: 0.38, height: 0.11 }, action: 'calendar' },
        { type: 'time', label: '9:30 AM', sourceImageIndex: 0, box: { x: 0.52, y: 0.57, width: 0.38, height: 0.11 }, action: 'calendar' },
        { type: 'location', label: 'Fuse at Mason Square, Arlington, VA', sourceImageIndex: 0, box: { x: 0.08, y: 0.73, width: 0.72, height: 0.1 }, action: 'maps' },
      ],
      suggestedAction: {
        label: 'Add it to your calendar',
        reason: 'Save the event details now so check-in time and location are easy to find.',
      },
      canCreateCalendarEvent: true,
      canCreateTask: false,
      event: {
        title: 'DevFest DC 2026',
        startDateTime: '2026-08-28T09:30:00',
        endDateTime: '2026-08-28T17:00:00',
        allDay: false,
        location: 'Fuse at Mason Square, Arlington, VA',
        description: 'DevFest DC 2026. Check-in begins at 9:30 AM.',
      },
      task: null,
      entities: {
        dates: ['August 28, 2026'],
        times: ['9:30 AM'],
        locations: ['Fuse at Mason Square', 'Arlington, VA'],
        urls: [],
        emails: [],
        phoneNumbers: [],
        amounts: [],
      },
      keyDetails: [
        { label: 'Date', value: 'Friday, August 28' },
        { label: 'Check-in', value: '9:30 AM' },
        { label: 'Location', value: 'Fuse at Mason Square' },
        { label: 'City', value: 'Arlington, VA' },
      ],
      warnings: [],
      confidence: 0.98,
    },
  },
  bill: {
    id: 'bill',
    shortLabel: 'Try a bill',
    imageCount: 1,
    imageLabels: ['Electric bill'],
    analysis: {
      contentType: 'bill',
      title: 'Electric bill',
      summary: 'Your August electric bill has an outstanding balance of $82.17.',
      whatMatters: 'Your $82.17 payment is due September 4.',
      whySaved: {
        reason: 'You likely saved this because the $82.17 payment is due September 4.',
        confidence: 0.98,
      },
      urgency: { level: 'later', score: 46, reason: 'The payment deadline is more than a week away.' },
      plan: [
        { task: 'Pay the $82.17 electric bill', dueDate: '2026-09-04', priority: 'high', source: 'explicit' },
        { task: 'Save the payment confirmation', dueDate: null, priority: 'low', source: 'suggested' },
      ],
      thread: null,
      visualEntities: [
        { type: 'amount', label: '$82.17', sourceImageIndex: 0, box: { x: 0.08, y: 0.27, width: 0.52, height: 0.12 }, action: 'task' },
        { type: 'deadline', label: 'September 4, 2026', sourceImageIndex: 0, box: { x: 0.08, y: 0.4, width: 0.65, height: 0.07 }, action: 'task' },
      ],
      suggestedAction: {
        label: 'Set a payment reminder',
        reason: 'Copy the task so the due date does not get lost in your camera roll.',
      },
      canCreateCalendarEvent: false,
      canCreateTask: true,
      event: null,
      task: {
        title: 'Pay electric bill ($82.17)',
        dueDate: '2026-09-04',
        notes: 'Amount due: $82.17. Account ending in 2841.',
      },
      entities: {
        dates: ['September 4, 2026'],
        times: [],
        locations: [],
        urls: ['myutility.example/pay'],
        emails: [],
        phoneNumbers: [],
        amounts: ['$82.17'],
      },
      keyDetails: [
        { label: 'Amount due', value: '$82.17' },
        { label: 'Due date', value: 'September 4, 2026' },
        { label: 'Account', value: '•••• 2841' },
      ],
      warnings: ['A late fee may apply after the due date.'],
      confidence: 0.97,
    },
  },
  message: {
    id: 'message',
    shortLabel: 'Try a message',
    imageCount: 1,
    imageLabels: ['Message'],
    analysis: {
      contentType: 'message',
      title: 'Presentation requested by Friday',
      summary: 'Jordan asked you to send the final presentation deck by Friday.',
      whatMatters: 'You need to send the presentation deck by Friday.',
      whySaved: {
        reason: 'You probably saved this because Jordan asked for the presentation by Friday.',
        confidence: 0.97,
      },
      urgency: { level: 'now', score: 96, reason: 'The requested deck is due tomorrow.' },
      plan: [
        { task: 'Send Jordan the final presentation deck', dueDate: '2026-08-28', priority: 'high', source: 'explicit' },
        { task: 'Confirm Jordan received the deck', dueDate: null, priority: 'low', source: 'suggested' },
      ],
      thread: null,
      visualEntities: [
        { type: 'deadline', label: 'by Friday', sourceImageIndex: 0, box: { x: 0.16, y: 0.48, width: 0.75, height: 0.11 }, action: 'task' },
      ],
      suggestedAction: {
        label: 'Copy the task',
        reason: 'Turn the request into a concrete deadline before it slips through the cracks.',
      },
      canCreateCalendarEvent: false,
      canCreateTask: true,
      event: null,
      task: {
        title: 'Send Jordan the presentation deck',
        dueDate: '2026-08-28',
        notes: 'Send the final deck by Friday.',
      },
      entities: {
        dates: ['Friday'],
        times: [],
        locations: [],
        urls: [],
        emails: [],
        phoneNumbers: [],
        amounts: [],
      },
      keyDetails: [
        { label: 'Deliverable', value: 'Final presentation deck' },
        { label: 'Deadline', value: 'Friday' },
        { label: 'Requested by', value: 'Jordan' },
      ],
      warnings: [],
      confidence: 0.96,
    },
  },
  trip: {
    id: 'trip',
    shortLabel: 'Try a trip',
    imageCount: 3,
    imageLabels: ['Flight', 'Hotel', 'Conference'],
    analysis: {
      contentType: 'travel',
      title: 'DevFest DC trip',
      summary: 'Your flight, hotel, and conference screenshots describe one trip to Washington, DC.',
      whatMatters: 'You leave Friday morning, check into your hotel that afternoon, and need to be at the conference by 9 AM Saturday.',
      whySaved: {
        reason: 'You likely saved these to keep your travel details together.',
        confidence: 0.99,
      },
      urgency: { level: 'soon', score: 82, reason: 'Your trip starts Friday morning.' },
      plan: [
        { task: 'Catch flight LI 214 at Gate C18', dueDate: '2026-08-28T06:35:00', priority: 'high', source: 'explicit' },
        { task: 'Add the flight to your calendar', dueDate: null, priority: 'high', source: 'suggested' },
        { task: 'Check in for flight LI 214', dueDate: '2026-08-27T06:35:00', priority: 'high', source: 'suggested' },
        { task: 'Save the hotel address', dueDate: null, priority: 'medium', source: 'suggested' },
        { task: 'Add the conference to your calendar', dueDate: null, priority: 'medium', source: 'suggested' },
      ],
      thread: {
        isMultiImage: true,
        isRelated: true,
        relationship: 'These 3 screenshots describe the same trip.',
        combinedSummary: 'A Friday flight and hotel stay lead into a Saturday morning conference in Washington, DC.',
        combinedWhatMatters: 'You leave Friday at 6:35 AM, can check into the hotel at 3 PM, and the conference begins Saturday at 9 AM.',
        imageSummaries: [
          { sourceImageIndex: 0, title: 'Flight LI 214', summary: 'Friday morning flight from DCA.', whatMatters: 'The flight departs at 6:35 AM.', urgency: { level: 'soon', score: 84, reason: 'The departure is Friday morning.' } },
          { sourceImageIndex: 1, title: 'Mason Hotel', summary: 'Two-night hotel reservation in Arlington.', whatMatters: 'Check-in begins Friday at 3 PM.', urgency: { level: 'soon', score: 68, reason: 'Check-in is Friday afternoon.' } },
          { sourceImageIndex: 2, title: 'DevFest DC', summary: 'Saturday technology conference at Mason Square.', whatMatters: 'The conference begins Saturday at 9 AM.', urgency: { level: 'soon', score: 65, reason: 'The conference begins this weekend.' } },
        ],
        timeline: [
          { label: 'Flight', dateTime: '2026-08-28T06:35:00', description: 'Flight LI 214 departs from DCA.', sourceImageIndex: 0 },
          { label: 'Hotel check-in', dateTime: '2026-08-28T15:00:00', description: 'Check in at Mason Hotel.', sourceImageIndex: 1 },
          { label: 'Conference', dateTime: '2026-08-29T09:00:00', description: 'DevFest DC begins at Mason Square.', sourceImageIndex: 2 },
        ],
      },
      visualEntities: [
        { type: 'time', label: '6:35 AM', sourceImageIndex: 0, box: { x: 0.1, y: 0.45, width: 0.38, height: 0.11 }, action: 'calendar' },
        { type: 'location', label: '901 N Glebe Rd, Arlington, VA', sourceImageIndex: 1, box: { x: 0.09, y: 0.61, width: 0.8, height: 0.09 }, action: 'maps' },
        { type: 'time', label: 'Saturday at 9:00 AM', sourceImageIndex: 2, box: { x: 0.09, y: 0.5, width: 0.75, height: 0.1 }, action: 'calendar' },
      ],
      suggestedAction: {
        label: 'Prepare for the trip',
        reason: 'Put the three time-sensitive stops into one plan before Friday morning.',
      },
      canCreateCalendarEvent: true,
      canCreateTask: true,
      event: {
        title: 'Flight LI 214 from DCA',
        startDateTime: '2026-08-28T06:35:00',
        endDateTime: '2026-08-28T08:05:00',
        allDay: false,
        location: 'Ronald Reagan Washington National Airport (DCA)',
        description: 'Flight LI 214. Continue to Mason Hotel after arrival.',
      },
      task: {
        title: 'Prepare for the DevFest DC trip',
        dueDate: '2026-08-27',
        notes: 'Flight Friday at 6:35 AM, hotel check-in at 3 PM, conference Saturday at 9 AM.',
      },
      entities: {
        dates: ['August 28, 2026', 'August 29, 2026'],
        times: ['6:35 AM', '3:00 PM', '9:00 AM'],
        locations: ['DCA', '901 N Glebe Rd, Arlington, VA', 'Fuse at Mason Square'],
        urls: [],
        emails: [],
        phoneNumbers: [],
        amounts: ['$428.00'],
      },
      keyDetails: [
        { label: 'Flight', value: 'LI 214 · Friday 6:35 AM' },
        { label: 'Hotel check-in', value: 'Friday 3:00 PM' },
        { label: 'Conference', value: 'Saturday 9:00 AM' },
        { label: 'Hotel', value: 'Mason Hotel · 901 N Glebe Rd' },
      ],
      warnings: ['Verify live flight status before leaving for the airport.'],
      confidence: 0.98,
    },
  },
};
