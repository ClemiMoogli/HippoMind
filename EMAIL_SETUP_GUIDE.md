# Guide de Configuration de l'Envoi d'Emails

## Pourquoi envoyer des emails ?

Actuellement, l'utilisateur ne voit sa clé de licence que sur la page success après paiement. Problèmes :

- ❌ S'il ferme la page, il perd sa clé
- ❌ Pas de backup automatique
- ❌ Doit prendre une capture d'écran ou copier manuellement

**Solution** : Envoyer automatiquement un email avec la clé de licence après chaque paiement.

## Solution recommandée : Resend

**Pourquoi Resend ?**

- ✅ Très simple à utiliser
- ✅ API moderne et bien documentée
- ✅ Templates React (TSX)
- ✅ Gratuit jusqu'à 3000 emails/mois
- ✅ Excellente délivrabilité
- ✅ Dashboard avec analytics

**Alternatives** :
- SendGrid (plus ancien, 100 emails/jour gratuit)
- Postmark (excellente délivrabilité, 100 emails/mois gratuit)
- AWS SES (très bon marché mais plus complexe)

## Étape 1 : Créer un compte Resend (5 min)

1. Aller sur https://resend.com
2. S'inscrire avec GitHub ou email
3. Vérifier votre email

## Étape 2 : Configurer votre domaine (10 min)

**Important** : Pour éviter que les emails finissent en spam, il faut configurer votre propre domaine.

1. Dans le dashboard Resend, aller dans "Domains"
2. Cliquer "Add Domain"
3. Entrer `hippomind.org`
4. Copier les enregistrements DNS fournis

### Configuration DNS

Ajouter ces enregistrements DNS dans votre provider (où vous avez acheté hippomind.org) :

```
Type: TXT
Name: _resend
Value: [fourni par Resend]

Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10

Type: TXT
Name: @
Value: "v=spf1 include:amazonses.com ~all"

Type: TXT
Name: resend._domainkey
Value: [fourni par Resend - clé DKIM]
```

**Attendre 5-10 minutes** pour la propagation DNS, puis cliquer "Verify" sur Resend.

## Étape 3 : Obtenir une clé API (2 min)

1. Dans le dashboard, aller dans "API Keys"
2. Cliquer "Create API Key"
3. Nom : `HippoMind Production`
4. Permissions : "Sending access"
5. Copier la clé (commence par `re_...`)

## Étape 4 : Ajouter la clé sur Vercel (1 min)

1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet `landing`
3. Settings > Environment Variables
4. Ajouter :
   - Name: `RESEND_API_KEY`
   - Value: `re_...` (la clé copiée)
   - Environnements : Production, Preview, Development

## Étape 5 : Installer Resend (1 min)

```bash
cd landing
npm install resend
```

## Étape 6 : Créer le service d'email (10 min)

Créer `landing/lib/email.ts` :

