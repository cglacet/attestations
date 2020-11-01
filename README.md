# Des attestations en quelques secondes

À lancer la première fois:

```bash
$ git clone git@github.com:cglacet/attestations.git
$ cd attestations
$ npm install
```

Puis pour générer des attestations: 

```bash
npm start -s
```

Pour configurer les attestations il suffit d'éditer le fichier [config.yml](config.yml).
Pour activer l'envoi d'emails automatiques il faut utiliser votre 
email avec un [mot de passe pour application][gmail app pwd] et éditer le 
fichier [mail-config.yml](mail-config.yml):

```yaml
user: votre.email.d.envoi@gmail.com
pass: abcdefghijklmnop
```

## Heroku

```bash
$ brew install heroku/brew/heroku
$ heroku login
$ heroku create
$ heroku apps:rename cglacet-attestation
$ heroku config:set CERTIFICATE_EMAIL_USER=cglacet.attestation@gmail.com CERTIFICATE_EMAIL_PASS=abcdefghijklmnop
$ git push heroku heroku:master
```

Les deux endpoints sont `certificates?reasons=travail` et `certificate?name=christian?reasons=travail`.


## TODO

- [ ] Plusieurs domiciles (avec ref vers le nom du domicile pour chaque personne)
- [ ] Ajouter un délai (eg., sortie dans 1h)
- [ ] Rendre accessible en ligne avec un DL à la place de l'envoi de mail (comment faire pour le fichier de config? Une URL?)

## Refs

- [Le dépôt officiel][official repo] (celui qu'on voit depuis le site)


## Le code

Est basé sur deux scripts du dépôt officiel: 

- Celui qui [génère les PDFs][pdf-util.js]
- Celui qui [génère les QR codes][util.js]

Mais il utilise également le [fichier PDF][certificate.pdf] "de base" qui est ensuite rempli par les scripts.


[gmail app pwd]: https://support.google.com/mail/answer/185833?hl=fr-FR#app-passwords
[official repo]: https://github.com/LAB-MI/attestation-deplacement-derogatoire-q4-2020#g%C3%A9n%C3%A9rateur-de-certificat-de-d%C3%A9placement
[pdf-util.js]: https://github.com/LAB-MI/attestation-deplacement-derogatoire-q4-2020/blob/main/src/js/pdf-util.js
[util.js]: https://github.com/LAB-MI/attestation-deplacement-derogatoire-q4-2020/blob/main/src/js/util.js
[certificate.pdf]: https://github.com/LAB-MI/attestation-deplacement-derogatoire-q4-2020/blob/main/src/certificate.pdf
