import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { ResponseMessage, SkipCheckPermission, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('invitation')
@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) { }

  @Post()
  @SkipCheckPermission()
  @ResponseMessage("Create a new invitation")
  create(@Body() createInvitationDto: CreateInvitationDto, @User() user: IUser) {
    return this.invitationService.create(createInvitationDto, user);
  }

  @Get()
  @SkipCheckPermission()
  @ResponseMessage("Fetch List invitation with paginate")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,
  ) {
    return this.invitationService.findAll(+currentPage, +limit, qs);
  }

  @Post('by-user')
  @SkipCheckPermission()
  @ResponseMessage("Get Invitation by User")
  getInvitationByUser(@User() user: IUser) {
    return this.invitationService.findByUsers(user);
  }

  @Get(':id')
  @SkipCheckPermission()
  @ResponseMessage("Fetch a Invitation by id")
  findOne(@Param('id') id: string) {
    return this.invitationService.findOne(id);
  }

  @Patch(':id')
  @SkipCheckPermission()
  @ResponseMessage("Update status Invitation")
  updateStatus(@Param('id') id: string, @Body("status") status: string, @User() user: IUser) {
    return this.invitationService.update(id, status, user);
  }

  @Delete(':id')
  @SkipCheckPermission()
  @ResponseMessage("Delete a Invitation")
  remove(
    @Param('id') id: string,
    @User() user: IUser
  ) {
    return this.invitationService.remove(id, user);
  }
}
