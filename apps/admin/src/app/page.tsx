const queueItems = [
  "Tutor verification",
  "Bookings",
  "Payments",
  "Refunds",
  "Audit logs"
];

export default function AdminHomePage() {
  return (
    <main className="admin-shell">
      <section>
        <p className="eyebrow">Operations</p>
        <h1>Tutor Marketplace Admin</h1>
        <p className="summary">Admin shell ready for verification, booking, payment, and trust workflows.</p>
      </section>
      <ul aria-label="Initial operations queues">
        {queueItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </main>
  );
}

