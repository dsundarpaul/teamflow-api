import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('tickets')
@UseGuards(AuthGuard('jwt'))
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  createTicket(@Req() req, @Body() dto: CreateTicketDto) {
    return this.ticketService.createTicket(req.user.id, dto);
  }

  @Get()
  getTickets(@Req() req) {
    return this.ticketService.getTickets(req.user.id);
  }

  // @Patch(':id')
  // updateTicket(
  //   @Req() req,
  //   @Param('id') id: string,
  //   @Body() dto: UpdateTicketDto,
  // ) {
  //   return this.ticketService.updateTicket(req.user.id, id, dto);
  // }

  // @Delete(':id')
  // deleteTicket(@Req() req, @Param('id') id: string) {
  //   return this.ticketService.deleteTicket(req.user.id, id);
  // }
}
