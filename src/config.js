import yaml from 'js-yaml';
import fs from 'fs';
import dateFormat from 'dateformat';

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

export function getProfile(firstname){
    return profile(PROFILES.get(firstname));
}

export function profile(person){
    const now = new Date();
    return {
        ...person,
        'heuresortie': dateFormat(now, 'HH:MM'),
        'datesortie': dateFormat(now, 'dd/mm/yyyy'),
    }
}

function translate(object){
    return mapObject(([k, v]) => [TRANSLATION_RULES.get(k) || k, v], object);
}

function mapObject(func, object){
    return Object.fromEntries(Object.entries(object).map(func));
}