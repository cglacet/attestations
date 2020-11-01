import fs from 'fs';
import { generatePdf } from './pdf-util';
import { profiles, REASONS, MAIL_AVAILABLE, PDF_BASE } from './config';
import { certificateMail } from './mail';


export async function getCertificates(reasons){
    const promises = [];
    for (const profile of profiles()){
        promises.push(getCertificate(profile, reasons));
    }
    return await Promise.all(promises);
}

export async function getCertificate(profile, reasons){
    const pdf = await certificatePDF(profile, reasons)
    if (MAIL_AVAILABLE && profile['email']){
        await certificateMail(profile['email'], mailTitle(profile), mailAttachments(profile, pdf));
        return {
            [profile['lastname']]: `Email envoyé à ${profile['email']} !`,
        };
    }
    else { 
        return {
            [profile['lastname']]: 'Email manquant, renseignez le champ email dans le fichier de configuration',
        };
    }
}
export async function writeCertificate(profile, reasons){
    const pdf = await certificatePDF(profile, reasons);
    fs.writeFile(pdfName(profile), pdf, doneGenerating(profile));
}

export async function certificatePDF(profile, reasons){
    return await generatePdf(profile, reasons.join(', '), PDF_BASE);
}

export function pdfName(profile){
    const name = `${profile['firstname']}_${profile['lastname']}`;
    const date = `${profile['datesortie'].replace(/\//g, '-')}_${profile['heuresortie'].replace(':', 'h')}`;
    return `${name}_${date}.pdf`;
}


export function mailTitle(profile){
    return `Attestation de sortie ${profile['datesortie']} à ${profile['heuresortie']}`;
}

function mailAttachments(profile, pdf){
    return [
        {
            filename: pdfName(profile),
            content: pdf,
        }
    ]
}

function doneGenerating(profile){
    function onDone(){
        console.log(`\nFichier d'autorisation de sortie pour ${profile['firstname']}:`);
        console.log(`\t ${pdfName(profile)}`);
    }
    return onDone;
}