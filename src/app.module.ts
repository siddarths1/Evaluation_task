import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphqlModule } from './graphql.module';
import { PrismaModule } from './prisma/prisma.module';
import { employeeModule } from './module/employee/emplyee.module';

@Module({
  imports: [GraphqlModule, PrismaModule, employeeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