```typescript
/**
 * Email service using Resend
 */

import { Resend } from 'resend';
import type { License } from './license';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send license email to customer
 */
export async function sendLicenseEmail(license: License): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'HippoMind <license@hippomind.org>',
      to: license.email,
      subject: 'Your HippoMind License Key 🎉',
      html: generateLicenseEmailHTML(license),
    });

    if (error) {
      console.error('Failed to send email:', error);
      return false;
    }

    console.log('License email sent:', data?.id);
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}

/**
 * Generate HTML email content
 */
function generateLicenseEmailHTML(license: License): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your HippoMind License</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <!-- Header -->
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">Welcome to HippoMind! 🎉</h1>
    <p style="color: #666; margin-top: 10px;">Thank you for your purchase!</p>
  </div>

  <!-- License Key Box -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
    <p style="color: white; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your License Key</p>
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 0 auto; display: inline-block;">
      <code style="font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 2px;">${license.key}</code>
    </div>
    <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 12px;">⚠️ Save this key in a safe place!</p>
  </div>

  <!-- Instructions -->
  <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
    <h2 style="margin-top: 0; color: #1e293b; font-size: 18px;">Next Steps:</h2>
    <ol style="margin: 0; padding-left: 20px;">
      <li style="margin-bottom: 10px;">Download HippoMind for your platform (see links below)</li>
      <li style="margin-bottom: 10px;">Install and launch the app</li>
      <li style="margin-bottom: 10px;">Enter your license key when prompted</li>
      <li>Start creating amazing mind maps!</li>
    </ol>
  </div>

  <!-- Download Links -->
  <div style="margin-bottom: 30px;">
    <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 15px;">📥 Download HippoMind</h2>

    <a href="${process.env.NEXT_PUBLIC_DOWNLOAD_MAC}"
       style="display: block; background: #2563eb; color: white; text-decoration: none; padding: 15px 20px; border-radius: 8px; margin-bottom: 10px; text-align: center; font-weight: 500;">
      🍎 Download for macOS
    </a>

    <a href="${process.env.NEXT_PUBLIC_DOWNLOAD_WINDOWS}"
       style="display: block; background: #2563eb; color: white; text-decoration: none; padding: 15px 20px; border-radius: 8px; margin-bottom: 10px; text-align: center; font-weight: 500;">
      🪟 Download for Windows
    </a>

    <a href="${process.env.NEXT_PUBLIC_DOWNLOAD_LINUX}"
       style="display: block; background: #2563eb; color: white; text-decoration: none; padding: 15px 20px; border-radius: 8px; text-align: center; font-weight: 500;">
      🐧 Download for Linux
    </a>
  </div>

  <!-- License Details -->
  <div style="background: #f8fafc; border-radius: 8px; padding: 15px; margin-bottom: 30px; font-size: 14px; color: #64748b;">
    <strong>License Details:</strong><br>
    • Product: ${license.productName}<br>
    • Max Devices: ${license.maxActivations}<br>
    • Purchase Date: ${new Date(license.createdAt).toLocaleDateString()}<br>
    • Price: ${(license.price / 100).toFixed(2)} ${license.currency.toUpperCase()}
  </div>

  <!-- Support -->
  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
    <p style="margin: 0 0 10px 0;">Need help?</p>
    <a href="mailto:support@hippomind.org" style="color: #2563eb; text-decoration: none; font-weight: 500;">
      📧 Contact Support
    </a>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
    <p style="margin: 0;">This email was sent because you purchased HippoMind.</p>
    <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} HippoMind. All rights reserved.</p>
  </div>

</body>
</html>
  `.trim();
}

/**
 * Send payment confirmation email (optional)
 */
export async function sendPaymentConfirmationEmail(
  email: string,
  amount: number,
  currency: string
): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'HippoMind <billing@hippomind.org>',
      to: email,
      subject: 'Payment Confirmation - HippoMind',
      html: `
        <h1>Payment Confirmed ✅</h1>
        <p>We've received your payment of ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}.</p>
        <p>Your license key has been sent in a separate email.</p>
        <p>Thank you for supporting HippoMind!</p>
      `,
    });

    if (error) {
      console.error('Failed to send confirmation email:', error);
      return false;
    }

    console.log('Confirmation email sent:', data?.id);
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}
```

## Étape 7 : Intégrer dans le webhook (5 min)

Modifier `landing/app/api/webhook/stripe/route.ts` :

```typescript
// Ajouter l'import en haut
import { sendLicenseEmail } from '@/lib/email';

// Dans le handler, après la génération de licence (ligne ~68)
// Remplacer les console.log par :

// Store license in database
await storeLicense(license);

console.log('License generated:', license.key);

// Send email with license key
const emailSent = await sendLicenseEmail(license);

if (emailSent) {
  console.log('License email sent to:', license.email);
} else {
  console.error('Failed to send license email to:', license.email);
  // TODO: Add to retry queue or manual intervention needed
}
```

## Étape 8 : Tester (10 min)

### Test en local

```bash
cd landing

# Ajouter RESEND_API_KEY au .env.local
echo "RESEND_API_KEY=re_your_key_here" >> .env.local

# Démarrer le serveur
npm run dev
```

### Test avec Stripe CLI

```bash
# Installer Stripe CLI si pas déjà fait
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks localement
stripe listen --forward-to localhost:3000/api/webhook/stripe

