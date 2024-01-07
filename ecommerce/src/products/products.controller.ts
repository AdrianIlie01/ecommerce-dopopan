import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  Redirect,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Controller('products')
export class ProductsController {
  private stripe: Stripe;

  constructor(private readonly productsService: ProductsService) {}

  @Get('image/:name')
  async getThumbnail(@Res() res, @Param('name') name: string) {
    try {
      res.sendFile(name, { root: 'product-images' });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Post('pay')
  async createSession(@Res() res, @Body() payload: { amount: number }) {
    try {
      const product = await this.productsService.creeateSession(
        payload.amount.toString(),
      );
      return res.status(HttpStatus.CREATED).json(product);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }
  @Get()
  async findAll(@Res() res) {
    try {
      const product = await this.productsService.findAll();
      return res.status(HttpStatus.CREATED).json(product);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Get(':id')
  async findOne(@Res() res, @Param('id') id: number) {
    try {
      const product = await this.productsService.findOne(id);
      return res.status(HttpStatus.OK).json(product);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Get('name/:name')
  async findByNam2e(@Res() res, @Param('name') name: string) {
    try {
      const user = await this.productsService.findByName(name);
      return res.status(HttpStatus.OK).json(user);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Get('image-name/:name')
  async getImageName(@Res() res, @Param('name') name: string) {
    try {
      const image = await this.productsService.getImageName(name);
      return res.status(HttpStatus.OK).json(image);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
