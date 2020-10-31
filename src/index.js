import fs from 'fs';
import { generatePdf } from './pdf-util';
import { profiles, reasons, MAIL_AVAILABLE } from './config';
import { attestationMail } from './mail';

global.fetch = require("node-fetch");
const REPO_URL = 'https://github.com/cglacet/attestations/raw/master/';
const PDF_BASE = `${REPO_URL}/assets/certificate.pdf`; 

async function generateAll(){
    for (const profile of profiles()){
        generateFor(profile);
    }
}

async function generateFor(profile){
    const pdf = await generatePdf(profile, reasons.join(', '), PDF_BASE);
    console.log(profile['email'], MAIL_AVAILABLE);
    if (MAIL_AVAILABLE && profile['email']){
        console.log(`Envoi de l'autorisation par mail à ${profile['email']} en cours ...`);
        attestationMail(profile['email'], mailTitle(profile), mailAttachments(profile, pdf));
    }
    else {
        fs.writeFile(pdfName(profile), pdf, doneGenerating(profile));
    }
}


function pdfName(profile){
    const name = `${profile['firstname']}_${profile['lastname']}`;
    const date = `${profile['datesortie'].replace(/\//g, '-')}_${profile['heuresortie'].replace(':', 'h')}`;
    return `${name}_${date}.pdf`;
}

function mailAttachments(profile, pdf){
    return [
        {
            filename: pdfName(profile),
            content: pdf, //new Buffer(pdf,'utf-8')
        }
    ]
}

function mailTitle(profile){
    return `Attestation de sortie ${profile['datesortie']} à ${profile['heuresortie']}`;
}

function doneGenerating(profile){
    function onDone(){
        console.log(`\nFichier d'autorisation de sortie pour ${profile['firstname']}:`);
        console.log(`\t ${pdfName(profile)}`);
    }
    return onDone;
}

generateAll();