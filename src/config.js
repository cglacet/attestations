import yaml from 'js-yaml';
import fs from 'fs';
import dateFormat from 'dateformat';

const TRANSLATION_RULES = new Map([
    ['nom', 'lastname'],
    ['prenom', 'firstname'],
    ['date_naissance', 'birthday'],
    ['lieu_naissance', 'placeofbirth'],
    ['addresse', 'address'],
    ['code_postal', 'zipcode'],
    ['ville', 'city'],
]);

const YAML_CONFIG_FILE = './config.yml';
const CONFIG = yaml.safeLoad(fs.readFileSync(YAML_CONFIG_FILE, 'utf8'));

const DEFAULT_MAIL_PWD = 'abcdefghijklmnop';
const YAML_MAIL_CONFIG_FILE = './mail-config.yml';
const MAIL_CONFIG = yaml.safeLoad(fs.readFileSync(YAML_MAIL_CONFIG_FILE, 'utf8'));
let MAIL_AVAILABLE = true;

if (MAIL_CONFIG['pass'] == DEFAULT_MAIL_PWD){
    console.error("Vous n'avez pas configuré vos identifiants pour l'envoi automatique d'emails (dans le fichier 'mail-config.yml').");
    console.error("Aucun mail ne sera envoyé et les fichiers seront simplement sauvegardés localement.");
    MAIL_AVAILABLE = false;
}

export const reasons = CONFIG['raisons'];
export const mailAuth = MAIL_CONFIG;

export function* profiles(){
    const place = CONFIG['lieux']['maison'];
    const now = new Date();
    for (const people of CONFIG['gens']){
        yield {
            ...translate(people),
            ...translate(place),
            'heuresortie': dateFormat(now, 'HH:MM'),
            'datesortie': dateFormat(now, 'dd/mm/yyyy'),
        }
    }
}


function translate(object){
    return mapObject(([k, v]) => [TRANSLATION_RULES.get(k) || k, v], object);
}

function mapObject(func, object){
    return Object.fromEntries(Object.entries(object).map(func));
}