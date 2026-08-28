import type { ExampleId } from '@/lib/fixtures';

export function SampleScreenshot({ id, imageIndex = 0 }: { id: ExampleId; imageIndex?: number }) {
  if (id === 'event') {
    return (
      <div className="sample-shot event-shot" aria-label="Example DevFest DC event screenshot">
        <div className="sample-status"><span>9:41</span><span>● ● ●</span></div>
        <div className="event-orbit" />
        <span className="sample-kicker">DEVFEST</span>
        <h3>DC</h3>
        <p className="sample-year">2026</p>
        <div className="event-shot-details">
          <div><small>FRIDAY</small><strong>AUG 28</strong></div>
          <div><small>CHECK-IN</small><strong>9:30 AM</strong></div>
        </div>
        <div className="sample-location">Fuse at Mason Square<br />Arlington, VA</div>
      </div>
    );
  }

  if (id === 'bill') {
    return (
      <div className="sample-shot bill-shot" aria-label="Example utility bill screenshot">
        <div className="sample-status"><span>9:41</span><span>● ● ●</span></div>
        <div className="bill-brand"><span>V</span><strong>Virginia Energy</strong></div>
        <p className="bill-label">AMOUNT DUE</p>
        <h3>$82.17</h3>
        <p className="bill-due">Due September 4, 2026</p>
        <div className="bill-panel">
          <span>Account</span><strong>•••• 2841</strong>
          <span>Billing period</span><strong>Jul 12 – Aug 11</strong>
        </div>
        <div className="bill-pay">Pay bill</div>
      </div>
    );
  }

  if (id === 'trip') {
    if (imageIndex === 0) {
      return (
        <div className="sample-shot trip-shot flight-shot" aria-label="Example flight confirmation screenshot">
          <div className="sample-status"><span>9:41</span><span>● ● ●</span></div>
          <span className="trip-app">LIFE AIR</span>
          <p className="trip-caption">Your trip is confirmed</p>
          <div className="flight-route"><strong>DCA</strong><span>LI 214 →</span><strong>BOS</strong></div>
          <div className="trip-primary"><small>DEPARTURE</small><strong>6:35 AM</strong><span>Friday, August 28</span></div>
          <div className="trip-info-row"><span>Terminal 2</span><span>Gate C18</span></div>
          <div className="trip-code">Confirmation · LIF3DC</div>
        </div>
      );
    }

    if (imageIndex === 1) {
      return (
        <div className="sample-shot trip-shot hotel-shot" aria-label="Example hotel reservation screenshot">
          <div className="sample-status"><span>9:41</span><span>● ● ●</span></div>
          <span className="trip-app">MASON HOTEL</span>
          <p className="trip-caption">Reservation confirmed</p>
          <div className="hotel-photo"><span>Arlington, Virginia</span></div>
          <div className="trip-primary"><small>CHECK-IN</small><strong>3:00 PM</strong><span>Friday, August 28</span></div>
          <div className="hotel-address">901 N Glebe Rd<br />Arlington, VA</div>
          <div className="trip-code">2 nights · $428.00</div>
        </div>
      );
    }

    return (
      <div className="sample-shot trip-shot conference-shot" aria-label="Example conference invitation screenshot">
        <div className="sample-status"><span>9:41</span><span>● ● ●</span></div>
        <span className="trip-app">DEVFEST DC</span>
        <div className="conference-mark">D<span>C</span></div>
        <p className="trip-caption">Build what&apos;s next.</p>
        <div className="trip-primary"><small>CONFERENCE BEGINS</small><strong>9:00 AM</strong><span>Saturday, August 29</span></div>
        <div className="hotel-address">Fuse at Mason Square<br />Arlington, VA</div>
        <div className="trip-code">Doors open at 8:30 AM</div>
      </div>
    );
  }

  return (
    <div className="sample-shot message-shot" aria-label="Example message screenshot">
      <div className="sample-status"><span>9:41</span><span>● ● ●</span></div>
      <div className="message-person"><span>J</span><div><strong>Jordan Lee</strong><small>Messages</small></div></div>
      <div className="message-space" />
      <div className="message-bubble">Hey! Can you send me the final presentation deck by Friday?</div>
      <span className="message-time">Delivered · 9:38 AM</span>
      <div className="message-input">iMessage <span>↑</span></div>
    </div>
  );
}
