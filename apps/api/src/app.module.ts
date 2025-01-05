import { Module } from '@nestjs/common';
import { LiveSessionModule } from './modules/live/live-session.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [LiveSessionModule, PaymentModule],
})
export class AppModule {}
