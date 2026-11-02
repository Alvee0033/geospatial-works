'use client';

import { FormEvent, useState } from 'react';

export default function ContactForm() {
  const [opened, setOpened] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = `Geospatial Works enquiry: ${String(data.get('subject') || 'Project')}`;
    const body = [
      `Name: ${data.get('firstName')} ${data.get('lastName')}`,
      `Email: ${data.get('email')}`,
      `Phone: ${data.get('phone') || 'Not provided'}`,
      `Organization: ${data.get('organization') || 'Not provided'}`,
      '',
      String(data.get('message') || ''),
    ].join('\n');
    window.location.href = `mailto:info@geospatialworks.com.bd?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  }

  return <form className="corporate-form" onSubmit={handleSubmit}>
    <label>First name<input name="firstName" autoComplete="given-name" required maxLength={80} /></label>
    <label>Last name<input name="lastName" autoComplete="family-name" required maxLength={80} /></label>
    <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
    <label>Phone<input name="phone" type="tel" autoComplete="tel" maxLength={30} /></label>
    <label className="full">Organization<input name="organization" autoComplete="organization" maxLength={120} /></label>
    <label className="full">Subject<select name="subject" required defaultValue=""><option value="" disabled>Select a topic</option><option>Surveying</option><option>UAV Mapping</option><option>GIS Solutions</option><option>Other</option></select></label>
    <label className="full">Message<textarea name="message" required minLength={10} maxLength={3000} /></label>
    <button type="submit" className="corporate-button corporate-button-orange full">Compose Email →</button>
    <p className="corporate-form-note" role="status">{opened ? 'Your email app should open with the message ready to send.' : 'This opens your email app with the details you enter; you can review the message before sending.'}</p>
  </form>;
}
