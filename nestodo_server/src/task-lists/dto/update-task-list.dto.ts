import { PartialType } from '@nestjs/swagger';
import { CreateTaskListDto } from './create-task-list.dto';

export class UpdateTaskListDto extends PartialType(CreateTaskListDto) {}
