import yaml from 'js-yaml';
import fs from 'fs';
import capitalize from 'capitalize';

const REPO_URL = 'https://github.com/cglacet/attestations/raw/master/';
export const PDF_BASE = `${REPO_URL}/assets/certificate.pdf`; 

const TRANSLATION_RULES = new Map([
    ['nom', 'lastname'],
    ['prénom', 'firstname'],
    ['date_naissance', 'birthday'],
    ['lieu_naissance', 'placeofbirth'],
    ['adresse', 'address'],
    ['code_postal', 'zipcode'],
    ['ville', 'city'],
]);

const YAML_CONFIG_FILE = './config.yml';
const CONFIG = yaml.safeLoad(fs.readFileSync(YAML_CONFIG_FILE, 'utf8'));

export const DEFAULT_MAIL_PWD = 'abcdefghijklmnop';
const YAML_MAIL_CONFIG_FILE = './mail-config.yml';
let MAIL_CONFIG = yaml.safeLoad(fs.readFileSync(YAML_MAIL_CONFIG_FILE, 'utf8'));
export let MAIL_AVAILABLE = true;

if (MAIL_CONFIG['pass'] == DEFAULT_MAIL_PWD){
    MAIL_AVAILABLE = false;
}

// heroku config:set CERTIFICATE_EMAIL_USER=cglacet.attestation@gmail.com CERTIFICATE_EMAIL_PASS=abcdefghijklmnop
if (!MAIL_AVAILABLE){
    MAIL_CONFIG = {
        'user': process.env.CERTIFICATE_EMAIL_USER,
        'pass': process.env.CERTIFICATE_EMAIL_PASS,
    }
    MAIL_AVAILABLE = true;
}

if (!MAIL_AVAILABLE){
    console.error("Vous n'avez pas configuré vos identifiants pour l'envoi automatique d'emails (dans le fichier 'mail-config.yml').");
    console.error("Aucun mail ne sera envoyé et les fichiers seront simplement sauvegardés localement.");
}

export const REASONS = CONFIG['raisons'];
export const mailAuth = MAIL_CONFIG;


const PROFILES = new Map();
const PLACE = CONFIG['lieux']['maison'];

for (const person of CONFIG['gens']){
    const content = {
        ...translate(person),
        ...translate(PLACE),
    }
    PROFILES.set(content['firstname'], content)
}

export function* profiles(){
    for (const person of PROFILES.values()){
        yield profile(person);
    }
}

export function getProfile(firstname, delay){
    return profile(PROFILES.get(firstname), delay);
}

export function profile(person, delay){
    const date = (delay != undefined) ? new Date(Date.now() + 60000 * parseFloat(delay)) : new Date();
    person['firstname'] = capitalize(person['firstname']);
    person['lastname'] = capitalize(person['lastname']);
    person['city'] = capitalize(person['city']);
    return {
        ...person,
        'heuresortie': date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: "Europe/Paris", hour12: false }),
        'datesortie': frenchDate(date, 'fr-FR')
    }
}

function frenchDate(date, langCode) {
    var day = date.toLocaleString(langCode, {day: '2-digit'});
    var month = date.toLocaleString(langCode, {month: '2-digit'});
    var year = date.toLocaleString(langCode, {year: 'numeric'});
    return `${day}/${month}/${year}`;
  }

function translate(object){
    return mapObject(([k, v]) => [TRANSLATION_RULES.get(k) || k, v], object);
}

function mapObject(func, object){
    return Object.fromEntries(Object.entries(object).map(func));
}