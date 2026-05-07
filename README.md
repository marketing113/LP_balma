# Landing Balma - CELIA Creation

Landing page autonome prete pour Vercel.

## Structure

- `index.html` : la landing page
- `styles.css` : le style premium mobile-first
- `script.js` : l'envoi du formulaire
- `api/lead.js` : la fonction serveur qui envoie l'email
- `vercel.json` : configuration simple de deploiement

## Format du lead envoye

Sujet :

`LEAD|FacebookAds|pub_balma`

Corps :

```txt
nom=

prenom=

email=

telephone=

secteur_recherche=

message=

landing_page=

IP=
```

## Variables d'environnement Vercel

- `MAKE_WEBHOOK_URL` : URL du webhook Make
- `LEAD_SUBJECT` : `LEAD|FacebookAds|pub_balma`

## Webhook Make

Le formulaire envoie les donnees au webhook Make cote serveur. Le payload contient :

- `nom`
- `prenom`
- `email`
- `telephone`
- `secteur_recherche`
- `message`
- `landing_page`
- `IP`
- `subject`
- `email_body`

`email_body` reprend la structure historique du lead email si tu veux la reconstituer telle quelle dans Make.

## Deploiement Vercel

1. Creer un depot Git avec ce dossier.
2. Importer le depot dans Vercel.
3. Ajouter les variables d'environnement.
4. Deployer.
5. Connecter ensuite le domaine ou sous-domaine souhaite.
