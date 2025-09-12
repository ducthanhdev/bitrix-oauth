import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenDocument = Token & Document;

@Schema({ timestamps: true })
export class Token {
  @Prop({ required: true, unique: true })
  domain: string;

  @Prop({ required: true })
  accessToken: string;

  @Prop({ required: true })
  refreshToken: string;

  @Prop({ required: true })
  expiresIn: number;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: 'active' })
  status: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
