import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class ProductsService {
  private stripe: Stripe;
  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(configService.get(process.env.SK), {
      apiVersion: '2023-10-16', // Schimbă la versiunea curentă a API-ului Stripe
    });
  }
  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  async creeateSession(amount: string) {
    const stripe = new Stripe(process.env.SK);
    console.log(amount);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ron', // schimbă la valuta ta
            unit_amount: parseFloat(amount) * 100, // Stripe lucrează cu valori în "cenți", deci multiplicăm cu 100
            product_data: {
              name: 'Product Name', // înlocuiește cu numele produsului tău
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: process.env.URL_SUCCESS, // înlocuiește cu URL-ul tău de succes
      cancel_url: 'https://example.com/cancel', // înlocuiește cu URL-ul tău de anulare
    });

    return { url: session.url, sessionId: session.id };
  }

  async findAll() {
    try {
      const products = await ProductEntity.find();
      return products;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
  async findOne(id: number) {
    try {
      const product = await ProductEntity.findOneBy({
        id: id,
      });
      return product;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findByName(name: string) {
    try {
      console.log(name);
      const product = await ProductEntity.findOne({
        where: {
          name: name,
        },
      });

      console.log(product);
      return product;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getImageName(name: string) {
    try {
      console.log(name);
      const product = await ProductEntity.findOne({
        where: {
          name: name,
        },
      });

      console.log(product);
      return product.image;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
