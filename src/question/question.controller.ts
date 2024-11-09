import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Public, ResponseMessage, SkipCheckPermission, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('question')
@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) { }

  @Post()
  @SkipCheckPermission()
  @ResponseMessage("create a new question")
  create(
    @Body() createQuestionDto: CreateQuestionDto,
    @User() user: IUser
  ) {
    return this.questionService.create(createQuestionDto, user);
  }

  @Public()
  @Get()
  @ResponseMessage("Fetch List question with paginate")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,
  ) {
    return this.questionService.findAll(+currentPage, +limit, qs); // Modify this line
  }


  @SkipCheckPermission()
  @Get(':id')
  @ResponseMessage("Fetch a question with id")
  findOne(@Param('id') id: string) {
    return this.questionService.findOne(id);
  }

  @Patch(':id')
  @SkipCheckPermission()
  @ResponseMessage("Update a question")
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @User() user: IUser

  ) {
    return this.questionService.update(id, updateQuestionDto, user);
  }


  @Delete(':id')
  @SkipCheckPermission()
  @ResponseMessage("Delete a question")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.questionService.remove(id, user);
  }
}
