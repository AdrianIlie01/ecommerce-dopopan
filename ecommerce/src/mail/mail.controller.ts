import {
  Controller,
  Post,
  HttpStatus,
  Res,
  Body,
  Get,
  Param,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { CreatePdfDto } from './dto/create-pdf.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get()
  async getVideo(@Res() res) {
    try {
      return res.status(HttpStatus.OK).json('get');
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }
  @Post('generate-pdf')
  async generatePdf(@Res() res, @Body() createPdf: CreatePdfDto) {
    try {
      const pdf = await this.mailService.generatePdf(createPdf);
      return res.status(HttpStatus.OK).json(pdf);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Get('image/:name')
  async getThumbnail(@Res() res, @Param('name') name: string) {
    try {
      res.sendFile(name, { root: 'product-images' });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }
  @Get('all-products')
  // @Get('json')
  async getProducts(@Res() res) {
    try {
      res.sendFile('products-info.json', { root: 'products' });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Get('product/:name')
  async getProduct(@Res() res, @Param('name') name: string) {
    try {
      res.sendFile(`${name}.json`, { root: 'products' });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }
}
