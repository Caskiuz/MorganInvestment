import nodemailer from 'nodemailer';

let transporter;
export function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
    });
  }
  return transporter;
}

export async function sendReservationEmail(to, subject, html) {
  if (!process.env.SMTP_HOST) {
    console.log('[email] SMTP no configurado, omitiendo envío');
    return;
  }
  const from = process.env.SMTP_FROM || 'Reservas <no-reply@example.com>';
  await getTransporter().sendMail({ from, to, subject, html });
}

export function buildPaidEmail(reservation) {
  return `<h2>Pago confirmado</h2>
  <p>Hola ${reservation.name}, hemos recibido tu pago.</p>
  <p>Detalles de la reserva:</p>
  <ul>
    <li>ID: ${reservation._id}</li>
    <li>Check-In: ${reservation.checkIn.toISOString().slice(0,10)}</li>
    <li>Check-Out: ${reservation.checkOut.toISOString().slice(0,10)}</li>
    <li>Total: $${reservation.totalAmount}</li>
  </ul>`;
}
