import { BadRequestException, Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { CreatePdfDto } from './dto/create-pdf.dto';
import * as nodemailer from 'nodemailer';
import { pdfPath } from '../shared/pdf-path';
import * as path from 'path';
import { fontsPath } from '../shared/fonts-path';
import { join } from 'path';

@Injectable()
export class MailService {
  async generatePdf(createPdf: CreatePdfDto) {
    try {
      const fontsDirectory = fontsPath;

      const { products, costTotal, phoneNumber, email, address, name } =
        createPdf;
      let pdfFileName = `${name.replace(/\s/g, '_')}_Comanda.pdf`;

      let counter = 1;
      while (fs.existsSync(path.join(pdfPath, pdfFileName))) {
        pdfFileName = `${name.replace(/\s/g, '_')}_Comanda_${counter}.pdf`;
        counter++;
      }

      if (!fs.existsSync(pdfPath)) {
        fs.mkdirSync(pdfPath, { recursive: true });
      }

      const pdfFilePath = path.join(pdfPath, pdfFileName);

      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(pdfFilePath));

      const fontLight = fs.readFileSync(
        path.join(fontsDirectory, 'RobotoSlab-Light.ttf'),
      );
      const fontBold = fs.readFileSync(
        path.join(fontsDirectory, 'RobotoSlab-Bold.ttf'),
      );

      const fontRegular = fs.readFileSync(
        path.join(fontsDirectory, 'RobotoSlab-Regular.ttf'),
      );

      doc.registerFont('RobotoLight', fontLight);
      doc.registerFont('RobotoBold', fontBold);
      doc.registerFont('RobotoRegular', fontRegular);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      const blueLineColor = '#030f27';
      const lineY = pageHeight * 0.04;
      const lineEndX = pageWidth;

      doc
        .moveTo(0, lineY)
        .lineTo(pageWidth, lineY)
        .lineWidth(1 * 100)
        .strokeColor(blueLineColor)
        .stroke();

      const lineWidthInInches = 2;
      const lineWidthInPoints = lineWidthInInches * 72;

      const startPointX = pageWidth;
      const startPointY = 0;
      const endPointX = pageWidth;
      const endPointY = lineY + 3;

      const controlPoint1X = pageWidth * 0.6;
      const controlPoint1Y = lineY + 80;
      const controlPoint2X = pageWidth * 0.4;
      const controlPoint2Y = lineY - 50;

      const _controlPoint1X = pageWidth * 0.9;
      const _controlPoint1Y = lineY;
      const _controlPoint2X = pageWidth * 0.9;
      const _controlPoint2Y = lineY - 180;

      doc
        .moveTo(startPointX, startPointY)
        .lineTo(endPointX, endPointY)
        .lineWidth(lineWidthInPoints)
        .strokeColor(blueLineColor)
        .bezierCurveTo(
          _controlPoint1X,
          _controlPoint1Y,
          _controlPoint2X,
          _controlPoint2Y,
          endPointX,
          endPointY,
        )
        .stroke();

      doc
        .moveTo(0, lineY)
        .lineWidth(1 * 150)
        .strokeColor(blueLineColor)
        .bezierCurveTo(
          controlPoint1X,
          controlPoint1Y,
          controlPoint2X,
          controlPoint2Y,
          lineEndX,
          lineY,
        )
        .stroke();

      doc
        .fillColor('white')
        .font('RobotoBold')
        .fontSize(19)
        .text('Online Shop', 50, 35, {
          align: 'center',
          lineGap: 5,
        });

      let startY = 180;
      let totalComponentHeight = 0;

      const columnGap = 50; // A gap between the two columns
      const columnWidth = (pageWidth - columnGap) / 2;
      const halfPage = pageWidth / 2; // X position for the center of the page

      products.forEach((item) => {
        console.log('product:');
        console.log(item);
        // const componentValue = `${item.name}`;
        const componentValue = `${item.name}: ${item.value} buc`;
        const textHeight = doc.heightOfString(componentValue, {
          width: columnWidth,
          lineGap: 5,
        });
        totalComponentHeight += textHeight + 20;

        if (startY + textHeight + 50 > doc.page.height) {
          doc.addPage();
          totalComponentHeight = 0;
          // startY = 180; // Reset startY to the top of the new page
          startY = 50;
          doc.x = 50;
          doc.y = 50;
        }

        // Check if the combined value can fit on the current page
        if (startY + textHeight + 80 <= doc.page.height) {
          // adding on the same page
          doc
            .fillColor('black')
            .font('RobotoRegular')
            .fontSize(15)
            .text(`${item.name}: `, 50, startY, {
              width: halfPage - 65, // Position the text until the center of the page
            });
          // todo de pus in loc de value in frontend count

          doc
            .fillColor('orange')
            .font('RobotoLight')
            .fontSize(15)
            .text(item.value + ' buc', halfPage + 15, startY, {
              width: halfPage - 65, // Position the text from the center to the right
              align: 'right',
            });
          totalComponentHeight += textHeight + 20;
          startY += textHeight + 20;
        } else {
          // adding new page
          // Move to the next page and render the combined value
          doc.addPage();
          totalComponentHeight = 0;
          startY = 50; // Reset startY to the top of the new page
          doc
            .fillColor('black')
            .font('RobotoRegular')
            .fontSize(15)
            .text(`${item.name}: `, 50, startY, {
              width: halfPage - 65, // Position the text until the center of the page
            });
          // Set the font and color for the right column (item.value)
          doc
            .fillColor('orange')
            .font('RobotoLight')
            .fontSize(15)
            .text(item.value + ' buc', halfPage + 15, startY, {
              width: halfPage - 65, // Position the text from the center to the right
              align: 'right',
            });
          startY += textHeight + 20;
        }
      });

      let adjustY = 0;
      doc.addPage();
      startY = 0;
      adjustY = 50;

      //hr
      doc
        .fillColor('black')
        .moveTo(50, startY + 110 - adjustY)
        .lineTo(550, startY + 110 - adjustY)
        .strokeColor('gray')
        .lineWidth(1)
        .stroke();

      doc
        .font('RobotoBold')
        .fontSize(19)
        .text(`CostTotal:`, 50, startY + 140 - adjustY, {
          continued: true,
          align: 'left',
        });

      doc
        .font('RobotoBold')
        .fontSize(19)
        .text(` ${costTotal} ron`, { continued: false, align: 'right' });

      doc
        .font('RobotoBold')
        .fontSize(15)
        .text('Informații de contact', 50, startY + 615 - adjustY, {
          align: 'left',
          lineGap: 20,
        });

      doc
        .font('RobotoRegular')
        .fontSize(14)
        .text('Nume:', 50, startY + 655 - adjustY, {
          continued: true,
          align: 'left',
        });

      doc
        .font('RobotoLight')
        .fontSize(14)
        .text(` ${name}`, { continued: false, align: 'right' });

      const nameValue = `Nume: ${name}`;
      const textHeightName = doc.heightOfString(nameValue, {
        width: columnWidth,
        lineGap: 5,
      });

      doc
        .font('RobotoRegular')
        .fontSize(14)
        .text('Adresă șantier:', 50, startY + 675 - adjustY, {
          continued: true,
          align: 'left',
        });

      doc
        .font('RobotoLight')
        .fontSize(14)
        .text(` ${address}`, { continued: false, align: 'right' });

      const addressValue = `Adresă șantier: ${address}`;
      const textHeight = doc.heightOfString(addressValue, {
        width: columnWidth,
        lineGap: 5,
      });

      let adjustYAddres = 0;
      if (textHeight > 30) {
        adjustYAddres = 30;
      }

      doc
        .font('RobotoRegular')
        .fontSize(14)
        .text('Email:', 50, startY + 695 - adjustY + adjustYAddres, {
          continued: true,
          align: 'left',
        });

      doc
        .font('RobotoLight')
        .fontSize(14)
        .text(` ${email}`, { continued: false, align: 'right' });
      doc
        .font('RobotoRegular')
        .fontSize(14)
        .text(`Număr telefon:`, 50, startY + 715 - adjustY + adjustYAddres, {
          continued: true,
          align: 'left',
        });

      doc
        .font('RobotoLight')
        .fontSize(14)
        .text(` ${phoneNumber}`, { continued: false, align: 'right' });

      const blueLineY = pageHeight - 1.5 * 2;

      doc
        .moveTo(0, blueLineY)
        .lineTo(pageWidth, blueLineY)
        .strokeColor(blueLineColor)
        .lineWidth(1 * 42.35)
        .stroke();

      doc.end();

      await this.sendEmailWithPdf(pdfFileName, email);

      return 'email-sent';
      // return pdfFilePath;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async sendEmailWithPdf(pdfFileName: string, email: string) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      const pdfFilePath = join(pdfPath, pdfFileName);

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: [email, adminEmail],
        subject: process.env.EMAIL_SUBJECT,
        text: process.env.EMAIL_MESSAGE,
        attachments: [
          {
            filename: pdfFileName,
            path: pdfFilePath,
          },
        ],
      };

      const info = await transporter.sendMail(mailOptions);

      // fs.unlinkSync(pdfFilePath);

      return { message: 'email-sent' };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