# Dans un autre terminal, créer un événement test
stripe trigger checkout.session.completed
```

Vérifier :
1. Les logs du serveur
2. La boîte de réception de l'email de test
3. Le dashboard Resend

## Étape 9 : Déployer (1 min)

```bash
git add landing/
git commit -m "feat: Add automatic license email sending via Resend"
git push
```

## Étape 10 : Tester en production (5 min)

1. Faire un paiement de test sur https://hippomind.org
2. Vérifier la réception de l'email
3. Vérifier que la clé dans l'email fonctionne

## Personnalisation de l'email

### Version React (optionnel, plus maintenable)

Si vous voulez utiliser des templates React (recommandé à long terme) :

```bash
npm install @react-email/components
```

Créer `landing/emails/license-email.tsx` :

```tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface LicenseEmailProps {
  licenseKey: string;
  email: string;
  downloadMac: string;
  downloadWindows: string;
  downloadLinux: string;
}

export default function LicenseEmail({
  licenseKey,
  email,
  downloadMac,
  downloadWindows,
  downloadLinux,
}: LicenseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your HippoMind license key is ready!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to HippoMind! 🎉</Heading>

          <Section style={licenseBox}>
            <Text style={licenseLabel}>Your License Key</Text>
            <Text style={licenseKey}>{licenseKey}</Text>
          </Section>

          <Section>
            <Heading style={h2}>Download HippoMind</Heading>
            <Button href={downloadMac} style={button}>
              Download for macOS
            </Button>
            <Button href={downloadWindows} style={button}>
              Download for Windows
            </Button>
            <Button href={downloadLinux} style={button}>
              Download for Linux
            </Button>
          </Section>

          <Text style={footer}>
            Need help? Contact us at support@hippomind.org
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles...
const main = { /* ... */ };
const container = { /* ... */ };
// etc.
```

## Analytics et monitoring

### Dashboard Resend

Le dashboard Resend vous permet de voir :
- ✅ Emails envoyés
- ✅ Taux de délivrabilité
- ✅ Emails ouverts (si activé)
- ✅ Clics sur les liens
- ❌ Erreurs et bounces

### Logs Vercel

Pour déboguer les problèmes :

1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet
3. Onglet "Logs"
4. Filtrer par "email" ou "resend"

## Gestion des erreurs

### Si l'email ne s'envoie pas

L'utilisateur voit toujours sa clé sur la page success, donc ce n'est pas bloquant. Mais vous devriez :

1. Logger l'erreur dans les logs Vercel
2. (Optionnel) Envoyer une alerte Slack/Discord
3. (Optionnel) Ajouter à une queue de retry

### Queue de retry (avancé)

Pour les emails qui ont échoué, vous pouvez utiliser Vercel Cron :

```typescript
// app/api/cron/retry-emails/route.ts
export async function GET(req: Request) {
  // Vérifier le secret cron
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Récupérer les licences créées dans les dernières 24h
  // Vérifier lesquelles n'ont pas reçu d'email
  // Renvoyer les emails

  return Response.json({ success: true });
}
```

## Coûts

**Resend - Plan gratuit** :
- 3000 emails/mois
- 100 emails/jour
- Domaine personnalisé
- API complète

**Estimation** :
- 1 achat = 1 email
- 3000 emails/mois = 100 achats/jour max
- Largement suffisant pour démarrer !

**Si vous dépassez** : 10$/mois pour 50,000 emails

## Checklist finale

Avant de passer en production :

- [ ] Domaine vérifié sur Resend
- [ ] DNS configurés (SPF, DKIM, MX)
- [ ] Clé API ajoutée sur Vercel
- [ ] Template d'email testé
- [ ] Liens de téléchargement fonctionnent
- [ ] Email de test reçu (pas en spam)
- [ ] Webhook Stripe configuré
- [ ] Logs Vercel vérifiés

---

**Temps total estimé** : ~45-60 minutes

**Difficulté** : ⭐⭐⭐☆☆ (Moyen - à cause de la config DNS)
