import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Public, ResponseMessage, SkipCheckPermission, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('quiz')
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) { }

  @Post()
  @SkipCheckPermission()
  @ResponseMessage("create a new quiz")
  create(
    @Body() createQuizDto: CreateQuizDto,
    @User() user: IUser
  ) {
    return this.quizService.create(createQuizDto, user);
  }

  @Public()
  @Get()
  @ResponseMessage("Fetch List quiz with paginate")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,
  ) {
    return this.quizService.findAll(+currentPage, +limit, qs); // Modify this line
  }

  @SkipCheckPermission()
  @Get(':id')
  @ResponseMessage("Fetch a quiz with id")
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Patch(':id')
  @SkipCheckPermission()
  @ResponseMessage("Update a quiz")
  update(
    @Param('id') id: string,
    @Body() updateQuizDto: UpdateQuizDto,
    @User() user: IUser

  ) {
    return this.quizService.update(id, updateQuizDto, user);
  }


  @Delete(':id')
  @SkipCheckPermission()
  @ResponseMessage("Delete a quiz")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.quizService.remove(id, user);
  }
}
