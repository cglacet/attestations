import { generateQR } from './util'
import moment from 'moment-timezone';
import pdfLib from 'pdf-lib';
const { PDFDocument, StandardFonts, rgb } = pdfLib;
const pageHeight = 830;


const ys = {
  travail: 276.5,
  achats_culturel_cultuel: 347,
  achats: 347,  // Backward compatibility 
  sante: 396.5,
  famille: 420,
  handicap: 456.5,
  sport_animaux: 480.5,
  convocation: 553.5,
  missions: 578.5,
  enfants: 602,
}

export async function generatePdf (profile, reasons, pdfBase) {
  const creationInstant = moment.tz(new Date(), "Europe/Paris");
  const creationDate = creationInstant.format("DD/MM/YYYY");
  const creationHour = creationInstant.format("HH:mm");

  const {
    lastname,
    firstname,
    birthday,
    placeofbirth,
    address,
    zipcode,
    city,
    datesortie,
    heuresortie,
  } = profile

  const data = [
    `Cree le: ${creationDate} a ${creationHour}`,
    `Nom: ${lastname}`,
    `Prenom: ${firstname}`,
    `Naissance: ${birthday} a ${placeofbirth}`,
    `Adresse: ${address} ${zipcode} ${city}`,
    `Sortie: ${datesortie} a ${heuresortie}`,
    `Motifs: ${reasons}`,
    '', // Pour ajouter un ; aussi au dernier élément
  ].join(';\n ')

  const existingPdfBytes = await fetch(pdfBase).then((res) => res.arrayBuffer())

  const pdfDoc = await PDFDocument.load(existingPdfBytes)

  // set pdf metadata
  pdfDoc.setTitle('COVID-19 - Déclaration de déplacement')
  pdfDoc.setSubject('Attestation de déplacement dérogatoire')
  pdfDoc.setKeywords([
    'covid19',
    'covid-19',
    'attestation',
    'déclaration',
    'déplacement',
    'officielle',
    'gouvernement',
  ])
  pdfDoc.setProducer('DNUM/SDIT')
  pdfDoc.setCreator('')
  pdfDoc.setAuthor("Ministère de l'intérieur")

  const page1 = pdfDoc.getPages()[0]

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const drawText = (text, x, y, size = 11) => {
    page1.drawText(text, { x, y, size, font })
  }

  drawText(`${firstname} ${lastname}`, 94, pageHeight - 127)
  drawText(birthday, 94, pageHeight - 146)
  drawText(placeofbirth, 215, pageHeight - 146)
  drawText(`${address} ${zipcode} ${city}`, 107, pageHeight - 164)


  reasons
    .split(', ')
    .forEach(reason => {
        drawText('x', 46.5, pageHeight- ys[reason], 12)
    })

  let locationSize = getIdealFontSize(font, profile.city, 83, 7, 11)

  if (!locationSize) {
    alert(
      'Le nom de la ville risque de ne pas être affiché correctement en raison de sa longueur. ' +
        'Essayez d\'utiliser des abréviations ("Saint" en "St." par exemple) quand cela est possible.',
    )
    locationSize = 7
  }

  drawText(profile.city, 81, pageHeight - 752.5, locationSize)
  drawText(`${profile.datesortie}`, 81, pageHeight - 770, 11)
  drawText(`${profile.heuresortie}`, 233, pageHeight - 770, 11)

  // const shortCreationDate = `${creationDate.split('/')[0]}/${
  //   creationDate.split('/')[1]
  // }`
  // drawText(shortCreationDate, 314, 189, locationSize)

  // // Date création
  // drawText('Date de création:', 479, 130, 6)
  // drawText(`${creationDate} à ${creationHour}`, 470, 124, 6)
  const qrTitle1 = 'QR-code contenant les informations '
  const qrTitle2 = 'de votre attestation numérique'

  const generatedQR = await generateQR(data)
  const qrImage = await pdfDoc.embedPng(generatedQR)

  page1.drawText(qrTitle1 + '\n' + qrTitle2, { x: 415, y: 135, size: 9, font, lineHeight: 10, color: rgb(1, 1, 1) })
  page1.drawImage(qrImage, {
    x: page1.getWidth() - 156,
    y: 25,
    width: 92,
    height: 92,
  })

  pdfDoc.addPage()
  const page2 = pdfDoc.getPages()[1]
  page2.drawText(qrTitle1 + qrTitle2, { x: 50, y: page2.getHeight() - 70, size: 11, font, color: rgb(1, 1, 1) })
  page2.drawImage(qrImage, {
    x: 50,
    y: page2.getHeight() - 390,
    width: 300,
    height: 300,
  })

  return await pdfDoc.save()
}

function getIdealFontSize (font, text, maxWidth, minSize, defaultSize) {
  let currentSize = defaultSize
  let textWidth = font.widthOfTextAtSize(text, defaultSize)

  while (textWidth > maxWidth && currentSize > minSize) {
    textWidth = font.widthOfTextAtSize(text, --currentSize)
  }

  return textWidth > maxWidth ? null : currentSize
}
