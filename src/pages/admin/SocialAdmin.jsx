import { Button, Card, Input, Notice, PageHeader } from './ui.jsx';
import { useSiteSettings } from './useSiteSettings.js';

export default function SocialAdmin() {
  const { draft, update, save, errors, message, busy, isLoading, error } = useSiteSettings();
  if (isLoading || (!draft && !error)) return <p className="text-ink-soft">Loading…</p>;
  if (error) return <Notice kind="error">{error.message}</Notice>;

  const social = (k) => (e) => update({ social: { ...draft.social, [k]: e.target.value } });
  const marketing = (k) => (e) => update({ marketing: { ...draft.marketing, [k]: e.target.value } });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      noValidate
    >
      <PageHeader title="Social media" intro="Links appear as icons in the website footer. Leave a box empty to hide that icon." />
      <div className="grid gap-6">
        {message && <Notice kind={message.kind}>{message.text}</Notice>}

        <Card title="Profiles">
          <Input label="Facebook page" placeholder="https://facebook.com/yourpage" value={draft.social.facebook || ''} onChange={social('facebook')} error={errors['social.facebook']} />
          <Input label="Instagram" placeholder="https://instagram.com/yourhandle" value={draft.social.instagram || ''} onChange={social('instagram')} error={errors['social.instagram']} />
          <Input
            label="YouTube channel"
            placeholder="https://youtube.com/@yourchannel"
            value={draft.social.youtube || ''}
            onChange={social('youtube')}
            error={errors['social.youtube']}
            hint="Project videos are added on each project's page."
          />
        </Card>

        <Card title="WhatsApp button" intro="The green button on every page opens a chat with this number.">
          <Input label="WhatsApp number" inputMode="tel" placeholder="98765 43210" value={draft.whatsapp || ''} onChange={(e) => update({ whatsapp: e.target.value })} error={errors.whatsapp} />
          <Input
            label="Pre-filled message (optional)"
            placeholder="Namaste, I saw your website and want to discuss a project."
            value={draft.social.whatsappMessage || ''}
            onChange={social('whatsappMessage')}
          />
        </Card>

        <Card
          title="Ads and tracking"
          intro="For Facebook and Instagram ads: the Pixel counts visits, WhatsApp/call taps and enquiries, so you can see which ads bring customers."
        >
          <Input
            label="Facebook (Meta) Pixel ID"
            inputMode="numeric"
            placeholder="15–16 digit number"
            value={draft.marketing.facebookPixelId || ''}
            onChange={marketing('facebookPixelId')}
            error={errors['marketing.facebookPixelId']}
            hint="Find it in Meta Events Manager → Data sources."
          />
          <Input
            label="Google Analytics ID (optional)"
            placeholder="G-XXXXXXX"
            value={draft.marketing.googleAnalyticsId || ''}
            onChange={marketing('googleAnalyticsId')}
            error={errors['marketing.googleAnalyticsId']}
          />
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
        </div>
      </div>
    </form>
  );
}
