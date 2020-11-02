# Des attestations en quelques secondes

Ce code permet remplir des attestations de sortie en :

* sauvegardant une URL dans vos favoris
* scannant un QR code

Une démo hébergée sur une version gratuite 
d'Heroku est [disponible ici][heroku demo].

En utilisant cette page web vous pouvez directement cliquer sur 
le lien pour générer une attestation, ce lien permettra de 
créer autant d'attestation que nécessaire (pour la raison 
sélectionne). Date et heures de sorties seront générées 
dynamiquement.

<p align="center">
    <img width=700 src=doc/img/link.gif alt="Génération d'attestation par lien direct">
</p>

Vous pouvez aussi sauvegarder ces liens en imprimant des QR codes.

<p align="center">
    <img width=700 src=doc/img/print.gif alt="Génération d'attestation par QR code">
</p>

## Travailler sur ce projet 

À lancer la première fois :

```bash
$ git clone -b heroku git@github.com:cglacet/attestations.git
$ cd attestations
$ npm install
```

Puis pour lancer le serveur :

```bash
npm start
```

Il suffit ensuite de vous rendre à sur [http://localhost:8080/set][local url].

## Publier sur Heroku

```bash
$ brew install heroku/brew/heroku
$ heroku login
$ heroku create
$ heroku apps:rename <insert a name you like here>
$ git push heroku heroku:master
```

## TODO

- [ ] Tester [svelte](https://svelte.dev/)
- [x] Ajouter un délai (eg., sortie dans 1h)
- [x] Rendre accessible en ligne avec un DL à la place de l'envoi de mail (comment faire pour le fichier de config? Une URL?)
- [ ] Mettre tout le code coté client (chiant à mettre à jour si l'attestation change)?

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

[heroku]: https://dashboard.heroku.com/
[heroku demo]: https://cglacet-attestation.herokuapp.com/set?firstname=Pr%C3%A9nom&lastname=Nom&birthday=31%2F07%2F1986&placeofbirth=Paris&address=12+rue+des+Lilas&zipcode=33000&city=Bordeaux&reasons=travail
[local url]: http://localhost:8080/set?firstname=Pr%C3%A9nom&lastname=Nom&birthday=31%2F07%2F1986&placeofbirth=Paris&address=12+rue+des+Lilas&zipcode=33000&city=Bordeaux&reasons=travail
